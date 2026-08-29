import type { Metadata } from "next";
import Link from "next/link";
import { getMemories, getPhotos, publicPhotoUrl } from "@/lib/data";

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
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {withCovers.map(({ memory, coverUrl }, i) => {
            const rotate = i % 2 === 0 ? "rotate-[-1deg]" : "rotate-[1deg]";
            return (
              <Link
                key={memory.id}
                href={`/memorias/${memory.id}`}
                className="transition hover:-translate-y-1 hover:shadow-lg"
              >
                <article
                  className={`polaroid ${rotate} flex h-full flex-col`}
                  style={{ backgroundColor: memory.theme.polaroidBg }}
                >
                  <div className="flex h-52 items-center justify-center overflow-hidden">
                    {coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={coverUrl}
                        alt={memory.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span
                        className="text-5xl"
                        style={{ color: memory.theme.accent }}
                      >
                        💌
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-center gap-1 px-3 py-3 text-center">
                    <h2
                      className="text-2xl leading-tight"
                      style={{
                        fontFamily: "'Sofia', cursive",
                        color: memory.theme.accent,
                      }}
                    >
                      {memory.title}
                    </h2>
                    {memory.date && (
                      <p className="text-sm opacity-70">{memory.date}</p>
                    )}
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
