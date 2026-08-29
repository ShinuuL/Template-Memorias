import type { Metadata } from "next";
import MemoryEditor from "@/components/admin/memory-editor";

export const metadata: Metadata = {
  title: "Nova memória",
};

export const dynamic = "force-dynamic";

export default function NovaMemoriaPage() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-neutral-800">Nova memória</h1>
      <MemoryEditor />
    </div>
  );
}
