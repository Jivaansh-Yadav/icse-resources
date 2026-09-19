import React, { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark") ||
      (typeof localStorage !== "undefined" && localStorage.getItem("theme") === "dark");
    setTheme(isDark ? "dark" : "light");
    setMounted(true);
  }, []);

  const toggle = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try {
      localStorage.setItem("theme", nextTheme);
    } catch (e) {
      console.warn("Failed to persist theme to localStorage:", e);
    }
    setTheme(nextTheme);
    window.dispatchEvent(new CustomEvent("theme-change", { detail: { theme: nextTheme } }));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="p-2.5 sm:p-3 rounded-full bg-card border border-border shadow-sm hover:shadow-md backdrop-blur-sm hover:scale-105 active:scale-95 transition-all text-foreground cursor-pointer flex items-center justify-center"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {mounted ? (
        theme === "dark" ? (
          <Moon className="h-5 w-5 text-foreground" />
        ) : (
          <Sun className="h-5 w-5 text-foreground" />
        )
      ) : (
        <Sun className="h-5 w-5 text-foreground" />
      )}
    </button>
  );
}
