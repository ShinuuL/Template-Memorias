// Tokens de motion — tema polaroid/carta (suave, não elástico)
export const EASE = [0.25, 0.1, 0.25, 1] as const;
export const EASE_BOUNCE = [0.34, 1.56, 0.64, 1] as const;
export const DUR = {
  micro: 0.2,
  card: 0.45,
  carta: 0.6,
  stagger: 0.07,
} as const;
export const SPRING = {
  type: "spring" as const,
  stiffness: 300,
  damping: 24,
};
