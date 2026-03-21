"use client";

import React, { useState, useRef, useEffect, forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { WeddingSite, SectionConfig } from "@/lib/types/wedding-site";
import { DEFAULT_SECTION_ORDER, SECTION_LABELS } from "@/lib/types/wedding-site";
import { themes, fontStyles } from "@/lib/themes";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
  role: "bot" | "user";
  content: string;
  stepIndex?: number;
}

interface EasyModeProps {
  site: WeddingSite;
  set: <K extends keyof WeddingSite>(key: K, value: WeddingSite[K]) => void;
  onClose: () => void;
}

const STEPS = [
  { key: "names", question: "What are your names?" },
  { key: "date", question: "When's the wedding?" },
  { key: "venue", question: "Where's the venue?" },
  { key: "template", question: "Pick a template" },
  { key: "colors", question: "Choose your colors" },
  { key: "fonts", question: "Choose your fonts" },
  { key: "sections", question: "Which sections do you want?" },
] as const;

// ─── Chat Bubble Components ───────────────────────────────────────────────────

function BotMessage({ content }: { content: string }) {
  return (
    <div className="flex items-start gap-2 mb-3">
      <div
        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs"
        style={{ background: "var(--dash-text)", color: "var(--dash-bg)" }}
      >
        ✦
      </div>
      <div
        className="rounded-2xl rounded-tl-sm px-3 py-2 text-sm max-w-[85%]"
        style={{
          background: "color-mix(in srgb, var(--dash-text) 6%, transparent)",
          color: "var(--dash-text)",
        }}
      >
        {content}
      </div>
    </div>
  );
}

function UserMessage({
  content,
  stepIndex,
  onChange,
}: {
  content: string;
  stepIndex?: number;
  onChange?: (stepIndex: number) => void;
}) {
  return (
    <div className="flex flex-col items-end mb-3">
      <div
        className="rounded-2xl rounded-tr-sm px-3 py-2 text-sm max-w-[85%]"
        style={{
          background: "var(--dash-btn-bg)",
          color: "var(--dash-btn-text)",
        }}
      >
        {content}
      </div>
      {onChange && stepIndex !== undefined && (
        <button
          onClick={() => onChange(stepIndex)}
          className="text-[10px] font-bold uppercase tracking-widest mt-1 mr-1 opacity-50 hover:opacity-100 transition-opacity"
          style={{ color: "var(--dash-text)" }}
        >
          Change
        </button>
      )}
    </div>
  );
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div
      className="w-full h-0.5 rounded-full overflow-hidden"
      style={{ background: "color-mix(in srgb, var(--dash-text) 12%, transparent)" }}
    >
      <div
        className="h-full transition-all duration-500"
        style={{ width: `${pct}%`, background: "var(--dash-text)" }}
      />
    </div>
  );
}

// ─── Step Input Components ────────────────────────────────────────────────────

function NamesInput({
  site,
  set,
  onDone,
}: {
  site: WeddingSite;
  set: <K extends keyof WeddingSite>(key: K, value: WeddingSite[K]) => void;
  onDone: (display: string) => void;
}) {
  const [name1, setName1] = useState(site.partner1Name ?? "");
  const [name2, setName2] = useState(site.partner2Name ?? "");
  const ref2 = useRef<HTMLInputElement>(null);

  const canContinue = name1.trim().length > 0 && name2.trim().length > 0;

  function handleSubmit() {
    if (!canContinue) return;
    set("partner1Name", name1.trim());
    set("partner2Name", name2.trim());
    onDone(`${name1.trim()} & ${name2.trim()}`);
  }

  return (
    <div className="pl-9 flex flex-col gap-2 mb-4">
      <input
        className="text-sm px-3 py-2 rounded-sm w-full"
        style={{
          background: "var(--dash-bg)",
          border: "1px solid color-mix(in srgb, var(--dash-text) 15%, transparent)",
          color: "var(--dash-text)",
        }}
        placeholder="Partner 1 name"
        value={name1}
        onChange={(e) => setName1(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") ref2.current?.focus();
        }}
        autoFocus
      />
      <input
        ref={ref2}
        className="text-sm px-3 py-2 rounded-sm w-full"
        style={{
          background: "var(--dash-bg)",
          border: "1px solid color-mix(in srgb, var(--dash-text) 15%, transparent)",
          color: "var(--dash-text)",
        }}
        placeholder="Partner 2 name"
        value={name2}
        onChange={(e) => setName2(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
        }}
      />
      <button
        onClick={handleSubmit}
        disabled={!canContinue}
        className="text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-sm transition-opacity disabled:opacity-40"
        style={{ background: "var(--dash-btn-bg)", color: "var(--dash-btn-text)" }}
      >
        Continue
      </button>
    </div>
  );
}

