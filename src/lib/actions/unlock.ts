"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "../supabase/server";
import { UNLOCK_COOKIE, UNLOCK_VALUE } from "../supabase/middleware";

export type UnlockResult = { ok: true } | { ok: false; error: string };

// Verifica a resposta da fachada no servidor. Se correta, grava o
// cookie que destrava a visualização (o proxy valida esse cookie).
export async function checkUnlock(formData: FormData): Promise<UnlockResult> {
  const answer = String(formData.get("resposta") ?? "").trim();

  const supabase = await createClient();
  const { data } = await supabase
    .from("site_config")
    .select("resposta")
    .eq("id", 1)
    .maybeSingle();

  const expected = (data?.resposta ?? "").trim();

  if (!answer || answer !== expected) {
    return { ok: false, error: "Hmm, não é essa. Tenta de novo! 💛" };
  }

  const cookieStore = await cookies();
  cookieStore.set(UNLOCK_COOKIE, UNLOCK_VALUE, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    // 30 dias de memória para o visualizador
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect("/memorias");
}
