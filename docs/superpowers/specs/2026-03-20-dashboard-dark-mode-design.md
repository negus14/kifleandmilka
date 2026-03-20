# Dashboard Dark Mode

## Overview

Add dark mode to the dashboard/editor that respects the user's system preference (`prefers-color-scheme`) with a manual override toggle. Published wedding sites are unaffected.

## Color Mapping

Replace hardcoded hex values with CSS custom properties. Light and dark values:

| Variable | Light | Dark | Used For |
|----------|-------|------|----------|
| `--dash-bg` | `#faf1e1` | `#1a1917` | Page background |
| `--dash-text` | `#2d2b25` | `#e8e0d4` | Text, icons, borders |
| `--dash-surface` | `rgba(255,255,255,0.5)` | `rgba(255,255,255,0.05)` | Cards, inputs, panels |
| `--dash-surface-alt` | `rgba(255,255,255,0.6)` | `rgba(255,255,255,0.08)` | Elevated surfaces |
| `--dash-btn-bg` | `#2d2b25` | `#e8e0d4` | Primary button background |
| `--dash-btn-text` | `#ffffff` | `#1a1917` | Primary button text |

The warm brown undertone is preserved in both modes to maintain brand consistency.

Opacity-based patterns (e.g. `text-[#2d2b25]/60` for secondary text) translate to `var(--dash-text)` at the same opacity, which works naturally in both modes since the base color is inverted.

## Architecture

### Theme State Management

- Store preference in `localStorage` as `"light" | "dark" | "system"`
- Default: `"system"` (respects OS `prefers-color-scheme`)
- A `ThemeProvider` client component wraps the dashboard:
  - Reads localStorage on mount
  - Listens to `matchMedia('(prefers-color-scheme: dark)')` changes when set to "system"
  - Applies `.dark` class to the dashboard root element when dark mode is active
  - Provides toggle function and current theme via React context

### Flash Prevention

A small inline `<script>` in the dashboard layout checks localStorage and applies `.dark` before React hydrates, preventing a white flash on load.

### CSS Variable Approach

- Define variables in `globals.css` under `:root` (light values) and `.dark` (dark values)
- Replace all hardcoded `#faf1e1`, `#2d2b25`, `white/50`, etc. in dashboard components with `var(--dash-*)` references
- Semantic status colors (green/amber/red for save state) remain hardcoded — they are not theme colors

## Toggle UI

### Header Toggle

Sun/moon icon button in the top navigation bar, near the logout button:
- Sun icon when in light mode
- Moon icon when in dark mode
- Hybrid sun/moon icon when set to "system"
- Cycles: system -> light -> dark -> system

### Settings Toggle

An "Appearance" section in the existing "Basics" tab with a 3-option selector:
- Light / Dark / System
- Current choice highlighted

## Scope

### Affected Areas

- Dashboard shell: header, sidebar, editor panels, forms, modals
- Login and signup pages (share the same color palette)
- Date picker widget (react-datepicker custom CSS overrides)
- Custom scrollbar styles (`.custom-scrollbar` in globals.css)

### Unaffected Areas

- Published wedding sites (`[slug]`, `cd/[domain]` routes)
- Live preview iframe within the editor — always shows wedding site in its chosen theme
- Wedding theme definitions (`src/lib/themes.ts`)
- Template stylesheets (`src/templates/`)

## Files

### New Files

- `src/components/dashboard/ThemeProvider.tsx` — client component: localStorage, system preference listener, `.dark` class management, React context
- `src/components/dashboard/ThemeToggle.tsx` — sun/moon icon button component

### Modified Files

- `src/app/globals.css` — CSS variables under `:root` and `.dark`, update custom-scrollbar and date picker overrides
- `src/app/dashboard/[slug]/DashboardEditor.tsx` — replace all hardcoded color values with `var(--dash-*)`, add ThemeToggle to header, add Appearance section to Basics tab
- `src/app/dashboard/[slug]/page.tsx` — wrap with ThemeProvider
- `src/app/login/page.tsx` — wrap with ThemeProvider
- `src/app/signup/page.tsx` — wrap with ThemeProvider
- `src/components/dashboard/ColorCustomizer.tsx` — replace hardcoded dashboard colors
- `src/components/dashboard/FontCustomizer.tsx` — replace hardcoded dashboard colors

## Edge Cases

- **Color picker swatches** — the ColorCustomizer displays wedding theme colors. Swatches and previews must remain true-color; only the dashboard chrome around them uses variables.
- **Image previews** — uploaded photos display normally, unaffected by dark mode.
- **Third-party date picker** — react-datepicker CSS overrides in globals.css use hardcoded colors and need updating to variables.
- **Transitions** — add `transition: background-color 0.2s, color 0.2s` to the dashboard root so toggling is smooth, not jarring.

## Testing

- Verify each dashboard section (Basics, Layout, all section editors, Guests, Gifts, Broadcast) renders correctly in both modes
- Verify toggle cycles correctly: system -> light -> dark -> system
- Verify localStorage persistence across page reloads
- Verify system preference changes are detected in real-time when set to "system"
- Verify live preview pane is unaffected by dark mode
- Check text contrast ratios meet WCAG AA (4.5:1 minimum)
