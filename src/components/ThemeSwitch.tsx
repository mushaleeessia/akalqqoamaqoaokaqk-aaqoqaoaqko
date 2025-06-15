
import { useEffect, useRef, useState } from "react";
import { Sun, Moon } from "lucide-react";

// Há 3 estados: 'light', 'dark', ou 'system'
type Theme = "light" | "dark" | "system";

const themeStorageKey = "theme-preference";

const getSystemTheme = (): Theme => {
  if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
};

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(themeStorageKey) as Theme | null;
  if (stored) return stored;
  return "system";
};

interface AnimationState {
  inProgress: boolean;
  toTheme: Theme;
  origin: { x: number; y: number; };
}

export const ThemeSwitch = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [animation, setAnimation] = useState<AnimationState | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Aplica o tema no HTML
    const applyTheme = (_theme: Theme) => {
      if (_theme === "system") {
        const system = getSystemTheme();
        document.documentElement.classList.toggle("dark", system === "dark");
      } else {
        document.documentElement.classList.toggle("dark", _theme === "dark");
      }
    };
    localStorage.setItem(themeStorageKey, theme);
    applyTheme(theme);
    if (theme === "system") {
      const listener = (e: MediaQueryListEvent) => {
        document.documentElement.classList.toggle("dark", e.matches);
      };
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      mql.addEventListener("change", listener);
      return () => mql.removeEventListener("change", listener);
    }
  }, [theme]);

  // Calcula o raio para cobrir a tela a partir do ponto de origem
  const calculateCircleRadius = (x: number, y: number) => {
    // Canto da tela mais distante do ponto de origem
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dx = x < w / 2 ? w - x : x;
    const dy = y < h / 2 ? h - y : y;
    // Hipotenusa (distância máxima)
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Inicia a animação de círculo a partir do botão clicado e troca tema durante o efeito
  const handleThemeChange = (toTheme: Theme) => (e: React.MouseEvent) => {
    // Pega centro do botão clicado
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const clickX = rect.left + rect.width / 2;
    const clickY = rect.top + rect.height / 2;
    setAnimation({
      inProgress: true,
      toTheme,
      origin: { x: clickX, y: clickY }
    });

    // Tema será trocado no meio da expansão
    setTimeout(() => {
      setTheme(toTheme);
    }, 350);

    // Termina a animação após fade-out
    setTimeout(() => {
      setAnimation(null);
    }, 750);
  };

  // Botão central para transição
  const handleSwitch = (e: React.MouseEvent) => {
    if (theme === "light") handleThemeChange("dark")(e);
    else if (theme === "dark") handleThemeChange("system")(e);
    else handleThemeChange("light")(e);
  };

  // Overlay animado
  const renderOverlay = () => {
    if (!animation) return null;
    // calcula o raio máximo e origem
    const radius = calculateCircleRadius(animation.origin.x, animation.origin.y) + 64;
    // Cor da animação conforme tema alvo
    const toTheme = animation.toTheme;
    let circleColor = "#171717bb"; // escuro (dark)
    if (toTheme === "light") circleColor = "#faf7bdaa";
    if (toTheme === "system") circleColor = "#6ee7b7bb"; // verde para system
    // Para animação do círculo expandindo + fade
    return (
      <div
        ref={overlayRef}
        className="pointer-events-none fixed inset-0 z-[100] transition-all duration-700"
        style={{}}
      >
        <div
          // O círculo cresce do ponto do clique
          className={`
            rounded-full
            fixed
            transition-[width,height,opacity,left,top] duration-700
            will-change-[width,height,opacity,left,top]
            pointer-events-none
            opacity-100
            animate-none
          `}
          style={{
            width: 0,
            height: 0,
            left: animation.origin.x,
            top: animation.origin.y,
            background: circleColor,
            boxShadow: "0 0 70px 30px #0002",
            transform: "translate(-50%,-50%)",
            zIndex: 999,
            animation: "theme-expand 0.7s cubic-bezier(.68,-0.6,.32,1.3) forwards"
          }}
        />
        <style>
          {`
          @keyframes theme-expand {
            0% { width:0; height:0; opacity:0.8; }
            50% { opacity:1; }
            68% { width:${radius * 1.25}px; height:${radius * 1.25}px; opacity:1; }
            100% { width:${radius * 1.25}px; height:${radius * 1.25}px; opacity:0; }
          }
          `}
        </style>
      </div>
    );
  };

  // UI buttons
  return (
    <>
      <div className="flex items-center space-x-4 relative z-10">
        <button
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            theme === "light"
              ? "bg-yellow-300/80 shadow-lg shadow-yellow-200/30 scale-110"
              : "hover:bg-yellow-100/40"
          }`}
          title="Modo claro"
          onClick={handleThemeChange("light")}
          aria-label="Tema claro"
        >
          <Sun className={`h-6 w-6 transition ${theme === "light" ? "text-yellow-700" : "text-yellow-400"}`} />
        </button>
        <button
          tabIndex={0}
          className={`
            w-14 h-8 rounded-full border-2 border-red-700 bg-red-900/60 flex items-center transition-all duration-300 relative
            focus-visible:ring-2 ring-red-400/90
          `}
          style={{ outline: "none" }}
          aria-label="Alternar tema"
          onClick={handleSwitch}
          title="Alternar tema (claro/escuro/automático)"
        >
          <span
            className={`
              absolute left-1 top-1 w-6 h-6 rounded-full transition-all duration-300
              bg-white/80 shadow
              ${theme === "light"
                ? "translate-x-0"
                : theme === "dark"
                ? "translate-x-6 bg-zinc-800/80"
                : "translate-x-3 bg-gradient-to-br from-yellow-200 via-gray-200 to-gray-700/40"}
            `}
          />
        </button>
        <button
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            theme === "dark"
              ? "bg-slate-900/90 shadow-lg shadow-zinc-800/40 scale-110"
              : "hover:bg-slate-800/30"
          }`}
          title="Modo escuro"
          onClick={handleThemeChange("dark")}
          aria-label="Tema escuro"
        >
          <Moon className={`h-6 w-6 transition ${theme === "dark" ? "text-blue-100" : "text-zinc-500"}`} />
        </button>
        <button
          className={`
            px-2 py-0.5 rounded font-semibold text-xs transition-all duration-200 border
            ${theme === "system"
              ? "border-green-400 bg-green-700/30 text-green-100 scale-105 shadow"
              : "border-slate-600 bg-slate-700/10 text-slate-200 hover:bg-slate-700/20"}
          `}
          onClick={handleThemeChange("system")}
          aria-label="Modo automático pelo sistema"
          title="Seguir tema do sistema"
        >
          Auto
        </button>
      </div>
      {/* Overlay animado */}
      {renderOverlay()}
    </>
  );
};

