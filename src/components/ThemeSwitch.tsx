
import { useEffect, useRef, useState } from "react";
import { Sunrise, Moon } from "lucide-react";
import {
  Theme,
  getSystemTheme,
  getInitialTheme,
  themeStorageKey,
} from "./theme-utils";

// Largura total do slider e largura do thumb (em px)
// O slider tem w-14 (56px), o thumb tem w-6 (24px), gap vertical/top igual: 4px
const SLIDER_WIDTH = 56;
const THUMB_SIZE = 24;
const THUMB_LEFT_LIGHT = 4; // px (spaces from left)
const THUMB_LEFT_DARK = SLIDER_WIDTH - THUMB_SIZE - 4; // px (spaces from right)
const THUMB_LEFT_SYSTEM = (SLIDER_WIDTH - THUMB_SIZE) / 2; // centralizado

export const ThemeSwitch = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

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

  const handleThemeChange = (toTheme: Theme) => (e: React.MouseEvent) => {
    setTheme(toTheme);
  };

  const handleSwitch = (e: React.MouseEvent) => {
    if (theme === "light") handleThemeChange("dark")(e);
    else if (theme === "dark") handleThemeChange("system")(e);
    else handleThemeChange("light")(e);
  };

  // Calcula a posição esquerda do thumb conforme o tema
  let thumbLeft = THUMB_LEFT_LIGHT;
  let thumbGradient = "from-yellow-400 to-yellow-100";
  if (theme === "dark") {
    thumbLeft = THUMB_LEFT_DARK;
    thumbGradient = "from-zinc-700 to-slate-800";
  } else if (theme === "system") {
    thumbLeft = THUMB_LEFT_SYSTEM;
    thumbGradient = "from-green-200 to-green-600";
  }

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
      <button
        tabIndex={0}
        type="button"
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
          className={[
            "absolute top-1 w-6 h-6 rounded-full transition-all duration-300 shadow bg-gradient-to-tr",
            thumbGradient
          ].join(" ")}
          style={{
            left: thumbLeft,
            transition: "left 0.28s cubic-bezier(.4,0,.2,1)",
          }}
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
