"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import type { Memory, Photo } from "@/lib/types";
import { themeToCssVars } from "@/lib/theme";
import SpotifyEmbed from "./spotify-embed";
import { DUR, EASE, EASE_BOUNCE } from "@/lib/motion";

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
        <motion.header
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: DUR.carta, ease: EASE }}
          className="text-center"
        >
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
        </motion.header>

        {/* Carta */}
        {memory.letter && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: DUR.carta, ease: EASE }}
            className="max-w-xl text-center leading-relaxed text-lg whitespace-pre-line"
          >
            {memory.letter}
          </motion.section>
        )}

        {/* Capa */}
        {cover && (
          <motion.figure
            initial={{ opacity: 0, y: 24, rotate: -1.5 }}
            animate={{ opacity: 1, y: 0, rotate: -1.2 }}
            transition={{ duration: 0.7, ease: EASE_BOUNCE }}
            className="polaroid"
          >
            { }
            <motion.img
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              src={cover.url}
              alt={cover.caption || memory.title}
              loading="lazy"
              className="max-h-[520px] w-auto max-w-full object-contain"
              onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
            />
            {cover.caption && (
              <figcaption className="mt-2 text-center text-base opacity-80">
                {cover.caption}
              </figcaption>
            )}
          </motion.figure>
        )}

        {/* Fotos restantes + músicas intercaladas */}
        {rest.map((photo, i) => (
          <Reveal key={photo.id} delay={i * 0.06} track={tracks[i]} photo={photo} title={memory.title} />
        ))}

        {/* Músicas que sobram da playlist além do número de fotos */}
        {tracks.length > rest.length &&
          tracks.slice(rest.length).map((track, i) => (
            <motion.div
              key={`${track}-${i}`}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <SpotifyEmbed trackId={track} />
            </motion.div>
          ))}

        {/* Playlist quando não há fotos para intercalar */}
        {photos.length === 0 &&
          tracks.map((track, i) => (
            <motion.div
              key={`${track}-${i}`}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <SpotifyEmbed trackId={track} />
            </motion.div>
          ))}
      </div>
    </div>
  );
}

function Reveal({
  photo,
  title,
  track,
  delay,
}: {
  photo: MemoryPhoto;
  title: string;
  track: string | undefined;
  delay: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: EASE }}
      className="flex w-full flex-col items-center gap-8"
    >
      <figure className="polaroid rotate-[1deg]">
        { }
        <motion.img
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          src={photo.url}
          alt={photo.caption || title}
          loading="lazy"
          className="max-h-[520px] w-auto max-w-full object-contain"
          onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
        />
        {photo.caption && (
          <figcaption className="mt-2 max-w-sm text-center text-base opacity-80">
            {photo.caption}
          </figcaption>
        )}
      </figure>

      {track && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <SpotifyEmbed trackId={track} />
        </motion.div>
      )}
    </motion.div>
  );
}
