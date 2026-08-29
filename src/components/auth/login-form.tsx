"use client";

import { useActionState } from "react";
import { signIn, type AuthResult } from "@/lib/actions/auth";

const initialState: AuthResult = { ok: true };

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: AuthResult, formData: FormData) => {
      formData.set("next", next);
      return await signIn(formData);
    },
    initialState
  );

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium">
        E-mail
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="rounded-md border border-black/15 bg-white px-3 py-2 text-black outline-none focus:border-rose-400"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Senha
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="rounded-md border border-black/15 bg-white px-3 py-2 text-black outline-none focus:border-rose-400"
        />
      </label>

      {!state.ok && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-md bg-rose-500 px-4 py-2 font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60"
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
