
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

// Há 3 estados: 'light', 'dark', ou 'system'
type Theme = "light" | "dark" | "system";

// Utilitário para manipular localStorage
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

export const ThemeSwitch = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    // Sincroniza a escolha do usuário com o localStorage e HTML
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

    // Atualiza se o sistema mudar de tema (se preferindo "system")
    if (theme === "system") {
      const listener = (e: MediaQueryListEvent) => {
        document.documentElement.classList.toggle("dark", e.matches);
      };
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      mql.addEventListener("change", listener);
      return () => mql.removeEventListener("change", listener);
    }
  }, [theme]);

  // Para o menu style mariaum.net: [Sol] [Switch] [Lua] [System]
  return (
    <div className="flex items-center space-x-4">
      <button
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          theme === "light" ? "bg-yellow-300/80 shadow-lg shadow-yellow-200/30 scale-110" : "hover:bg-yellow-100/40"
        }`}
        title="Modo claro"
        onClick={() => setTheme("light")}
        aria-label="Tema claro"
      >
        <Sun className={`h-6 w-6 transition ${theme === "light" ? "text-yellow-700" : "text-yellow-400"}`} />
      </button>
      {/* Switch principal */}
      <button
        tabIndex={0}
        className={`
          w-14 h-8 rounded-full border-2 border-red-700 bg-red-900/60 flex items-center transition-all duration-300 relative
          focus-visible:ring-2 ring-red-400/90
        `}
        style={{ outline: "none" }}
        aria-label="Alternar tema"
        onClick={() =>
          setTheme(theme === "light" ? "dark" : theme === "dark" ? "system" : "light")
        }
        title="Alternar tema (claro/escuro/automático)"
      >
        <span
          className={`
            absolute left-1 top-1 w-6 h-6 rounded-full transition-all duration-300
            bg-white/80 shadow
            ${theme === "light" ? "translate-x-0" : theme === "dark" ? "translate-x-6 bg-zinc-800/80" : "translate-x-3 bg-gradient-to-br from-yellow-200 via-gray-200 to-gray-700/40"}
          `}
        />
        {/* Seguindo o padrão do mariaum: sem indicativo textual, só os ícones ao lado */}
      </button>
      <button
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          theme === "dark" ? "bg-slate-900/90 shadow-lg shadow-zinc-800/40 scale-110" : "hover:bg-slate-800/30"
        }`}
        title="Modo escuro"
        onClick={() => setTheme("dark")}
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
        onClick={() => setTheme("system")}
        aria-label="Modo automático pelo sistema"
        title="Seguir tema do sistema"
      >
        Auto
      </button>
    </div>
  );
};

