
import { useEffect, useRef, useState } from "react";
import { Sun, Moon } from "lucide-react";
import {
  Theme,
  getSystemTheme,
  getInitialTheme,
  themeStorageKey,
} from "./theme-utils";

// Ícone simples de monitor/computador (para modo sistema)
const MonitorIcon = ({ className = "", ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    width={24}
    height={24}
    stroke="currentColor"
    strokeWidth={2}
    className={className}
    {...props}
  >
    <rect x="3" y="4" width="18" height="14" rx="2" />
    <path d="M8 20h8M12 16v4" />
  </svg>
);

export const ThemeSwitch = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [animation, setAnimation] = useState<null>(null);
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

  const handleThemeChange = (toTheme: Theme) => (e: React.MouseEvent) => {
    setTheme(toTheme);
  };

  const handleSwitch = (e: React.MouseEvent) => {
    if (theme === "light") handleThemeChange("dark")(e);
    else if (theme === "dark") handleThemeChange("system")(e);
    else handleThemeChange("light")(e);
  };

  // Definir o ícone central do switch
  let CenterIcon;
  let centerIconClass = "h-6 w-6 transition";
  if (theme === "light") {
    CenterIcon = Sun;
    centerIconClass += " text-yellow-600";
  } else if (theme === "dark") {
    CenterIcon = Moon;
    centerIconClass += " text-blue-200";
  } else {
    CenterIcon = MonitorIcon;
    centerIconClass += " text-green-400";
  }

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
            px-0
          `}
          style={{ outline: "none" }}
          aria-label="Alternar tema"
          onClick={handleSwitch}
          title="Alternar tema (claro/escuro/automático)"
        >
          <span
            className={`
              absolute left-1 top-1 w-6 h-6 rounded-full transition-all duration-300 shadow flex items-center justify-center
              bg-gradient-to-tr 
              z-10
              ${theme === "light"
                ? "from-yellow-400 to-yellow-100 translate-x-0"
                : theme === "dark"
                  ? "from-zinc-700 to-slate-800 translate-x-6"
                  : "from-green-200 to-green-600 translate-x-3"}
            `}
          >
            <CenterIcon className={centerIconClass} />
          </span>
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
    </>
  );
};

