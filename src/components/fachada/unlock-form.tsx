"use client";

import { useActionState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { checkUnlock, type UnlockResult } from "@/lib/actions/unlock";
import { DUR, EASE } from "@/lib/motion";

const initialState: UnlockResult = { ok: true };

export default function UnlockForm({ pergunta }: { pergunta: string }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: UnlockResult, formData: FormData) => checkUnlock(formData),
    initialState
  );

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col items-center gap-4">
      <label
        htmlFor="resposta"
        className="text-center text-2xl"
        style={{ fontFamily: "'Sofia', cursive", fontStyle: "oblique" }}
      >
        {pergunta}
      </label>

      <motion.input
        id="resposta"
        name="resposta"
        autoComplete="off"
        animate={!state.ok ? { x: [0, -6, 6, -4, 0] } : { x: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="w-full max-w-[220px] rounded-md border border-black/20 bg-white px-3 py-2 text-center text-lg text-black outline-none focus:border-emerald-500"
        placeholder=""
      />

      <motion.button
        type="submit"
        disabled={pending}
        animate={pending ? { scale: 0.98 } : { scale: 1 }}
        transition={{ duration: DUR.micro }}
        className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-6 py-2 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {pending && (
          <motion.span
            className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            aria-hidden
          />
        )}
        {pending ? "Verificando..." : "Verificar"}
      </motion.button>

      <AnimatePresence mode="wait">
        {!state.ok && (
          <motion.p
            key="error"
            initial={{ y: -6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="text-center text-base text-black/70"
            role="alert"
            style={{ fontStyle: "oblique" }}
          >
            {state.error}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}
