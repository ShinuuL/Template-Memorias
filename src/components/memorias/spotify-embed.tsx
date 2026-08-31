"use client";

import { useState } from "react";

// Embutidor de música do Spotify com skeleton shimmer.
export default function SpotifyEmbed({
  trackId,
  className = "",
}: {
  trackId: string;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`spotify-embed relative w-full overflow-hidden rounded-xl ${className}`}>
      {!loaded && (
        <div
          className="absolute inset-0 rounded-xl"
          style={{
            background: "linear-gradient(90deg, #f0f0f0 25%, #fafafa 50%, #f0f0f0 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s ease infinite",
          }}
          aria-hidden
        />
      )}
      <iframe
        src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator`}
        width="100%"
        height="152"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title="Música no Spotify"
        style={{ borderRadius: "12px", overflow: "hidden", opacity: loaded ? 1 : 0, transition: "opacity 0.4s" }}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
