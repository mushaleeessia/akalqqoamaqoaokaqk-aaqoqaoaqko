
export type Theme = "light" | "dark" | "system";
export const themeStorageKey = "theme-preference";

export const getSystemTheme = (): Theme => {
  if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
};

export const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(themeStorageKey) as Theme | null;
  if (stored) return stored;
  return "system";
};

// Calcula o maior raio possível (da origem para cada canto da janela)
export const calculateCircleRadius = (x: number, y: number) => {
  const corners = [
    { x: 0, y: 0 },
    { x: window.innerWidth, y: 0 },
    { x: 0, y: window.innerHeight },
    { x: window.innerWidth, y: window.innerHeight },
  ];
  let maxDist = 0;
  for (const corner of corners) {
    const dist = Math.hypot(corner.x - x, corner.y - y);
    if (dist > maxDist) maxDist = dist;
  }
  return maxDist + 64;
};
