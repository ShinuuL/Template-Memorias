"use client";

import { useActionState, useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { saveMemory, type SaveResult } from "@/lib/actions/memorias";
import { AVAILABLE_FONTS, DEFAULT_THEME, type Memory, type Theme } from "@/lib/types";

type EditorPhoto =
  | { kind: "existing"; id: string; url: string; caption: string }
  | { kind: "new"; file: File; preview: string; caption: string };

// Extrai o track id de um link do Spotify ou aceita o id puro.
function parseSpotifyId(input: string): string | null {
  const clean = input.trim();
  if (!clean) return null;

  const trackMatch = clean.match(
    /(?:open\.spotify\.com|spotify\.com)\/(?:embed\/)?track\/([A-Za-z0-9]+)/
  );
  if (trackMatch) return trackMatch[1];

  // Aceita só o id (seqüência alfanumérica)
  if (/^[A-Za-z0-9]{22}$/.test(clean)) return clean;
  return null;
}

function TrackItem({ track, onRemove }: { track: string; onRemove: () => void }) {
  return (
    <li className="flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2">
      <span className="text-rose-500">♪</span>
      <span className="flex-1 truncate font-mono text-xs text-neutral-600">{track}</span>
      <button
        type="button"
        onClick={onRemove}
        className="text-neutral-400 hover:text-red-500"
        aria-label="Remover música"
      >
        ✕
      </button>
    </li>
  );
}

// --- Fotos com reorder (drag) -------------------------------------
function SortablePhoto({
  photo,
  onChangeCaption,
  onRemove,
}: {
  photo: EditorPhoto;
  onChangeCaption: (caption: string) => void;
  onRemove: () => void;
}) {
  // id único da foto para o drag (fotos novas usam o nome do arquivo)
  const dragId = photo.kind === "new" ? `new-${photo.file.name}` : photo.id;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: dragId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.6 : 1,
  };

  const src =
    photo.kind === "existing" ? photo.url : photo.kind === "new" ? photo.preview : "";

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-2 shadow-sm"
    >
      <button
        {...attributes}
        {...listeners}
        aria-label="Arrastar"
        className="cursor-grab touch-none text-neutral-400 hover:text-neutral-600 active:cursor-grabbing"
      >
        ⠿
      </button>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="prévia"
        className="h-16 w-16 shrink-0 rounded object-cover"
      />

      <input
        type="text"
        value={photo.caption}
        onChange={(e) => onChangeCaption(e.target.value)}
        placeholder="Legenda (opcional)"
        className="min-w-0 flex-1 rounded-md border border-neutral-200 px-2 py-1.5 text-sm"
      />

      <button
        type="button"
        onClick={onRemove}
        className="text-neutral-400 hover:text-red-500"
        aria-label="Remover foto"
      >
        ✕
      </button>
    </li>
  );
}

