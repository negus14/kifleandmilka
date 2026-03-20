# Dashboard Dark Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add dark mode to the dashboard that respects system preference with a manual toggle override.

**Architecture:** Define dashboard colors as CSS variables in `globals.css` with light/dark values. A `ThemeProvider` client component manages state (localStorage + system preference) and applies a `.dark` class. Replace all hardcoded hex values in dashboard components with `var(--dash-*)` references.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, CSS custom properties, localStorage, `matchMedia` API

**Spec:** `docs/superpowers/specs/2026-03-20-dashboard-dark-mode-design.md`

---

### Task 1: CSS Variables Foundation

**Files:**
- Modify: `src/app/globals.css:1-3` (add variables at top, after @import)

- [ ] **Step 1: Add dashboard CSS variables to globals.css**

Add the CSS variables right after the `@import "tailwindcss";` line. Define both `:root` (light) and `.dark` (dark) scopes:

```css
/* ─── Dashboard theme variables ─── */

:root {
  --dash-bg: #faf1e1;
  --dash-text: #2d2b25;
  --dash-surface: rgba(255, 255, 255, 0.5);
  --dash-surface-alt: rgba(255, 255, 255, 0.6);
  --dash-btn-bg: #2d2b25;
  --dash-btn-text: #ffffff;
}

.dark {
  --dash-bg: #1a1917;
  --dash-text: #e8e0d4;
  --dash-surface: rgba(255, 255, 255, 0.05);
  --dash-surface-alt: rgba(255, 255, 255, 0.08);
  --dash-btn-bg: #e8e0d4;
  --dash-btn-text: #1a1917;
}
```

- [ ] **Step 2: Update datepicker overrides to use variables**

In `globals.css`, replace hardcoded colors in the `.wedding-datepicker` rules:
- `rgba(45, 43, 37, ...)` → `color-mix(in srgb, var(--dash-text), transparent N%)`
- `#2d2b25` → `var(--dash-text)`
- `#fff` / `#fafaf8` backgrounds → `var(--dash-bg)` / `var(--dash-surface)`

- [ ] **Step 3: Update custom-scrollbar to use variables**

In the `@layer utilities` section, replace:
- `rgba(45, 43, 37, 0.1)` → `color-mix(in srgb, var(--dash-text), transparent 90%)`
- `rgba(45, 43, 37, 0.2)` → `color-mix(in srgb, var(--dash-text), transparent 80%)`

- [ ] **Step 4: Update input-animated-wrap to use variables**

Replace `background: #2d2b25;` with `background: var(--dash-text);` in the `.input-animated-wrap::after` rule.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(dark-mode): add dashboard CSS variables with light/dark values"
```

---

### Task 2: ThemeProvider Component

**Files:**
- Create: `src/components/dashboard/ThemeProvider.tsx`

- [ ] **Step 1: Create ThemeProvider component**

```tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

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

  // Apply .dark class to a wrapper ref instead of documentElement
  // so it doesn't affect published wedding site routes
  const ref = useRef<HTMLDivElement>(null);
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/ThemeProvider.tsx
git commit -m "feat(dark-mode): add ThemeProvider with localStorage and system preference support"
```

---

### Task 3: ThemeToggle Component

**Files:**
- Create: `src/components/dashboard/ThemeToggle.tsx`

- [ ] **Step 1: Create ThemeToggle component**

```tsx
"use client";

import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { pref, resolved, cycle } = useTheme();

  const title =
    pref === "system" ? "Theme: System" :
    pref === "light" ? "Theme: Light" : "Theme: Dark";

  return (
    <button
      onClick={cycle}
      className="p-1 sm:p-1.5 rounded-sm hover:bg-[var(--dash-text)]/10 transition-all"
      style={{ color: "var(--dash-text)", opacity: 0.5 }}
      title={title}
    >
      {pref === "system" ? (
        /* Monitor icon for system */
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      ) : resolved === "dark" ? (
        /* Moon icon */
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      ) : (
        /* Sun icon */
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      )}
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/ThemeToggle.tsx
git commit -m "feat(dark-mode): add ThemeToggle sun/moon/system icon button"
```

---

### Task 4: Wire Up ThemeProvider and Flash Prevention

**Files:**
- Modify: `src/app/dashboard/[slug]/page.tsx`

- [ ] **Step 1: Wrap dashboard page with ThemeProvider**

In `src/app/dashboard/[slug]/page.tsx`, import and wrap `DashboardEditor`:

```tsx
import ThemeProvider from "@/components/dashboard/ThemeProvider";

// In the return statement, wrap DashboardEditor:
return (
  <ThemeProvider>
    <DashboardEditor site={site} />
  </ThemeProvider>
);
```

- [ ] **Step 2: Add flash-prevention script to ThemeProvider**

Instead of a global script in root layout (which would affect published wedding sites), add the flash prevention inside the ThemeProvider's wrapper div. Use a `useLayoutEffect` to apply `.dark` synchronously before paint:

```tsx
import { useLayoutEffect } from "react";

// Inside ThemeProvider, before the existing useEffects:
useLayoutEffect(() => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemePref | null;
    const p = stored && CYCLE_ORDER.includes(stored) ? stored : "system";
    const dark = p === "dark" || (p !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (dark && ref.current) ref.current.classList.add("dark");
  } catch (e) {}
}, []);
```

This scopes flash prevention to only pages wrapped in ThemeProvider (dashboard, login, signup) and leaves published wedding sites unaffected.

- [ ] **Step 3: Verify the dev server loads without errors**

Run: `npm run dev`
Expected: Dashboard loads without hydration mismatches or errors in console.

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/[slug]/page.tsx
git commit -m "feat(dark-mode): wire ThemeProvider to dashboard page"
```

