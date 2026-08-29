"use client";

import { useActionState, useState } from "react";
import { updateSiteConfig, type SaveResult } from "@/lib/actions/memorias";
import type { SiteConfig } from "@/lib/types";

const initial: SaveResult | null = null;

export default function FachadaForm({ config }: { config: SiteConfig }) {
  const [fachadaBg, setFachadaBg] = useState(config.fachada_bg ?? "#69dd69");
  const [state, formAction, isPending] = useActionState<SaveResult | null, FormData>(
    async (_prev, formData) => updateSiteConfig(_prev as SaveResult, formData),
    initial
  );

  const justSaved = state !== null && state.ok;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {!justSaved && state && !state.ok && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      {justSaved && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          Configuração salva!
        </p>
      )}

      <label className="flex flex-col gap-1 text-sm font-medium">
        Pergunta da fachada
        <input
          type="text"
          name="pergunta"
          defaultValue={config.pergunta}
          required
          className="rounded-md border border-neutral-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Resposta (senha do visualizador)
        <input
          type="text"
          name="resposta"
          defaultValue={config.resposta}
          required
          autoComplete="off"
          className="rounded-md border border-neutral-300 px-3 py-2"
        />
        <span className="text-xs text-neutral-400">
          É a resposta que o visualizador precisa digitar na fachada para liberar as memórias.
        </span>
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Cor de fundo da fachada
        <span className="flex items-center gap-3">
          <input
            type="color"
            name="fachada_bg"
            value={fachadaBg}
            onChange={(e) => setFachadaBg(e.target.value)}
            className="h-9 w-14 cursor-pointer rounded border border-neutral-300 p-1"
            aria-label="Cor de fundo da fachada"
          />
          <input
            type="text"
            value={fachadaBg}
            onChange={(e) => setFachadaBg(e.target.value)}
            placeholder="#69dd69"
            pattern="^#[0-9a-fA-F]{6}$"
            className="w-28 rounded-md border border-neutral-300 px-3 py-2 font-mono text-sm"
          />
          <span
            className="h-7 w-7 rounded-full border border-black/10"
            style={{ backgroundColor: fachadaBg }}
            aria-hidden
          />
        </span>
        <span className="text-xs text-neutral-400">Clique no quadrado para escolher a cor.</span>
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded-md bg-rose-500 px-6 py-2.5 font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
      >
        {isPending ? "Salvando…" : "Salvar"}
      </button>
    </form>
  );
}