// --- Editor principal ----------------------------------------------
export default function MemoryEditor({
  memory,
  photos = [],
}: {
  memory?: Memory; // undefined => nova
  photos?: { id: string; url: string; caption: string }[];
}) {
  const isNew = !memory;

  // Campos básicos
  const [title, setTitle] = useState(memory?.title ?? "");
  const [date, setDate] = useState(memory?.date ?? "");
  const [letter, setLetter] = useState(memory?.letter ?? "");

  // Tema
  const [theme, setTheme] = useState<Theme>(memory?.theme ?? DEFAULT_THEME);

  // Playlist
  const [tracks, setTracks] = useState<string[]>(memory?.spotify_tracks ?? []);
  const [trackInput, setTrackInput] = useState("");

  // Fotos
  const [editorPhotos, setEditorPhotos] = useState<EditorPhoto[]>(
    photos.map((p) => ({ kind: "existing", id: p.id, url: p.url, caption: p.caption }))
  );
  const [deleted, setDeleted] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const [state, formAction, isPending] = useActionState<SaveResult, FormData>(
    saveMemory,
    { ok: true }
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function pickPhotos(files: FileList | null) {
    if (!files) return;
    const nextNew: EditorPhoto[] = Array.from(files).map((file) => ({
      kind: "new",
      file,
      preview: URL.createObjectURL(file),
      caption: "",
    }));
    setEditorPhotos((prev) => [...prev, ...nextNew]);
  }

  // id único de uma foto do editor (necessário p/ drag-and-drop)
  function keyOf(p: EditorPhoto): string {
    return p.kind === "existing" ? p.id : `new-${p.file.name}`;
  }

  function handlePhotosDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setEditorPhotos((prev) => {
      const oldIndex = prev.findIndex((p) => keyOf(p) === active.id);
      const newIndex = prev.findIndex((p) => keyOf(p) === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  function updateCaptionAt(id: string, caption: string) {
    setEditorPhotos((prev) =>
      prev.map((p) => (keyOf(p) === id ? { ...p, caption } : p))
    );
  }

  function removePhoto(id: string) {
    setEditorPhotos((prev) => {
      const target = prev.find((p) => keyOf(p) === id);
      if (target?.kind === "existing") {
        setDeleted((d) => [...d, target.id]);
      }
      return prev.filter((p) => keyOf(p) !== id);
    });
  }

  function addTrack() {
    const id = parseSpotifyId(trackInput);
    if (!id) return;
    setTracks((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setTrackInput("");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const fd = new FormData();
    fd.set("memoryId", isNew ? "" : (memory!.id as string));
    fd.set("title", title);
    fd.set("date", date);
    fd.set("letter", letter);
    fd.set("theme", JSON.stringify(theme));
    fd.set("tracks", JSON.stringify(tracks));
    fd.set("deleted", JSON.stringify(deleted));

    // Monta photoOrder e arquivos novos, na ordem atual
    const order: unknown[] = [];
    const newFiles: File[] = [];
    for (const p of editorPhotos) {
      if (p.kind === "existing") {
        order.push({ kind: "existing", id: p.id, caption: p.caption });
      } else {
        order.push({ kind: "new", caption: p.caption, fileIndex: newFiles.length });
        newFiles.push(p.file);
      }
    }
    fd.set("photoOrder", JSON.stringify(order));
    newFiles.forEach((f) => fd.append("files", f));

    formAction(fd);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {!state.ok && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      {/* Básicos */}
      <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-neutral-800">Informações</h2>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Título *
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="rounded-md border border-neutral-300 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Data (opcional)
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="ex: 12/05/2026"
              className="rounded-md border border-neutral-300 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Carta
            <textarea
              value={letter}
              onChange={(e) => setLetter(e.target.value)}
              rows={8}
              placeholder="Escreva aqui a sua carta…"
              className="rounded-md border border-neutral-300 px-3 py-2"
            />
          </label>
        </div>
      </section>

      {/* Tema */}
      <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-neutral-800">Aparência</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Fundo
            <input
              type="color"
              value={theme.bg}
              onChange={(e) => setTheme({ ...theme, bg: e.target.value })}
              className="h-10 w-full cursor-pointer rounded border border-neutral-300"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Texto
            <input
              type="color"
              value={theme.text}
              onChange={(e) => setTheme({ ...theme, text: e.target.value })}
              className="h-10 w-full cursor-pointer rounded border border-neutral-300"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Destaque
            <input
              type="color"
              value={theme.accent}
              onChange={(e) => setTheme({ ...theme, accent: e.target.value })}
              className="h-10 w-full cursor-pointer rounded border border-neutral-300"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Cartão da foto
            <input
              type="color"
              value={theme.polaroidBg}
              onChange={(e) => setTheme({ ...theme, polaroidBg: e.target.value })}
              className="h-10 w-full cursor-pointer rounded border border-neutral-300"
            />
          </label>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Fonte do título
            <select
              value={theme.fontHeading}
              onChange={(e) => setTheme({ ...theme, fontHeading: e.target.value })}
              className="rounded-md border border-neutral-300 px-3 py-2"
            >
              {AVAILABLE_FONTS.map((f) => (
                <option key={f.label} value={f.label}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Fonte do corpo
            <select
              value={theme.fontBody}
              onChange={(e) => setTheme({ ...theme, fontBody: e.target.value })}
              className="rounded-md border border-neutral-300 px-3 py-2"
            >
              {AVAILABLE_FONTS.map((f) => (
                <option key={f.label} value={f.label}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {/* Playlist */}
      <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-neutral-800">Músicas (Spotify)</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={trackInput}
            onChange={(e) => setTrackInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTrack();
              }
            }}
            placeholder="Cole o link da música ou o ID da track"
            className="min-w-0 flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={addTrack}
            className="shrink-0 rounded-md bg-neutral-800 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-900"
          >
            + Adicionar
          </button>
        </div>
        {tracks.length > 0 && (
          <ul className="mt-3 flex flex-col gap-2">
            {tracks.map((t) => (
              <TrackItem
                key={t}
                track={t}
                onRemove={() => setTracks((prev) => prev.filter((x) => x !== t))}
              />
            ))}
          </ul>
        )}
      </section>

      {/* Fotos */}
      <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-800">Fotos</h2>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-md bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
          >
            + Adicionar da galeria
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              pickPhotos(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {editorPhotos.length === 0 ? (
          <p className="text-sm text-neutral-400">
            Nenhuma foto ainda. Clique em &quot;Adicionar da galeria&quot;.
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handlePhotosDragEnd}
          >
            <SortableContext items={editorPhotos.map(keyOf)} strategy={verticalListSortingStrategy}>
              <ul className="flex flex-col gap-2">
                {editorPhotos.map((p) => (
                  <SortablePhoto
                    key={keyOf(p)}
                    photo={p}
                    onChangeCaption={(c) => updateCaptionAt(keyOf(p), c)}
                    onRemove={() => removePhoto(keyOf(p))}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
        <p className="mt-2 text-xs text-neutral-400">
          Arraste para reordenar. As fotos aparecem intercaladas com as músicas na página.
        </p>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-rose-500 px-6 py-2.5 font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
        >
          {isPending ? "Salvando…" : "Salvar"}
        </button>
        <span className="text-sm text-neutral-400">~</span>
      </div>
    </form>
  );
}
