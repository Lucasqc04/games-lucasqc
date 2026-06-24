"use client";

import { useEffect, useState } from "react";
import { applyTheme, readThemePreference, saveThemePreference } from "@/src/lib/storage";
import type { Theme } from "@/src/types";

type ThemeToggleProps = {
  compact?: boolean;
};

export function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const next = readThemePreference();
    setTheme(next);
    applyTheme(next);

    function syncTheme(event?: Event) {
      const customTheme = event instanceof CustomEvent ? event.detail : undefined;
      const synced = customTheme === "dark" || customTheme === "light" ? customTheme : readThemePreference();
      setTheme(synced);
      applyTheme(synced);
    }

    window.addEventListener("lucasqc-theme-change", syncTheme);
    window.addEventListener("storage", syncTheme);
    return () => {
      window.removeEventListener("lucasqc-theme-change", syncTheme);
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  function toggleTheme() {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    applyTheme(next);
    saveThemePreference(next);
    window.dispatchEvent(new CustomEvent("lucasqc-theme-change", { detail: next }));
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm font-black text-slate-950 shadow-sm transition hover:border-brand-500 hover:bg-brand-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/10"
      aria-label={`Alternar para modo ${theme === "light" ? "escuro" : "claro"}`}
      title={`Modo atual: ${theme === "light" ? "claro" : "escuro"}`}
    >
      {compact ? (theme === "light" ? "Claro" : "Escuro") : `Modo ${theme === "light" ? "claro" : "escuro"}`}
    </button>
  );
}
