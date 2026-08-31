export default function Loading() {
  return (
    <main className="min-h-screen px-5 py-10" style={{ backgroundColor: "#fdf2e9" }}>
      <header className="mx-auto mb-8 max-w-3xl text-center">
        <div className="mx-auto h-9 w-56 rounded bg-neutral-200" />
        <div className="mx-auto mt-3 h-4 w-72 rounded bg-neutral-200/70" />
      </header>
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="polaroid overflow-hidden"
            style={{
              background: "linear-gradient(90deg, #f5f5f5 25%, #fafafa 50%, #f5f5f5 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.4s ease infinite",
            }}
          >
            <div className="h-52 bg-neutral-200/60" />
            <div className="space-y-2 px-3 py-3">
              <div className="h-5 w-3/4 rounded bg-neutral-200" />
              <div className="h-3 w-1/2 rounded bg-neutral-200" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
