import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "./config";

// Cliente destinado a Server Components, Server Actions e Route Handlers.
// Lê e escreve cookies de sessão de forma assíncrona (requisito do Next 16).
export async function createClient() {
  const { url, anonKey } = getSupabaseConfig();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Chamado a partir de um Server Component. Isso pode ser ignorado
          // se o middleware (proxy) já renovou o token de sessão.
        }
      },
    },
  });
}
