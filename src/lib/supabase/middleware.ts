import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "./config";

// Cookie definido quando o visualizador acerta a pergunta da fachada.
export const UNLOCK_COOKIE = "memorias_unlocked";
export const UNLOCK_VALUE = "1";

// Atualiza os cookies de sessão do Supabase a cada request e devolve
// o estado de acesso (logado? é admin? destravou a fachada?).
//
// Chamar antes de retornar NextResponse.next() para manter a sessão viva.
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const { url, anonKey } = getSupabaseConfig();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Importante: chamar getUser() para renovar a sessão se necessário.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    isAdmin = data?.role === "admin";
  }

  // Estado da fachada vindo de cookie.
  const unlocked = request.cookies.get(UNLOCK_COOKIE)?.value === UNLOCK_VALUE;

  return { supabaseResponse, user, isAdmin, unlocked };
}
