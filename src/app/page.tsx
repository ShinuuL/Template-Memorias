import type { Metadata } from "next";
import { getSiteConfig } from "@/lib/data";
import FachadaMotion from "@/components/fachada/fachada-motion";

export const metadata: Metadata = {
  title: "Site de Memórias",
};

export const dynamic = "force-dynamic";

// Fachada: tela de entrada estilo "acerta a data".
// A pergunta/resposta são configuráveis no painel admn (site_config).
export default async function HomePage() {
  const config = await getSiteConfig();

  return (
    <FachadaMotion bg={config.fachada_bg} pergunta={config.pergunta} />
  );
}
