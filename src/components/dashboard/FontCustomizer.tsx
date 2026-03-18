"use client";

import React, { useState, useEffect } from "react";
import { getFontStyle, fontCatalog, type FontCatalogEntry } from "@/lib/themes";

const FONT_ROLES = [
  { key: "script", label: "Script", desc: "Decorative headings & flourishes" },
  { key: "serif", label: "Serif", desc: "Titles & section headings" },
  { key: "sans", label: "Sans-Serif", desc: "Body text & labels" },
] as const;

type FontKey = (typeof FONT_ROLES)[number]["key"];

interface FontCustomizerProps {
  fontStyleId?: string;
  customFonts: { script?: string; serif?: string; sans?: string } | undefined;
  onChange: (fonts: { script?: string; serif?: string; sans?: string } | undefined) => void;
}

export default function FontCustomizer({ fontStyleId, customFonts, onChange }: FontCustomizerProps) {
  const [expanded, setExpanded] = useState(false);
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());
  const fontStyle = getFontStyle(fontStyleId);
  const hasCustom = customFonts && Object.keys(customFonts).length > 0;

  const getFont = (key: FontKey): string => {
    return customFonts?.[key] || fontStyle.fonts[key];
  };

  const getCatalogOptions = (category: FontCatalogEntry["category"]) => {
    return fontCatalog.filter(f => f.category === category);
  };

  // Load Google Font for preview when a dropdown is opened
  useEffect(() => {
    if (!expanded) return;
    const families = fontCatalog
      .filter(f => !loadedFonts.has(f.googleFamily))
      .map(f => f.googleFamily);
    if (families.length === 0) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?${families.map(f => `family=${f}`).join("&")}&display=swap`;
    document.head.appendChild(link);
    setLoadedFonts(new Set([...loadedFonts, ...families.map(f => f)]));
  }, [expanded]); // eslint-disable-line react-hooks/exhaustive-deps

  const setFont = (key: FontKey, value: string) => {
    // If the selected font matches the preset, remove the override
    if (value === fontStyle.fonts[key]) {
      const next = { ...(customFonts || {}) };
      delete next[key];
      onChange(Object.keys(next).length > 0 ? next : undefined);
    } else {
      onChange({ ...(customFonts || {}), [key]: value });
    }
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
              Customize Fonts
            </p>
            <p className="text-[10px] text-[#2d2b25]/40 mt-0.5">
              {hasCustom ? "Custom font overrides active" : "Pick individual fonts"}
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
          Customize Fonts
        </p>
        <svg className="w-4 h-4 text-[#2d2b25]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>

      <div className="px-3 pb-4 space-y-4">
        {FONT_ROLES.map(({ key, label, desc }) => {
          const currentFont = getFont(key);
          const options = getCatalogOptions(key);
          const isCustom = !!customFonts?.[key];

          return (
            <div key={key}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-tight text-[#2d2b25]">
                  {label}
                </span>
                {isCustom && (
                  <span className="text-[8px] font-bold uppercase tracking-widest text-[#2d2b25]/30">
                    Custom
                  </span>
                )}
              </div>
              <p className="text-[9px] text-[#2d2b25]/40 mb-2">{desc}</p>
              <select
                value={currentFont}
                onChange={(e) => setFont(key, e.target.value)}
                className="w-full px-3 py-2.5 border border-[#2d2b25]/15 bg-white/50 text-[#2d2b25] text-sm outline-none focus:border-[#2d2b25]/40 rounded-sm appearance-none cursor-pointer"
                style={{ fontFamily: currentFont }}
              >
                {options.map((font) => (
                  <option
                    key={font.family}
                    value={font.family}
                    style={{ fontFamily: font.family }}
                  >
                    {font.displayName}
                  </option>
                ))}
              </select>
              {/* Preview */}
              <p
                className="mt-1.5 text-lg text-[#2d2b25]/70 truncate"
                style={{ fontFamily: currentFont }}
              >
                {key === "script" ? "The Wedding of" : key === "serif" ? "Partner & Partner" : "Saturday, August 1st"}
              </p>
            </div>
          );
        })}

        {hasCustom && (
          <button
            type="button"
            onClick={resetAll}
            className="w-full text-center py-2 text-[10px] font-bold uppercase tracking-wider text-[#2d2b25]/50 hover:text-[#2d2b25]/80 border border-dashed border-[#2d2b25]/15 rounded-sm hover:border-[#2d2b25]/30 transition-all mt-2"
          >
            Reset to Preset
          </button>
        )}
      </div>
    </div>
  );
}