const EasyDateTrigger = forwardRef<HTMLDivElement, { value?: string; onClick?: () => void; hasValue: boolean }>(
  ({ value: displayValue, onClick, hasValue }, ref) => {
    const formatDisplay = (iso: string) => {
      if (!iso) return "";
      try {
        return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
      } catch { return ""; }
    };

    return (
      <div ref={ref} onClick={onClick} className="group cursor-pointer">
        <div className="flex items-center gap-2.5 w-full px-3 py-2.5 border border-[var(--dash-text)]/15 bg-[var(--dash-surface)] text-[var(--dash-text)] text-sm rounded-sm transition-all group-hover:border-[var(--dash-text)]/30 shadow-sm">
          <div className="text-[var(--dash-text)]/30 group-hover:text-[var(--dash-text)]/50 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <span className={`flex-1 text-sm font-serif italic ${hasValue ? "text-[var(--dash-text)]" : "text-[var(--dash-text)]/25"}`}>
            {hasValue ? formatDisplay(displayValue || "") : "Pick a date"}
          </span>
          <div className="text-[var(--dash-text)]/10 group-hover:text-[var(--dash-text)]/25 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 7l5 5 5-5M7 13l5 5 5-5" />
            </svg>
          </div>
        </div>
      </div>
    );
  }
);
EasyDateTrigger.displayName = "EasyDateTrigger";

function DateInput({
  site,
  set,
  onDone,
}: {
  site: WeddingSite;
  set: <K extends keyof WeddingSite>(key: K, value: WeddingSite[K]) => void;
  onDone: (display: string) => void;
}) {
  const [selected, setSelected] = useState<Date | null>(site.weddingDate ? new Date(site.weddingDate) : null);

  function handleSubmit() {
    if (!selected) return;
    const display = selected.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    set("weddingDate", selected.toISOString());
    set("dateDisplayText", display);
    onDone(display);
  }

  return (
    <div className="pl-9 flex flex-col gap-2 mb-4 wedding-datepicker">
      <DatePicker
        selected={selected}
        onChange={(date: Date | null) => setSelected(date)}
        dateFormat="d MMMM yyyy"
        placeholderText="Pick a date"
        isClearable
        popperPlacement="bottom-start"
        customInput={
          <EasyDateTrigger hasValue={!!selected} value={selected?.toISOString()} />
        }
      />
      <button
        onClick={handleSubmit}
        disabled={!selected}
        className="text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-sm transition-opacity disabled:opacity-40"
        style={{ background: "var(--dash-btn-bg)", color: "var(--dash-btn-text)" }}
      >
        Continue
      </button>
    </div>
  );
}

function VenueInput({
  set,
  onDone,
}: {
  site: WeddingSite;
  set: <K extends keyof WeddingSite>(key: K, value: WeddingSite[K]) => void;
  onDone: (display: string) => void;
}) {
  const [venue, setVenue] = useState("");

  function handleSubmit() {
    set("locationText", venue.trim());
    onDone(venue.trim());
  }

  return (
    <div className="pl-9 flex flex-col gap-2 mb-4">
      <input
        className="text-sm px-3 py-2 rounded-sm w-full"
        style={{
          background: "var(--dash-bg)",
          border: "1px solid color-mix(in srgb, var(--dash-text) 15%, transparent)",
          color: "var(--dash-text)",
        }}
        placeholder="Venue name or city"
        value={venue}
        onChange={(e) => setVenue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && venue.trim()) handleSubmit();
        }}
        autoFocus
      />
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={!venue.trim()}
          className="flex-1 text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-sm transition-opacity disabled:opacity-40"
          style={{ background: "var(--dash-btn-bg)", color: "var(--dash-btn-text)" }}
        >
          Continue
        </button>
        <button
          onClick={() => onDone("Skipped")}
          className="text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-sm transition-opacity opacity-50 hover:opacity-100"
          style={{
            border: "1px solid color-mix(in srgb, var(--dash-text) 20%, transparent)",
            color: "var(--dash-text)",
          }}
        >
          Skip
        </button>
      </div>
    </div>
  );
}

