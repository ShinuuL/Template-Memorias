import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Onde o proxy roda em relação às rotas públicas:
//   /            -> fachada (sempre acessível)
//   /login       -> autenticação admin (sempre acessível)
//   /memorias/*  -> visualização (exige estar "destravado" pela fachada OU admin)
//   /admin/*     -> painel (exige admin autenticado)

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Atualiza cookies de sessão e descobre o estado de acesso.
  const { supabaseResponse, isAdmin, unlocked } = await updateSession(request);

  // --- Painel admin -------------------------------------------------
  if (pathname.startsWith("/admin")) {
    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // --- Visualização pública -----------------------------------------
  // Admin autenticado sempre pode ver; visualizador precisa ter
  // "destravado" a fachada (cookie).
  if (pathname.startsWith("/memorias")) {
    if (!isAdmin && !unlocked) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // /login: se já for admin, manda direto pro painel.
  if (pathname === "/login" && isAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  // Não rodar o proxy em estáticos/imagens/favicon para não bloquear assets.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
