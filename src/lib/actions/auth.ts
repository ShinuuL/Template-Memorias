"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../supabase/server";

export type AuthResult =
  | { ok: true }
  | { ok: false; error: string };

// Login do admin (email + senha). Após autenticar, garante que o
// usuário realmente tem papel 'admin' antes de deixar entrar no painel.
export async function signIn(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "").trim() || "/admin";

  if (!email || !password) {
    return { ok: false, error: "Informe e-mail e senha." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return { ok: false, error: "E-mail ou senha inválidos." };

  // Verifica papel. Só admin acessa o painel.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    await supabase.auth.signOut();
    return { ok: false, error: "Não foi possível autenticar." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    await supabase.auth.signOut();
    return {
      ok: false,
      error: "Esta conta não tem permissão de administrador.",
    };
  }

  revalidatePath("/admin", "layout");
  redirect(next);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
