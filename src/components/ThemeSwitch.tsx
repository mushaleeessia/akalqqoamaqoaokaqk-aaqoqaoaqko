
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
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

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  return (
    <div className="flex items-center gap-3 bg-red-900/20 backdrop-blur-sm border border-red-700/30 rounded-full px-2 py-1">
      {/* Sun Icon */}
      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
        theme === "light" 
          ? "bg-yellow-400 shadow-lg shadow-yellow-400/30" 
          : "hover:bg-yellow-400/10"
      }`}>
        <Sun className={`w-3 h-3 ${theme === "light" ? "text-yellow-900" : "text-yellow-400/60"}`} />
      </div>

      {/* Toggle Switch */}
      <button
        onClick={cycleTheme}
        className="relative w-16 h-8 bg-red-800/40 rounded-full border border-red-600/40 focus:outline-none focus:ring-2 focus:ring-red-400/50 transition-all duration-200"
        aria-label={`Tema atual: ${theme === "light" ? "claro" : theme === "dark" ? "escuro" : "automático"}`}
      >
        <div 
          className={`absolute top-0.5 w-7 h-7 rounded-full transition-all duration-300 ease-out shadow-lg ${
            theme === "light" 
              ? "left-0.5 bg-gradient-to-r from-yellow-300 to-yellow-400" 
              : theme === "dark"
              ? "left-8 bg-gradient-to-r from-slate-600 to-slate-700"
              : "left-4 bg-gradient-to-r from-green-400 to-green-500"
          }`}
        />
      </button>

      {/* Moon Icon */}
      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
        theme === "dark" 
          ? "bg-slate-700 shadow-lg shadow-slate-700/30" 
          : "hover:bg-slate-700/10"
      }`}>
        <Moon className={`w-3 h-3 ${theme === "dark" ? "text-slate-100" : "text-slate-400/60"}`} />
      </div>

      {/* Auto Label */}
      <div className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
        theme === "system"
          ? "bg-green-500/20 text-green-100 border border-green-400/30"
          : "text-green-400/60 hover:bg-green-500/10"
      }`}>
        Auto
      </div>
    </div>
  );
};
