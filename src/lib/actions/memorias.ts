"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../supabase/server";
import { DEFAULT_THEME, type Theme } from "../types";

export type SaveResult = { ok: true } | { ok: false; error: string };

// Cria um client do Supabase garantindo que o usuário atual é admin.
async function getAdminClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") return null;

  return supabase;
}

function parseTheme(raw: FormDataEntryValue | null): Theme {
  if (!raw) return DEFAULT_THEME;
  try {
    return { ...DEFAULT_THEME, ...(JSON.parse(String(raw)) as Partial<Theme>) };
  } catch {
    return DEFAULT_THEME;
  }
}

function parseJsonArray<T>(raw: FormDataEntryValue | null): T[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(String(raw));
    return Array.isArray(v) ? (v as T[]) : [];
  } catch {
    return [];
  }
}

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
];
const MAX_SIZE = 15 * 1024 * 1024; // 15 MB

function extForMime(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/heic": "heic",
    "image/heif": "heif",
  };
  return map[mime] ?? "jpg";
}

// ---------------------------------------------------------------------
// Salva uma memória (cria ou atualiza) e gerencia suas fotos, playlist e tema.
// Espera do FormData:
//   memoryId     -> "" para nova, ou o id ao editar
//   title, date, letter
//   theme        -> JSON Theme
//   tracks       -> JSON string[] (track ids do Spotify)
//   photoOrder   -> JSON: [{kind:"existing",id,caption} | {kind:"new",caption,fileIndex}]
//   deleted      -> JSON string[] (ids de fotos a apagar)
//   files[]      -> arquivos de imagem selecionados da galeria
// ---------------------------------------------------------------------
export async function saveMemory(
  _prev: SaveResult,
  formData: FormData
): Promise<SaveResult> {
  const supabase = await getAdminClient();
  if (!supabase) return { ok: false, error: "Sem permissão de administrador." };

  const memoryId = String(formData.get("memoryId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim() || null;
  const letter = String(formData.get("letter") ?? "").trim();
  const theme = parseTheme(formData.get("theme"));
  const tracks = parseJsonArray<string>(formData.get("tracks"));

  if (!title) return { ok: false, error: "O título é obrigatório." };

  // --- Grava a memória (cria ou atualiza) ---------------------------
  let finalId = memoryId;
  if (!finalId) {
    const { data: created, error } = await supabase
      .from("memories")
      .insert({
        title,
        date,
        letter,
        theme,
        spotify_tracks: tracks,
      })
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    finalId = created.id;
  } else {
    const { error } = await supabase
      .from("memories")
      .update({ title, date, letter, theme, spotify_tracks: tracks })
      .eq("id", finalId);
    if (error) return { ok: false, error: error.message };
  }

  // --- Fotos: ordem/legenda das existentes + upload das novas -------
  const photoOrder = parseJsonArray<
    | { kind: "existing"; id: string; caption?: string }
    | { kind: "new"; caption?: string; fileIndex: number }
  >(formData.get("photoOrder"));
  const deleted = parseJsonArray<string>(formData.get("deleted"));
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);

  // 1) Apaga fotos removidas (tabela + storage)
  if (deleted.length) {
    const { data: rows } = await supabase
      .from("photos")
      .select("storage_path")
      .in("id", deleted);
    await supabase.from("photos").delete().in("id", deleted);
    const paths = (rows ?? [])
      .map((r) => r.storage_path.replace(/^fotos\//, ""));
    if (paths.length) {
      await supabase.storage.from("fotos").remove(paths);
    }
  }

  let orderIndex = 0;
  for (const item of photoOrder) {
    if (item.kind === "existing") {
      await supabase
        .from("photos")
        .update({ sort_order: orderIndex, caption: item.caption || null })
        .eq("id", item.id);
      orderIndex += 1;
    } else if (item.kind === "new") {
      const file = files[item.fileIndex];
      if (!file) continue;

      if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
        return { ok: false, error: `Tipo de arquivo não suportado: ${file.type || "desconhecido"}.` };
      }
      if (file.size > MAX_SIZE) {
        return { ok: false, error: "Uma das imagens tem mais de 15 MB." };
      }

      const name = `${crypto.randomUUID()}.${extForMime(file.type.toLowerCase())}`;
      const storagePath = `${finalId}/${name}`;

      const { error: upErr } = await supabase.storage
        .from("fotos")
        .upload(storagePath, file, { contentType: file.type });
      if (upErr) return { ok: false, error: `Falha ao enviar foto: ${upErr.message}` };

      await supabase.from("photos").insert({
        memory_id: finalId,
        storage_path: storagePath,
        caption: item.caption || null,
        sort_order: orderIndex,
      });
      orderIndex += 1;
    }
  }

  revalidatePath("/memorias");
  revalidatePath("/memorias/[id]", "page");
  revalidatePath("/admin", "layout");
  redirect("/admin?saved=1");
}

// ---------------------------------------------------------------------
export async function deleteMemory(id: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await getAdminClient();
  if (!supabase) return { ok: false, error: "Sem permissão de administrador." };

  // Apaga fotos do storage.
  const { data: photos } = await supabase
    .from("photos")
    .select("storage_path")
    .eq("memory_id", id);
  const paths = (photos ?? []).map((p) => p.storage_path.replace(/^fotos\//, ""));
  if (paths.length) {
    await supabase.storage.from("fotos").remove(paths);
  }

  // A tabela photos é apagada em cascata (on delete cascade), só apaga a memória.
  const { error } = await supabase.from("memories").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/memorias");
  revalidatePath("/admin", "layout");
  return { ok: true };
}

// Reordena as memórias na lista do painel. `ids` é a nova ordem.
export async function reorderMemories(ids: string[]): Promise<{ ok: boolean; error?: string }> {
  const supabase = await getAdminClient();
  if (!supabase) return { ok: false, error: "Sem permissão de administrador." };

  for (let i = 0; i < ids.length; i += 1) {
    await supabase
      .from("memories")
      .update({ sort_order: i })
      .eq("id", ids[i]);
  }

  revalidatePath("/memorias");
  revalidatePath("/admin", "layout");
  return { ok: true };
}

// ---------------------------------------------------------------------
// Configuração da fachada (pergunta + resposta secretas).
export async function updateSiteConfig(
  _prev: SaveResult,
  formData: FormData
): Promise<SaveResult> {
  const supabase = await getAdminClient();
  if (!supabase) return { ok: false, error: "Sem permissão de administrador." };

  const pergunta = String(formData.get("pergunta") ?? "").trim();
  const resposta = String(formData.get("resposta") ?? "").trim();
  let fachada_bg = String(formData.get("fachada_bg") ?? "#69dd69").trim();
  if (!/^#[0-9a-fA-F]{6}$/.test(fachada_bg)) fachada_bg = "#69dd69";

  if (!pergunta) return { ok: false, error: "A pergunta é obrigatória." };
  if (!resposta) return { ok: false, error: "A resposta é obrigatória." };

  const { error } = await supabase
    .from("site_config")
    .update({ pergunta, resposta, fachada_bg, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}
