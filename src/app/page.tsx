import type { Metadata } from "next";
import Link from "next/link";
import UnlockForm from "@/components/fachada/unlock-form";
import { getSiteConfig } from "@/lib/data";

export const metadata: Metadata = {
  title: "Site de Memórias",
};

export const dynamic = "force-dynamic";

// Fachada: tela de entrada estilo "acerta a data".
// A pergunta/resposta são configuráveis no painel admn (site_config).
export default async function HomePage() {
  const config = await getSiteConfig();

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center gap-6 px-6"
      style={{ backgroundColor: config.fachada_bg }}
    >
      <h1
        className="text-center text-4xl sm:text-5xl"
        style={{ fontFamily: "'Sofia', cursive", fontStyle: "oblique" }}
      >
        {config.pergunta}
      </h1>

      <UnlockForm pergunta={config.pergunta} />

      <Link
        href="/login"
        className="mt-10 text-xs text-black/40 underline hover:text-black/60"
      >
        área administrativa
      </Link>
    </main>
  );
}
