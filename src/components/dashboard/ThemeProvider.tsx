"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useLayoutEffect } from "react";

type ThemePref = "light" | "dark";

interface ThemeContextValue {
  pref: ThemePref;
  setPref: (pref: ThemePref) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

const STORAGE_KEY = "dash-theme";

function getSystemTheme(): ThemePref {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [pref, setPrefState] = useState<ThemePref>("light");
  const ref = useRef<HTMLDivElement>(null);

  // Flash prevention: apply .dark synchronously before paint
  useLayoutEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemePref | null;
      const p = stored === "light" || stored === "dark" ? stored : getSystemTheme();
      if (p === "dark" && ref.current) ref.current.classList.add("dark");
    } catch (e) {}
  }, []);

  // Read from localStorage on mount, default to system preference
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemePref | null;
    const p = stored === "light" || stored === "dark" ? stored : getSystemTheme();
    setPrefState(p);
  }, []);

  // Apply .dark class to wrapper
  useEffect(() => {
    ref.current?.classList.toggle("dark", pref === "dark");
  }, [pref]);

  const setPref = useCallback((p: ThemePref) => {
    setPrefState(p);
    localStorage.setItem(STORAGE_KEY, p);
  }, []);

  const toggle = useCallback(() => {
    setPref(pref === "light" ? "dark" : "light");
  }, [pref, setPref]);

  return (
    <ThemeContext.Provider value={{ pref, setPref, toggle }}>
      <div ref={ref}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
