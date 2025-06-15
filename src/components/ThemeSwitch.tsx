
import { useEffect, useState } from "react";
import { Sunrise, Moon } from "lucide-react";
import {
  Theme,
  getSystemTheme,
  getInitialTheme,
  themeStorageKey,
} from "./theme-utils";

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

  // Posição do thumb baseada no tema
  let thumbPosition = "translate-x-0"; // light
  if (theme === "system") {
    thumbPosition = "translate-x-6"; // meio
  } else if (theme === "dark") {
    thumbPosition = "translate-x-12"; // direita
  }

  // Cor do thumb baseada no tema
  let thumbColor = "bg-gradient-to-r from-yellow-400 to-yellow-200"; // light
  if (theme === "system") {
    thumbColor = "bg-gradient-to-r from-green-400 to-green-200"; // system
  } else if (theme === "dark") {
    thumbColor = "bg-gradient-to-r from-gray-600 to-gray-400"; // dark
  }

  return (
    <div className="flex items-center space-x-4 relative z-10">
      {/* Botão Modo Claro */}
      <button
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all outline-none focus-visible:ring-2 ring-yellow-400/70
          ${theme === "light"
            ? "bg-yellow-200/90 shadow-md shadow-yellow-100/40 scale-105"
            : "hover:bg-yellow-100/50"}
        `}
        title="Modo claro"
        onClick={handleThemeChange("light")}
        aria-label="Tema claro"
        type="button"
      >
        <Sunrise className={`h-6 w-6 transition ${theme === "light" ? "text-yellow-800" : "text-yellow-400"}`} />
      </button>

      {/* Switch Central */}
      <button
        className="relative w-16 h-7 bg-red-900/70 border-2 border-red-700 rounded-full shadow-inner shadow-red-900/60 transition-all duration-300 focus-visible:ring-2 ring-red-400/90 outline-none"
        onClick={handleSwitch}
        aria-label="Alternar tema"
        title="Alternar tema (claro/escuro/automático)"
        type="button"
      >
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow transition-all duration-300 ease-out ${thumbColor} ${thumbPosition}`}
        />
      </button>

      {/* Botão Modo Escuro */}
      <button
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all outline-none focus-visible:ring-2 ring-blue-300/70
          ${theme === "dark"
            ? "bg-slate-900/90 shadow-md shadow-zinc-700/40 scale-105"
            : "hover:bg-slate-900/20"}
        `}
        title="Modo escuro"
        onClick={handleThemeChange("dark")}
        aria-label="Tema escuro"
        type="button"
      >
        <Moon className={`h-6 w-6 transition ${theme === "dark" ? "text-blue-100" : "text-zinc-500"}`} />
      </button>

      {/* Botão Auto */}
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
