import Link from "next/link";
import MemoryList from "@/components/admin/memory-list";
import { getMemories } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const memories = await getMemories();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-800">Memórias</h1>
        <Link
          href="/admin/memorias/nova"
          className="rounded-md bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
        >
          + Nova memória
        </Link>
      </div>

      <p className="text-sm text-neutral-500">
        Arraste para reordenar. Clique em <strong>Editar</strong> para abrir o editor.
      </p>

      {memories.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-left">
          <p className="text-center font-medium text-neutral-700">Site limpo — comece por aqui</p>
          <ol className="mx-auto mt-4 max-w-md list-decimal space-y-2 pl-5 text-sm text-neutral-600">
            <li>
              Configure a fachada em <Link href="/admin/config" className="text-rose-500 underline">Fachada</Link> (pergunta, resposta e cor).
            </li>
            <li>Crie a primeira memória no botão acima — título, carta, fotos da galeria e IDs do Spotify.</li>
            <li>Teste como visualizador: abra a fachada em aba anônima e acerte a resposta.</li>
          </ol>
          <p className="mt-4 text-center text-xs text-neutral-400">
            Guia completo em <code>INSTRUCOES.md</code>
          </p>
          <div className="mt-4 text-center">
            <Link
              href="/admin/memorias/nova"
              className="inline-block rounded-md bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
            >
              Criar a primeira
            </Link>
          </div>
        </div>
      ) : (
        <MemoryList memories={memories} />
      )}
    </div>
  );
}
