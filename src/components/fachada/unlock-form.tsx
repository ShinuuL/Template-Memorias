"use client";

import { useActionState } from "react";
import { checkUnlock, type UnlockResult } from "@/lib/actions/unlock";

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

      <input
        id="resposta"
        name="resposta"
        autoComplete="off"
        className="w-full max-w-[220px] rounded-md border border-black/20 bg-white px-3 py-2 text-center text-lg text-black outline-none focus:border-emerald-500"
        placeholder=""
      />

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-emerald-600 px-6 py-2 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {pending ? "Verificando..." : "Verificar"}
      </button>

      {!state.ok && (
        <p className="text-center text-base text-black/70" role="alert" style={{ fontStyle: "oblique" }}>
          {state.error}
        </p>
      )}
    </form>
  );
}
