import type { Metadata } from "next";
import FachadaForm from "@/components/admin/fachada-form";
import { getSiteConfig } from "@/lib/data";

export const metadata: Metadata = {
  title: "Configuração da fachada",
};

export const dynamic = "force-dynamic";

export default async function AdminConfigPage() {
  const config = await getSiteConfig();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-neutral-800">Fachada</h1>
      <p className="text-sm text-neutral-500">
        A fachada é a tela de entrada. O visualizador precisa acertar a resposta
        para destravar as memórias.
      </p>
      <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <FachadaForm config={config} />
      </div>
    </div>
  );
}