---

### Task 5: Replace Hardcoded Colors in DashboardEditor

**Files:**
- Modify: `src/app/dashboard/[slug]/DashboardEditor.tsx`

This is the largest task. Replace all hardcoded dashboard colors with CSS variables. The file is ~4,300 lines so work methodically.

- [ ] **Step 1: Replace background colors**

Find-and-replace throughout the file:
- `bg-[#faf1e1]` → `bg-[var(--dash-bg)]`
- `bg-[#faf1e1]/95` → `bg-[var(--dash-bg)]/95`
- `bg-white/50` → `bg-[var(--dash-surface)]`
- `bg-white/60` → `bg-[var(--dash-surface-alt)]`
- `bg-white` (standalone, not inside other patterns) → `bg-[var(--dash-surface)]`

- [ ] **Step 2: Replace text colors**

Find-and-replace:
- `text-[#2d2b25]` (exact, not with opacity suffix) → `text-[var(--dash-text)]`
- `text-[#2d2b25]/XX` (all opacity variants like `/40`, `/60`, `/70`) → `text-[var(--dash-text)]/XX`
- `text-[#faf1e1]` → `text-[var(--dash-bg)]`

- [ ] **Step 3: Replace border colors**

Find-and-replace:
- `border-[#2d2b25]/XX` (all variants) → `border-[var(--dash-text)]/XX`
- `border-[#2d2b25]` (exact) → `border-[var(--dash-text)]`

- [ ] **Step 4: Replace button and interactive element colors**

Find-and-replace:
- `bg-[#2d2b25]` → `bg-[var(--dash-btn-bg)]`
- `bg-[#2d2b25]/XX` (opacity variants like `/5`, `/90`) → `bg-[var(--dash-text)]/XX`
- `text-white` on primary buttons → `text-[var(--dash-btn-text)]`
- `hover:bg-white` → `hover:bg-[var(--dash-surface)]`

- [ ] **Step 5: Replace inline style colors**

Search for any inline `style={{ ... color: "#2d2b25" ... }}` or `style={{ ... background: "#faf1e1" ... }}` and update to use CSS variables.

- [ ] **Step 6: Add ThemeToggle to header**

In the header section (around line 2899, before the logout form), add the ThemeToggle:

```tsx
import ThemeToggle from "@/components/dashboard/ThemeToggle";

// In header, before the logout form:
<ThemeToggle />
```

- [ ] **Step 7: Add Appearance section to Basics tab**

Add an "Appearance" section in the Basics editor area with a 3-option Light/Dark/System selector:

```tsx
import { useTheme } from "@/components/dashboard/ThemeProvider";

// Inside the Basics tab content:
<Label>Appearance</Label>
<div className="flex gap-1 bg-[var(--dash-text)]/5 rounded-sm p-1">
  {(["system", "light", "dark"] as const).map((opt) => (
    <button
      key={opt}
      onClick={() => setPref(opt)}
      className={`flex-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all ${
        pref === opt
          ? "bg-[var(--dash-btn-bg)] text-[var(--dash-btn-text)] shadow-sm"
          : "text-[var(--dash-text)]/40 hover:text-[var(--dash-text)]/60"
      }`}
    >
      {opt === "system" ? "System" : opt === "light" ? "Light" : "Dark"}
    </button>
  ))}
</div>
```

- [ ] **Step 8: Add transition for smooth toggle**

