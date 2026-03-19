# Easy Mode Q&A — Design Spec

## Overview

A chat-style guided wizard that slides in as a panel from the right side of the dashboard editor. Users answer 7 simple questions to set up their wedding website, with each answer auto-saving and updating the live preview in real-time.

## Entry Point

- A floating button in the bottom-right corner of the dashboard editor labeled "✦ Easy Mode"
- Clicking opens a ~320px slide-in panel from the right
- The editor and live preview remain visible behind the panel
- X button closes the panel; progress is persisted in component state
- Reopening resumes where the user left off

## Chat Interface

The panel uses a conversational chat bubble UI:

- **Bot messages**: Left-aligned, light background (`#f8f6f2`), rounded bubbles with a small avatar icon
- **User replies**: Right-aligned, themed background (`#b8a088`), white text
- **Input area**: Bottom of panel with a rounded text input and send button
- **Progress**: Header shows "Step X of 7" with a thin progress bar below

## Q&A Flow (7 Steps)

Each step asks one question. After the user answers, the response is saved to the site data immediately (auto-save), the answer appears as a user chat bubble, and the next question appears.

| Step | Question | Input Type | Maps To |
|------|----------|------------|---------|
| 1 | What are your names? | Two text fields (Partner 1, Partner 2) | `partner1Name`, `partner2Name` |
| 2 | When's the wedding? | Date picker | `weddingDate` + auto-generate `dateDisplayText` |
| 3 | Where's the venue? | Text field | `locationText` |
| 4 | Pick a template | Visual cards (Classic, Modern) | `layoutId` |
| 5 | Choose your colors | Scrollable color theme cards (all themes from `themes.ts`) | `templateId` |
| 6 | Choose your fonts | Font style cards (8 presets) | `fontStyleId` |
| 7 | Which sections do you want? | Checkboxes (multi-select) | `sectionOrder[].visible` |

### Input rendering within chat

For steps 1-3, the input appears inline in the chat panel — a text field or date picker below the bot's question bubble.

For steps 4-6, visual selection cards appear within the chat flow — small preview cards the user can tap to select. The selected card gets a highlight border. Step 5 (colors) uses a scrollable grid since there are 21 themes.

For step 7, a checklist of toggleable sections appears: Story, Quote, Featured Photo, Letter, Schedule, Menu, FAQs, Gallery, Things to Do, Accommodations, RSVP, Gift Registry, Contact. Hero and Footer are structural and always included (not shown in the checklist).

### Step 2: Date handling

When the user picks a date, auto-generate `dateDisplayText` from it (e.g., "June 15, 2027") so the display text stays in sync. Use `toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })`.

### Completion

After step 7, a completion message appears: "Your site is ready! You can keep customizing in the full editor." The panel can be closed. Reopening after completion shows the full chat history with an option to redo any step by scrolling up and clicking "Change" next to a previous answer.

## Data Flow

1. Easy Mode panel receives `site` data and the `set()` function as props from `DashboardEditor`
2. For steps 1-4 and 6, each answer calls `set('fieldName', value)` — the same setter used by the editor (defined at ~line 2597 of `DashboardEditor.tsx`)
3. For step 5 (colors), calls `set('templateId', selectedThemeId)`
4. For step 7 (sections), updates `sectionOrder` entries' `visible` flags via the existing section visibility mechanism
5. This triggers the existing auto-save (PUT `/api/sites/[slug]`) and live preview update
6. No new API endpoints or data structures needed

## State Management

The `EasyMode` component manages its own internal state:

- `easyModeStep: number` — current step (1-7)
- `messages: Array<{role: 'bot' | 'user', content: string}>` — chat history for display

The parent `DashboardEditor` only manages:

- `easyModeOpen: boolean` — whether the panel is visible

The `EasyMode` component receives `site`, `set()`, and `sectionOrder`/`setSectionOrder` as props. This keeps the 4,265-line editor file clean.

## Component Structure

```
DashboardEditor.tsx
├── EasyModeButton              — floating button, bottom-right
├── EasyModePanel               — slide-in panel container (in components/dashboard/EasyMode.tsx)
│   ├── EasyModeHeader          — title, step counter, close button
│   ├── EasyModeProgressBar     — thin progress bar
│   ├── EasyModeChat            — scrollable message list
│   │   ├── BotMessage          — left-aligned bubble
│   │   ├── UserMessage         — right-aligned bubble
│   │   └── StepInput           — renders the appropriate input for current step
│   │       ├── TextInput       — for names, venue (steps 1, 3)
│   │       ├── DateInput       — date picker (step 2)
│   │       ├── CardSelector    — visual cards (steps 4, 5, 6)
│   │       └── SectionCheckbox — multi-select toggles (step 7)
│   └── EasyModeInputBar        — bottom input area (for text steps)
```

All Easy Mode components live in `src/components/dashboard/EasyMode.tsx`.

## Visual Design

- Panel background: white
- Left border accent: `#b8a088` (2px)
- Shadow: `-4px 0 20px rgba(0,0,0,0.08)` for depth
- Bot avatar: small circle with `✦` icon, themed color
- Animations: slide in `transform: translateX` with `300ms ease-out`, slide out `200ms ease-in`
- Floating button: rounded pill, themed background, subtle shadow
- Z-index: floating button at `z-40`, panel at `z-50` (below existing modals which use `z-[9999]`)

## Responsive Behavior

- **Desktop**: Panel overlays the right side of the editor (320px)
- **Mobile**: Panel takes full width as an overlay, since the editor is already single-column on mobile

## Edge Cases

- **Existing site data**: If the user already has names/date/etc. filled in, pre-populate the answers and show them as already-answered chat bubbles. Start at the first step that has empty/default data. If all steps are filled (e.g., returning user), show all as answered and display the completion message.
- **Skipping steps**: Users can close the panel at any step — all answered steps are already saved
- **Re-entering**: Reopening shows the chat history and resumes at the next unanswered step
- **Empty answers**: Require non-empty input for names and date before advancing; venue can be skipped
- **Template/color defaults**: Every new site has defaults for `layoutId`, `templateId`, and `fontStyleId`. In the wizard, show these steps with the current value pre-selected so the user can change or confirm.
