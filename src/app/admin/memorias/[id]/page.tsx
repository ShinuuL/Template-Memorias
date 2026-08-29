import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MemoryEditor from "@/components/admin/memory-editor";
import { getMemory, getPhotos, publicPhotoUrl } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: PageProps<"/admin/memorias/[id]">
): Promise<Metadata> {
  const { id } = await props.params;
  const memory = await getMemory(id);
  return { title: memory ? `${memory.title} — Editar` : "Editar memória" };
}

export default async function EditarMemoriaPage(
  props: PageProps<"/admin/memorias/[id]">
) {
  const { id } = await props.params;
  const memory = await getMemory(id);
  if (!memory) notFound();

  const dbPhotos = await getPhotos(id);
  const photos = dbPhotos.map((p) => ({
    id: p.id,
    url: publicPhotoUrl(p.storage_path),
    caption: p.caption ?? "",
  }));

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-neutral-800">Editar memória</h1>
      <MemoryEditor memory={memory} photos={photos} />
    </div>
  );
}
