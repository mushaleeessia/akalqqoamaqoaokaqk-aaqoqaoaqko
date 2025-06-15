
import { useEffect, useState } from "react";
import { Sunrise, Moon } from "lucide-react";
import {
  Theme,
  getSystemTheme,
  getInitialTheme,
  themeStorageKey,
} from "./theme-utils";

// Tamanho do slider, do thumb e da borda
const SLIDER_WIDTH = 56;
const SLIDER_HEIGHT = 28;
const THUMB_SIZE = 24;
const SLIDER_BORDER = 2; // border-2 (tailwind = 2px)

// O espaço interno disponível pro thumb é menor devido à borda de ambos os lados
const SLIDER_INNER_WIDTH = SLIDER_WIDTH - SLIDER_BORDER * 2;

export const ThemeSwitch = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
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

  const handleThemeChange = (toTheme: Theme) => () => {
    setTheme(toTheme);
  };

  const handleSwitch = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  // Gradiente do thumb
  let thumbGradient = "from-yellow-400 to-yellow-100";
  if (theme === "dark") {
    thumbGradient = "from-zinc-700 to-slate-800";
  } else if (theme === "system") {
    thumbGradient = "from-green-200 to-green-600";
  }

  // Calculando posição da thumb:
  // O limite de left é SLIDER_INNER_WIDTH - THUMB_SIZE (máximo sem exceder interior do slider)
  let leftValue = 0;
  if (theme === "light") {
    leftValue = 0;
  } else if (theme === "system") {
    leftValue = Math.round((SLIDER_INNER_WIDTH - THUMB_SIZE) / 2);
  } else if (theme === "dark") {
    leftValue = SLIDER_INNER_WIDTH - THUMB_SIZE;
  }
  leftValue = Math.max(0, Math.min(leftValue, SLIDER_INNER_WIDTH - THUMB_SIZE));

  // Posição do thumb: precisa adicionar SLIDER_BORDER pois área util começa após borda
  let thumbStyle: React.CSSProperties = {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    top: Math.floor((SLIDER_HEIGHT - THUMB_SIZE) / 2),
    left: leftValue + SLIDER_BORDER, // compensação da borda esquerda
    transition: "left 0.32s cubic-bezier(.4,0,.2,1), background 0.3s, box-shadow 0.3s",
  };

  let thumbClass = `absolute rounded-full shadow bg-gradient-to-tr transition-all duration-300 ${thumbGradient}`;

  return (
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
        type="button"
      >
        <Sunrise className={`h-6 w-6 transition ${theme === "light" ? "text-yellow-800" : "text-yellow-400"}`} />
      </button>
      {/* SLIDER */}
      <button
        tabIndex={0}
        type="button"
        className={`
          w-14 rounded-full border-2 border-red-700 bg-red-900/70 flex items-center transition-all duration-300 relative
          shadow-inner shadow-red-900/60
          focus-visible:ring-2 ring-red-400/90
        `}
        style={{ outline: "none", width: SLIDER_WIDTH, height: SLIDER_HEIGHT }}
        aria-label="Alternar tema"
        onClick={handleSwitch}
        title="Alternar tema (claro/escuro/automático)"
      >
        <span
          className={thumbClass}
          style={thumbStyle}
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
        type="button"
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
        type="button"
      >
        Auto
      </button>
    </div>
  );
};

