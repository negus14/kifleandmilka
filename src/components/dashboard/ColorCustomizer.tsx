"use client";

import React, { useState } from "react";
import { getTheme } from "@/lib/themes";

const COLOR_ROLES = [
  { key: "primary", label: "Background", desc: "Page background & light sections" },
  { key: "primaryDark", label: "Background Alt", desc: "Alternating section backgrounds" },
  { key: "accent", label: "Accent", desc: "Decorative elements & borders" },
  { key: "accentLight", label: "Accent Light", desc: "Hover states & subtle highlights" },
  { key: "accentDark", label: "Accent Dark", desc: "Stronger accent elements" },
  { key: "dark", label: "Text / Dark", desc: "Headings, body text & dark sections" },
] as const;

type ColorKey = (typeof COLOR_ROLES)[number]["key"];

interface ColorCustomizerProps {
  templateId: string;
  customColors: Partial<Record<ColorKey, string>> | undefined;
  onChange: (colors: Partial<Record<ColorKey, string>> | undefined) => void;
}

export default function ColorCustomizer({ templateId, customColors, onChange }: ColorCustomizerProps) {
  const [expanded, setExpanded] = useState(false);
  const theme = getTheme(templateId);
  const hasCustom = customColors && Object.keys(customColors).length > 0;

  const getColor = (key: ColorKey): string => {
    return customColors?.[key] || theme.colors[key];
  };

  const setColor = (key: ColorKey, value: string) => {
    const next = { ...(customColors || {}), [key]: value };
    onChange(next);
  };

  const resetAll = () => onChange(undefined);

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="w-full text-left px-3 py-3 border border-[#2d2b25]/10 rounded-sm hover:border-[#2d2b25]/30 transition-all group"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#2d2b25]/70">
              Customize Colors
            </p>
            <p className="text-[10px] text-[#2d2b25]/40 mt-0.5">
              {hasCustom ? "Custom overrides active" : "Tweak individual colors"}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {hasCustom && (
              <span className="w-2 h-2 rounded-full bg-[#2d2b25]/60" />
            )}
            <svg className="w-4 h-4 text-[#2d2b25]/30 group-hover:text-[#2d2b25]/50 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="border border-[#2d2b25]/10 rounded-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(false)}
        className="w-full text-left px-3 py-3 hover:bg-[#2d2b25]/[0.02] transition-all flex items-center justify-between"
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#2d2b25]/70">
          Customize Colors
        </p>
        <svg className="w-4 h-4 text-[#2d2b25]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>

      <div className="px-3 pb-4 space-y-3">
        {COLOR_ROLES.map(({ key, label, desc }) => {
          const val = getColor(key);
          const isCustom = !!customColors?.[key];
          return (
            <div key={key} className="flex items-center gap-3">
              <label className="relative cursor-pointer shrink-0">
                <input
                  type="color"
                  value={val}
                  onChange={(e) => setColor(key, e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <span
                  className="block w-8 h-8 rounded-sm border border-[#2d2b25]/15 shadow-sm"
                  style={{ background: val }}
                />
              </label>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-tight text-[#2d2b25]">
                    {label}
                  </span>
                  {isCustom && (
                    <span className="text-[8px] font-bold uppercase tracking-widest text-[#2d2b25]/30">
                      Custom
                    </span>
                  )}
                </div>
                <p className="text-[9px] text-[#2d2b25]/40">{desc}</p>
              </div>
              <input
                type="text"
                value={val}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#[0-9a-fA-F]{6}$/.test(v)) setColor(key, v);
                }}
                className="w-[72px] px-2 py-1 text-[10px] font-mono border border-[#2d2b25]/10 rounded-sm text-[#2d2b25]/70 bg-white/50 outline-none focus:border-[#2d2b25]/30"
                spellCheck={false}
              />
            </div>
          );
        })}

        {hasCustom && (
          <button
            type="button"
            onClick={resetAll}
            className="w-full text-center py-2 text-[10px] font-bold uppercase tracking-wider text-[#2d2b25]/50 hover:text-[#2d2b25]/80 border border-dashed border-[#2d2b25]/15 rounded-sm hover:border-[#2d2b25]/30 transition-all mt-2"
          >
            Reset to Theme Defaults
          </button>
        )}
      </div>
    </div>
  );
}
