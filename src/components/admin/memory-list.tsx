"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { deleteMemory, reorderMemories } from "@/lib/actions/memorias";
import type { Memory } from "@/lib/types";

function SortableRow({
  memory,
  index,
  onDelete,
}: {
  memory: Memory;
  index: number;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: memory.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-3 shadow-sm"
    >
      {/* Alça de arrastar */}
      <button
        {...attributes}
        {...listeners}
        aria-label="Arrastar para reordenar"
        className="cursor-grab touch-none select-none text-neutral-400 hover:text-neutral-600 active:cursor-grabbing"
      >
        ⠿
      </button>

      <span className="w-6 text-center text-sm text-neutral-400">{index + 1}</span>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-neutral-800">{memory.title}</p>
        {memory.date && (
          <p className="text-sm text-neutral-500">{memory.date}</p>
        )}
      </div>

      <Link
        href={`/admin/memorias/${memory.id}`}
        className="rounded-md border border-neutral-300 px-3 py-1 text-sm text-neutral-600 hover:bg-neutral-50"
      >
        Editar
      </Link>

      <button
        type="button"
        onClick={() => onDelete(memory.id)}
        className="rounded-md border border-red-200 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
      >
        Excluir
      </button>
    </li>
  );
}

export default function MemoryList({ memories }: { memories: Memory[] }) {
  const router = useRouter();
  const [items, setItems] = useState<string[]>(
    memories.map((m) => m.id)
  );

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems((prev) => {
      const oldIndex = prev.indexOf(String(active.id));
      const newIndex = prev.indexOf(String(over.id));
      const next = arrayMove(prev, oldIndex, newIndex);
      void reorderMemories(next);
      return next;
    });
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que quer excluir esta memória e todas as suas fotos?")) return;
    await deleteMemory(id);
    setItems((prev) => prev.filter((item) => item !== id));
    router.refresh();
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-col gap-2">
          {items.map((id, index) => {
            const memory = memories.find((m) => m.id === id);
            return (
              <SortableRow
                key={id}
                memory={memory as Memory}
                index={index}
                onDelete={handleDelete}
              />
            );
          })}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
