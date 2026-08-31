import type { Metadata } from "next";
import { getMemories, getPhotos, publicPhotoUrl } from "@/lib/data";
import MemoryGrid from "@/components/memorias/memory-grid";

export const metadata: Metadata = {
  title: "Nossas Memórias",
};

export const dynamic = "force-dynamic";

// Lista pública de memórias (acesso liberado pela fachada ou admin).
export default async function MemoriasPage() {
  const memories = await getMemories();

  // Capa (primeira foto) de cada memória, para os cartões da grade.
  const withCovers = await Promise.all(
    memories.map(async (m) => {
      const photos = await getPhotos(m.id);
      const cover = photos[0];
      return {
        memory: m,
        coverUrl: cover ? publicPhotoUrl(cover.storage_path) : null,
      };
    })
  );

  return (
    <main
      className="min-h-screen px-5 py-10"
      style={{ backgroundColor: "#fdf2e9" }}
    >
      <header className="mx-auto mb-8 max-w-3xl text-center">
        <h1
          className="text-4xl"
          style={{ fontFamily: "'Sofia', cursive", color: "#c2410c" }}
        >
          Nossas Memórias
        </h1>
        <p className="mt-2 text-neutral-500">Tocou meu coração? Aqui está o nosso cantinho.</p>
      </header>

      {withCovers.length === 0 ? (
        <p className="text-center leading-relaxed text-neutral-500">
          Ainda não há memórias por aqui. Logo logo teremos! 💛
          <br />
          <span className="text-sm">Se você é o admin, crie a primeira em /admin</span>
        </p>
      ) : (
        <MemoryGrid items={withCovers} />
      )}
    </main>
  );
}
