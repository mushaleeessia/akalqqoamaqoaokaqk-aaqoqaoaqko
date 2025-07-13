import { useEffect, useState } from "react";
import { Sunrise, Moon, Monitor } from "lucide-react";
import {
  Theme,
  getSystemTheme,
  getInitialTheme,
  themeStorageKey,
} from "./theme-utils";

import { Language } from "@/contexts/LanguageContext";

interface ThemeSwitchProps {
  language: Language;
}

export const ThemeSwitch = ({ language }: ThemeSwitchProps) => {
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

  const getCurrentIcon = () => {
    switch (theme) {
      case "light":
        return <Sunrise className="w-4 h-4" />;
      case "dark":
        return <Moon className="w-4 h-4" />;
      case "system":
        return <Monitor className="w-4 h-4" />;
      default:
        return <Sunrise className="w-4 h-4" />;
    }
  };

  const getCurrentLabel = () => {
    switch (theme) {
      case "light":
        return language === 'en' ? "Light" : language === 'it' ? "Chiaro" : "Claro";
      case "dark":
        return language === 'en' ? "Dark" : language === 'it' ? "Scuro" : "Escuro";
      case "system":
        return "Auto";
      default:
        return language === 'en' ? "Light" : language === 'it' ? "Chiaro" : "Claro";
    }
  };

  return (
    <button
      onClick={cycleTheme}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200 text-white/90 hover:text-white"
      aria-label={`Tema atual: ${getCurrentLabel()}`}
    >
      <div className="flex items-center justify-center">
        {getCurrentIcon()}
      </div>
      <span className="text-sm font-medium">
        {getCurrentLabel()}
      </span>
    </button>
  );
};
