import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Entrar — Site de Memórias",
};

// Página de login do admin. O parâmetro ?next= indica para onde voltar
// após entrar (ex.: /admin, /admin/memorias/[id]).
export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const next = typeof searchParams?.next === "string" ? searchParams.next : "/admin";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-b from-rose-50 to-orange-50 p-6">
      <div className="w-full max-w-sm rounded-2xl border border-rose-100 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-center text-3xl" style={{ fontFamily: "'Sofia', cursive" }}>
          Bem-vindo de volta
        </h1>
        <p className="mb-6 text-center text-sm text-neutral-500">
          Área administrativa
        </p>
        <LoginForm next={next} />
      </div>
      <Link href="/" className="text-sm text-neutral-500 underline hover:text-neutral-700">
        ← Voltar para a fachada
      </Link>
    </main>
  );
}
