"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { DUR, EASE_BOUNCE } from "@/lib/motion";
import type { Memory } from "@/lib/types";

export default function MemoryGrid({
  items,
}: {
  items: { memory: Memory; coverUrl: string | null }[];
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: DUR.stagger, delayChildren: 0.12 } },
      }}
      className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {items.map(({ memory, coverUrl }, i) => {
        const rotate = i % 2 === 0 ? -1.2 : 1.2;
        const rotateHover = 0;
        return (
          <motion.div
            key={memory.id}
            variants={{
              hidden: { y: 18, opacity: 0, rotate },
              visible: { y: 0, opacity: 1, rotate: rotate * 0.66 },
            }}
            transition={{ duration: DUR.card, ease: EASE_BOUNCE }}
            whileHover={{ y: -4, rotate: rotateHover, scale: 1.01, transition: { duration: DUR.micro } }}
            whileTap={{ scale: 0.98 }}
          >
            <Link href={`/memorias/${memory.id}`} className="block">
              <article
                className="polaroid flex h-full flex-col"
                style={{ backgroundColor: memory.theme.polaroidBg }}
              >
                <div className="flex h-52 items-center justify-center overflow-hidden">
                  {coverUrl ? (
                     
                    <motion.img
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      src={coverUrl}
                      alt={memory.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <motion.span
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-5xl"
                      style={{ color: memory.theme.accent }}
                    >
                      💌
                    </motion.span>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-center gap-1 px-3 py-3 text-center">
                  <h2
                    className="text-2xl leading-tight"
                    style={{ fontFamily: "'Sofia', cursive", color: memory.theme.accent }}
                  >
                    {memory.title}
                  </h2>
                  {memory.date && <p className="text-sm opacity-70">{memory.date}</p>}
                </div>
              </article>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
