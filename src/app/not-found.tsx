import Link from "next/link";

export default function NotFound() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center"
      style={{ backgroundColor: "#fdf2e9" }}
    >
      <h1
        className="text-5xl"
        style={{ fontFamily: "'Sofia', cursive", color: "#c2410c" }}
      >
        Ops!
      </h1>
      <p className="text-neutral-600">Não encontramos o que você procurava.</p>
      <Link href="/memorias" className="text-neutral-500 underline hover:text-neutral-700">
        ← Voltar para as memórias
      </Link>
    </main>
  );
}
