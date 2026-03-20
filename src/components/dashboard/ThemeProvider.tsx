"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useLayoutEffect } from "react";

type ThemePref = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  pref: ThemePref;
  resolved: ResolvedTheme;
  setPref: (pref: ThemePref) => void;
  cycle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

const STORAGE_KEY = "dash-theme";
const CYCLE_ORDER: ThemePref[] = ["system", "light", "dark"];

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolve(pref: ThemePref): ResolvedTheme {
  return pref === "system" ? getSystemTheme() : pref;
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [pref, setPrefState] = useState<ThemePref>("system");
  const [resolved, setResolved] = useState<ResolvedTheme>("light");
  const ref = useRef<HTMLDivElement>(null);

  // Flash prevention: apply .dark synchronously before paint
  useLayoutEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemePref | null;
      const p = stored && CYCLE_ORDER.includes(stored) ? stored : "system";
      const dark = p === "dark" || (p !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      if (dark && ref.current) ref.current.classList.add("dark");
    } catch (e) {}
  }, []);

  // Read from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemePref | null;
    const p = stored && CYCLE_ORDER.includes(stored) ? stored : "system";
    setPrefState(p);
    setResolved(resolve(p));
  }, []);

  // Listen for system preference changes
  useEffect(() => {
    if (pref !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setResolved(getSystemTheme());
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [pref]);

  // Apply .dark class to wrapper
  useEffect(() => {
    ref.current?.classList.toggle("dark", resolved === "dark");
  }, [resolved]);

  const setPref = useCallback((p: ThemePref) => {
    setPrefState(p);
    setResolved(resolve(p));
    localStorage.setItem(STORAGE_KEY, p);
  }, []);

  const cycle = useCallback(() => {
    const idx = CYCLE_ORDER.indexOf(pref);
    const next = CYCLE_ORDER[(idx + 1) % CYCLE_ORDER.length];
    setPref(next);
  }, [pref, setPref]);

  return (
    <ThemeContext.Provider value={{ pref, resolved, setPref, cycle }}>
      <div ref={ref}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
