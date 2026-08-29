import "server-only";

import { createClient } from "./supabase/server";
import { DEFAULT_THEME, type Memory, type Photo, type SiteConfig } from "./types";

// Tipos para as linhas vindas do Postgres (o client sem tipagem gerada
// retorna os registros de forma genérica; tipamos manualmente aqui).
interface MemoryRow {
  id: string;
  title: string;
  date: string | null;
  letter: string | null;
  spotify_tracks: unknown;
  theme: unknown;
  sort_order: number | null;
  created_at: string;
}

interface PhotoRow {
  id: string;
  memory_id: string;
  storage_path: string;
  caption: string | null;
  sort_order: number | null;
  created_at: string;
}

// Normaliza a linha de memória vinda do Postgres (JSONB -> tipado).
function normalizeMemory(row: MemoryRow): Memory {
  return {
    id: row.id,
    title: row.title,
    date: row.date ?? null,
    letter: row.letter ?? null,
    spotify_tracks: Array.isArray(row.spotify_tracks) ? row.spotify_tracks : [],
    theme: { ...DEFAULT_THEME, ...(row.theme ?? {}) },
    sort_order: row.sort_order ?? 0,
    created_at: row.created_at,
  };
}

export async function getMemories(): Promise<Memory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(normalizeMemory);
}

export async function getMemory(id: string): Promise<Memory | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memories")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? normalizeMemory(data) : null;
}

export async function getPhotos(memoryId: string): Promise<Photo[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("memory_id", memoryId)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((p: PhotoRow) => ({
    id: p.id,
    memory_id: p.memory_id,
    storage_path: p.storage_path,
    caption: p.caption ?? null,
    sort_order: p.sort_order ?? 0,
    created_at: p.created_at,
  }));
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_config")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return {
    id: 1,
    pergunta: data?.pergunta ?? "Acerta a data Neném",
    resposta: data?.resposta ?? "",
    fachada_bg: (data as { fachada_bg?: string } | null)?.fachada_bg ?? "#69dd69",
  };
}

// URL pública de uma foto no bucket 'fotos'.
export function publicPhotoUrl(storagePath: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  // Caminho completo do objeto, em "fotos/<memory_id>/<arquivo>".
  return `${url}/storage/v1/object/public/${storagePath}`;
}
