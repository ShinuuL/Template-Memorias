// Embutidor de música do Spotify (server component).
// Renderiza o iframe da track sem a barra de rolagem visível.
export default function SpotifyEmbed({
  trackId,
  className = "",
}: {
  trackId: string;
  className?: string;
}) {
  return (
    <div className={`spotify-embed w-full overflow-hidden rounded-xl ${className}`}>
      <iframe
        src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator`}
        width="100%"
        height="152"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title="Música no Spotify"
        style={{ borderRadius: "12px", overflow: "hidden" }}
      />
    </div>
  );
}
