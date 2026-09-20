"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Sun, Moon } from "lucide-react";

type Theme = "dark" | "light" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  resolvedTheme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  const applyTheme = useCallback((targetTheme: Theme) => {
    let resolved: "dark" | "light" = "dark";
    if (targetTheme === "system") {
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      resolved = systemDark ? "dark" : "light";
    } else {
      resolved = targetTheme;
    }

    setResolvedTheme(resolved);
    const root = document.documentElement;
    if (resolved === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
  }, []);

  useEffect(() => {
    const savedTheme = (localStorage.getItem("arthavi_theme") as Theme) || "dark";
    setThemeState(savedTheme);
    applyTheme(savedTheme);
    setMounted(true);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const current = (localStorage.getItem("arthavi_theme") as Theme) || "dark";
      if (current === "system") {
        applyTheme("system");
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [applyTheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("arthavi_theme", newTheme);
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <ThemeContext.Provider
      value={{ theme, resolvedTheme, setTheme, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeToggle({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center justify-center p-2 rounded-xl transition-all duration-200 border cursor-pointer ${
        resolvedTheme === "dark"
          ? "bg-slate-900/80 border-slate-800 text-amber-400 hover:bg-slate-800 hover:text-amber-300 shadow-sm"
          : "bg-slate-100 border-slate-200 text-indigo-600 hover:bg-slate-200 hover:text-indigo-700 shadow-sm"
      } ${className}`}
      aria-label="Toggle theme"
      title={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} mode`}
    >
      {resolvedTheme === "dark" ? (
        <Sun size={compact ? 16 : 18} className="transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon size={compact ? 16 : 18} className="transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
}
