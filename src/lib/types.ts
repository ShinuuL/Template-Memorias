// Tipos compartilhados entre leitura pública, painel e visualização.

export interface Theme {
  // Cor de fundo da página da memória.
  bg: string;
  // Cor principal do texto.
  text: string;
  // Cor de destaque (títulos, links, botões de ação).
  accent: string;
  // Fonte para títulos (ex: "Sofia", "Shadows Into Light").
  fontHeading: string;
  // Fonte para o corpo/carta (ex: "Shadows Into Light", "Sofia").
  fontBody: string;
  // Cor de fundo das "polaroids" (fotos com borda).
  polaroidBg: string;
}

export interface Memory {
  id: string;
  title: string;
  date: string | null;
  letter: string | null;
  spotify_tracks: string[];
  theme: Theme;
  sort_order: number;
  created_at: string;
}

export interface Photo {
  id: string;
  memory_id: string;
  storage_path: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export interface SiteConfig {
  id: number;
  pergunta: string;
  resposta: string;
  fachada_bg: string;
}

export interface MemoryWithPhotos extends Memory {
  photos: Photo[];
}

// Tema padrão, igual ao visual do template original.
export const DEFAULT_THEME: Theme = {
  bg: "#89cff0",
  text: "#1a1a1a",
  accent: "#e91e63",
  fontHeading: "Sofia",
  fontBody: "Shadows Into Light",
  polaroidBg: "#ffffff",
};

// Fontes candidatas que o painel permite escolher. Mantidas em sincronia
// com as fontes carregadas no layout global.
export const AVAILABLE_FONTS: { label: string; css: string }[] = [
  { label: "Sofia", css: "'Sofia', cursive" },
  { label: "Shadows Into Light", css: "'Shadows Into Light', cursive" },
  { label: "Poppins", css: "'Poppins', sans-serif" },
  { label: "Great Vibes", css: "'Great Vibes', cursive" },
  { label: "Dancing Script", css: "'Dancing Script', cursive" },
];
