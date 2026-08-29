"use client";

import Link from "next/link";
import type { Memory, Photo } from "@/lib/types";
import { themeToCssVars } from "@/lib/theme";
import SpotifyEmbed from "./spotify-embed";

export interface MemoryPhoto extends Photo {
  url: string;
}

// Renderização completa de uma memória: carta + fotos + músicas,
// com o tema específico da memória (cores e fontes por memória).
export default function MemoryView({
  memory,
  photos,
}: {
  memory: Memory;
  photos: MemoryPhoto[];
}) {
  const { theme } = memory;
  const tracks = memory.spotify_tracks ?? [];

  // Imagem de capa (primeira foto, se existir).
  const cover = photos[0];
  const rest = photos.slice(1);

  return (
    <div
      className="min-h-screen w-full pb-16"
      style={{
        ...themeToCssVars(theme),
        backgroundColor: "var(--mem-bg)",
        color: "var(--mem-text)",
        fontFamily: "var(--mem-font-body)",
      }}
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 px-5 pt-10">
        {/* Navegação */}
        <Link
          href="/memorias"
          className="self-start text-sm underline opacity-70"
          style={{ fontFamily: "sans-serif" }}
        >
          ← Todas as memórias
        </Link>

        {/* Título */}
        <header className="text-center">
          <h1
            className="text-4xl sm:text-5xl"
            style={{
              fontFamily: "var(--mem-font-heading)",
              color: "var(--mem-accent)",
            }}
          >
            {memory.title}
          </h1>
          {memory.date && (
            <p
              className="mt-2 text-lg opacity-80"
              style={{ fontFamily: "sans-serif" }}
            >
              {memory.date}
            </p>
          )}
        </header>

        {/* Carta */}
        {memory.letter && (
          <section className="max-w-xl text-center leading-relaxed text-lg whitespace-pre-line">
            {memory.letter}
          </section>
        )}

        {/* Capa */}
        {cover && (
          <figure className="polaroid rotate-[-1.5deg]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover.url}
              alt={cover.caption || memory.title}
              className="max-h-[520px] w-auto max-w-full object-contain"
            />
            {cover.caption && (
              <figcaption className="mt-2 text-center text-base opacity-80">
                {cover.caption}
              </figcaption>
            )}
          </figure>
        )}

        {/* Fotos restantes + músicas intercaladas */}
        {rest.map((photo, i) => {
          // Intercala um player de música após cada foto quando disponível.
          const track = tracks[i];
          return (
            <div key={photo.id} className="flex w-full flex-col items-center gap-8">
              <figure className="polaroid rotate-[1deg]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.caption || memory.title}
                  className="max-h-[520px] w-auto max-w-full object-contain"
                />
                {photo.caption && (
                  <figcaption className="mt-2 max-w-sm text-center text-base opacity-80">
                    {photo.caption}
                  </figcaption>
                )}
              </figure>

              {track && <SpotifyEmbed trackId={track} />}
            </div>
          );
        })}

        {/* Músicas que sobram da playlist além do número de fotos */}
        {tracks.length > rest.length &&
          tracks.slice(rest.length).map((track, i) => (
            <SpotifyEmbed key={`${track}-${i}`} trackId={track} />
          ))}

        {/* Playlist quando não há fotos para intercalar */}
        {photos.length === 0 &&
          tracks.map((track, i) => (
            <SpotifyEmbed key={`${track}-${i}`} trackId={track} />
          ))}
      </div>
    </div>
  );
}
