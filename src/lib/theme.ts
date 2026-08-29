import type { CSSProperties } from "react";
import { AVAILABLE_FONTS, type Theme } from "./types";

// Converte um nome de fonte do tema para o valor CSS correto.
export function fontCss(name: string): string {
  const found = AVAILABLE_FONTS.find((f) => f.label === name);
  return found ? found.css : "'Sofia', cursive";
}

// Gera as CSS custom properties aplicadas inline no contêiner da memória,
// para que os estilos (Tamanhos de fotos etc.) usem as cores do tema.
export function themeToCssVars(theme: Theme): CSSProperties {
  return {
    "--mem-bg": theme.bg,
    "--mem-text": theme.text,
    "--mem-accent": theme.accent,
    "--mem-font-heading": fontCss(theme.fontHeading),
    "--mem-font-body": fontCss(theme.fontBody),
    "--mem-polaroid": theme.polaroidBg,
  } as CSSProperties;
}
