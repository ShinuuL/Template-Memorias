import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MemoryView, { type MemoryPhoto } from "@/components/memorias/memory-view";
import { getMemory, getPhotos, publicPhotoUrl } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: PageProps<"/memorias/[id]">
): Promise<Metadata> {
  const { id } = await props.params;
  const memory = await getMemory(id);
  return {
    title: memory ? `${memory.title} — Nossas Memórias` : "Memória",
  };
}

// Página de uma memória específica (carta + fotos + músicas).
export default async function MemoriaPage(props: PageProps<"/memorias/[id]">) {
  const { id } = await props.params;

  const memory = await getMemory(id);
  if (!memory) notFound();

  const dbPhotos = await getPhotos(id);
  const photos: MemoryPhoto[] = dbPhotos.map((p) => ({
    ...p,
    url: publicPhotoUrl(p.storage_path),
  }));

  return <MemoryView memory={memory} photos={photos} />;
}