function TemplateSelector({
  site,
  set,
  onDone,
}: {
  site: WeddingSite;
  set: <K extends keyof WeddingSite>(key: K, value: WeddingSite[K]) => void;
  onDone: (display: string) => void;
}) {
  const layouts = [
    { id: "classic" as const, name: "Classic", description: "Traditional centered layout" },
    { id: "modern" as const, name: "Modern", description: "Bold asymmetric design" },
  ];
  const [selected, setSelected] = useState<"classic" | "modern">(site.layoutId ?? "classic");

  function handleSelect(id: "classic" | "modern") {
    setSelected(id);
    set("layoutId", id);
  }

  function handleContinue() {
    onDone(layouts.find((l) => l.id === selected)?.name ?? selected);
  }

  return (
    <div className="pl-9 flex flex-col gap-2 mb-4">
      {layouts.map((l) => (
        <button
          key={l.id}
          onClick={() => handleSelect(l.id)}
          className="text-left px-3 py-2 rounded-sm transition-all"
          style={{
            background:
              selected === l.id
                ? "var(--dash-btn-bg)"
                : "color-mix(in srgb, var(--dash-text) 5%, transparent)",
            color: selected === l.id ? "var(--dash-btn-text)" : "var(--dash-text)",
            border:
              selected === l.id
                ? "1px solid var(--dash-btn-bg)"
                : "1px solid color-mix(in srgb, var(--dash-text) 12%, transparent)",
          }}
        >
          <div className="text-[11px] font-bold uppercase tracking-widest">{l.name}</div>
          <div className="text-[11px] opacity-70 mt-0.5">{l.description}</div>
        </button>
      ))}
      <button
        onClick={handleContinue}
        className="text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-sm"
        style={{ background: "var(--dash-btn-bg)", color: "var(--dash-btn-text)" }}
      >
        Continue
      </button>
    </div>
  );
}

