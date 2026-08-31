"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import UnlockForm from "./unlock-form";
import { DUR, EASE } from "@/lib/motion";

export default function FachadaMotion({
  bg,
  pergunta,
}: {
  bg: string;
  pergunta: string;
}) {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="flex min-h-screen flex-col items-center justify-center gap-6 px-6"
      style={{ backgroundColor: bg }}
    >
      <motion.h1
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: DUR.carta, ease: EASE }}
        className="text-center text-4xl sm:text-5xl"
        style={{ fontFamily: "'Sofia', cursive", fontStyle: "oblique" }}
      >
        {pergunta}
      </motion.h1>

      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35, duration: DUR.carta, ease: EASE }}
      >
        <UnlockForm pergunta={pergunta} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <Link
          href="/login"
          className="mt-10 inline-block text-xs text-black/40 underline hover:text-black/60"
        >
          área administrativa
        </Link>
      </motion.div>
    </motion.main>
  );
}
