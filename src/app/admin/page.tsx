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
        <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-10 text-center text-neutral-500">
          Nenhuma memória criada ainda.
          <br />
          <Link
            href="/admin/memorias/nova"
            className="mt-2 inline-block text-rose-500 underline"
          >
            Criar a primeira
          </Link>
        </div>
      ) : (
        <MemoryList memories={memories} />
      )}
    </div>
  );
}