function ColorSelector({
  site,
  set,
  onDone,
}: {
  site: WeddingSite;
  set: <K extends keyof WeddingSite>(key: K, value: WeddingSite[K]) => void;
  onDone: (display: string) => void;
}) {
  const [selected, setSelected] = useState(site.templateId ?? themes[0].id);

  function handleSelect(id: string) {
    setSelected(id);
    set("templateId", id);
    set("customColors", undefined as any);
  }

  function handleContinue() {
    const t = themes.find((th) => th.id === selected);
    onDone(t?.name ?? selected);
  }

  return (
    <div className="pl-9 flex flex-col gap-1 mb-4 max-h-56 overflow-y-auto pr-1">
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => handleSelect(t.id)}
          className="flex items-center gap-2 text-left px-3 py-2 rounded-sm transition-all"
          style={{
            background:
              selected === t.id
                ? "color-mix(in srgb, var(--dash-text) 8%, transparent)"
                : "transparent",
            color: "var(--dash-text)",
            border:
              selected === t.id
                ? "1px solid color-mix(in srgb, var(--dash-text) 20%, transparent)"
                : "1px solid transparent",
          }}
        >
          <div className="flex gap-1 flex-shrink-0">
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: t.colors.dark }}
            />
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: t.colors.accent }}
            />
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: t.colors.primary }}
            />
          </div>
          <span className="text-[12px]">{t.name}</span>
        </button>
      ))}
      <div
        className="sticky bottom-0 pt-2"
        style={{ background: "var(--dash-bg)" }}
      >
        <button
          onClick={handleContinue}
          className="w-full text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-sm"
          style={{ background: "var(--dash-btn-bg)", color: "var(--dash-btn-text)" }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function FontSelector({
  site,
  set,
  onDone,
}: {
  site: WeddingSite;
  set: <K extends keyof WeddingSite>(key: K, value: WeddingSite[K]) => void;
  onDone: (display: string) => void;
}) {
  const [selected, setSelected] = useState<string>(site.fontStyleId ?? fontStyles[0].id);

  function handleSelect(id: string) {
    setSelected(id);
    set("fontStyleId", id as WeddingSite["fontStyleId"]);
    set("customFonts", undefined as any);
  }

  function handleContinue() {
    const f = fontStyles.find((fs) => fs.id === selected);
    onDone(f?.name ?? selected);
  }

  return (
    <div className="pl-9 flex flex-col gap-1 mb-4 max-h-56 overflow-y-auto pr-1">
      {fontStyles.map((f) => (
        <button
          key={f.id}
          onClick={() => handleSelect(f.id)}
          className="flex flex-col text-left px-3 py-2 rounded-sm transition-all"
          style={{
            background:
              selected === f.id
                ? "color-mix(in srgb, var(--dash-text) 8%, transparent)"
                : "transparent",
            color: "var(--dash-text)",
            border:
              selected === f.id
                ? "1px solid color-mix(in srgb, var(--dash-text) 20%, transparent)"
                : "1px solid transparent",
          }}
        >
          <span className="text-[11px] font-bold uppercase tracking-widest opacity-60">
            {f.name}
          </span>
          <span
            className="text-base mt-0.5"
            style={{ fontFamily: f.fonts.serif }}
          >
            Love & Joy
          </span>
        </button>
      ))}
      <div
        className="sticky bottom-0 pt-2"
        style={{ background: "var(--dash-bg)" }}
      >
        <button
          onClick={handleContinue}
          className="w-full text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-sm"
          style={{ background: "var(--dash-btn-bg)", color: "var(--dash-btn-text)" }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function SectionSelector({
  site,
  set,
  onDone,
}: {
  site: WeddingSite;
  set: <K extends keyof WeddingSite>(key: K, value: WeddingSite[K]) => void;
  onDone: (display: string) => void;
}) {
  const sectionOrder = site.sectionOrder ?? DEFAULT_SECTION_ORDER;

  // Exclude hero and footer from toggles
  const togglable = sectionOrder.filter((s) => s.type !== "hero" && s.type !== "footer");

  const initialToggles: Record<string, boolean> = {};
  togglable.forEach((s) => {
    initialToggles[s.id] = s.visible;
  });

  const [toggles, setToggles] = useState<Record<string, boolean>>(initialToggles);

  function handleToggle(id: string) {
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleFinish() {
    const hero = sectionOrder.find((s) => s.type === "hero");
    const footer = sectionOrder.find((s) => s.type === "footer");
    const middle = sectionOrder
      .filter((s) => s.type !== "hero" && s.type !== "footer")
      .map((s) => ({ ...s, visible: toggles[s.id] ?? s.visible }));

    const newOrder: SectionConfig[] = [
      ...(hero ? [hero] : []),
      ...middle,
      ...(footer ? [footer] : []),
    ];

    set("sectionOrder", newOrder);
    const enabledCount = middle.filter((s) => s.visible).length;
    onDone(`${enabledCount} sections`);
  }

  return (
    <div className="pl-9 flex flex-col gap-1 mb-4 max-h-64 overflow-y-auto pr-1">
      {togglable.map((s) => {
        const label = SECTION_LABELS[s.type] ?? s.type;
        const on = toggles[s.id] ?? s.visible;
        return (
          <button
            key={s.id}
            onClick={() => handleToggle(s.id)}
            className="flex items-center justify-between px-3 py-2 rounded-sm text-left transition-all"
            style={{
              background: on
                ? "color-mix(in srgb, var(--dash-text) 6%, transparent)"
                : "transparent",
              color: "var(--dash-text)",
              border: "1px solid color-mix(in srgb, var(--dash-text) 10%, transparent)",
            }}
          >
            <span className="text-[12px]">{label}</span>
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ opacity: on ? 1 : 0.4 }}
            >
              {on ? "On" : "Off"}
            </span>
          </button>
        );
      })}
      <div
        className="sticky bottom-0 pt-2"
        style={{ background: "var(--dash-bg)" }}
      >
        <button
          onClick={handleFinish}
          className="w-full text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-sm"
          style={{ background: "var(--dash-btn-bg)", color: "var(--dash-btn-text)" }}
        >
          Finish
        </button>
      </div>
    </div>
  );
}

// ─── Main EasyMode Component ──────────────────────────────────────────────────

export default function EasyMode({ site, set, onClose }: EasyModeProps) {
  const total = STEPS.length;

  // Detect which steps are already filled
  function getInitialFilledDisplay(stepKey: string): string | null {
    switch (stepKey) {
      case "names":
        return site.partner1Name && site.partner2Name
          ? `${site.partner1Name} & ${site.partner2Name}`
          : null;
      case "date":
        return site.dateDisplayText || null;
      case "venue":
        return site.locationText || null;
      case "template":
        return site.layoutId ?? null;
      case "colors": {
        const t = themes.find((th) => th.id === site.templateId);
        return t?.name ?? null;
      }
      case "fonts": {
        const f = fontStyles.find((fs) => fs.id === site.fontStyleId);
        return f?.name ?? null;
      }
      case "sections":
        return site.sectionOrder ? `${site.sectionOrder.filter((s) => s.visible && s.type !== "hero" && s.type !== "footer").length} sections` : null;
      default:
        return null;
    }
  }

  // Build initial chat history and find first empty step
  const initialMessages: Message[] = [];
  let firstEmptyStep = 0;

  for (let i = 0; i < STEPS.length; i++) {
    const step = STEPS[i];
    const filled = getInitialFilledDisplay(step.key);
    initialMessages.push({ role: "bot", content: step.question });
    if (filled) {
      initialMessages.push({ role: "user", content: filled, stepIndex: i });
      firstEmptyStep = i + 1;
    } else {
      break;
    }
  }

  const [step, setStep] = useState(firstEmptyStep);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [completed, setCompleted] = useState(firstEmptyStep >= total);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, step]);

  function handleStepDone(displayText: string) {
    const newMessages: Message[] = [
      ...messages,
      { role: "user" as const, content: displayText, stepIndex: step },
    ];

    const nextStep = step + 1;
    if (nextStep >= total) {
      setMessages(newMessages);
      setCompleted(true);
      return;
    }

    newMessages.push({ role: "bot" as const, content: STEPS[nextStep].question });
    setMessages(newMessages);
    setStep(nextStep);
  }

  function handleChange(stepIndex: number) {
    // Slice messages back to just before the user reply for that step
    // Find the index of the user message for this step
    const msgIndex = messages.findIndex(
      (m) => m.role === "user" && m.stepIndex === stepIndex
    );
    if (msgIndex === -1) return;

    // Keep everything up to (not including) that user message
    const sliced = messages.slice(0, msgIndex);
    setMessages(sliced);
    setStep(stepIndex);
    setCompleted(false);
  }

  function renderStepInput() {
    if (completed) return null;

    switch (step) {
      case 0:
        return <NamesInput site={site} set={set} onDone={handleStepDone} />;
      case 1:
        return <DateInput site={site} set={set} onDone={handleStepDone} />;
      case 2:
        return <VenueInput site={site} set={set} onDone={handleStepDone} />;
      case 3:
        return <TemplateSelector site={site} set={set} onDone={handleStepDone} />;
      case 4:
        return <ColorSelector site={site} set={set} onDone={handleStepDone} />;
      case 5:
        return <FontSelector site={site} set={set} onDone={handleStepDone} />;
      case 6:
        return <SectionSelector site={site} set={set} onDone={handleStepDone} />;
      default:
        return null;
    }
  }

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .easy-mode-panel {
          animation: slideInRight 0.25s ease-out forwards;
        }
      `}</style>

      <div
        className="easy-mode-panel fixed right-0 top-0 h-full w-full sm:w-80 z-50 flex flex-col shadow-2xl"
        style={{
          background: "var(--dash-bg)",
          color: "var(--dash-text)",
          borderLeft: "1px solid color-mix(in srgb, var(--dash-text) 10%, transparent)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ borderBottom: "1px solid color-mix(in srgb, var(--dash-text) 8%, transparent)" }}
        >
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest opacity-50">
              Easy Setup
            </div>
            <div className="text-[11px] opacity-40 mt-0.5">
              {completed ? "All done!" : `Step ${Math.min(step + 1, total)} of ${total}`}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-lg opacity-50 hover:opacity-100 transition-opacity"
            style={{ color: "var(--dash-text)" }}
            aria-label="Close easy mode"
          >
            ×
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-4 py-2 flex-shrink-0">
          <ProgressBar step={completed ? total : step} total={total} />
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {messages.map((msg, i) =>
            msg.role === "bot" ? (
              <BotMessage key={i} content={msg.content} />
            ) : (
              <UserMessage
                key={i}
                content={msg.content}
                stepIndex={msg.stepIndex}
                onChange={handleChange}
              />
            )
          )}

          {/* Current step input */}
          {!completed && renderStepInput()}

          {/* Completion message */}
          {completed && (
            <div className="mt-4 text-center">
              <BotMessage content="You're all set! Your wedding site is ready to customize further. 🎉" />
              <button
                onClick={onClose}
                className="mt-3 text-[11px] font-bold uppercase tracking-widest px-6 py-2 rounded-sm"
                style={{ background: "var(--dash-btn-bg)", color: "var(--dash-btn-text)" }}
              >
                Go to Dashboard
              </button>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>
    </>
  );
}
