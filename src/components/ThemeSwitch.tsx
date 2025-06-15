import { useEffect, useRef, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { ThemeSwitchOverlay } from "./ThemeSwitchOverlay";
import {
  Theme,
  getSystemTheme,
  getInitialTheme,
  themeStorageKey,
} from "./theme-utils";

// 3 possíveis estados: 'light', 'dark' ou 'system'
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
  origin: { x: number; y: number };
}

export const ThemeSwitch = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [animation, setAnimation] = useState<{
    inProgress: boolean;
    toTheme: Theme;
    origin: { x: number; y: number };
  } | null>(null);
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

  // Calcula o maior raio possível (da origem para cada canto da janela)
  const calculateCircleRadius = (x: number, y: number) => {
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

  // Inicia animação, faz troca suave do tema
  const handleThemeChange = (toTheme: Theme) => (e: React.MouseEvent) => {
    // Usa centro do botão
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const clickX = rect.left + rect.width / 2;
    const clickY = rect.top + rect.height / 2;
    setAnimation({
      inProgress: true,
      toTheme,
      origin: { x: clickX, y: clickY }
    });

    // Tema muda após meio segundo (sincronizado com animação)
    setTimeout(() => {
      setTheme(toTheme);
    }, 370);

    // Limpa overlay depois da animação
    setTimeout(() => {
      setAnimation(null);
    }, 730);
  };

  // Botão central para ciclo de tema
  const handleSwitch = (e: React.MouseEvent) => {
    if (theme === "light") handleThemeChange("dark")(e);
    else if (theme === "dark") handleThemeChange("system")(e);
    else handleThemeChange("light")(e);
  };

  // Overlay animado + animação suavizada
  const renderOverlay = () => {
    if (!animation) return null;
    const { origin, toTheme } = animation;
    const radius = calculateCircleRadius(origin.x, origin.y);
    let circleColor = "rgba(5,5,16,0.85)";
    let gradient = "";
    if (toTheme === "light") {
      circleColor = "rgba(255, 246, 186, 0.88)";
      gradient = "radial-gradient(circle at 60% 40%, #fff7d6 68%, #fff79e 100%)";
    } else if (toTheme === "system") {
      circleColor = "rgba(110, 231, 183, 0.83)";
      gradient = "radial-gradient(circle at 50% 30%, #6ee7b7 70%, #065f46 100%)";
    } else {
      gradient = "radial-gradient(circle at 55% 55%, #16162d 65%, #000 100%)";
    }

    return (
      <div
        ref={overlayRef}
        className="pointer-events-none fixed inset-0 z-[100] transition-all duration-700"
        style={{}}
      >
        <div
          className={`
            rounded-full
            fixed
            pointer-events-none
            will-change-[width,height,opacity,left,top]
            transition-all
          `}
          style={{
            width: 0,
            height: 0,
            left: origin.x,
            top: origin.y,
            opacity: 0.9,
            background: gradient.length ? gradient : circleColor,
            boxShadow: "0 0 110px 40px #0002",
            transform: "translate(-50%,-50%)",
            zIndex: 999,
            animation: `theme-expand-softer 0.68s cubic-bezier(.77,-0.41,.17,1.32) forwards`
          }}
        />
        <style>
          {`
            @keyframes theme-expand-softer {
              0% { width:0; height:0; opacity:0.88; filter: blur(0px);}
              43% {opacity:1;}
              65% { width:${radius * 2}px; height:${radius * 2}px; opacity:1; filter: blur(0.5px);}
              80% { opacity:0.93;}
              100% { width:${radius * 2}px; height:${radius * 2}px; opacity:0; filter: blur(1.5px);}
            }
          `}
        </style>
      </div>
    );
  };

  // UI dos botões
  return (
    <>
      <div className="flex items-center space-x-4 relative z-10">
        <button
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all outline-none focus-visible:ring-2 ring-yellow-400/70
            ${theme === "light"
              ? "bg-yellow-200/90 shadow-md shadow-yellow-100/40 scale-105"
              : "hover:bg-yellow-100/50"}
          `}
          title="Modo claro"
          onClick={handleThemeChange("light")}
          aria-label="Tema claro"
          tabIndex={0}
        >
          <Sun className={`h-6 w-6 transition ${theme === "light" ? "text-yellow-800" : "text-yellow-400"}`} />
        </button>
        <button
          tabIndex={0}
          className={`
            w-14 h-8 rounded-full border-2 border-red-700 bg-red-900/70 flex items-center transition-all duration-300 relative
            shadow-inner shadow-red-900/60
            focus-visible:ring-2 ring-red-400/90
          `}
          style={{ outline: "none" }}
          aria-label="Alternar tema"
          onClick={handleSwitch}
          title="Alternar tema (claro/escuro/automático)"
        >
          <span
            className={`
              absolute left-1 top-1 w-6 h-6 rounded-full transition-all duration-300 shadow
              bg-gradient-to-tr 
              ${theme === "light"
                ? "from-yellow-400 to-yellow-100 translate-x-0"
                : theme === "dark"
                  ? "from-zinc-700 to-slate-800 translate-x-6"
                  : "from-green-200 to-green-600 translate-x-3"}
            `}
          />
        </button>
        <button
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all outline-none focus-visible:ring-2 ring-blue-300/70
            ${theme === "dark"
              ? "bg-slate-900/90 shadow-md shadow-zinc-700/40 scale-105"
              : "hover:bg-slate-900/20"}
          `}
          title="Modo escuro"
          onClick={handleThemeChange("dark")}
          aria-label="Tema escuro"
          tabIndex={0}
        >
          <Moon className={`h-6 w-6 transition ${theme === "dark" ? "text-blue-100" : "text-zinc-500"}`} />
        </button>
        <button
          className={`
            px-2 py-0.5 rounded font-semibold text-xs transition-all duration-200 border
            ${theme === "system"
              ? "border-green-400 bg-green-700/40 text-green-100 scale-105 shadow"
              : "border-slate-600 bg-slate-700/10 text-slate-200 hover:bg-slate-700/15"}
          `}
          onClick={handleThemeChange("system")}
          aria-label="Modo automático pelo sistema"
          title="Seguir tema do sistema"
        >
          Auto
        </button>
      </div>
      {/* Overlay animado */}
      <ThemeSwitchOverlay animation={animation} />
    </>
  );
};