Add to the outermost dashboard wrapper div:

```tsx
style={{ transition: "background-color 0.2s, color 0.2s" }}
```

- [ ] **Step 9: Verify dashboard renders correctly in both modes**

Open the dashboard in the browser. Toggle between light/dark/system and verify:
- Header, sidebar, editor panels all update correctly
- No hardcoded white/cream backgrounds leak through
- Text is readable in both modes
- Buttons render with correct inverted colors
- Live preview pane is unaffected

- [ ] **Step 10: Commit**

```bash
git add src/app/dashboard/[slug]/DashboardEditor.tsx
git commit -m "feat(dark-mode): replace hardcoded colors with CSS variables in DashboardEditor"
```

---

### Task 6: Replace Hardcoded Colors in Dashboard Sub-Components

**Files:**
- Modify: `src/components/dashboard/ColorCustomizer.tsx`
- Modify: `src/components/dashboard/FontCustomizer.tsx`

- [ ] **Step 1: Update ColorCustomizer**

Replace hardcoded `#2d2b25` and `#faf1e1` colors with CSS variables in Tailwind classes. **Important:** Keep color swatch previews (`backgroundColor` for theme color display) as-is — only replace the dashboard chrome colors.

- [ ] **Step 2: Update FontCustomizer**

Same treatment — replace dashboard chrome colors with variables.

- [ ] **Step 3: Verify both customizers look correct in light and dark mode**

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/ColorCustomizer.tsx src/components/dashboard/FontCustomizer.tsx
git commit -m "feat(dark-mode): update ColorCustomizer and FontCustomizer to use CSS variables"
```

---

### Task 7: Dark Mode for Login and Signup Pages

**Files:**
- Modify: `src/app/login/page.tsx`
- Modify: `src/app/login/LoginForm.tsx`
- Modify: `src/app/signup/page.tsx`
- Modify: `src/app/signup/SignupForm.tsx`

- [ ] **Step 1: Wrap LoginForm with ThemeProvider in login page.tsx**

In `src/app/login/page.tsx`, import ThemeProvider and wrap the `<LoginForm>` component:

```tsx
import ThemeProvider from "@/components/dashboard/ThemeProvider";

// In the return:
return (
  <ThemeProvider>
    <LoginForm action={loginAction} />
  </ThemeProvider>
);
```

- [ ] **Step 2: Wrap SignupForm with ThemeProvider in signup page.tsx**

Same pattern in `src/app/signup/page.tsx`:

```tsx
import ThemeProvider from "@/components/dashboard/ThemeProvider";

// In the return:
return (
  <ThemeProvider>
    <SignupForm action={signupAction} />
  </ThemeProvider>
);
```

- [ ] **Step 3: Update LoginForm colors**

Replace `bg-[#faf1e1]`, `text-[#2d2b25]`, and related hardcoded colors with `var(--dash-*)` variables in `LoginForm.tsx`.

- [ ] **Step 4: Update SignupForm colors**

Same treatment as LoginForm in `SignupForm.tsx`.

- [ ] **Step 5: Verify login and signup pages render correctly in both modes**

The image showcase overlay and content should remain visually consistent.

- [ ] **Step 6: Commit**

```bash
git add src/app/login/page.tsx src/app/login/LoginForm.tsx src/app/signup/page.tsx src/app/signup/SignupForm.tsx
git commit -m "feat(dark-mode): update login and signup pages to use CSS variables"
```

---

### Task 8: Final Verification and Cleanup

- [ ] **Step 1: Search for remaining hardcoded dashboard colors**

Run: `grep -rn "#faf1e1\|#2d2b25" src/app/dashboard/ src/components/dashboard/ src/app/login/ src/app/signup/`

Any remaining instances should either be:
- In template/theme code (expected, don't change)
- Missed dashboard colors (fix them)

- [ ] **Step 2: Test system preference detection**

1. Set toggle to "System"
2. Change OS dark mode setting
3. Verify dashboard switches in real-time without page reload

- [ ] **Step 3: Test localStorage persistence**

1. Set toggle to "Dark"
2. Reload the page
3. Verify it stays in dark mode (no flash of light mode)

- [ ] **Step 4: Test toggle cycle**

Click the header toggle repeatedly and verify: System → Light → Dark → System

- [ ] **Step 5: Verify WCAG AA contrast**

Check `#e8e0d4` text on `#1a1917` background — contrast ratio should be ≥ 4.5:1.

- [ ] **Step 6: Final commit if any cleanup was needed**

```bash
git add -A
git commit -m "feat(dark-mode): final cleanup and verification"
```
