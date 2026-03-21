"use client";

import React, { useState, useRef, useId, useEffect, useCallback, forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/navigation";
import type {
  WeddingSite,
  WeddingDay,
  VenueItem,
  ScheduleItem,
  MenuItem,
  MenuCategory,
  GalleryImage,
  ExploreGroup,
  AccommodationItem,
  ContactEntry,
  VenueInfoBlock,
} from "@/lib/types/wedding-site";
import { DEFAULT_SECTION_ORDER, SECTION_LABELS, type SectionConfig } from "@/lib/types/wedding-site";
import { themes, fontStyles } from "@/lib/themes";
import EasyMode from "@/components/dashboard/EasyMode";
import CountryCodePicker, { matchCountry } from "@/components/CountryCodePicker";
import CurrencyPicker, { getCurrencySymbol } from "@/components/CurrencyPicker";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ClassicTemplate from "@/templates/classic/Template";
import ModernTemplate from "@/templates/modern/Template";
import ColorCustomizer from "@/components/dashboard/ColorCustomizer";
import FontCustomizer from "@/components/dashboard/FontCustomizer";
import ThemeToggle from "@/components/dashboard/ThemeToggle";
import { useTheme } from "@/components/dashboard/ThemeProvider";

const STATIC_TABS = ["Basics", "Layout"] as const;
type View = "website" | "guests" | "gifts" | "messages";
type Tab = string; // Allows dynamic tabs like "story-123"

// ─── Primitives ───

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-[var(--dash-text)]/60 mb-3 mt-8 first:mt-0">
      {children}
    </label>
  );
}

function Field({ label, value, onChange, placeholder, multiline, rows, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; multiline?: boolean; rows?: number; type?: string;
}) {
  const val = value ?? "";
  return (
    <div className="mb-4">
      <Label>{label}</Label>
      {multiline ? (
        <textarea
          value={val} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} rows={rows || 4}
          className="w-full px-3 py-2 border border-[var(--dash-text)]/15 bg-[var(--dash-surface)] text-[var(--dash-text)] text-sm outline-none focus:border-[var(--dash-text)]/40 resize-y rounded-sm"
        />
      ) : (
        <input
          type={type}
          value={val} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-[var(--dash-text)]/15 bg-[var(--dash-surface)] text-[var(--dash-text)] text-sm outline-none focus:border-[var(--dash-text)]/40 rounded-sm"
        />
      )}
    </div>
  );
}

function SlugField({ currentSlug, onSave, customDomain, domainVerified }: { currentSlug: string; onSave: (val: string) => void; customDomain?: string | null; domainVerified?: boolean }) {
  const [draft, setDraft] = useState(currentSlug);
  const [copied, setCopied] = useState(false);
  const hasChanged = draft !== currentSlug;

  const shareUrl = customDomain
    ? `https://${customDomain}`
    : `https://${currentSlug}.ithinkshewifey.com`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mb-6 p-4 bg-[var(--dash-text)]/5 border border-[var(--dash-text)]/10 rounded-sm">
      <Label>Site URL</Label>

      {/* Shareable link with copy */}
      <div className="flex items-center gap-2 mt-1 mb-3 p-2.5 bg-[var(--dash-surface-alt)] border border-[var(--dash-text)]/10 rounded-sm">
        <span className="flex-1 text-sm text-[var(--dash-text)]/70 truncate select-all">{shareUrl}</span>
        <button
          onClick={handleCopy}
          className="shrink-0 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-[var(--dash-btn-bg)] text-[var(--dash-btn-text)] rounded-sm hover:bg-[var(--dash-text)]/90 transition-all"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--dash-text)]/40 shrink-0 hidden sm:inline">ithinkshewifey.com/</span>
        <input
          type="text"
          value={draft}
          onChange={(e) => {
            const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
            setDraft(val);
          }}
          className="flex-1 min-w-0 px-3 py-2 border border-[var(--dash-text)]/15 bg-[var(--dash-surface)] text-[var(--dash-text)] text-sm font-medium outline-none focus:border-[var(--dash-text)]/40 rounded-sm"
          placeholder="your-url-here"
        />
      </div>
      {hasChanged && (
        <button
          onClick={() => onSave(draft)}
          className="mt-2 w-full px-4 py-2 bg-[var(--dash-btn-bg)] text-[var(--dash-bg)] text-[10px] font-bold tracking-widest uppercase rounded-sm hover:opacity-90 transition-opacity"
        >
          Update URL
        </button>
      )}
      <p className="text-[10px] text-[var(--dash-text)]/40 mt-2 uppercase tracking-wider">
        Caution: Changing this will change your public website address.
      </p>
    </div>
  );
}

const DatePickerTrigger = forwardRef<HTMLDivElement, { value?: string; onClick?: () => void; hasValue: boolean }>(
  ({ value: displayValue, onClick, hasValue }, ref) => {
    const formatDisplay = (iso: string) => {
      if (!iso) return { date: "", time: "" };
      try {
        const d = new Date(iso);
        return {
          date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
        };
      } catch { return { date: "", time: "" }; }
    };

    const { date, time } = formatDisplay(displayValue || "");

    return (
      <div ref={ref} onClick={onClick} className="group cursor-pointer">
        <div className="flex items-center gap-3 w-full px-4 py-3.5 border border-[var(--dash-text)]/15 bg-[var(--dash-surface)] text-[var(--dash-text)] text-sm outline-none group-focus-within:border-[var(--dash-text)]/40 rounded-sm transition-all group-hover:border-[var(--dash-text)]/30 shadow-sm">
          <div className="text-[var(--dash-text)]/30 group-hover:text-[var(--dash-text)]/50 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div className="flex-1 flex flex-col items-start overflow-hidden">
            <span className={`text-base font-serif italic leading-none ${hasValue ? "text-[var(--dash-text)]" : "text-[var(--dash-text)]/20"}`}>
              {hasValue ? date : "Set Date & Time"}
            </span>
            {hasValue && (
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--dash-text)]/40 mt-1.5 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[var(--dash-text)]/20" />
                {time}
              </span>
            )}
          </div>
          <div className="text-[var(--dash-text)]/10 group-hover:text-[var(--dash-text)]/25 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 7l5 5 5-5M7 13l5 5 5-5" />
            </svg>
          </div>
        </div>
      </div>
    );
  }
);
DatePickerTrigger.displayName = "DatePickerTrigger";

function DateTimePicker({ label, value, onChange }: {
  label: string;
  value: string;
  onChange: (v: string) => void
}) {
  const selected = value ? new Date(value) : null;

  return (
    <div className="mb-4 wedding-datepicker">
      <Label>{label}</Label>
      <DatePicker
        selected={selected}
        onChange={(date: Date | null) => {
          onChange(date ? date.toISOString() : "");
        }}
        showTimeSelect
        timeFormat="h:mm aa"
        timeIntervals={15}
        timeCaption="Time"
        dateFormat="MMMM d, yyyy h:mm aa"
        placeholderText="Set Date & Time"
        isClearable
        popperPlacement="bottom-start"
        customInput={
          <DatePickerTrigger hasValue={!!value} value={value} />
        }
      />
    </div>
  );
}

function TimePicker({ label, hour, period, onChange }: { 
  label: string; 
  hour: string; 
  period: string; 
  onChange: (hour: string, period: string) => void 
}) {
  return (
    <div className="mb-4">
      <Label>{label}</Label>
      <div className="flex gap-1">
        <div className="relative flex-1 group">
           <input
             type="text"
             value={hour}
             onChange={(e) => onChange(e.target.value, period)}
             placeholder="4:00"
             className="w-full pl-9 pr-3 py-2 border border-[var(--dash-text)]/15 bg-[var(--dash-surface)] text-[var(--dash-text)] text-sm outline-none focus:border-[var(--dash-text)]/40 rounded-sm transition-all group-hover:border-[var(--dash-text)]/30"
           />
           <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-text)]/30 group-focus-within:text-[var(--dash-text)]/50 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
           </div>
        </div>
        <div className="flex border border-[var(--dash-text)]/15 rounded-sm overflow-hidden bg-[var(--dash-surface)]">
          {(["AM", "PM"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onChange(hour, p)}
              className={`px-3 py-2 text-[10px] font-bold transition-all ${
                period === p ? "bg-[var(--dash-btn-bg)] text-[var(--dash-bg)]" : "text-[var(--dash-text)]/40 hover:text-[var(--dash-text)] hover:bg-[var(--dash-text)]/5"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({ children, onRemove, title }: { children: React.ReactNode; onRemove?: () => void; title?: string }) {
  return (
    <div className="border border-[var(--dash-text)]/10 bg-[var(--dash-surface)] p-4 rounded-sm mb-3 relative transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
      {title && <p className="text-xs font-semibold tracking-wide uppercase text-[var(--dash-text)]/40 mb-3">{title}</p>}
      {onRemove && (
        <button onClick={onRemove} type="button"
          className="absolute top-3 right-3 text-[var(--dash-text)]/30 hover:text-red-500 text-lg leading-none transition-colors"
          title="Remove"
        >&times;</button>
      )}
      {children}
    </div>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} type="button"
      className="text-xs font-semibold tracking-[0.1em] uppercase text-[var(--dash-text)]/50 border border-dashed border-[var(--dash-text)]/20 px-4 py-2.5 hover:border-[var(--dash-text)]/40 hover:text-[var(--dash-text)] hover:bg-[var(--dash-text)]/[0.02] transition-all duration-200 w-full mt-1 mb-4 rounded-sm hover:scale-[1.01]"
    >+ {label}</button>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{children}</h2>;
}

function DomainRequest({ slug, existingDomain }: { slug: string; existingDomain?: string | null }) {
  const [mode, setMode] = useState<"choose" | "buy" | "own">(existingDomain ? "buy" : "choose");
  const [domain, setDomain] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [expanded, setExpanded] = useState(!existingDomain);

  const handleSubmit = async (type: "buy" | "own") => {
    if (!domain.trim()) return;
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch(`/api/sites/${slug}/domain-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.trim().toLowerCase(), type }),
      });
      if (res.ok) {
        setStatus("sent");
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || "Something went wrong. Please try again.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-sm">
        <p className="text-xs font-medium text-green-600">Request submitted!</p>
        <p className="text-[10px] text-green-600 mt-1">
          We&apos;ll connect <strong>{domain}</strong> to your site. You&apos;ll receive an email when it&apos;s ready.
        </p>
        <button
          onClick={() => { setStatus("idle"); setDomain(""); }}
          className="mt-2 text-[10px] text-green-600 underline hover:no-underline"
        >
          Change or cancel request
        </button>
      </div>
    );
  }

  if (existingDomain && !expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="text-[10px] text-[var(--dash-text)]/50 underline hover:text-[var(--dash-text)]/70 transition-colors"
      >
        Change requested domain
      </button>
    );
  }

  // Choice screen
  if (mode === "choose" && !existingDomain) {
    return (
      <div className="space-y-2">
        <button
          onClick={() => setMode("buy")}
          className="w-full p-3 text-left border border-[var(--dash-text)]/10 rounded-sm hover:border-[var(--dash-text)]/30 transition-colors"
        >
          <p className="text-xs font-medium text-[var(--dash-text)]">I need a new domain</p>
          <p className="text-[10px] text-[var(--dash-text)]/50 mt-0.5">We&apos;ll purchase and set it up for you — from £15/year</p>
        </button>
        <button
          onClick={() => setMode("own")}
          className="w-full p-3 text-left border border-[var(--dash-text)]/10 rounded-sm hover:border-[var(--dash-text)]/30 transition-colors"
        >
          <p className="text-xs font-medium text-[var(--dash-text)]">I already have a domain</p>
          <p className="text-[10px] text-[var(--dash-text)]/50 mt-0.5">We&apos;ll connect your existing domain for free</p>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--dash-text)]/70">
        {existingDomain
          ? "Enter a different domain to update your request:"
          : mode === "own"
            ? "Enter the domain you already own:"
            : "Enter the domain you\u2019d like us to purchase for you:"}
      </p>
      <input
        type="text"
        value={domain}
        onChange={(e) => { setDomain(e.target.value.toLowerCase().replace(/[^a-z0-9.-]/g, "")); if (status === "error") setStatus("idle"); }}
        placeholder="e.g. milkaandkifle.com"
        className="w-full text-sm px-3 py-2.5 bg-[var(--dash-surface)] border border-[var(--dash-text)]/15 rounded-sm focus:outline-none focus:border-[var(--dash-text)]/40 transition-colors placeholder:text-[var(--dash-text)]/25"
      />
      {mode === "own" && domain && (
        <div className="p-3 bg-[var(--dash-text)]/[0.04] border border-[var(--dash-text)]/10 rounded-sm">
          <p className="text-[10px] text-[var(--dash-text)]/60">
            After submitting, you&apos;ll need to add a DNS record pointing to us. We&apos;ll email you the instructions.
          </p>
        </div>
      )}
      {status === "error" && (
        <p className="text-xs text-red-600">{errorMsg}</p>
      )}
      {domain && (
        <button
          onClick={() => handleSubmit(mode === "choose" ? "buy" : mode)}
          disabled={status === "sending"}
          className="w-full py-2.5 text-[10px] font-semibold tracking-[0.12em] uppercase bg-[var(--dash-btn-bg)] text-[var(--dash-bg)] hover:opacity-85 disabled:opacity-50 transition-colors rounded-sm"
        >
          {status === "sending" ? "Submitting..." : existingDomain ? `Update to ${domain}` : mode === "own" ? `Connect ${domain}` : `Request ${domain}`}
        </button>
      )}
      <div className="flex gap-3">
        {!existingDomain && (
          <button
            onClick={() => { setMode("choose"); setDomain(""); setStatus("idle"); }}
            className="text-[10px] text-[var(--dash-text)]/40 hover:text-[var(--dash-text)]/60 transition-colors"
          >
            Back
          </button>
        )}
        {existingDomain && (
          <button
            onClick={() => setExpanded(false)}
            className="text-[10px] text-[var(--dash-text)]/40 hover:text-[var(--dash-text)]/60 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
      {mode === "buy" && !existingDomain && (
        <p className="text-[10px] text-[var(--dash-text)]/40">
          Custom domains are £15/year. We&apos;ll check availability and send you a payment link.
        </p>
      )}
    </div>
  );
}

function DomainStatus({ slug, domain }: { slug: string; domain: string }) {
  const [status, setStatus] = useState<"idle" | "checking" | "configured" | "pending" | "error">("idle");
  const [message, setMessage] = useState("");

  const check = async () => {
    setStatus("checking");
    try {
      // First check current status
      const getRes = await fetch(`/api/sites/${slug}/domain`);
      const getData = await getRes.json();

      if (getData.configured) {
        setStatus("configured");
        setMessage("Domain is configured and active");
        return;
      }

      if (getData.pending) {
        setStatus("pending");
        setMessage("SSL certificate is being provisioned. Check back in a few minutes.");
        return;
      }

      // Not yet registered — try to verify and register
      const postRes = await fetch(`/api/sites/${slug}/domain`, { method: "POST" });
      const postData = await postRes.json();

      if (!postRes.ok) {
        setStatus("error");
        setMessage(postData.error);
        return;
      }

      setStatus("pending");
      setMessage("Domain verified! SSL certificate is being provisioned. This usually takes a few minutes.");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Failed to check status");
    }
  };

  return (
    <div className="mt-3 flex items-center gap-3">
      <button onClick={check} disabled={status === "checking"} className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider bg-[var(--dash-btn-bg)] text-[var(--dash-btn-text)] rounded-sm hover:bg-[var(--dash-text)]/90 disabled:opacity-50 transition-all">
        {status === "checking" ? "Verifying..." : "Verify & Connect"}
      </button>
      {status === "configured" && <span className="text-[10px] text-green-600 font-medium">{message}</span>}
      {status === "pending" && <span className="text-[10px] text-yellow-600 font-medium">{message}</span>}
      {status === "error" && <span className="text-[10px] text-red-600 font-medium">{message}</span>}
    </div>
  );
}

function ColorPicker({ label, value, onChange, themeColors }: { 
  label: string; 
  value: string; 
  onChange: (v: "primary" | "accent" | "dark" | "transparent") => void;
  themeColors: { primary: string; accent: string; dark: string };
}) {
  const options = [
    { id: "transparent", name: "Default", color: "transparent", border: "border-dashed" },
    { id: "primary", name: "Light", color: themeColors.primary, border: "border-solid" },
    { id: "accent", name: "Accent", color: themeColors.accent, border: "border-solid" },
    { id: "dark", name: "Dark", color: themeColors.dark, border: "border-solid" },
  ] as const;

  return (
    <div className="mb-6">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2 mt-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id as any)}
            className={`group relative flex flex-col items-center gap-1.5 p-1 rounded-sm transition-all ${
              value === opt.id ? "bg-[var(--dash-text)]/5" : "hover:bg-[var(--dash-text)]/5"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full border ${opt.border} border-[var(--dash-text)]/20 shadow-sm transition-transform group-hover:scale-105 ${
                value === opt.id ? "ring-2 ring-[var(--dash-text)] ring-offset-2 ring-offset-[var(--dash-bg)]" : ""
              }`}
              style={{ backgroundColor: opt.color }}
            />
            <span className={`text-[9px] font-bold uppercase tracking-wider ${
              value === opt.id ? "text-[var(--dash-text)]" : "text-[var(--dash-text)]/40"
            }`}>{opt.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Image Upload ───

async function uploadFile(file: File): Promise<string> {
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      fileSize: file.size,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Upload failed");
  }
  const { uploadUrl, publicUrl } = await res.json();

  const upload = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });
  if (!upload.ok) throw new Error("Upload to storage failed");

  return publicUrl;
}

function MediaLibrary({ onSelect, onClose, recentLinks = [] }: { onSelect: (url: string) => void; onClose: () => void; recentLinks?: string[] }) {
  const [images, setImages] = useState<{ url: string; key: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [libTab, setLibTab] = useState<"uploads" | "recent">("uploads");

  useEffect(() => {
    async function loadMedia() {
      setLoading(true);
      try {
        const res = await fetch("/api/media");
        const data = await res.json();
        
        if (data.error) {
          setError("Media library is not available. Please check your storage configuration.");
          return;
        }

        // The API returns { images: [...] }
        if (Array.isArray(data.images)) {
          setImages(data.images);
        } else if (data.data && Array.isArray(data.data.images)) {
          // Fallback if structured differently
          setImages(data.data.images);
        }
      } catch (err) {
        console.error("Failed to load media", err);
      } finally {
        setLoading(false);
      }
    }
    loadMedia();
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--dash-text)]/60 backdrop-blur-sm p-4">
      <div className="bg-[var(--dash-bg)] w-full max-w-4xl max-h-[80vh] flex flex-col rounded-sm shadow-2xl border border-[var(--dash-text)]/10">
        <div className="p-6 border-b border-[var(--dash-text)]/10 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-serif italic">Media Library</h2>
            <div className="flex gap-4 mt-2">
              <button 
                onClick={() => setLibTab("uploads")}
                className={`text-[10px] font-bold uppercase tracking-widest pb-1 border-b-2 transition-all ${libTab === "uploads" ? "border-[var(--dash-text)] text-[var(--dash-text)]" : "border-transparent text-[var(--dash-text)]/40 hover:text-[var(--dash-text)]/60"}`}
              >
                Uploads
              </button>
              <button 
                onClick={() => setLibTab("recent")}
                className={`text-[10px] font-bold uppercase tracking-widest pb-1 border-b-2 transition-all ${libTab === "recent" ? "border-[var(--dash-text)] text-[var(--dash-text)]" : "border-transparent text-[var(--dash-text)]/40 hover:text-[var(--dash-text)]/60"}`}
              >
                Recently Used {recentLinks.length > 0 && `(${recentLinks.length})`}
              </button>
              <button 
                onClick={() => {
                  setError(null);
                  setImages([]);
                  setLoading(true);
                  async function refresh() {
                    try {
                      const res = await fetch("/api/media");
                      const data = await res.json();
                      if (data.error) { setError("Media library is not available. Please check your storage configuration."); return; }
                      if (data.images) setImages(data.images);
                    } catch (err) {
                      console.error("Refresh failed", err);
                    } finally {
                      setLoading(false);
                    }
                  }
                  refresh();
                }}
                className="text-[10px] font-bold uppercase tracking-widest text-[var(--dash-text)]/40 hover:text-[var(--dash-text)] ml-4 flex items-center gap-1"
              >
                <svg className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
          <button onClick={onClose} className="text-[var(--dash-text)]/40 hover:text-[var(--dash-text)] text-2xl">&times;</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {libTab === "uploads" ? (
            loading ? (
              <div className="flex items-center justify-center h-64 text-[var(--dash-text)]/40 italic uppercase tracking-widest text-xs">Loading your media...</div>
            ) : error && !loading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--dash-text)]/20 mb-4">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="M21 15l-5-5L5 21"/>
                </svg>
                <p className="text-sm text-[var(--dash-text)]/50 max-w-xs">{error}</p>
              </div>
            ) : images.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-[var(--dash-text)]/40 gap-4">
                <p className="italic">Your library is empty.</p>
                <p className="text-[10px] uppercase tracking-widest text-center max-w-xs">Upload images using the "Upload" button in the editor to see them here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((img) => (
                  <button
                    key={img.key}
                    onClick={() => { onSelect(img.url); onClose(); }}
                    className="group relative aspect-square bg-[var(--dash-surface)] border border-[var(--dash-text)]/5 hover:border-[var(--dash-text)]/40 transition-all overflow-hidden rounded-sm"
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-[var(--dash-text)]/0 group-hover:bg-[var(--dash-text)]/10 transition-colors" />
                  </button>
                ))}
              </div>
            )
          ) : (
            recentLinks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-[var(--dash-text)]/40 gap-4">
                <p className="italic">No recently used links yet.</p>
                <p className="text-[10px] uppercase tracking-widest text-center max-w-xs">Any images you paste as a URL or upload will appear here for easy re-use.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recentLinks.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => { onSelect(url); onClose(); }}
                    className="group relative aspect-square bg-[var(--dash-surface)] border border-[var(--dash-text)]/5 hover:border-[var(--dash-text)]/40 transition-all overflow-hidden rounded-sm"
                  >
                    <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-[var(--dash-text)]/0 group-hover:bg-[var(--dash-text)]/10 transition-colors" />
                    <div className="absolute bottom-1 left-1 bg-[var(--dash-bg)]/80 px-1 py-0.5 rounded-[1px] text-[8px] uppercase tracking-widest font-bold text-[var(--dash-text)]/60 border border-[var(--dash-text)]/5">Recent</div>
                  </button>
                ))}
              </div>
            )
          )}
        </div>
        
        <div className="p-4 border-t border-[var(--dash-text)]/5 bg-[var(--dash-text)]/[0.02] text-right">
          <button onClick={onClose} className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--dash-text)]/60 hover:text-[var(--dash-text)]">Close Library</button>
        </div>
      </div>
    </div>
  );
}

function ImageField({ label, value, onChange, recentLinks = [], onAddRecentLink }: {
  label: string; value: string; onChange: (url: string) => void; recentLinks?: string[]; onAddRecentLink?: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [largeFileConfirm, setLargeFileConfirm] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function processUpload(file: File) {
    setUploading(true);
    try {
      const url = await uploadFile(file);
      onChange(url);
      if (onAddRecentLink) onAddRecentLink(url);
    } catch (err: any) {
      setUploadError(err.message || "Upload failed");
    }
    setUploading(false);
  }

  async function handleFile(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      setLargeFileConfirm(file);
      return;
    }
    processUpload(file);
  }

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          handleFile(file);
        }
      }
    }
  };

  return (
    <div className="mb-6">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        <input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (e.target.value && onAddRecentLink) onAddRecentLink(e.target.value);
          }}
          onPaste={handlePaste}
          placeholder="Paste URL or paste image directly (Ctrl+V)"
          className="w-full px-3 py-2 border border-[var(--dash-text)]/15 bg-[var(--dash-surface)] text-[var(--dash-text)] text-sm outline-none focus:border-[var(--dash-text)]/40 rounded-sm"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="px-3 py-2 text-xs font-semibold tracking-wide uppercase border border-red-500/30 text-red-500 bg-red-500/10 hover:bg-red-500/20 hover:border-red-500/50 transition-colors rounded-sm whitespace-nowrap"
          >
            Clear
          </button>
        )}
        <button
          type="button"
          onClick={() => setShowLibrary(true)}
          className="px-3 py-2 text-xs font-semibold tracking-wide uppercase border border-[var(--dash-text)]/15 bg-[var(--dash-text)]/5 text-[var(--dash-text)]/60 hover:text-[var(--dash-text)] hover:bg-[var(--dash-text)]/10 hover:border-[var(--dash-text)]/30 transition-colors rounded-sm whitespace-nowrap"
        >
          Library
        </button>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="px-3 py-2 text-xs font-semibold tracking-wide uppercase border border-[var(--dash-text)]/15 bg-[var(--dash-text)]/5 text-[var(--dash-text)]/60 hover:text-[var(--dash-text)] hover:bg-[var(--dash-text)]/10 hover:border-[var(--dash-text)]/30 transition-colors rounded-sm disabled:opacity-50 whitespace-nowrap"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
        <input
          ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>
      <p className="text-[9px] text-[var(--dash-text)]/40 mt-1 uppercase tracking-tighter">
        Tip: You can paste a Canva "Shared Link" here, or upload an optimized image for better speed.
      </p>
      {value && (
        <img src={value} alt="Preview" className="w-full max-w-xs h-32 object-cover rounded-sm border border-[var(--dash-text)]/10 mt-2" />
      )}
      
      {showLibrary && (
        <MediaLibrary
          onSelect={(url) => {
            onChange(url);
            if (onAddRecentLink) onAddRecentLink(url);
          }}
          onClose={() => setShowLibrary(false)}
          recentLinks={recentLinks}
        />
      )}
      {/* Large file confirmation modal */}
      {largeFileConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setLargeFileConfirm(null)}>
          <div className="bg-[var(--dash-bg)] border border-[var(--dash-text)]/15 rounded-sm p-6 max-w-sm mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-medium mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Large Image</h3>
            <p className="text-sm text-[var(--dash-text)]/60 mb-2">This image is over 5MB. Large images can slow down your site for guests.</p>
            <p className="text-[10px] text-[var(--dash-text)]/40 uppercase tracking-wider mb-6">Would you like to upload it anyway?</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setLargeFileConfirm(null)} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--dash-text)]/50 hover:text-[var(--dash-text)] transition-colors">
                Cancel
              </button>
              <button onClick={() => { const f = largeFileConfirm; setLargeFileConfirm(null); processUpload(f); }} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-[var(--dash-btn-bg)] text-[var(--dash-bg)] rounded-sm hover:opacity-90 transition-opacity">
                Upload Anyway
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Upload error modal */}
      {uploadError && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setUploadError(null)}>
          <div className="bg-[var(--dash-bg)] border border-[var(--dash-text)]/15 rounded-sm p-6 max-w-sm mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-medium mb-1 text-red-500" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Upload Failed</h3>
            <p className="text-sm text-[var(--dash-text)]/70 mb-6 break-words">{uploadError}</p>
            <div className="flex items-center justify-end">
              <button onClick={() => setUploadError(null)} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-[var(--dash-btn-bg)] text-[var(--dash-bg)] rounded-sm hover:opacity-90 transition-opacity">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Drag Handle ───

function DragHandle({ listeners, attributes }: { listeners?: Record<string, Function>; attributes?: Record<string, any> }) {
  return (
    <button
      type="button"
      className="absolute top-3 left-3 cursor-grab active:cursor-grabbing text-[var(--dash-text)]/25 hover:text-[var(--dash-text)]/50 touch-none"
      {...attributes}
      {...listeners}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <circle cx="5" cy="3" r="1.5" /><circle cx="11" cy="3" r="1.5" />
        <circle cx="5" cy="8" r="1.5" /><circle cx="11" cy="8" r="1.5" />
        <circle cx="5" cy="13" r="1.5" /><circle cx="11" cy="13" r="1.5" />
      </svg>
    </button>
  );
}

// ─── Sortable Item ───

function SortableCard({ id, children, onRemove, title }: {
  id: string; children: React.ReactNode; onRemove?: () => void; title?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="border border-[var(--dash-text)]/10 bg-[var(--dash-surface)] p-4 pl-10 rounded-sm mb-3 relative">
        <DragHandle listeners={listeners} attributes={attributes} />
        {title && <p className="text-xs font-semibold tracking-wide uppercase text-[var(--dash-text)]/40 mb-3">{title}</p>}
        {onRemove && (
          <button onClick={onRemove} type="button"
            className="absolute top-3 right-3 text-[var(--dash-text)]/30 hover:text-red-500 text-lg leading-none transition-colors"
            title="Remove"
          >&times;</button>
        )}
        {children}
      </div>
    </div>
  );
}

// ─── Sortable List Wrapper ───

function SortableList<T>({ items, prefix, onReorder, children }: {
  items: T[];
  prefix: string;
  onReorder: (items: T[]) => void;
  children: (item: T, index: number, id: string) => React.ReactNode;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );
  const ids = items.map((_, i) => `${prefix}-${i}`);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    onReorder(arrayMove(items, oldIndex, newIndex));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {items.map((item, i) => children(item, i, ids[i]))}
      </SortableContext>
    </DndContext>
  );
}

// ─── Gift Tracker Panel ───

function GiftTrackerPanel({ giftData, loadGifts, site }: {
  giftData: {
    contributions: {
      id: string; gift_name: string; guest_name: string; amount: string | null;
      currency: string | null; message: string | null; payment_method: string | null;
      status: string | null; created_at: string | null;
    }[];
    total: number; page: number; totalPages: number;
    loaded: boolean; loading: boolean; error: string | null;
  };
  loadGifts: (page?: number) => void;
  site: WeddingSite;
}) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { contributions, loading, error } = giftData;

  const totalAmount = contributions.reduce((sum, c) => sum + (c.amount ? parseFloat(c.amount) : 0), 0);
  const confirmed = contributions.filter(c => c.status === "confirmed").length;
  const pending = contributions.filter(c => c.status === "pending").length;
  const currencySymbol = getCurrencySymbol(site.giftCurrency || "GBP");

  const toggleStatus = async (id: string, current: string | null) => {
    const newStatus = current === "confirmed" ? "pending" : "confirmed";
    try {
      await fetch(`/api/sites/${site.slug}/gift-contributions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      loadGifts();
    } catch { /* silently fail */ }
  };

  const deleteGift = async (id: string) => {
    try {
      await fetch(`/api/sites/${site.slug}/gift-contributions`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setDeleteConfirm(null);
      loadGifts();
    } catch { /* silently fail */ }
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h2 className="text-lg" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Gift Tracker{giftData.total > 0 ? ` (${giftData.total})` : ""}</h2>
          <p className="text-xs text-[var(--dash-text)]/40 mt-1">Track contributions and well wishes from guests</p>
        </div>
        <button onClick={() => loadGifts(giftData.page)} disabled={loading} className="p-2 text-[var(--dash-text)]/40 hover:text-[var(--dash-text)] hover:bg-[var(--dash-text)]/5 rounded-sm transition-all" title="Refresh">
          <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-sm">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 mt-6">
        {[
          { label: "Gifts", value: contributions.length, color: "text-[var(--dash-text)]" },
          { label: "Total", value: `${currencySymbol}${totalAmount.toFixed(0)}`, color: "text-[var(--dash-text)]" },
          { label: "Confirmed", value: confirmed, color: "text-green-600" },
          { label: "Pending", value: pending, color: "text-[var(--dash-text)]/40" },
        ].map((stat) => (
          <div key={stat.label} className="p-3 bg-[var(--dash-surface)] border border-[var(--dash-text)]/8 rounded-sm text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
            <p className={`text-xl font-serif italic ${stat.color}`}>{stat.value}</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-[var(--dash-text)]/35 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Loading */}
      {loading && !giftData.loaded && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <svg className="w-6 h-6 animate-spin text-[var(--dash-text)]/25" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--dash-text)]/30">Loading gifts</span>
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && contributions.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--dash-text)]/[0.04] flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--dash-text)]/20">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <p className="text-sm font-medium text-[var(--dash-text)]/50">No gifts yet</p>
          <p className="text-xs text-[var(--dash-text)]/30 mt-1 max-w-[220px]">When guests send gifts and well wishes, they will appear here</p>
        </div>
      )}

      {/* Table */}
      {contributions.length > 0 && (
        <div className="bg-[var(--dash-surface)] border border-[var(--dash-text)]/10 rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--dash-text)]/8 bg-[var(--dash-text)]/[0.02]">
                  <th className="px-4 py-2.5 text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--dash-text)]/40">From</th>
                  <th className="px-4 py-2.5 text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--dash-text)]/40 hidden sm:table-cell">Gift</th>
                  <th className="px-4 py-2.5 text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--dash-text)]/40 text-right">Amount</th>
                  <th className="px-4 py-2.5 text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--dash-text)]/40 hidden sm:table-cell">Message</th>
                  <th className="px-4 py-2.5 text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--dash-text)]/40 text-center">Status</th>
                  <th className="px-4 py-2.5 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {contributions.map((c) => (
                  <tr key={c.id} className="border-b border-[var(--dash-text)]/5 last:border-0 hover:bg-[var(--dash-text)]/[0.015] transition-colors">
                    <td className="px-4 py-2.5">
                      <p className="text-sm text-[var(--dash-text)] font-medium">{c.guest_name}</p>
                      <p className="text-[10px] text-[var(--dash-text)]/30">{c.created_at ? new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}</p>
                    </td>
                    <td className="px-4 py-2.5 hidden sm:table-cell">
                      <span className="text-xs text-[var(--dash-text)]/50">{c.gift_name}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="text-sm font-medium text-[var(--dash-text)]">{c.amount ? `${getCurrencySymbol(c.currency || site.giftCurrency || "GBP")}${c.amount}` : "\u2014"}</span>
                    </td>
                    <td className="px-4 py-2.5 hidden sm:table-cell">
                      <span className="text-xs text-[var(--dash-text)]/45 truncate block max-w-[200px]">{c.message || "\u2014"}</span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button
                        onClick={() => toggleStatus(c.id, c.status)}
                        className={`inline-flex px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-full cursor-pointer transition-colors ${
                          c.status === "confirmed" ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" : "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                        }`}
                      >
                        {c.status === "confirmed" ? "Confirmed" : "Pending"}
                      </button>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button onClick={() => setDeleteConfirm(c.id)} className="p-1 text-[var(--dash-text)]/20 hover:text-red-500 transition-colors" title="Delete">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {giftData.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--dash-text)]/8">
          <button
            onClick={() => loadGifts(giftData.page - 1)}
            disabled={giftData.page <= 1 || loading}
            className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--dash-text)]/50 hover:text-[var(--dash-text)] border border-[var(--dash-text)]/10 hover:border-[var(--dash-text)]/25 rounded-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--dash-text)]/40">
            Page {giftData.page} of {giftData.totalPages}
          </span>
          <button
            onClick={() => loadGifts(giftData.page + 1)}
            disabled={giftData.page >= giftData.totalPages || loading}
            className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--dash-text)]/50 hover:text-[var(--dash-text)] border border-[var(--dash-text)]/10 hover:border-[var(--dash-text)]/25 rounded-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Delete modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-[var(--dash-bg)] border border-[var(--dash-text)]/15 rounded-sm p-6 max-w-sm mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-medium mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Delete Gift</h3>
            <p className="text-sm text-[var(--dash-text)]/60 mb-6">Are you sure? This cannot be undone.</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--dash-text)]/50 hover:text-[var(--dash-text)] transition-colors">Cancel</button>
              <button onClick={() => deleteGift(deleteConfirm)} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-red-600 text-red-50 rounded-sm hover:bg-red-500 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Guest List Panel ───

type GuestRow = {
  name: string;
  attending: boolean;
  mealChoice: string;
  isHalal: boolean;
  dietaryPreference: string;
  email: string;
  phone: string;
  message: string;
  date: string;
  rsvpId: string;
};

// ─── Messages Panel ───

function MessagesPanel({ msgData, loadMessages, site }: {
  msgData: {
    groups: { id: string; name: string; type: string; filter: any; members: any }[];
    broadcasts: { id: string; groupId: string | null; subject: string; body: string; channel: string; status: string; recipientCount: number | null; sentAt: string | null; createdAt: string | null }[];
    loaded: boolean; loading: boolean; error: string | null;
  };
  loadMessages: () => void;
  site: WeddingSite;
}) {
  const [activeView, setActiveView] = useState<"compose" | "history" | "groups">("compose");
  const [channel, setChannel] = useState<"email" | "sms">("email");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [memberInput, setMemberInput] = useState("");
  const [savingMembers, setSavingMembers] = useState(false);

  if (!msgData.loaded) {
    return (
      <div className="flex flex-col items-center justify-center pt-20">
        {msgData.loading ? (
          <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--dash-text)]/40 animate-pulse">Loading messages...</p>
        ) : msgData.error ? (
          <div className="text-center">
            <p className="text-[11px] text-red-600 mb-4">{msgData.error}</p>
            <button onClick={loadMessages} className="text-[10px] font-bold uppercase tracking-wider px-4 py-2 border border-[var(--dash-text)]/15 hover:border-[var(--dash-text)]/30 rounded-sm">Retry</button>
          </div>
        ) : (
          <button onClick={loadMessages} className="text-[10px] font-bold uppercase tracking-wider px-6 py-3 border border-[var(--dash-text)]/15 hover:border-[var(--dash-text)]/30 rounded-sm transition-all">Load Messages</button>
        )}
      </div>
    );
  }

  const handleSend = async () => {
    if (!selectedGroup || !body.trim()) return;
    if (channel === "email" && !subject.trim()) return;
    setSending(true);
    setSendResult(null);
    try {
      // Create broadcast
      const createRes = await fetch(`/api/sites/${site.slug}/broadcasts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: selectedGroup, subject: subject || undefined, body, channel }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error);

      // Send it
      const sendRes = await fetch(`/api/sites/${site.slug}/broadcasts/${createData.broadcast.id}/send`, {
        method: "POST",
      });
      const sendData = await sendRes.json();
      if (!sendRes.ok) throw new Error(sendData.error);

      setSendResult({ ok: true, message: `Sent to ${sendData.recipientCount} recipient${sendData.recipientCount === 1 ? "" : "s"}` });
      setSubject("");
      setBody("");
      setSelectedGroup("");
      loadMessages();
    } catch (err) {
      setSendResult({ ok: false, message: err instanceof Error ? err.message : "Failed to send" });
    } finally {
      setSending(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    setCreatingGroup(true);
    try {
      const res = await fetch(`/api/sites/${site.slug}/broadcast-groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newGroupName, members: [] }),
      });
      if (!res.ok) throw new Error("Failed to create group");
      setNewGroupName("");
      loadMessages();
    } catch (err) {
      // silent
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      await fetch(`/api/sites/${site.slug}/broadcast-groups`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: groupId }),
      });
      if (editingGroupId === groupId) setEditingGroupId(null);
      loadMessages();
    } catch {
      // silent
    }
  };

  const handleAddMembers = async (groupId: string) => {
    const raw = memberInput.trim();
    if (!raw) return;
    // Split by comma, semicolon, newline, or space — then validate emails
    const newEmails = raw
      .split(/[,;\s\n]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    if (newEmails.length === 0) return;

    const group = msgData.groups.find((g) => g.id === groupId);
    const existing = (group?.members as string[]) || [];
    const merged = Array.from(new Set([...existing, ...newEmails]));

    setSavingMembers(true);
    try {
      const res = await fetch(`/api/sites/${site.slug}/broadcast-groups`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: groupId, members: merged }),
      });
      if (!res.ok) throw new Error("Failed to update group");
      setMemberInput("");
      loadMessages();
    } catch {
      // silent
    } finally {
      setSavingMembers(false);
    }
  };

  const handleRemoveMember = async (groupId: string, email: string) => {
    const group = msgData.groups.find((g) => g.id === groupId);
    const existing = (group?.members as string[]) || [];
    const updated = existing.filter((e) => e !== email);

    try {
      await fetch(`/api/sites/${site.slug}/broadcast-groups`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: groupId, members: updated }),
      });
      loadMessages();
    } catch {
      // silent
    }
  };

  const smartGroups = msgData.groups.filter((g) => g.type === "smart");
  const customGroups = msgData.groups.filter((g) => g.type === "custom");
  const sentBroadcasts = msgData.broadcasts
    .filter((b) => b.status === "sent")
    .sort((a, b) => new Date(b.sentAt || b.createdAt || 0).getTime() - new Date(a.sentAt || a.createdAt || 0).getTime());

  const isPremium = !!site.isPaid;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--dash-text)]/60 mb-6">Messages</h2>

      {!isPremium && (
        <div className="mb-6 p-4 border border-amber-500/20 bg-amber-500/10 rounded-sm">
          <p className="text-sm font-medium text-amber-600">Premium Feature</p>
          <p className="text-[11px] text-amber-600 mt-1">Email and SMS broadcasts require a premium account. Upgrade to send messages to your guests.</p>
        </div>
      )}

      {/* View Tabs */}
      <div className="flex gap-1 mb-8 border-b border-[var(--dash-text)]/10 pb-px">
        {(["compose", "history", "groups"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setActiveView(v)}
            className={`text-[10px] font-bold uppercase tracking-wider px-4 py-2.5 transition-all border-b-2 -mb-px ${activeView === v ? "border-[var(--dash-text)] text-[var(--dash-text)]" : "border-transparent text-[var(--dash-text)]/40 hover:text-[var(--dash-text)]/60"}`}
          >
            {v === "compose" ? "Compose" : v === "history" ? "History" : "Groups"}
          </button>
        ))}
      </div>

      {/* Compose View */}
      {activeView === "compose" && (
        <div>
          {/* Template Button */}
          {channel === "email" && !subject && !body && (
            <button
              onClick={() => {
                const names = `${site.partner1Name} & ${site.partner2Name}`;
                const url = site.customDomain ? `https://${site.customDomain}` : `https://${site.slug}.ithinkshewifey.com`;
                setSubject(`You're Invited — ${names}`);
                setBody(`We are delighted to invite you to celebrate our wedding!\n\n${site.dateDisplayText ? `Date: ${site.dateDisplayText}\n` : ""}${site.locationText ? `Venue: ${site.locationText}\n` : ""}\nPlease visit our wedding website for all the details and to RSVP:\n${url}\n\nWe can't wait to celebrate with you!\n\nWith love,\n${names}`);
              }}
              className="w-full mb-5 py-3 border border-dashed border-[var(--dash-text)]/20 text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--dash-text)]/50 hover:text-[var(--dash-text)]/80 hover:border-[var(--dash-text)]/40 rounded-sm transition-all"
            >
              Use Invite Template
            </button>
          )}

          {/* Channel Toggle */}
          <div className="mb-5">
            <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-[var(--dash-text)]/60 mb-3">Channel</label>
            <div className="flex gap-0 border border-[var(--dash-text)]/15 rounded-sm overflow-hidden w-fit">
              {(["email", "sms"] as const).map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setChannel(ch)}
                  className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${channel === ch ? "bg-[var(--dash-btn-bg)] text-[var(--dash-btn-text)]" : "bg-[var(--dash-surface)] text-[var(--dash-text)]/50 hover:text-[var(--dash-text)]/80"}`}
                >
                  {ch === "email" ? "Email" : "SMS"}
                </button>
              ))}
            </div>
            {channel === "sms" && (
              <p className="text-[10px] text-[var(--dash-text)]/40 mt-2">Only guests who provided a phone number will receive this message.</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-[var(--dash-text)]/60 mb-3">Send To</label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--dash-text)]/15 bg-[var(--dash-surface)] text-[var(--dash-text)] text-sm outline-none focus:border-[var(--dash-text)]/40 rounded-sm"
            >
              <option value="">Select a group...</option>
              {smartGroups.length > 0 && (
                <optgroup label="Smart Groups">
                  {smartGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </optgroup>
              )}
              {customGroups.length > 0 && (
                <optgroup label="Custom Groups">
                  {customGroups.map((g) => <option key={g.id} value={g.id}>{g.name} ({((g.members as string[]) || []).length})</option>)}
                </optgroup>
              )}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-[var(--dash-text)]/60 mb-3">
              {channel === "sms" ? "Header (optional)" : "Subject"}
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={channel === "sms" ? "e.g. Wedding Update" : "e.g. Important Update"}
              className="w-full px-3 py-2 border border-[var(--dash-text)]/15 bg-[var(--dash-surface)] text-[var(--dash-text)] text-sm outline-none focus:border-[var(--dash-text)]/40 rounded-sm"
            />
          </div>

          <div className="mb-6">
            <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-[var(--dash-text)]/60 mb-3">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message here..."
              rows={8}
              maxLength={channel === "sms" ? 1600 : undefined}
              className="w-full px-3 py-2 border border-[var(--dash-text)]/15 bg-[var(--dash-surface)] text-[var(--dash-text)] text-sm outline-none focus:border-[var(--dash-text)]/40 resize-y rounded-sm"
            />
            {channel === "sms" && (
              <p className="text-[10px] text-[var(--dash-text)]/30 mt-1 text-right">{body.length}/1600 {body.length > 160 && `(${Math.ceil(body.length / 153)} SMS parts)`}</p>
            )}
          </div>

          {sendResult && (
            <div className={`mb-4 p-3 rounded-sm text-sm ${sendResult.ok ? "bg-green-500/10 text-green-600 border border-green-500/20" : "bg-red-500/10 text-red-600 border border-red-500/20"}`}>
              {sendResult.message}
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={sending || !selectedGroup || !body.trim() || (channel === "email" && !subject.trim()) || !isPremium}
            className="w-full py-3 text-[11px] font-bold uppercase tracking-[0.2em] bg-[var(--dash-btn-bg)] text-[var(--dash-btn-text)] rounded-sm hover:bg-[var(--dash-text)]/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {sending ? "Sending..." : channel === "sms" ? "Send SMS" : "Send Email"}
          </button>
        </div>
      )}

      {/* History View */}
      {activeView === "history" && (
        <div>
          {sentBroadcasts.length === 0 ? (
            <p className="text-center text-[var(--dash-text)]/40 text-sm pt-8">No messages sent yet</p>
          ) : (
            <div className="space-y-3">
              {sentBroadcasts.map((b) => {
                const group = msgData.groups.find((g) => g.id === b.groupId);
                return (
                  <div key={b.id} className="p-4 border border-[var(--dash-text)]/10 rounded-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--dash-text)] truncate">{b.subject}</p>
                        <p className="text-[11px] text-[var(--dash-text)]/50 mt-1">
                          To: {group?.name || "Unknown group"} &middot; {b.recipientCount || "?"} recipient{b.recipientCount === 1 ? "" : "s"}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm mr-1 ${b.channel === "sms" ? "bg-emerald-500/10 text-emerald-600" : "bg-blue-500/10 text-blue-600"}`}>
                          {b.channel === "sms" ? "SMS" : "Email"}
                        </span>
                        <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm ${b.status === "sent" ? "bg-green-500/10 text-green-600" : b.status === "failed" ? "bg-red-500/10 text-red-600" : "bg-yellow-500/10 text-yellow-600"}`}>
                          {b.status}
                        </span>
                        {b.sentAt && (
                          <p className="text-[10px] text-[var(--dash-text)]/40 mt-1">
                            {new Date(b.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Groups View */}
      {activeView === "groups" && (
        <div>
          {smartGroups.length > 0 && (
            <div className="mb-8">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--dash-text)]/40 mb-3">Smart Groups (auto-updated)</h3>
              <div className="space-y-2">
                {smartGroups.map((g) => (
                  <div key={g.id} className="flex items-center justify-between p-3 border border-[var(--dash-text)]/10 rounded-sm">
                    <span className="text-sm text-[var(--dash-text)]">{g.name}</span>
                    <span className="text-[10px] text-[var(--dash-text)]/40 uppercase tracking-wider">Auto</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--dash-text)]/40 mb-3">Custom Groups</h3>
            {customGroups.length > 0 ? (
              <div className="space-y-3 mb-4">
                {customGroups.map((g) => {
                  const members = (g.members as string[]) || [];
                  const isEditing = editingGroupId === g.id;
                  return (
                    <div key={g.id} className="border border-[var(--dash-text)]/10 rounded-sm">
                      <div className="flex items-center justify-between p-3">
                        <button
                          onClick={() => { setEditingGroupId(isEditing ? null : g.id); setMemberInput(""); }}
                          className="flex items-center gap-2 text-left"
                        >
                          <svg width="10" height="10" viewBox="0 0 10 10" className={`text-[var(--dash-text)]/40 transition-transform ${isEditing ? "rotate-90" : ""}`}><path d="M3 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
                          <span className="text-sm text-[var(--dash-text)]">{g.name}</span>
                          <span className="text-[10px] text-[var(--dash-text)]/40">({members.length} member{members.length !== 1 ? "s" : ""})</span>
                        </button>
                        <button onClick={() => handleDeleteGroup(g.id)} className="text-[10px] text-red-500 hover:text-red-500 uppercase tracking-wider font-bold">Remove</button>
                      </div>

                      {isEditing && (
                        <div className="px-3 pb-3 border-t border-[var(--dash-text)]/5 pt-3">
                          {/* Existing members */}
                          {members.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {members.map((email) => (
                                <span key={email} className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--dash-text)]/5 rounded text-[11px] text-[var(--dash-text)]/70">
                                  {email}
                                  <button onClick={() => handleRemoveMember(g.id, email)} className="text-[var(--dash-text)]/30 hover:text-red-500 ml-0.5">&times;</button>
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Add emails */}
                          <div>
                            <textarea
                              value={memberInput}
                              onChange={(e) => setMemberInput(e.target.value)}
                              placeholder="Paste emails here — separated by commas, spaces, or new lines"
                              rows={3}
                              className="w-full px-3 py-2 border border-[var(--dash-text)]/15 bg-[var(--dash-surface)] text-[var(--dash-text)] text-sm outline-none focus:border-[var(--dash-text)]/40 rounded-sm resize-y"
                            />
                            <button
                              onClick={() => handleAddMembers(g.id)}
                              disabled={savingMembers || !memberInput.trim()}
                              className="mt-2 px-4 py-2 text-[10px] font-bold uppercase tracking-wider bg-[var(--dash-btn-bg)] text-[var(--dash-btn-text)] rounded-sm hover:bg-[var(--dash-text)]/90 disabled:opacity-30"
                            >
                              {savingMembers ? "Adding..." : "Add Emails"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-[var(--dash-text)]/40 mb-4">No custom groups yet</p>
            )}

            <div className="flex gap-2">
              <input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="New group name"
                className="flex-1 px-3 py-2 border border-[var(--dash-text)]/15 bg-[var(--dash-surface)] text-[var(--dash-text)] text-sm outline-none focus:border-[var(--dash-text)]/40 rounded-sm"
                onKeyDown={(e) => e.key === "Enter" && handleCreateGroup()}
              />
              <button
                onClick={handleCreateGroup}
                disabled={creatingGroup || !newGroupName.trim()}
                className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider bg-[var(--dash-btn-bg)] text-[var(--dash-btn-text)] rounded-sm hover:bg-[var(--dash-text)]/90 disabled:opacity-30"
              >
                {creatingGroup ? "..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type GuestFilter = "all" | "attending" | "declined";
type GuestView = "table" | "cards";

function GuestListPanel({ rsvpData, loadRSVPs, site, set }: {
  rsvpData: {
    rsvps: {
      id: string;
      email: string | null;
      phone: string | null;
      message: string | null;
      guests: { name: string; attending: boolean; mealChoice?: string; isHalal?: boolean; dietaryPreference?: string }[];
      created_at: string | null;
    }[];
    total: number;
    page: number;
    totalPages: number;
    loaded: boolean;
    loading: boolean;
    error: string | null;
  };
  loadRSVPs: (page?: number) => void;
  site: WeddingSite;
  set: <K extends keyof WeddingSite>(key: K, value: WeddingSite[K]) => void;
}) {
  const [filter, setFilter] = useState<GuestFilter>("all");
  const [view, setView] = useState<GuestView>("table");
  const [search, setSearch] = useState("");
  const [expandedRsvp, setExpandedRsvp] = useState<string | null>(null);
  const [editingRsvp, setEditingRsvp] = useState<string | null>(null);
  const [editData, setEditData] = useState<{
    email: string;
    phone: string;
    message: string;
    guests: { name: string; attending: boolean; mealChoice?: string; isHalal?: boolean; dietaryPreference?: string }[];
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const startEdit = (rsvp: typeof rsvps[0]) => {
    setEditingRsvp(rsvp.id);
    setExpandedRsvp(rsvp.id);
    setView("cards");
    setEditData({
      email: rsvp.email || "",
      phone: rsvp.phone || "",
      message: rsvp.message || "",
      guests: rsvp.guests.map(g => ({ ...g })),
    });
  };

  const cancelEdit = () => {
    setEditingRsvp(null);
    setEditData(null);
  };

  const saveEdit = async () => {
    if (!editingRsvp || !editData) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/sites/${site.slug}/rsvps`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingRsvp, ...editData }),
      });
      if (!res.ok) throw new Error("Failed to save");
      cancelEdit();
      loadRSVPs();
    } catch {
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const deleteRsvp = async (id: string) => {
    try {
      const res = await fetch(`/api/sites/${site.slug}/rsvps`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      setDeleteConfirm(null);
      loadRSVPs();
    } catch {
      alert("Failed to delete RSVP");
    }
  };

  const updateEditGuest = (index: number, updates: Partial<{ name: string; attending: boolean; mealChoice: string; isHalal: boolean; dietaryPreference: string }>) => {
    if (!editData) return;
    const guests = [...editData.guests];
    guests[index] = { ...guests[index], ...updates };
    setEditData({ ...editData, guests });
  };

  const removeEditGuest = (index: number) => {
    if (!editData || editData.guests.length <= 1) return;
    const guests = editData.guests.filter((_, i) => i !== index);
    setEditData({ ...editData, guests });
  };

  const addEditGuest = () => {
    if (!editData) return;
    setEditData({ ...editData, guests: [...editData.guests, { name: "", attending: true }] });
  };

  const { rsvps, loading: rsvpLoading, error: rsvpError } = rsvpData;

  // Flatten all guests into rows for table view
  const allGuests: GuestRow[] = rsvps.flatMap(r =>
    r.guests.map(g => ({
      name: g.name,
      attending: g.attending,
      mealChoice: g.mealChoice || "",
      isHalal: g.isHalal || false,
      dietaryPreference: g.dietaryPreference || "",
      email: r.email || "",
      phone: r.phone || "",
      message: r.message || "",
      date: r.created_at || "",
      rsvpId: r.id,
    }))
  );

  // Compute stats
  const attending = allGuests.filter(g => g.attending).length;
  const declined = allGuests.filter(g => !g.attending).length;
  const mealCounts: Record<string, number> = {};
  const dietaryCounts: Record<string, number> = {};
  allGuests.forEach(g => {
    if (g.attending && g.mealChoice) {
      mealCounts[g.mealChoice] = (mealCounts[g.mealChoice] || 0) + 1;
    }
    const dietary = g.dietaryPreference || (g.isHalal ? "Halal" : "");
    if (g.attending && dietary) {
      dietaryCounts[dietary] = (dietaryCounts[dietary] || 0) + 1;
    }
  });

  // Filter + search
  const filtered = allGuests.filter(g => {
    if (filter === "attending" && !g.attending) return false;
    if (filter === "declined" && g.attending) return false;
    if (search) {
      const q = search.toLowerCase();
      return g.name.toLowerCase().includes(q) || g.email.toLowerCase().includes(q);
    }
    return true;
  });

  const [copied, setCopied] = useState(false);

  // Copy guest data as tab-separated text (pastes directly into Google Sheets)
  const copyToClipboard = async () => {
    const headers = ["Name", "Email", "WhatsApp", "Attending", "Meal", "Dietary", "Message", "Date"];
    const rows = allGuests.map(g => [
      g.name,
      g.email,
      g.phone,
      g.attending ? "Yes" : "No",
      g.mealChoice,
      g.dietaryPreference || (g.isHalal ? "Halal" : ""),
      g.message,
      g.date ? new Date(g.date).toLocaleDateString() : "",
    ]);
    const tsv = [headers, ...rows].map(r => r.join("\t")).join("\n");
    await navigator.clipboard.writeText(tsv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h2 className="text-lg" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Guest List{rsvpData.total > 0 ? ` (${rsvpData.total})` : ""}</h2>
          <p className="text-xs text-[var(--dash-text)]/40 mt-1">Track RSVPs and manage your guest list</p>
        </div>
        <div className="flex items-center gap-2">
          {allGuests.length > 0 && (
            <button
              onClick={copyToClipboard}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm border transition-all ${
                copied
                  ? "text-green-600 bg-green-500/10 border-green-500/20"
                  : "text-[var(--dash-text)]/60 hover:text-[var(--dash-text)] border-[var(--dash-text)]/10 hover:border-[var(--dash-text)]/25"
              }`}
            >
              {copied ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              )}
              {copied ? "Copied!" : "Copy All"}
            </button>
          )}
          <button
            onClick={() => loadRSVPs(rsvpData.page)}
            disabled={rsvpLoading}
            className="p-2 text-[var(--dash-text)]/40 hover:text-[var(--dash-text)] hover:bg-[var(--dash-text)]/5 rounded-sm transition-all"
            title="Refresh"
          >
            <svg className={`w-4 h-4 ${rsvpLoading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>


      {rsvpError && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-sm">
          <p className="text-sm text-red-600">{rsvpError}</p>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 mt-6">
        {[
          { label: "Responses", value: rsvps.length, color: "text-[var(--dash-text)]" },
          { label: "Total Guests", value: allGuests.length, color: "text-[var(--dash-text)]" },
          { label: "Attending", value: attending, color: "text-green-600" },
          { label: "Declined", value: declined, color: "text-[var(--dash-text)]/40" },
        ].map((stat) => (
          <div key={stat.label} className="p-3 bg-[var(--dash-surface)] border border-[var(--dash-text)]/8 rounded-sm text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
            <p className={`text-xl font-serif italic ${stat.color}`}>{stat.value}</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-[var(--dash-text)]/35 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Meal breakdown bar */}
      {attending > 0 && Object.keys(mealCounts).length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--dash-text)]/50">Meals</span>
            {Object.keys(dietaryCounts).length > 0 && (
              <span className="text-[10px] font-medium text-green-600">
                {Object.entries(dietaryCounts).map(([d, c]) => `${c} ${d}`).join(", ")}
              </span>
            )}
          </div>
          <div className="flex h-2 rounded-full overflow-hidden bg-[var(--dash-text)]/5">
            {Object.entries(mealCounts).map(([meal, count], i) => {
              const colors = ["bg-[var(--dash-btn-bg)]", "bg-[var(--dash-text)]/60", "bg-[var(--dash-text)]/35", "bg-[var(--dash-text)]/20", "bg-[var(--dash-text)]/10"];
              return (
                <div
                  key={meal}
                  className={`${colors[i % colors.length]} transition-all`}
                  style={{ width: `${(count / attending) * 100}%` }}
                  title={`${meal}: ${count}`}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            {Object.entries(mealCounts).sort((a, b) => b[1] - a[1]).map(([meal, count], i) => {
              const dots = ["bg-[var(--dash-btn-bg)]", "bg-[var(--dash-text)]/60", "bg-[var(--dash-text)]/35", "bg-[var(--dash-text)]/20", "bg-[var(--dash-text)]/10"];
              return (
                <span key={meal} className="flex items-center gap-1.5 text-[10px] text-[var(--dash-text)]/60">
                  <span className={`w-2 h-2 rounded-full ${dots[i % dots.length]}`} />
                  {meal} <span className="text-[var(--dash-text)]/30">{count}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading state */}
      {rsvpLoading && !rsvpData.loaded && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <svg className="w-6 h-6 animate-spin text-[var(--dash-text)]/25" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--dash-text)]/30">Loading responses</span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!rsvpLoading && rsvps.length === 0 && !rsvpError && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--dash-text)]/[0.04] flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--dash-text)]/20">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[var(--dash-text)]/50">No RSVPs yet</p>
          <p className="text-xs text-[var(--dash-text)]/30 mt-1 max-w-[200px]">Once guests respond to your invitation, their details will appear here</p>
        </div>
      )}

      {/* Toolbar: search, filter, view toggle */}
      {rsvps.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-4">
            {/* Search */}
            <div className="relative flex-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-text)]/25">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-[var(--dash-text)]/10 bg-[var(--dash-surface)] rounded-sm outline-none focus:border-[var(--dash-text)]/30 transition-colors placeholder:text-[var(--dash-text)]/20"
              />
            </div>

            {/* Filter pills */}
            <div className="flex bg-[var(--dash-text)]/5 rounded-sm p-0.5 shrink-0">
              {([
                { key: "all" as const, label: "All" },
                { key: "attending" as const, label: "Yes" },
                { key: "declined" as const, label: "No" },
              ]).map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all ${
                    filter === f.key
                      ? "bg-[var(--dash-btn-bg)] text-[var(--dash-btn-text)] shadow-sm"
                      : "text-[var(--dash-text)]/40 hover:text-[var(--dash-text)]/60"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* View toggle */}
            <div className="flex bg-[var(--dash-text)]/5 rounded-sm p-0.5 shrink-0">
              <button
                onClick={() => setView("table")}
                className={`p-1.5 rounded-sm transition-all ${view === "table" ? "bg-[var(--dash-surface)] shadow-sm text-[var(--dash-text)]" : "text-[var(--dash-text)]/30"}`}
                title="Table view"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
              </button>
              <button
                onClick={() => setView("cards")}
                className={`p-1.5 rounded-sm transition-all ${view === "cards" ? "bg-[var(--dash-surface)] shadow-sm text-[var(--dash-text)]" : "text-[var(--dash-text)]/30"}`}
                title="Card view"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              </button>
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--dash-text)]/35">
              {filtered.length} guest{filtered.length !== 1 ? "s" : ""}{filter !== "all" ? ` (${filter})` : ""}{search ? ` matching "${search}"` : ""}
            </span>
          </div>

          {/* Table view */}
          {view === "table" && (
            <div className="bg-[var(--dash-surface)] border border-[var(--dash-text)]/10 rounded-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[var(--dash-text)]/8 bg-[var(--dash-text)]/[0.02]">
                      <th className="px-4 py-2.5 text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--dash-text)]/40">Guest</th>
                      <th className="px-4 py-2.5 text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--dash-text)]/40 hidden sm:table-cell">Email</th>
                      <th className="px-4 py-2.5 text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--dash-text)]/40 hidden sm:table-cell">Phone</th>
                      <th className="px-4 py-2.5 text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--dash-text)]/40 text-center">RSVP</th>
                      <th className="px-4 py-2.5 text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--dash-text)]/40 hidden sm:table-cell">Meal</th>
                      <th className="px-4 py-2.5 text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--dash-text)]/40 text-right">Date</th>
                      <th className="px-4 py-2.5 text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--dash-text)]/40 w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((guest, i) => {
                      // Find original rsvp for this guest row
                      const rsvp = rsvps.find(r => r.id === guest.rsvpId);
                      return (
                        <tr key={`${guest.rsvpId}-${i}`} className="border-b border-[var(--dash-text)]/5 last:border-0 hover:bg-[var(--dash-text)]/[0.015] transition-colors">
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${guest.attending ? "bg-green-500" : "bg-[var(--dash-text)]/15"}`} />
                              <span className="text-sm text-[var(--dash-text)] font-medium">{guest.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 hidden sm:table-cell">
                            <span className="text-xs text-[var(--dash-text)]/45 truncate block max-w-[180px]">{guest.email || "\u2014"}</span>
                          </td>
                          <td className="px-4 py-2.5 hidden sm:table-cell">
                            <span className="text-xs text-[var(--dash-text)]/45 truncate block max-w-[140px]">{guest.phone || "\u2014"}</span>
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={`inline-flex px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-full ${
                              guest.attending
                                ? "bg-green-500/10 text-green-600"
                                : "bg-[var(--dash-text)]/5 text-[var(--dash-text)]/35"
                            }`}>
                              {guest.attending ? "Attending" : "Declined"}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 hidden sm:table-cell">
                            {guest.attending && guest.mealChoice ? (
                              <span className="text-xs text-[var(--dash-text)]/50">
                                {guest.mealChoice}{(guest.dietaryPreference || guest.isHalal) ? <span className="text-green-600 ml-1 text-[9px] font-bold">({guest.dietaryPreference || "Halal"})</span> : ""}
                              </span>
                            ) : (
                              <span className="text-xs text-[var(--dash-text)]/15">{"\u2014"}</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <span className="text-[10px] text-[var(--dash-text)]/30">
                              {guest.date ? new Date(guest.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {rsvp && (
                                <>
                                  <button onClick={() => startEdit(rsvp)} className="p-1 text-[var(--dash-text)]/20 hover:text-[var(--dash-text)]/60 transition-colors" title="Edit">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                  </button>
                                  <button onClick={() => setDeleteConfirm(rsvp.id)} className="p-1 text-[var(--dash-text)]/20 hover:text-red-500 transition-colors" title="Delete">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filtered.length === 0 && (
                <div className="py-8 text-center text-sm text-[var(--dash-text)]/30">No guests match your search</div>
              )}
            </div>
          )}

          {/* Card view — grouped by RSVP submission */}
          {view === "cards" && (
            <div className="space-y-3">
              {rsvps.filter(r => {
                if (!search && filter === "all") return true;
                return r.guests.some(g => {
                  const matchFilter = filter === "all" || (filter === "attending" ? g.attending : !g.attending);
                  const matchSearch = !search || g.name.toLowerCase().includes(search.toLowerCase()) || (r.email || "").toLowerCase().includes(search.toLowerCase());
                  return matchFilter && matchSearch;
                });
              }).map((rsvp) => {
                const isExpanded = expandedRsvp === rsvp.id;
                const isEditing = editingRsvp === rsvp.id;
                const guestCount = rsvp.guests.length;
                const attendingCount = rsvp.guests.filter(g => g.attending).length;

                return (
                  <div key={rsvp.id} className={`bg-[var(--dash-surface)] border rounded-sm overflow-hidden ${isEditing ? "border-[var(--dash-text)]/30 ring-1 ring-[var(--dash-text)]/10" : "border-[var(--dash-text)]/10"}`}>
                    <div className="flex items-center">
                      <button
                        onClick={() => { setExpandedRsvp(isExpanded ? null : rsvp.id); if (isEditing && isExpanded) cancelEdit(); }}
                        className="flex-1 px-4 py-3 flex items-center justify-between hover:bg-[var(--dash-text)]/[0.02] transition-colors text-left"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-[var(--dash-text)]/[0.06] flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-[var(--dash-text)]/50">{guestCount}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-[var(--dash-text)] font-medium truncate">{rsvp.email || "No email"}</p>
                            <p className="text-[10px] text-[var(--dash-text)]/35 mt-0.5">
                              {attendingCount === guestCount ? (
                                <span className="text-green-600">All attending</span>
                              ) : attendingCount === 0 ? (
                                <span>All declined</span>
                              ) : (
                                <span>{attendingCount} attending, {guestCount - attendingCount} declined</span>
                              )}
                              {rsvp.created_at && (
                                <span className="ml-2">{new Date(rsvp.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-[var(--dash-text)]/20 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                      <div className="flex items-center gap-0.5 pr-3">
                        <button onClick={() => isEditing ? cancelEdit() : startEdit(rsvp)} className={`p-1.5 rounded-sm transition-colors ${isEditing ? "text-[var(--dash-text)] bg-[var(--dash-text)]/10" : "text-[var(--dash-text)]/20 hover:text-[var(--dash-text)]/60"}`} title={isEditing ? "Cancel" : "Edit"}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button onClick={() => setDeleteConfirm(rsvp.id)} className="p-1.5 text-[var(--dash-text)]/20 hover:text-red-500 rounded-sm transition-colors" title="Delete">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </div>

                    {isExpanded && !isEditing && (
                      <div className="border-t border-[var(--dash-text)]/8">
                        {rsvp.guests.map((guest, gi) => (
                          <div key={gi} className={`px-4 py-3 flex items-center justify-between ${gi > 0 ? "border-t border-[var(--dash-text)]/5" : ""}`}>
                            <div className="flex items-center gap-2.5">
                              <span className={`w-2 h-2 rounded-full ${guest.attending ? "bg-green-500" : "bg-[var(--dash-text)]/15"}`} />
                              <div>
                                <p className="text-sm text-[var(--dash-text)] font-medium">{guest.name}</p>
                                {guest.attending && guest.mealChoice && (
                                  <p className="text-[10px] text-[var(--dash-text)]/40 mt-0.5">
                                    {guest.mealChoice}{(guest.dietaryPreference || guest.isHalal) ? ` \u00b7 ${guest.dietaryPreference || "Halal"}` : ""}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span className={`text-[9px] font-bold uppercase tracking-widest ${guest.attending ? "text-green-600" : "text-[var(--dash-text)]/25"}`}>
                              {guest.attending ? "Yes" : "No"}
                            </span>
                          </div>
                        ))}
                        {rsvp.message && (
                          <div className="px-4 py-3 border-t border-[var(--dash-text)]/5 bg-[var(--dash-text)]/[0.015]">
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--dash-text)]/30 mb-1">Message</p>
                            <p className="text-xs text-[var(--dash-text)]/60 italic leading-relaxed">&ldquo;{rsvp.message}&rdquo;</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Edit form */}
                    {isExpanded && isEditing && editData && (
                      <div className="border-t border-[var(--dash-text)]/8 bg-[var(--dash-text)]/[0.02] p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                          <div>
                            <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--dash-text)]/40 block mb-1">Email</label>
                            <input
                              type="email"
                              value={editData.email}
                              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                              className="w-full px-3 py-2 text-sm border border-[var(--dash-text)]/10 bg-[var(--dash-surface)] rounded-sm outline-none focus:border-[var(--dash-text)]/30"
                              placeholder="guest@email.com"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--dash-text)]/40 block mb-1">WhatsApp</label>
                            <div className="flex">
                              <CountryCodePicker
                                compact
                                value={matchCountry(editData.phone)?.code || "+44"}
                                onChange={(code) => {
                                  const current = matchCountry(editData.phone);
                                  const local = current ? editData.phone.slice(current.code.length) : editData.phone.replace(/^\+?\d{1,4}/, "");
                                  setEditData({ ...editData, phone: code + local });
                                }}
                              />
                              <input
                                type="tel"
                                value={(() => {
                                  if (!editData.phone) return "";
                                  const match = matchCountry(editData.phone);
                                  return match ? editData.phone.slice(match.code.length) : editData.phone;
                                })()}
                                onChange={(e) => {
                                  const local = e.target.value.replace(/[^0-9]/g, "");
                                  const code = matchCountry(editData.phone)?.code || "+44";
                                  setEditData({ ...editData, phone: code + local });
                                }}
                                className="flex-1 min-w-0 px-3 py-2 text-sm border border-[var(--dash-text)]/10 bg-[var(--dash-surface)] rounded-r-sm outline-none focus:border-[var(--dash-text)]/30"
                                placeholder="7123456789"
                              />
                            </div>
                          </div>
                        </div>

                        <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--dash-text)]/40 block mb-2">Guests</label>
                        <div className="space-y-2 mb-4">
                          {editData.guests.map((g, gi) => (
                            <div key={gi} className="flex items-center gap-2 bg-[var(--dash-surface)] border border-[var(--dash-text)]/10 rounded-sm p-2">
                              <input
                                type="text"
                                value={g.name}
                                onChange={(e) => updateEditGuest(gi, { name: e.target.value })}
                                className="flex-1 min-w-0 px-2 py-1 text-sm border border-[var(--dash-text)]/10 rounded-sm outline-none focus:border-[var(--dash-text)]/30"
                                placeholder="Guest name"
                              />
                              <button
                                type="button"
                                onClick={() => updateEditGuest(gi, { attending: !g.attending })}
                                className={`shrink-0 px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded-sm border transition-colors ${
                                  g.attending
                                    ? "bg-green-500/10 text-green-600 border-green-500/20"
                                    : "bg-[var(--dash-text)]/5 text-[var(--dash-text)]/35 border-[var(--dash-text)]/10"
                                }`}
                              >
                                {g.attending ? "Yes" : "No"}
                              </button>
                              <input
                                type="text"
                                value={g.mealChoice || ""}
                                onChange={(e) => updateEditGuest(gi, { mealChoice: e.target.value })}
                                className="w-24 shrink-0 px-2 py-1 text-xs border border-[var(--dash-text)]/10 rounded-sm outline-none focus:border-[var(--dash-text)]/30 hidden sm:block"
                                placeholder="Meal"
                              />
                              <select
                                value={g.dietaryPreference || (g.isHalal ? "Halal" : "")}
                                onChange={(e) => updateEditGuest(gi, { dietaryPreference: e.target.value, isHalal: e.target.value === "Halal" })}
                                className="w-24 shrink-0 px-1 py-1 text-[10px] border border-[var(--dash-text)]/10 rounded-sm outline-none focus:border-[var(--dash-text)]/30 hidden sm:block"
                              >
                                <option value="">No dietary</option>
                                {["Halal", "Kosher", "Vegan", "Vegetarian", "Gluten-Free", "Dairy-Free", "Nut-Free"].map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                              {editData.guests.length > 1 && (
                                <button onClick={() => removeEditGuest(gi)} className="p-1 text-[var(--dash-text)]/20 hover:text-red-500 shrink-0" title="Remove guest">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        <button onClick={addEditGuest} className="text-[10px] font-bold uppercase tracking-widest text-[var(--dash-text)]/40 hover:text-[var(--dash-text)]/60 mb-4 block">+ Add guest</button>

                        <div className="mb-4">
                          <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--dash-text)]/40 block mb-1">Message</label>
                          <textarea
                            value={editData.message}
                            onChange={(e) => setEditData({ ...editData, message: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 text-sm border border-[var(--dash-text)]/10 bg-[var(--dash-surface)] rounded-sm outline-none focus:border-[var(--dash-text)]/30 resize-none"
                            placeholder="Optional message"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          <button onClick={cancelEdit} className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--dash-text)]/40 hover:text-[var(--dash-text)] transition-colors">
                            Cancel
                          </button>
                          <button onClick={saveEdit} disabled={saving} className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-[var(--dash-btn-bg)] text-[var(--dash-bg)] rounded-sm hover:opacity-85 transition-colors disabled:opacity-50">
                            {saving ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {rsvpData.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--dash-text)]/8">
              <button
                onClick={() => loadRSVPs(rsvpData.page - 1)}
                disabled={rsvpData.page <= 1 || rsvpLoading}
                className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--dash-text)]/50 hover:text-[var(--dash-text)] border border-[var(--dash-text)]/10 hover:border-[var(--dash-text)]/25 rounded-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--dash-text)]/40">
                Page {rsvpData.page} of {rsvpData.totalPages}
              </span>
              <button
                onClick={() => loadRSVPs(rsvpData.page + 1)}
                disabled={rsvpData.page >= rsvpData.totalPages || rsvpLoading}
                className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--dash-text)]/50 hover:text-[var(--dash-text)] border border-[var(--dash-text)]/10 hover:border-[var(--dash-text)]/25 rounded-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-[var(--dash-bg)] border border-[var(--dash-text)]/15 rounded-sm p-6 max-w-sm mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-medium mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Delete RSVP</h3>
            <p className="text-sm text-[var(--dash-text)]/60 mb-6">Are you sure you want to delete this RSVP? This action cannot be undone.</p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--dash-text)]/50 hover:text-[var(--dash-text)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteRsvp(deleteConfirm)}
                className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-red-600 text-red-50 rounded-sm hover:bg-red-500 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Editor ───

export default function DashboardEditor({ site: initial }: { site: WeddingSite }) {
  const router = useRouter();
  const { pref, setPref } = useTheme();

  const [site, setSite] = useState(initial);
  
  // History stacks
  const [past, setPast] = useState<WeddingSite[]>([]);
  const [future, setFuture] = useState<WeddingSite[]>([]);

  const [tab, setTab] = useState<Tab>("Basics");
  const [view, setView] = useState<View>("website");
  const [easyModeOpen, setEasyModeOpen] = useState(false);
  const [easyModeDismissed, setEasyModeDismissed] = useState(false);

  // RSVP guest list state
  const [rsvpData, setRsvpData] = useState<{
    rsvps: {
      id: string;
      email: string | null;
      phone: string | null;
      message: string | null;
      guests: { name: string; attending: boolean; mealChoice?: string; isHalal?: boolean; dietaryPreference?: string }[];
      created_at: string | null;
    }[];
    total: number;
    page: number;
    totalPages: number;
    loaded: boolean;
    loading: boolean;
    error: string | null;
  }>({ rsvps: [], total: 0, page: 1, totalPages: 1, loaded: false, loading: false, error: null });

  const loadRSVPs = useCallback(async (page = 1) => {
    setRsvpData(prev => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(`/api/sites/${initial.slug}/rsvps?page=${page}&limit=50`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load RSVPs");
      setRsvpData({ rsvps: data.rsvps, total: data.total ?? data.rsvps.length, page: data.page ?? page, totalPages: data.totalPages ?? 1, loaded: true, loading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load RSVPs";
      setRsvpData(prev => ({ ...prev, loading: false, error: message }));
    }
  }, [initial.slug]);

  // Gift contributions state
  const [giftData, setGiftData] = useState<{
    contributions: {
      id: string;
      gift_name: string;
      guest_name: string;
      amount: string | null;
      currency: string | null;
      message: string | null;
      payment_method: string | null;
      status: string | null;
      created_at: string | null;
    }[];
    total: number;
    page: number;
    totalPages: number;
    loaded: boolean;
    loading: boolean;
    error: string | null;
  }>({ contributions: [], total: 0, page: 1, totalPages: 1, loaded: false, loading: false, error: null });

  const loadGifts = useCallback(async (page = 1) => {
    setGiftData(prev => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(`/api/sites/${initial.slug}/gift-contributions?page=${page}&limit=50`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setGiftData({ contributions: data.contributions, total: data.total ?? data.contributions.length, page: data.page ?? page, totalPages: data.totalPages ?? 1, loaded: true, loading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load gift contributions";
      setGiftData(prev => ({ ...prev, loading: false, error: message }));
    }
  }, [initial.slug]);

  // Broadcast / messages state
  const [msgData, setMsgData] = useState<{
    groups: { id: string; name: string; type: string; filter: any; members: any }[];
    broadcasts: { id: string; groupId: string | null; subject: string; body: string; channel: string; status: string; recipientCount: number | null; sentAt: string | null; createdAt: string | null }[];
    loaded: boolean; loading: boolean; error: string | null;
  }>({ groups: [], broadcasts: [], loaded: false, loading: false, error: null });

  const loadMessages = useCallback(async () => {
    setMsgData(prev => ({ ...prev, loading: true, error: null }));
    try {
      const [gRes, bRes] = await Promise.all([
        fetch(`/api/sites/${initial.slug}/broadcast-groups`),
        fetch(`/api/sites/${initial.slug}/broadcasts`),
      ]);
      const gData = await gRes.json();
      const bData = await bRes.json();
      if (!gRes.ok) throw new Error(gData.error || "Failed to load groups");
      if (!bRes.ok) throw new Error(bData.error || "Failed to load broadcasts");
      setMsgData({ groups: gData.groups, broadcasts: bData.broadcasts, loaded: true, loading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load messages";
      setMsgData(prev => ({ ...prev, loading: false, error: message }));
    }
  }, [initial.slug]);

  // Load data when management views are first selected
  useEffect(() => {
    if (view === "guests" && !rsvpData.loaded && !rsvpData.loading) {
      loadRSVPs();
    }
    if (view === "messages" && !msgData.loaded && !msgData.loading) {
      loadMessages();
    }
    if (view === "gifts" && !giftData.loaded && !giftData.loading) {
      loadGifts();
    }
  }, [view, rsvpData.loaded, rsvpData.loading, loadRSVPs, msgData.loaded, msgData.loading, loadMessages, giftData.loaded, giftData.loading, loadGifts]);

  // Persist and restore tab state safely
  useEffect(() => {
    const saved = localStorage.getItem(`itsw_active_tab_${site.slug}`);
    if (saved) {
      // Basic validation: must be a static tab or exist in sectionOrder
      const order = site.sectionOrder ?? DEFAULT_SECTION_ORDER;
      const isValid = (STATIC_TABS as readonly string[]).includes(saved) || order.some(s => s.id === saved);
      if (isValid) {
        setTab(saved as Tab);
      }
    }
  }, [site.slug, site.sectionOrder]);

  useEffect(() => {
    localStorage.setItem(`itsw_active_tab_${site.slug}`, tab);
  }, [tab, site.slug]);
  
  const isInitialMount = useRef(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      isInitialMount.current = false;
    }, 500); // Brief lock to allow initial render to settle
    return () => clearTimeout(timer);
  }, []);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true); // Start as saved
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showRenameConfirm, setShowRenameConfirm] = useState(false);
  const [showSaveErrorModal, setShowSaveErrorModal] = useState<string | null>(null);
  const [showCancelDomainModal, setShowCancelDomainModal] = useState(false);
  const [showLargeImageModal, setShowLargeImageModal] = useState<(() => void) | null>(null);
  const saveRetryCountRef = useRef(0);
  const MAX_SAVE_RETRIES = 2;
  const [isPreview, setIsPreview] = useState(true);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile(e.matches);
    handler(mq);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  const [editorWidth, setEditorWidth] = useState(30); // percentage of content wrapper
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isResizing = useRef(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastManualTabClick = useRef<number>(0);

  // Helper to format date for datetime-local without timezone shift
  const formatForInput = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  function handleTabChange(newTab: string) {
    setTab(newTab);
    setView("website");
    lastManualTabClick.current = Date.now();

    // Static tabs (Basics, Layout) don't correspond to a specific scrollable section
    const isStatic = (STATIC_TABS as readonly string[]).includes(newTab);

    if (!isStatic && isPreview && previewContainerRef.current) {
      const sectionEl = previewContainerRef.current.querySelector(`[id="${newTab}"]`) as HTMLElement;
      sectionEl?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // Undo/Redo logic
  function undo() {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    
    setPast(newPast);
    setFuture([site, ...future]);
    setSite(previous);
    setSaved(false);
  }

  function redo() {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    
    setPast([...past, site]);
    setFuture(newFuture);
    setSite(next);
    setSaved(false);
  }

  // Keyboard Shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        redo();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [past, future, site]);

  // Auto-save logic
  useEffect(() => {
    if (saved || saving) return;

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      handleSave();
    }, 1500);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [site, saved, saving]);

  // Scroll-sync: observe which section is in view in the inline preview
  useEffect(() => {
    if (!isPreview || !previewContainerRef.current) return;
    const container = previewContainerRef.current;
    const sectionIds = (site.sectionOrder ?? []).filter(s => s.visible).map(s => s.id);
    const elements = sectionIds.map(id => container.querySelector(`[id="${id}"]`)).filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      if (isInitialMount.current) return;
      if (Date.now() - lastManualTabClick.current < 1000) return;
      const isStatic = (STATIC_TABS as readonly string[]).includes(tab);
      if (isStatic) return;

      for (const entry of entries) {
        if (entry.isIntersecting && entry.target.id && entry.target.id !== tab) {
          setTab(entry.target.id);
          break;
        }
      }
    }, { root: container, threshold: 0.3 });

    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [site.sectionOrder, isPreview, tab]);
  function startResizing(e: React.MouseEvent | React.TouchEvent) {
    isResizing.current = true;
    setIsDragging(true);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopResizing);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", stopResizing);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

  function stopResizing() {
    isResizing.current = false;
    setIsDragging(false);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", stopResizing);
    document.removeEventListener("touchmove", handleTouchMove);
    document.removeEventListener("touchend", stopResizing);
    document.body.style.cursor = "default";
    document.body.style.userSelect = "auto";
  }

  function clientXToEditorPercent(clientX: number): number {
    const wrapper = contentWrapperRef.current;
    if (!wrapper) return editorWidth;
    const rect = wrapper.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isResizing.current) return;
    const newWidth = clientXToEditorPercent(e.clientX);
    if (newWidth > 20 && newWidth < 65) {
      setEditorWidth(newWidth);
    }
  }

  function handleTouchMove(e: TouchEvent) {
    if (!isResizing.current) return;
    const newWidth = clientXToEditorPercent(e.touches[0].clientX);
    if (newWidth > 20 && newWidth < 65) {
      setEditorWidth(newWidth);
    }
  }

  function set<K extends keyof WeddingSite>(key: K, value: WeddingSite[K]) {
    setPast((p) => [...p.slice(-49), site]); // Keep last 50 states
    setFuture([]); // Clear redo on new change
    setSite((s) => ({ ...s, [key]: value }));
    setSaved(false);
  }

  // Inline editing callback — uses set() so undo/redo and auto-save work
  const handleFieldUpdate = useCallback((field: string, value: string) => {
    set(field as keyof WeddingSite, value as any);
  }, [site]); // eslint-disable-line react-hooks/exhaustive-deps

  function setSectionData(sectionId: string, data: any) {
    setPast((p) => [...p.slice(-49), site]);
    setFuture([]);
    const currentSectionData = site.sectionData || {};
    setSite((s) => ({
      ...s,
      sectionData: {
        ...currentSectionData,
        [sectionId]: {
          ...(currentSectionData[sectionId] || {}),
          ...data
        }
      }
    }));
    setSaved(false);
  }

  function addSection(type: string) {
    const newSection: SectionConfig = {
      id: `${type}-${Date.now()}`,
      type,
      visible: true
    };
    const order = site.sectionOrder || DEFAULT_SECTION_ORDER;
    set("sectionOrder", [...order, newSection]);
  }

  function removeSection(index: number) {
    const order = site.sectionOrder || DEFAULT_SECTION_ORDER;
    const section = order[index];
    if (section.type === "hero" || section.type === "footer") {
      alert("The Hero and Footer sections are mandatory and cannot be removed.");
      return;
    }
    if (order.length <= 1) {
      alert("You must have at least one section in your layout.");
      return;
    }
    set("sectionOrder", removeFromArray(order, index));
  }

  function duplicateSection(index: number) {
    const order = site.sectionOrder || DEFAULT_SECTION_ORDER;
    const original = order[index];
    if (original.type === "hero" || original.type === "footer") {
      alert("The Hero and Footer sections cannot be duplicated.");
      return;
    }
    const newId = `${original.type}-${Date.now()}`;
    const duplicated: SectionConfig = {
      ...original,
      id: newId
    };
    
    // Copy data if instance data exists
    const currentData = site.sectionData || {};
    const instanceData = currentData[original.id];
    
    if (instanceData) {
      set("sectionData", { 
        ...currentData, 
        [newId]: JSON.parse(JSON.stringify(instanceData)) 
      });
    } else {
      // If it's a primary section, we might want to initialize its sectionData 
      // with current top-level values so the duplicate has independent content
      const typeToData: Record<string, any> = {
        "story": { 
          title: site.storyTitle, 
          subtitle: site.storySubtitle, 
          leadQuote: site.storyLeadQuote, 
          body: site.storyBody, 
          imageUrl: site.storyImageUrl 
        },
        "quote": { text: site.quoteText, attribution: site.quoteAttribution },
        "featuredPhoto": { url: site.featuredPhotoUrl, caption: site.featuredPhotoCaption },
        "letter": { opening: site.letterOpening, body: site.letterBody, closing: site.letterClosing }
      };
      
      const initialData = typeToData[original.type];
      if (initialData) {
        set("sectionData", { 
          ...currentData, 
          [newId]: JSON.parse(JSON.stringify(initialData)) 
        });
      }
    }
    
    const newOrder = [...order];
    newOrder.splice(index + 1, 0, duplicated);
    set("sectionOrder", newOrder);
  }

  const addRecentLink = useCallback((url: string) => {
    if (!url) return;
    setSite((s) => {
      if (s.recentlyUsedLinks?.includes(url)) return s;
      const newRecent = [url, ...(s.recentlyUsedLinks || [])].slice(0, 20);
      return { ...s, recentlyUsedLinks: newRecent };
    });
    setSaved(false);
  }, []);

  function updateInArray<T>(arr: T[], index: number, patch: Partial<T>): T[] {
    return arr.map((item, i) => (i === index ? { ...item, ...patch } : item));
  }

  function removeFromArray<T>(arr: T[], index: number): T[] {
    return arr.filter((_, i) => i !== index);
  }

  async function handleSave(isRetry = false, skipRenameCheck = false) {
    // 1. Check for slug rename — show styled modal instead of window.confirm
    if (!skipRenameCheck && site.slug !== initial.slug) {
      setShowRenameConfirm(true);
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      const { passwordHash, ...data } = site;
      const res = await fetch(`/api/sites/${initial.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result?.error || `Save failed (${res.status})`);
      }

      setSaved(true);
      setSaveError(null);
      saveRetryCountRef.current = 0;

      // 2. Redirect if renamed
      if (result.newSlug) {
        router.push(`/dashboard/${result.newSlug}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save";
      console.error(`[Dashboard] Save failed (attempt ${saveRetryCountRef.current + 1}):`, message);

      // Auto-retry for network/server errors (not for validation errors)
      if (!isRetry && saveRetryCountRef.current < MAX_SAVE_RETRIES) {
        saveRetryCountRef.current++;
        console.log(`[Dashboard] Retrying save (${saveRetryCountRef.current}/${MAX_SAVE_RETRIES})...`);
        setTimeout(() => handleSave(true, true), 2000);
        return; // Don't clear saving state yet
      }

      setSaveError(message);
      saveRetryCountRef.current = 0;
      setShowSaveErrorModal(message);
    } finally {
      if (!isRetry || saveRetryCountRef.current === 0) {
        setSaving(false);
      }
    }
  }

  const [isPaying, setIsPaying] = useState(false);

  async function handleCheckout() {
    setIsPaying(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (err: any) {
      alert(err.message);
      setIsPaying(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--dash-bg)] text-[var(--dash-text)]" style={{ fontFamily: "'DM Sans', sans-serif", transition: "background-color 0.2s, color 0.2s" }}>
      {/* ... Existing Head/Scripts ... */}
      
      {/* Upgrade banner for unpaid sites */}
      {!site.isPaid && (
        <div className="sticky top-0 z-[60] bg-[var(--dash-btn-bg)] text-[var(--dash-bg)] px-4 py-2.5 flex items-center justify-between">
          <p className="text-xs">
            <span className="font-bold uppercase tracking-wider">Free plan</span>
            <span className="opacity-60 ml-2">Upgrade to publish your site and go live</span>
          </p>
          <button
            onClick={handleCheckout}
            disabled={isPaying}
            className="px-4 py-1.5 bg-[var(--dash-bg)] text-[var(--dash-btn-bg)] text-[10px] font-bold uppercase tracking-widest rounded-sm hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {isPaying ? "Loading..." : "Upgrade — £50"}
          </button>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--dash-text)]/[0.08] bg-[var(--dash-bg)]/95 backdrop-blur-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex-shrink-0 text-[var(--dash-text)] text-xl font-bold italic" style={{ fontFamily: "'Playfair Display', serif" }} title="Home">
              ITSW
            </a>
            <span className="text-[var(--dash-text)]/30">/</span>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center bg-[var(--dash-btn-bg)] text-[var(--dash-btn-text)] text-[10px] font-bold italic flex-shrink-0"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {(site.partner1Name || "A").charAt(0).toUpperCase()}&{(site.partner2Name || "B").charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3">
            <div className="flex items-center gap-0.5 bg-[var(--dash-text)]/5 p-0.5 sm:p-1 rounded-sm">
              <button
                onClick={undo}
                disabled={past.length === 0}
                className="p-1 sm:p-1.5 rounded-sm hover:bg-[var(--dash-surface)] disabled:opacity-30 transition-all text-[var(--dash-text)]"
                title="Undo (Ctrl+Z)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
              </button>
              <button
                onClick={redo}
                disabled={future.length === 0}
                className="p-1 sm:p-1.5 rounded-sm hover:bg-[var(--dash-surface)] disabled:opacity-30 transition-all text-[var(--dash-text)]"
                title="Redo (Ctrl+Y)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
              </button>
            </div>

            <div className="flex items-center gap-1 px-1 sm:px-3">
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-300 ${saveError ? "bg-red-500 animate-pulse" : saving ? "bg-amber-400 animate-pulse" : saved ? "bg-green-500" : "bg-amber-400"}`} />
              <span className={`hidden sm:inline text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors duration-300 ${saveError ? "text-red-600" : saved && !saving ? "text-green-600" : "text-[var(--dash-text)]/40"}`}>
                {saveError ? "Error" : saving ? "Saving..." : saved ? "Saved" : "Unsaved"}
              </span>
            </div>

            {site.isPaid && site.isPublished && (
              <a href={`/${site.slug}`} target="_blank"
                className="hidden sm:block text-xs tracking-wide uppercase text-[var(--dash-text)]/50 hover:text-[var(--dash-text)] transition-colors">
                View Live
              </a>
            )}

            <div className="flex bg-[var(--dash-text)]/5 rounded-sm p-0.5 sm:p-1">
              <button
                onClick={() => { setView("website"); setIsPreview(false); }}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all ${
                  view === "website" && !isPreview
                  ? "bg-[var(--dash-btn-bg)] text-[var(--dash-btn-text)] shadow-sm"
                  : "text-[var(--dash-text)]/40 hover:text-[var(--dash-text)]/60"
                }`}
              >
                Edit
              </button>
              <button
                onClick={() => { setView("website"); setIsPreview(true); }}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all ${
                  view === "website" && isPreview
                  ? "bg-[var(--dash-btn-bg)] text-[var(--dash-btn-text)] shadow-sm"
                  : "text-[var(--dash-text)]/40 hover:text-[var(--dash-text)]/60"
                }`}
              >
                Live
              </button>
            </div>

            <div className="hidden lg:flex bg-[var(--dash-text)]/5 rounded-sm p-1">
              <button
                onClick={() => setPreviewDevice("desktop")}
                className={`px-2 py-1.5 rounded-sm transition-all ${
                  previewDevice === "desktop" ? "bg-[var(--dash-surface)] shadow-sm text-[var(--dash-text)]" : "text-[var(--dash-text)]/40 hover:text-[var(--dash-text)]/60"
                }`}
                title="Desktop Preview"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
              </button>
              <button
                onClick={() => setPreviewDevice("mobile")}
                className={`px-2 py-1.5 rounded-sm transition-all ${
                  previewDevice === "mobile" ? "bg-[var(--dash-surface)] shadow-sm text-[var(--dash-text)]" : "text-[var(--dash-text)]/40 hover:text-[var(--dash-text)]/60"
                }`}
                title="Mobile Preview"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
              </button>
            </div>

            <ThemeToggle />

            <form action="/api/auth/logout" method="POST">
              <button type="submit"
                className="p-1 sm:p-0 text-[var(--dash-text)]/40 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <span className="hidden sm:inline text-xs tracking-wide uppercase">Logout</span>
                <svg className="sm:hidden" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Layout with Sidebar */}
      <div className={`mx-auto transition-all ${view === "website" && isPreview ? "max-w-[1800px] px-0 lg:px-3 py-0 lg:py-0" : "max-w-6xl px-3 sm:px-6 py-4 lg:py-8"} flex flex-col lg:flex-row gap-0 ${view === "website" && isPreview ? "lg:gap-4" : "lg:gap-8"}`}>
        {/* Sidebar / Mobile Tabs */}
        <nav className={`shrink-0 sticky top-14 lg:top-[3.5rem] z-40 self-start transition-all ${view === "website" && isPreview ? "lg:w-36 lg:h-[calc(100vh-3.5rem)] lg:overflow-y-auto lg:pt-4" : "lg:w-44"} w-full overflow-x-auto lg:overflow-x-visible no-scrollbar mb-6 lg:mb-0 px-4 lg:px-0 block bg-[var(--dash-bg)]/95 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none py-2 lg:py-0 -mx-0 border-b border-[var(--dash-text)]/[0.06] lg:border-b-0`}>
          <div className="flex lg:flex-col gap-1 min-w-max lg:min-w-0">
            {(() => {
              const order = site.sectionOrder ?? DEFAULT_SECTION_ORDER;
              const dynamicTabs: { label: string, id: string, type: string, divider?: boolean }[] = [
                { label: "Basics", id: "Basics", type: "static" },
                { label: "Layout", id: "Layout", type: "static" },
              ];

              const typeCounts: Record<string, number> = {};
              order.forEach((s, i) => {
                const baseLabel = SECTION_LABELS[s.type] || SECTION_LABELS[s.id] || s.type;
                typeCounts[s.type] = (typeCounts[s.type] || 0) + 1;
                const label = typeCounts[s.type] > 1 ? `${baseLabel} ${typeCounts[s.type]}` : baseLabel;
                dynamicTabs.push({ label, id: s.id, type: s.type, divider: i === 0 });
              });

              return dynamicTabs.map((t) => {
                const isHidden = t.type !== "static" && order.find(s => s.id === t.id)?.visible === false;

                return (
                  <React.Fragment key={t.id}>
                  {t.divider && (
                    <div className="hidden lg:block w-full h-px bg-[var(--dash-text)]/8 my-1" />
                  )}
                  {t.divider && (
                    <span className="hidden lg:block text-[8px] font-bold uppercase tracking-[0.2em] text-[var(--dash-text)]/25 px-3 mt-1 mb-0.5">Sections</span>
                  )}
                  <button
                    onClick={() => {
                      if (isHidden) {
                        alert(`The "${t.label}" section is currently hidden. Enable it in the "Layout" tab to edit its content and see it in the preview.`);
                        return;
                      }
                      handleTabChange(t.id);
                    }}
                    className={`whitespace-nowrap px-4 lg:px-3 py-1.5 lg:py-1.5 text-[11px] lg:text-[13px] transition-all duration-200 text-left rounded-sm ${
                      view === "website" && tab === t.id
                        ? "text-[var(--dash-text)] font-semibold bg-[var(--dash-text)]/[0.08] shadow-sm"
                        : isHidden
                          ? "text-[var(--dash-text)]/20 cursor-not-allowed italic"
                          : "text-[var(--dash-text)]/40 hover:text-[var(--dash-text)]/70 hover:bg-[var(--dash-text)]/[0.03]"
                    }`}
                    title={isHidden ? `${t.label} is hidden in layout` : ""}
                  >
                    <div className="flex items-center gap-2">
                      <span>{t.label}</span>
                      {isHidden && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-40 shrink-0">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      )}
                    </div>
                  </button>
                  </React.Fragment>
                );
              });
            })()}

            {/* Management */}
            <div className="hidden lg:block w-full h-px bg-[var(--dash-text)]/8 my-1" />
            <span className="hidden lg:block text-[8px] font-bold uppercase tracking-[0.2em] text-[var(--dash-text)]/25 px-3 mt-1 mb-0.5">Management</span>
            {([
              { id: "guests" as View, label: "Guests", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
              { id: "gifts" as View, label: "Gifts", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg> },
              { id: "messages" as View, label: "Broadcast", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg> },
            ]).map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`whitespace-nowrap px-4 lg:px-3 py-1.5 lg:py-1.5 text-[11px] lg:text-[13px] transition-all duration-200 w-full text-left rounded-sm ${
                  view === item.id
                    ? "text-[var(--dash-text)] font-semibold bg-[var(--dash-text)]/[0.08] shadow-sm"
                    : "text-[var(--dash-text)]/40 hover:text-[var(--dash-text)]/70 hover:bg-[var(--dash-text)]/[0.03]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="lg:hidden">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              </button>
            ))}
          </div>
        </nav>

        {/* Management Panels */}
        {view === "guests" && (
          <div className="flex-1 min-w-0 py-0 lg:py-0">
            <GuestListPanel rsvpData={rsvpData} loadRSVPs={loadRSVPs} site={site} set={set} />
          </div>
        )}
        {view === "messages" && (
          <div className="flex-1 min-w-0 py-0 lg:py-0">
            <MessagesPanel msgData={msgData} loadMessages={loadMessages} site={site} />
          </div>
        )}
        {view === "gifts" && (
          <div className="flex-1 min-w-0 py-0 lg:py-0">
            <GiftTrackerPanel giftData={giftData} loadGifts={loadGifts} site={site} />
          </div>
        )}

        {/* Content Wrapper */}
        {view === "website" && (
        <div ref={contentWrapperRef} className={`flex flex-col lg:flex-row transition-all px-0 lg:px-0 ${isPreview ? "flex-1 min-w-0 overflow-hidden" : "flex-1 max-w-2xl lg:mx-auto"}`}>
          
          {/* Editor Column */}
          <div
            style={isPreview ? { width: `${editorWidth}%`, maxWidth: `${editorWidth}%` } : { width: '100%' }}
            className={`transition-all min-w-0 overflow-x-hidden ${isPreview ? "h-auto lg:h-[calc(100vh-3.5rem)] lg:overflow-y-auto lg:pr-6 lg:pt-4 custom-scrollbar block shrink-0 max-lg:!w-full max-lg:!max-w-full lg:sticky lg:top-[3.5rem]" : "w-full max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar block"}`}
          >
            <div key={tab} className="animate-[fadeIn_0.3s_ease]">
            {(() => {
              if (tab === "Basics") return (
                <div>
                  <SectionTitle>Basic Info</SectionTitle>
                  
                  <SlugField currentSlug={site.slug} onSave={(val) => set("slug", val)} customDomain={site.customDomain} domainVerified={!!site.domainVerifiedAt} />

                  {/* Custom Domain — right below Site URL */}
                  {site.isPaid && (
                    <div className="mb-6 p-4 bg-[var(--dash-text)]/5 border border-[var(--dash-text)]/10 rounded-sm">
                      <Label>Custom Domain</Label>
                      <p className="text-[10px] text-[var(--dash-text)]/40 mb-4 uppercase tracking-wider">Use your own domain instead of {site.slug}.ithinkshewifey.com</p>
                      {site.domainVerifiedAt ? (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            <p className="text-xs font-medium text-green-600">Connected</p>
                          </div>
                          <p className="text-xs text-green-600">
                            {site.customDomain} is live. Contact support to make changes.
                          </p>
                        </div>
                      ) : site.customDomain ? (
                        <div className="space-y-3">
                          <div className="p-4 bg-[var(--dash-text)]/5 border border-[var(--dash-text)]/10 rounded-sm">
                            <p className="text-sm font-medium text-[var(--dash-text)] mb-1">{site.customDomain}</p>
                            <p className="text-[10px] text-[var(--dash-text)]/40">Point your domain&apos;s CNAME to <strong>proxy.ithinkshewifey.com</strong>, then verify below.</p>
                          </div>
                          <DomainStatus slug={site.slug} domain={site.customDomain} />
                          <button
                            onClick={() => setShowCancelDomainModal(true)}
                            className="text-[10px] text-[var(--dash-text)]/40 underline hover:text-[var(--dash-text)]/60"
                          >
                            Remove domain
                          </button>
                        </div>
                      ) : (
                        <DomainRequest slug={site.slug} />
                      )}
                    </div>
                  )}

                  <Field label="Partner 1 Name" value={site.partner1Name} onChange={(v) => set("partner1Name", v)} />
                  <Field label="Partner 2 Name" value={site.partner2Name} onChange={(v) => set("partner2Name", v)} />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <DateTimePicker 
                      label="Wedding Start Date" 
                      value={site.weddingDate} 
                      onChange={(v) => {
                        if (!v) { set("weddingDate", ""); return; }
                        set("weddingDate", new Date(v).toISOString());
                      }} 
                    />
                    <DateTimePicker 
                      label="Wedding End Date (optional)" 
                      value={site.weddingEndDate || ""} 
                      onChange={(v) => {
                        if (!v) { set("weddingEndDate", ""); return; }
                        set("weddingEndDate", new Date(v).toISOString());
                      }} 
                    />
                  </div>

                  <Field label="Display Date Text" value={site.dateDisplayText} onChange={(v) => set("dateDisplayText", v)} placeholder="e.g. August 1st & 2nd, 2026" />
                  <Field label="Location" value={site.locationText} onChange={(v) => set("locationText", v)} />
                  <Field label="Nav Brand Text" value={site.navBrand} onChange={(v) => set("navBrand", v)} placeholder="K & M" />

                  <Label>Layout Style</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2 mb-6">
                    {([
                      { id: "classic", name: "Classic", desc: "Elegant, centered layout with script fonts." },
                      { id: "modern", name: "Modern", desc: "Minimalist, bold typography and high contrast." },
                    ] as const).map((layout) => (
                      <button
                        key={layout.id}
                        type="button"
                        onClick={() => set("layoutId", layout.id)}
                        className={`text-left p-4 rounded-sm border-2 transition-all ${
                          (site.layoutId || "classic") === layout.id
                            ? "border-[var(--dash-text)] bg-[var(--dash-text)]/[0.02]"
                            : "border-[var(--dash-text)]/10 hover:border-[var(--dash-text)]/30"
                        }`}
                      >
                        <p className="text-sm font-bold text-[var(--dash-text)] uppercase tracking-tight">{layout.name}</p>
                        <p className="text-[10px] text-[var(--dash-text)]/50 mt-1 leading-tight">{layout.desc}</p>
                      </button>
                    ))}
                  </div>
                  <Label>Color Palette</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2 mb-6">
                    {themes.map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => { set("templateId", theme.id); set("customColors", undefined as any); }}
                        className={`relative text-left p-3 rounded-sm border-2 transition-all ${
                          site.templateId === theme.id
                            ? "border-[var(--dash-text)] shadow-sm bg-[var(--dash-text)]/[0.02]"
                            : "border-[var(--dash-text)]/10 hover:border-[var(--dash-text)]/30"
                        }`}
                      >
                        <div className="flex gap-1.5 mb-2">
                          <span className="w-5 h-5 rounded-full border border-[var(--dash-text)]/10" style={{ background: theme.colors.primary }} />
                          <span className="w-5 h-5 rounded-full border border-[var(--dash-text)]/10" style={{ background: theme.colors.accent }} />
                          <span className="w-5 h-5 rounded-full border border-[var(--dash-text)]/10" style={{ background: theme.colors.dark }} />
                        </div>
                        <p className="text-[11px] font-bold uppercase tracking-tight text-[var(--dash-text)]">{theme.name}</p>
                        {site.templateId === theme.id && (
                          <span className="absolute top-2 right-2 text-[8px] font-bold uppercase tracking-widest text-[var(--dash-text)]/40">Active</span>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="mb-6">
                    <ColorCustomizer
                      templateId={site.templateId}
                      customColors={site.customColors}
                      onChange={(colors) => set("customColors", colors as any)}
                    />
                  </div>

                  <Label>Font Style</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2 mb-4">
                    {fontStyles.map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => { set("fontStyleId", style.id); set("customFonts", undefined as any); }}
                        className={`relative text-left p-4 rounded-sm border-2 transition-all ${
                          (site.fontStyleId || "timeless") === style.id
                            ? "border-[var(--dash-text)] shadow-sm bg-[var(--dash-text)]/[0.02]"
                            : "border-[var(--dash-text)]/10 hover:border-[var(--dash-text)]/30"
                        }`}
                      >
                        <p className="text-sm font-bold text-[var(--dash-text)] uppercase tracking-tight mb-2">{style.name}</p>
                        <div className="flex flex-col gap-1 border-t border-[var(--dash-text)]/5 pt-2">
                          <span className="text-lg" style={{ fontFamily: style.fonts.script }}>The Wedding of</span>
                          <span className="text-xs uppercase tracking-widest" style={{ fontFamily: style.fonts.serif }}>Partner & Partner</span>
                          <span className="text-[9px] uppercase font-bold opacity-40" style={{ fontFamily: style.fonts.sans }}>Saturday, August 1st 2026</span>
                        </div>
                        {(site.fontStyleId || "timeless") === style.id && (
                          <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-widest text-[var(--dash-text)]/40">Active</span>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="mb-6">
                    <FontCustomizer
                      fontStyleId={site.fontStyleId}
                      customFonts={site.customFonts}
                      onChange={(fonts) => set("customFonts", fonts as any)}
                    />
                  </div>

                  {/* Appearance */}
                  <Label>Appearance</Label>
                  <div className="flex gap-1 bg-[var(--dash-text)]/5 rounded-sm p-1">
                    {(["light", "dark"] as const).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setPref(opt)}
                        className={`flex-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all ${
                          pref === opt
                            ? "bg-[var(--dash-btn-bg)] text-[var(--dash-btn-text)] shadow-sm"
                            : "text-[var(--dash-text)]/40 hover:text-[var(--dash-text)]/60"
                        }`}
                      >
                        {opt === "light" ? "Light" : "Dark"}
                      </button>
                    ))}
                  </div>

                  {/* Publish Section */}
                  <div className="mt-10 pt-8 border-t border-[var(--dash-text)]/10">
                    <Label>Publish Your Site</Label>
                    {site.isPaid ? (
                      <div className="flex items-center justify-between p-4 bg-[var(--dash-surface)] border border-[var(--dash-text)]/10 rounded-sm">
                        <div>
                          <p className="text-sm font-medium text-[var(--dash-text)]">
                            {site.isPublished ? "Your site is live" : "Your site is hidden"}
                          </p>
                          <p className="text-[10px] text-[var(--dash-text)]/40 mt-0.5">
                            {site.isPublished
                              ? <>Visible at <a href={site.customDomain ? `https://${site.customDomain}` : `https://${site.slug}.ithinkshewifey.com`} target="_blank" className="underline">{site.customDomain || `${site.slug}.ithinkshewifey.com`}</a></>
                              : "Toggle to make your site visible to guests"}
                          </p>
                        </div>
                        <button
                          onClick={() => set("isPublished", !site.isPublished)}
                          className={`relative w-12 h-7 rounded-full transition-colors ${site.isPublished ? "bg-green-500" : "bg-[var(--dash-text)]/20"}`}
                        >
                          <span className={`absolute top-1 w-5 h-5 bg-[var(--dash-bg)] rounded-full shadow-sm transition-transform ${site.isPublished ? "left-6" : "left-1"}`} />
                        </button>
                      </div>
                    ) : (
                      <div className="p-5 bg-[var(--dash-surface)] border border-[var(--dash-text)]/10 rounded-sm">
                        <p className="text-sm text-[var(--dash-text)]/60 mb-4 leading-relaxed">
                          Upgrade to publish your wedding site and share it with your guests.
                        </p>
                        <ul className="text-sm text-[var(--dash-text)]/70 space-y-2 mb-5">
                          <li className="flex gap-2.5 items-center">
                            <svg className="shrink-0 text-green-600" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                            Publish & share your site
                          </li>
                          <li className="flex gap-2.5 items-center">
                            <svg className="shrink-0 text-green-600" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                            Collect RSVPs from guests
                          </li>
                          <li className="flex gap-2.5 items-center">
                            <svg className="shrink-0 text-green-600" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                            Unlimited uploads & media library
                          </li>
                        </ul>
                        <button
                          onClick={handleCheckout}
                          disabled={isPaying}
                          className="w-full py-3 bg-[var(--dash-btn-bg)] text-[var(--dash-bg)] font-bold uppercase tracking-widest text-[10px] rounded-sm hover:opacity-90 disabled:opacity-50 transition-all"
                        >
                          {isPaying ? "Preparing Checkout..." : "Upgrade — £50 one-time"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );

              if (tab === "Layout") return (
                <div>
                  <SectionTitle>Section Order & Visibility</SectionTitle>
                  <p className="text-xs text-[var(--dash-text)]/50 mb-4">
                    Drag to reorder sections. Duplicate or remove as needed.
                  </p>
                  <SortableList
                    items={site.sectionOrder ?? DEFAULT_SECTION_ORDER}
                    prefix="layout"
                    onReorder={(items) => set("sectionOrder", items)}
                  >
                    {(section, i, id) => (
                      <SortableCard key={id} id={id}>
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className={`text-sm font-medium ${section.visible ? "text-[var(--dash-text)]" : "text-[var(--dash-text)]/30 line-through"}`}>
                                {SECTION_LABELS[section.type] || SECTION_LABELS[section.id] || section.id}
                              </span>
                              <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--dash-text)]/30">
                                {section.id}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => duplicateSection(i)}
                                className="p-1.5 text-[var(--dash-text)]/40 hover:text-[var(--dash-text)] transition-colors"
                                title="Duplicate Section"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                                </svg>
                              </button>

                              <button
                                type="button"
                                onClick={() => removeSection(i)}
                                className="p-1.5 text-[var(--dash-text)]/40 hover:text-red-500 transition-colors"
                                title="Remove Section"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                                </svg>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const order = site.sectionOrder ?? DEFAULT_SECTION_ORDER;
                                  const updated = order.map((s, j) =>
                                    j === i ? { ...s, visible: !s.visible } : s
                                  );
                                  set("sectionOrder", updated);
                                }}
                                className={`p-1.5 transition-colors ${
                                  section.visible
                                    ? "text-[var(--dash-text)]/60 hover:text-[var(--dash-text)]"
                                    : "text-[var(--dash-text)]/20 hover:text-[var(--dash-text)]/40"
                                }`}
                                title={section.visible ? "Hide section" : "Show section"}
                              >
                                {section.visible ? (
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                  </svg>
                                ) : (
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                    <line x1="1" y1="1" x2="23" y2="23" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </SortableCard>
                    )}
                  </SortableList>

                  <div className="mt-8 pt-8 border-t border-[var(--dash-text)]/10">
                    <SectionTitle>Add New Section</SectionTitle>
                    <p className="text-[10px] font-medium text-[var(--dash-text)]/40 uppercase tracking-widest mb-4">Click to append to layout</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(SECTION_LABELS).map(([type, label]) => {
                        // Unique sections that shouldn't be duplicated usually, 
                        // but if they are missing entirely we want to show them.
                        const isUnique = ["hero", "footer"].includes(type);
                        const exists = site.sectionOrder?.some(s => s.type === type);
                        if (isUnique && exists) return null;

                        return (
                          <button
                            key={type}
                            onClick={() => addSection(type)}
                            className="text-[10px] font-bold uppercase tracking-wider px-3 py-2 border border-[var(--dash-text)]/10 bg-[var(--dash-surface)] hover:border-[var(--dash-text)]/30 hover:bg-[var(--dash-surface-alt)] transition-all rounded-sm"
                          >+ {label}</button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );


              // --- Dynamic Sections ---
              const order = site.sectionOrder ?? DEFAULT_SECTION_ORDER;
              const section = order.find(s => s.id === tab);
              
              if (!section) return (
                <div className="flex flex-col items-center justify-center h-full text-[var(--dash-text)]/40 pt-20">
                  <p>Section not found or removed.</p>
                  <button onClick={() => handleTabChange("Basics")} className="mt-4 text-sm font-bold uppercase tracking-wider text-[var(--dash-text)] hover:underline">Go to Basics</button>
                </div>
              );

              const { id, type } = section;
              const activeTheme = themes.find(t => t.id === site.templateId) || themes[0];
              
              // Helpers for dynamic data
              const d = <T,>(key: string, fallback: T): T => (site.sectionData?.[id]?.[key] as T) ?? fallback;
              const update = (patch: any) => setSectionData(id, patch);
              
              const bg = site.sectionBackgrounds?.[id] || "";
              const setBg = (v: string) => {
                const bgs = { ...(site.sectionBackgrounds || {}) };
                if (v) bgs[id] = v; else delete bgs[id];
                set("sectionBackgrounds", bgs);
              };

              const bgColor = site.sectionBackgroundColors?.[id] || "transparent";
              const setBgColor = (v: "primary" | "accent" | "dark" | "transparent") => {
                const bgs = { ...(site.sectionBackgroundColors || {}) };
                if (v && v !== "transparent") bgs[id] = v; else delete bgs[id];
                set("sectionBackgroundColors", bgs);
              };

              const textColor = site.sectionTextColors?.[id] || "";
              const setTextColor = (v: string) => {
                const colors = { ...(site.sectionTextColors || {}) };
                if (!v) delete colors[id]; else colors[id] = v;
                set("sectionTextColors", colors);
              };

              const renderBg = (label: string) => (
                <div className="mb-6 pt-2">
                  <ColorPicker
                    label="Background Color"
                    value={bgColor}
                    onChange={setBgColor as any}
                    themeColors={activeTheme.colors}
                  />
                  <div className="h-px bg-[var(--dash-text)]/5 my-6" />
                  <ImageField
                    label={label}
                    value={bg}
                    onChange={(v) => setBg(v)}
                    recentLinks={site.recentlyUsedLinks || []}
                    onAddRecentLink={addRecentLink}
                  />
                  {bg && (
                    <div className="mt-4">
                      <Label>Text Color</Label>
                      <p className="text-[10px] text-[var(--dash-text)]/40 mb-2 uppercase tracking-wider">Text color over the background image</p>
                      <div className="flex flex-wrap gap-2">
                        {([
                          { id: "", name: "Default", color: activeTheme.colors.accent },
                          { id: activeTheme.colors.primary, name: "Light", color: activeTheme.colors.primary },
                          { id: activeTheme.colors.accent, name: "Accent", color: activeTheme.colors.accent },
                          { id: activeTheme.colors.dark, name: "Dark", color: activeTheme.colors.dark },
                          { id: "#ffffff", name: "White", color: "#ffffff" },
                        ]).map((opt) => (
                          <button
                            key={opt.id || "default"}
                            type="button"
                            onClick={() => setTextColor(opt.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-sm border transition-all ${textColor === opt.id ? "border-[var(--dash-text)] bg-[var(--dash-text)]/5" : "border-[var(--dash-text)]/10 hover:border-[var(--dash-text)]/30"}`}
                          >
                            <span className="w-4 h-4 rounded-full border border-[var(--dash-text)]/20" style={{ background: opt.color }} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{opt.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="h-px bg-[var(--dash-text)]/10 mt-6" />
                </div>
              );

              if (type === "hero") return (
                <div>
                  <SectionTitle>Hero Section</SectionTitle>
                  {renderBg("Hero Background Image")}
                  <Field label="Pre-text" value={site.heroPretext} onChange={(v) => set("heroPretext", v)} />
                  <Field label="Tagline" value={site.heroTagline} onChange={(v) => set("heroTagline", v)} />
                  <Field label="CTA Button Text" value={site.heroCta} onChange={(v) => set("heroCta", v)} />
                  <ImageField 
                    label="Hero Image (Foreground)" 
                    value={site.heroImageUrl} 
                    onChange={(v) => set("heroImageUrl", v)} 
                    recentLinks={site.recentlyUsedLinks || []}
                    onAddRecentLink={addRecentLink}
                  />
                </div>
              );

              if (type === "story") return (
                <div>
                  <SectionTitle>Our Story</SectionTitle>
                  {renderBg("Story Background Image")}
                  <Field label="Subtitle" value={site.storySubtitle} onChange={(v) => set("storySubtitle", v)} />
                  <Field label="Title" value={site.storyTitle} onChange={(v) => set("storyTitle", v)} />
                  <Field label="Lead Quote" value={site.storyLeadQuote} onChange={(v) => set("storyLeadQuote", v)} multiline rows={3} />
                  <Label>Story Paragraphs</Label>
                  <SortableList items={site.storyBody || []} prefix={`story-${id}`} onReorder={(items) => set("storyBody", items)}>
                    {(p, i, sid) => (
                      <SortableCard key={sid} id={sid} onRemove={() => set("storyBody", removeFromArray(site.storyBody || [], i))}>
                        <textarea value={p} rows={3}
                          onChange={(e) => {
                            const body = [...(site.storyBody || [])];
                            body[i] = e.target.value;
                            set("storyBody", body);
                          }}
                          className="w-full px-3 py-2 border border-[var(--dash-text)]/15 bg-[var(--dash-surface)] text-[var(--dash-text)] text-sm outline-none focus:border-[var(--dash-text)]/40 resize-y rounded-sm"
                        />
                      </SortableCard>
                    )}
                  </SortableList>
                  <AddButton label="Add Paragraph" onClick={() => set("storyBody", [...(site.storyBody || []), ""])} />
                  <ImageField 
                    label="Story Image" 
                    value={site.storyImageUrl} 
                    onChange={(v) => set("storyImageUrl", v)} 
                    recentLinks={site.recentlyUsedLinks || []}
                    onAddRecentLink={addRecentLink}
                  />
                </div>
              );

              if (type === "quote") return (
                <div>
                  <SectionTitle>Quote</SectionTitle>
                  {renderBg("Quote Background Image")}
                  <Field label="Quote Text" value={site.quoteText} onChange={(v) => set("quoteText", v)} multiline rows={3} />
                  <Field label="Attribution" value={site.quoteAttribution} onChange={(v) => set("quoteAttribution", v)} />
                </div>
              );

              if (type === "featuredPhoto" || type === "photo") return (
                <div>
                  <SectionTitle>Photo</SectionTitle>
                  {renderBg("Photo Section Background")}
                  <ImageField
                    label="Photo URL"
                    value={site.featuredPhotoUrl}
                    onChange={(v) => set("featuredPhotoUrl", v)}
                    recentLinks={site.recentlyUsedLinks || []}
                    onAddRecentLink={addRecentLink}
                  />
                  <Field label="Caption" value={site.featuredPhotoCaption} onChange={(v) => set("featuredPhotoCaption", v)} />
                </div>
              );

              if (type === "letter") return (
                <div>
                  <SectionTitle>Letter</SectionTitle>
                  {renderBg("Letter Background Image")}
                  <Field label="Opening" value={site.letterOpening} onChange={(v) => set("letterOpening", v)} />
                  <Label>Body Paragraphs</Label>
                  <SortableList items={site.letterBody || []} prefix={`letter-${id}`} onReorder={(items) => set("letterBody", items)}>
                    {(p, i, sid) => (
                      <SortableCard key={sid} id={sid} onRemove={() => set("letterBody", removeFromArray(site.letterBody || [], i))}>
                        <textarea value={p} rows={3}
                          onChange={(e) => {
                            const body = [...(site.letterBody || [])];
                            body[i] = e.target.value;
                            set("letterBody", body);
                          }}
                          className="w-full px-3 py-2 border border-[var(--dash-text)]/15 bg-[var(--dash-surface)] text-[var(--dash-text)] text-sm outline-none focus:border-[var(--dash-text)]/40 resize-y rounded-sm"
                        />
                      </SortableCard>
                    )}
                  </SortableList>
                  <AddButton label="Add Paragraph" onClick={() => set("letterBody", [...(site.letterBody || []), ""])} />
                  <Field label="Closing" value={site.letterClosing} onChange={(v) => set("letterClosing", v)} />
                </div>
              );

              // For complex sections like details, schedule, etc., we fallback to global state 
              // for now, but they can be migrated to use update({ ... }) over time.
              // Note: Duplicate 'details' or 'schedule' will share the same global list until fully migrated.

              if (type === "details") return (
                <div>
                  <SectionTitle>Celebration Events</SectionTitle>
                  {renderBg("Details Background Image")}
                  <p className="text-xs text-[var(--dash-text)]/50 mb-6">
                    Add multiple days or events (e.g., Wedding Day, Farewell Brunch). Each can have its own venues and info.
                  </p>

                  <SortableList 
                    items={site.eventDays} 
                    prefix={`event-days-${id}`} 
                    onReorder={(items) => set("eventDays", items)}
                  >
                    {(day, di, dayId) => (
                      <SortableCard 
                        key={dayId} 
                        id={dayId} 
                        title={day.label || `Event Day ${di + 1}`} 
                        onRemove={() => set("eventDays", removeFromArray(site.eventDays, di))}
                      >
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Event Day Label" value={day.label} onChange={(v) => set("eventDays", updateInArray(site.eventDays, di, { label: v }))} placeholder="e.g. Day One" />
                            <Field label="Date (Optional)" value={day.date || ""} onChange={(v) => set("eventDays", updateInArray(site.eventDays, di, { date: v }))} placeholder="e.g. Saturday, Aug 1st" />
                          </div>

                          <ColorPicker 
                            label="Section Background Color" 
                            value={day.sectionBackgroundColor || "transparent"} 
                            onChange={(v) => set("eventDays", updateInArray(site.eventDays, di, { sectionBackgroundColor: v }))} 
                            themeColors={activeTheme.colors}
                          />

                          <ImageField 
                            label="Section Background Image" 
                            value={day.sectionBackground || ""} 
                            onChange={(v) => set("eventDays", updateInArray(site.eventDays, di, { sectionBackground: v }))} 
                            recentLinks={site.recentlyUsedLinks || []}
                            onAddRecentLink={addRecentLink}
                          />

                          <div>
                            <Label>Layout Style</Label>
                            <div className="grid grid-cols-3 gap-2 mt-2">
                              {(["grid", "split", "minimal"] as const).map((style) => (
                                <button
                                  key={style}
                                  type="button"
                                  onClick={() => set("eventDays", updateInArray(site.eventDays, di, { detailsStyle: style }))}
                                  className={`p-2 rounded-sm border transition-all text-center ${
                                    (day.detailsStyle || "grid") === style ? "border-[var(--dash-text)] bg-[var(--dash-text)]/5" : "border-[var(--dash-text)]/10 hover:border-[var(--dash-text)]/30"
                                  }`}
                                >
                                  <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--dash-text)]">{style}</p>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--dash-text)]/40">Venues & Locations</p>
                            <SortableList items={day.venues} prefix={`venues-${dayId}`} onReorder={(newVenues) => set("eventDays", updateInArray(site.eventDays, di, { venues: newVenues }))}>
                              {(v, vi, vId) => (
                                <SortableCard key={vId} id={vId} title={v.label || `Venue ${vi + 1}`} onRemove={() => set("eventDays", updateInArray(site.eventDays, di, { venues: removeFromArray(day.venues, vi) }))}>
                                  <Field label="Label" value={v.label} onChange={(val) => set("eventDays", updateInArray(site.eventDays, di, { venues: updateInArray(day.venues, vi, { label: val }) }))} placeholder="Ceremony / Reception" />
                                  <Field label="Venue Name" value={v.name} onChange={(val) => set("eventDays", updateInArray(site.eventDays, di, { venues: updateInArray(day.venues, vi, { name: val }) }))} />
                                  <Field label="Address" value={v.address} onChange={(val) => set("eventDays", updateInArray(site.eventDays, di, { venues: updateInArray(day.venues, vi, { address: val }) }))} multiline rows={2} />
                                  <Field label="Time" value={v.time} onChange={(val) => set("eventDays", updateInArray(site.eventDays, di, { venues: updateInArray(day.venues, vi, { time: val }) }))} placeholder="2:00 PM" />
                                  <Field label="Google Maps Link" value={v.mapsEmbedUrl || ""} onChange={(val) => set("eventDays", updateInArray(site.eventDays, di, { venues: updateInArray(day.venues, vi, { mapsEmbedUrl: val }) }))} />
                                </SortableCard>
                              )}
                            </SortableList>
                            <button type="button" onClick={() => set("eventDays", updateInArray(site.eventDays, di, { venues: [...day.venues, { label: "", name: "", address: "", time: "" }] }))} className="text-[10px] font-bold uppercase text-[var(--dash-text)]/40 hover:text-[var(--dash-text)] transition-colors">+ Add Venue</button>
                          </div>

                          <div className="space-y-4">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--dash-text)]/40">Information Blocks</p>
                            <SortableList items={day.infoBlocks} prefix={`info-${dayId}`} onReorder={(newBlocks) => set("eventDays", updateInArray(site.eventDays, di, { infoBlocks: newBlocks }))}>
                              {(b, bi, bId) => (
                                <SortableCard key={bId} id={bId} onRemove={() => set("eventDays", updateInArray(site.eventDays, di, { infoBlocks: removeFromArray(day.infoBlocks, bi) }))}>
                                  <Field label="Heading" value={b.heading || ""} onChange={(val) => set("eventDays", updateInArray(site.eventDays, di, { infoBlocks: updateInArray(day.infoBlocks, bi, { heading: val }) }))} />
                                  <Field label="Text" value={b.text} onChange={(val) => set("eventDays", updateInArray(site.eventDays, di, { infoBlocks: updateInArray(day.infoBlocks, bi, { text: val }) }))} multiline rows={3} />
                                </SortableCard>
                              )}
                            </SortableList>
                            <button type="button" onClick={() => set("eventDays", updateInArray(site.eventDays, di, { infoBlocks: [...day.infoBlocks, { text: "" }] }))} className="text-[10px] font-bold uppercase text-[var(--dash-text)]/40 hover:text-[var(--dash-text)] transition-colors">+ Add Info Block</button>
                          </div>

                          <Field label="Additional Note" value={day.note || ""} onChange={(v) => set("eventDays", updateInArray(site.eventDays, di, { note: v }))} multiline rows={2} />
                        </div>
                      </SortableCard>
                    )}
                  </SortableList>
                  <AddButton label="Add Another Event Day" onClick={() => set("eventDays", [...site.eventDays, { id: "day-" + Date.now(), label: "New Event Day", venues: [], infoBlocks: [], detailsStyle: "grid" }])} />
                </div>
              );

              if (type === "schedule") return (
                <div>
                  <SectionTitle>Wedding Schedule</SectionTitle>
                  {renderBg("Schedule Background Image")}
                  <Label>Visualization Style</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2 mb-8">
                    {(["classic", "minimal", "cards"] as const).map((style) => (
                      <button key={style} type="button" onClick={() => set("scheduleStyle", style)} className={`p-3 rounded-sm border-2 transition-all text-center ${(site.scheduleStyle || "classic") === style ? "border-[var(--dash-text)] bg-[var(--dash-text)]/5" : "border-[var(--dash-text)]/10 hover:border-[var(--dash-text)]/30"}`}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--dash-text)]">{style}</p>
                      </button>
                    ))}
                  </div>

                  <SortableList items={site.weddingDays ?? []} prefix={`schedule-${id}`} onReorder={(items) => set("weddingDays", items)}>
                    {(day, di, sid) => (
                      <SortableCard key={sid} id={sid} title={day.label || `Day ${di + 1}`} onRemove={() => set("weddingDays", removeFromArray(site.weddingDays ?? [], di))}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Field label="Label" value={day.label} onChange={(v) => set("weddingDays", updateInArray(site.weddingDays ?? [], di, { label: v }))} placeholder="e.g. Wedding Day" />
                          <Field label="Date" value={day.date || ""} onChange={(v) => set("weddingDays", updateInArray(site.weddingDays ?? [], di, { date: v }))} placeholder="August 1st" />
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                          <input type="checkbox" id={`private-${di}`} checked={day.isPrivate} onChange={(e) => set("weddingDays", updateInArray(site.weddingDays ?? [], di, { isPrivate: e.target.checked }))} className="accent-[var(--dash-text)]" />
                          <label htmlFor={`private-${di}`} className="text-xs text-[var(--dash-text)]/60">Private (hidden from public site)</label>
                        </div>
                        <Label>Items</Label>
                        <SortableList items={day.items} prefix={`items-${sid}`} onReorder={(items) => set("weddingDays", updateInArray(site.weddingDays ?? [], di, { items }))}>
                          {(item, i, iid) => (
                            <SortableCard key={iid} id={iid} title={item.event || `Event ${i + 1}`} onRemove={() => set("weddingDays", updateInArray(site.weddingDays ?? [], di, { items: removeFromArray(day.items, i) }))}>
                              <TimePicker 
                                label="Time" 
                                hour={item.hour} 
                                period={item.period} 
                                onChange={(h, p) => set("weddingDays", updateInArray(site.weddingDays ?? [], di, { items: updateInArray(day.items, i, { hour: h, period: p }) }))} 
                              />
                              <Field label="Event" value={item.event} onChange={(v) => set("weddingDays", updateInArray(site.weddingDays ?? [], di, { items: updateInArray(day.items, i, { event: v }) }))} />
                              <Field label="Venue" value={item.venue} onChange={(v) => set("weddingDays", updateInArray(site.weddingDays ?? [], di, { items: updateInArray(day.items, i, { venue: v }) }))} />
                              <Field label="Description" value={item.description} multiline rows={2} onChange={(v) => set("weddingDays", updateInArray(site.weddingDays ?? [], di, { items: updateInArray(day.items, i, { description: v }) }))} />
                            </SortableCard>
                          )}
                        </SortableList>
                        <AddButton label="Add Event" onClick={() => set("weddingDays", updateInArray(site.weddingDays ?? [], di, { items: [...day.items, { hour: "", period: "PM", event: "", venue: "", description: "" }] }))} />
                      </SortableCard>
                    )}
                  </SortableList>
                  <AddButton label="Add Day" onClick={() => set("weddingDays", [...(site.weddingDays ?? []), { label: "", date: "", isPrivate: false, items: [] }])} />
                </div>
              );

              if (type === "menu") {
                const categories = site.menuCategories || [];
                const hasCategories = categories.length > 0;

                // Helpers for category-based editing
                const setCategories = (cats: MenuCategory[]) => {
                  set("menuCategories", cats);
                  // Sync flat menuItems for RSVP meal options
                  const allItems = cats.flatMap(c => c.items);
                  set("menuItems", allItems);
                };
                const updateCategory = (catIdx: number, patch: Partial<MenuCategory>) => {
                  const updated = [...categories];
                  updated[catIdx] = { ...updated[catIdx], ...patch };
                  setCategories(updated);
                };
                const addDishToCategory = (catIdx: number) => {
                  const updated = [...categories];
                  updated[catIdx] = { ...updated[catIdx], items: [...updated[catIdx].items, { name: "", description: "" }] };
                  setCategories(updated);
                };
                const updateDish = (catIdx: number, dishIdx: number, patch: Partial<MenuItem>) => {
                  const updated = [...categories];
                  const items = [...updated[catIdx].items];
                  items[dishIdx] = { ...items[dishIdx], ...patch };
                  updated[catIdx] = { ...updated[catIdx], items };
                  setCategories(updated);
                };
                const removeDish = (catIdx: number, dishIdx: number) => {
                  const updated = [...categories];
                  updated[catIdx] = { ...updated[catIdx], items: updated[catIdx].items.filter((_, i) => i !== dishIdx) };
                  setCategories(updated);
                };
                const removeCategory = (catIdx: number) => {
                  setCategories(categories.filter((_, i) => i !== catIdx));
                };
                const addCategory = () => {
                  setCategories([...categories, { id: `cat-${Date.now()}`, name: "", items: [{ name: "", description: "" }] }]);
                };

                // Migrate: if user has flat menuItems but no categories, offer to convert
                const migrateToCategories = () => {
                  const cat: MenuCategory = { id: `cat-${Date.now()}`, name: "Main Course", items: [...site.menuItems] };
                  set("menuCategories", [cat]);
                };

                return (
                <div>
                  <SectionTitle>Wedding Menu</SectionTitle>
                  {renderBg("Menu Background Image")}
                  <Field label="Menu Note" value={site.menuNote} onChange={(v) => set("menuNote", v)} multiline rows={2} />

                  {!hasCategories && site.menuItems.length > 0 && (
                    <div className="mb-4 p-3 border border-dashed border-[var(--dash-text)]/15 rounded-sm">
                      <p className="text-[10px] text-[var(--dash-text)]/50 mb-2">You have dishes without categories. Organise them into courses?</p>
                      <button type="button" onClick={migrateToCategories} className="text-[10px] font-bold uppercase tracking-wider text-[var(--dash-text)] hover:underline">
                        Convert to Categories
                      </button>
                    </div>
                  )}

                  {!hasCategories && (
                    <>
                      <SortableList items={site.menuItems} prefix={`menu-${id}`} onReorder={(items) => set("menuItems", items)}>
                        {(m, i, sid) => (
                          <SortableCard key={sid} id={sid} onRemove={() => set("menuItems", removeFromArray(site.menuItems, i))}>
                            <Field label="Name" value={m.name} onChange={(v) => set("menuItems", updateInArray(site.menuItems, i, { name: v }))} placeholder="e.g. Chicken, Beef, Vegetarian" />
                            <Field label="Description" value={m.description} onChange={(v) => set("menuItems", updateInArray(site.menuItems, i, { description: v }))} multiline rows={2} />
                            <div className="mt-2">
                              <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--dash-text)]/40 block mb-2">Dietary Options Available</label>
                              <div className="flex flex-wrap gap-1.5">
                                {["Halal", "Kosher", "Vegan", "Vegetarian", "Gluten-Free", "Dairy-Free", "Nut-Free"].map(opt => {
                                  const active = m.dietaryOptions?.includes(opt);
                                  return (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() => {
                                        const current = m.dietaryOptions || [];
                                        const updated = active ? current.filter(o => o !== opt) : [...current, opt];
                                        set("menuItems", updateInArray(site.menuItems, i, { dietaryOptions: updated }));
                                      }}
                                      className={`px-2.5 py-1 text-[10px] font-medium rounded-sm border transition-all ${
                                        active
                                          ? "bg-[var(--dash-btn-bg)] text-[var(--dash-btn-text)] border-[var(--dash-text)]"
                                          : "text-[var(--dash-text)]/40 border-[var(--dash-text)]/10 hover:border-[var(--dash-text)]/25"
                                      }`}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                              <p className="text-[9px] text-[var(--dash-text)]/30 mt-1.5">Select which dietary options are available for this dish. These appear in the RSVP form.</p>
                            </div>
                          </SortableCard>
                        )}
                      </SortableList>
                      <div className="flex gap-2 mt-2">
                        <AddButton label="Add Dish" onClick={() => set("menuItems", [...site.menuItems, { name: "", description: "" }])} />
                        {site.menuItems.length === 0 && (
                          <AddButton label="Use Categories" onClick={addCategory} />
                        )}
                      </div>
                    </>
                  )}

                  {hasCategories && (
                    <>
                      {categories.map((cat, catIdx) => (
                        <div key={cat.id} className="mb-6 border border-[var(--dash-text)]/10 rounded-sm overflow-hidden">
                          {/* Category header */}
                          <div className="bg-[var(--dash-text)]/[0.03] px-3 py-2.5 flex items-center gap-2 border-b border-[var(--dash-text)]/10">
                            <input
                              type="text"
                              value={cat.name}
                              onChange={(e) => updateCategory(catIdx, { name: e.target.value })}
                              placeholder="e.g. Starters, Main Course, Desserts"
                              className="flex-1 bg-transparent text-sm font-bold uppercase tracking-[0.08em] text-[var(--dash-text)] outline-none placeholder:text-[var(--dash-text)]/25 placeholder:normal-case placeholder:font-normal placeholder:tracking-normal"
                            />
                            <button
                              type="button"
                              onClick={() => removeCategory(catIdx)}
                              className="text-[var(--dash-text)]/25 hover:text-red-500 transition-colors shrink-0"
                              title="Remove category"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                          {/* Dishes in this category */}
                          <div className="px-3 py-2 space-y-3">
                            {cat.items.map((dish, dishIdx) => (
                              <div key={dishIdx} className="relative pl-3 border-l-2 border-[var(--dash-text)]/10">
                                <button
                                  type="button"
                                  onClick={() => removeDish(catIdx, dishIdx)}
                                  className="absolute top-0 right-0 text-[var(--dash-text)]/20 hover:text-red-500 transition-colors"
                                  title="Remove dish"
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                  </svg>
                                </button>
                                <Field label="Dish Name" value={dish.name} onChange={(v) => updateDish(catIdx, dishIdx, { name: v })} placeholder="e.g. Grilled Salmon" />
                                <Field label="Description" value={dish.description} onChange={(v) => updateDish(catIdx, dishIdx, { description: v })} placeholder="A brief description" multiline rows={2} />
                                <div className="mt-1">
                                  <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--dash-text)]/40 block mb-2">Dietary Options</label>
                                  <div className="flex flex-wrap gap-1.5">
                                    {["Halal", "Kosher", "Vegan", "Vegetarian", "Gluten-Free", "Dairy-Free", "Nut-Free"].map(opt => {
                                      const active = dish.dietaryOptions?.includes(opt);
                                      return (
                                        <button
                                          key={opt}
                                          type="button"
                                          onClick={() => {
                                            const current = dish.dietaryOptions || [];
                                            const updated = active ? current.filter(o => o !== opt) : [...current, opt];
                                            updateDish(catIdx, dishIdx, { dietaryOptions: updated });
                                          }}
                                          className={`px-2.5 py-1 text-[10px] font-medium rounded-sm border transition-all ${
                                            active
                                              ? "bg-[var(--dash-btn-bg)] text-[var(--dash-btn-text)] border-[var(--dash-text)]"
                                              : "text-[var(--dash-text)]/40 border-[var(--dash-text)]/10 hover:border-[var(--dash-text)]/25"
                                          }`}
                                        >
                                          {opt}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => addDishToCategory(catIdx)}
                              className="w-full py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--dash-text)]/30 hover:text-[var(--dash-text)]/60 border border-dashed border-[var(--dash-text)]/10 hover:border-[var(--dash-text)]/25 rounded-sm transition-all"
                            >
                              + Add Dish
                            </button>
                          </div>
                        </div>
                      ))}
                      <AddButton label="Add Category" onClick={addCategory} />
                    </>
                  )}
                </div>
                );
              }

              if (type === "faqs") return (
                <div>
                  <SectionTitle>Frequently Asked Questions</SectionTitle>
                  {renderBg("FAQs Background Image")}
                  <Field label="Heading" value={site.faqHeading || "Frequently Asked Questions"} onChange={(v) => set("faqHeading", v)} />
                  <SortableList items={site.faqs || []} prefix={`faqs-${id}`} onReorder={(items) => set("faqs", items)}>
                    {(f, i, sid) => (
                      <SortableCard key={sid} id={sid} title={f.question || `Question ${i + 1}`} onRemove={() => set("faqs", removeFromArray(site.faqs || [], i))}>
                        <Field label="Question" value={f.question} onChange={(v) => set("faqs", updateInArray(site.faqs || [], i, { question: v }))} />
                        <Field label="Answer" value={f.answer} onChange={(v) => set("faqs", updateInArray(site.faqs || [], i, { answer: v }))} multiline rows={3} />
                      </SortableCard>
                    )}
                  </SortableList>
                  <AddButton label="Add Question" onClick={() => set("faqs", [...(site.faqs || []), { question: "", answer: "" }])} />
                </div>
              );

              if (type === "gallery") return (
                <div>
                  <SectionTitle>Gallery</SectionTitle>
                  {renderBg("Gallery Background Image")}
                  <SortableList items={site.galleryImages} prefix={`gallery-${id}`} onReorder={(items) => set("galleryImages", items)}>
                    {(img, i, sid) => (
                      <SortableCard key={sid} id={sid} onRemove={() => set("galleryImages", removeFromArray(site.galleryImages, i))}>
                        <ImageField label="Image URL" value={img.url} onChange={(v) => set("galleryImages", updateInArray(site.galleryImages, i, { url: v }))} recentLinks={site.recentlyUsedLinks || []} onAddRecentLink={addRecentLink} />
                        <Field label="Alt Text" value={img.alt} onChange={(v) => set("galleryImages", updateInArray(site.galleryImages, i, { alt: v }))} />
                      </SortableCard>
                    )}
                  </SortableList>
                  <AddButton label="Add Image" onClick={() => set("galleryImages", [...site.galleryImages, { url: "", alt: "" }])} />
                </div>
              );

              if (type === "explore") return (
                <div>
                  <SectionTitle>Explore / Things to Do</SectionTitle>
                  {renderBg("Explore Background Image")}
                  <SortableList items={site.exploreGroups} prefix={`explore-${id}`} onReorder={(items) => set("exploreGroups", items)}>
                    {(g, i, sid) => (
                      <SortableCard key={sid} id={sid} title={g.heading || `Group ${i + 1}`} onRemove={() => set("exploreGroups", removeFromArray(site.exploreGroups, i))}>
                        <Field label="Heading" value={g.heading} onChange={(v) => set("exploreGroups", updateInArray(site.exploreGroups, i, { heading: v }))} />
                        <Field label="Subheading" value={g.subheading || ""} onChange={(v) => set("exploreGroups", updateInArray(site.exploreGroups, i, { subheading: v }))} />
                        <Label>Links</Label>
                        <SortableList items={g.links} prefix={`links-${sid}`} onReorder={(items) => set("exploreGroups", updateInArray(site.exploreGroups, i, { links: items }))}>
                          {(l, j, lid) => (
                            <SortableCard key={lid} id={lid} onRemove={() => set("exploreGroups", updateInArray(site.exploreGroups, i, { links: removeFromArray(g.links, j) }))}>
                              <Field label="Label" value={l.label} onChange={(v) => set("exploreGroups", updateInArray(site.exploreGroups, i, { links: updateInArray(g.links, j, { label: v }) }))} />
                              <Field label="URL" value={l.url} onChange={(v) => set("exploreGroups", updateInArray(site.exploreGroups, i, { links: updateInArray(g.links, j, { url: v }) }))} />
                            </SortableCard>
                          )}
                        </SortableList>
                        <AddButton label="Add Link" onClick={() => set("exploreGroups", updateInArray(site.exploreGroups, i, { links: [...g.links, { label: "", url: "" }] }))} />
                      </SortableCard>
                    )}
                  </SortableList>
                  <AddButton label="Add Group" onClick={() => set("exploreGroups", [...site.exploreGroups, { heading: "", links: [] }])} />
                </div>
              );

              if (type === "accommodations") return (
                <div>
                  <SectionTitle>Accommodations</SectionTitle>
                  {renderBg("Accommodations Background Image")}
                  <Field label="Recommendations / Tips" value={site.accommodationNote || ""} onChange={(v) => set("accommodationNote", v)} multiline rows={3} placeholder="e.g. Book early for the best rates! We recommend staying at..." />
                  <SortableList items={site.accommodations} prefix={`hotels-${id}`} onReorder={(items) => set("accommodations", items)}>
                    {(h, i, sid) => (
                      <SortableCard key={sid} id={sid} title={h.name || `Hotel ${i + 1}`} onRemove={() => set("accommodations", removeFromArray(site.accommodations, i))}>
                        <Field label="Name" value={h.name} onChange={(v) => set("accommodations", updateInArray(site.accommodations, i, { name: v }))} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Field label="Distance" value={h.distance} onChange={(v) => set("accommodations", updateInArray(site.accommodations, i, { distance: v }))} />
                          <Field label="Discount Code" value={h.discountCode || ""} onChange={(v) => set("accommodations", updateInArray(site.accommodations, i, { discountCode: v }))} />
                        </div>
                        <Field label="Description" value={h.description} onChange={(v) => set("accommodations", updateInArray(site.accommodations, i, { description: v }))} multiline rows={2} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Field label="Phone" value={h.phone || ""} onChange={(v) => set("accommodations", updateInArray(site.accommodations, i, { phone: v }))} placeholder="+44 123 456 7890" />
                          <Field label="Email" value={h.email || ""} onChange={(v) => set("accommodations", updateInArray(site.accommodations, i, { email: v }))} placeholder="reservations@hotel.com" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Field label="Website URL" value={h.bookingUrl} onChange={(v) => set("accommodations", updateInArray(site.accommodations, i, { bookingUrl: v }))} placeholder="https://hotel.com/book" />
                          <Field label="Website Button Label" value={h.buttonLabel || ""} onChange={(v) => set("accommodations", updateInArray(site.accommodations, i, { buttonLabel: v }))} placeholder="Visit Website" />
                        </div>
                        <p className="text-[10px] text-[var(--dash-text)]/40 mt-1">Fill in phone, email, or website to show a contact button. Multiple options create a dropdown.</p>
                      </SortableCard>
                    )}
                  </SortableList>
                  <AddButton label="Add Accommodation" onClick={() => set("accommodations", [...site.accommodations, { name: "", distance: "", description: "", discountCode: "", bookingUrl: "" }])} />
                </div>
              );

              if (type === "rsvp") return (
                <div>
                  <SectionTitle>RSVP Settings</SectionTitle>
                  {renderBg("RSVP Background Image")}
                  <Field label="Heading" value={site.rsvpHeading} onChange={(v) => set("rsvpHeading", v)} />
                  <Field label="Deadline Text" value={site.rsvpDeadlineText} onChange={(v) => set("rsvpDeadlineText", v)} />

                  <div className="mt-10 pt-8 border-t border-[var(--dash-text)]/10">
                    <Label>Email Notifications</Label>
                    <p className="text-[10px] text-[var(--dash-text)]/40 mb-4 uppercase tracking-wider">Get notified when guests RSVP and send them a confirmation</p>
                    <Field label="Your Email" value={site.coupleEmail || ""} onChange={(v) => set("coupleEmail", v)} placeholder="you@example.com — receive RSVP notifications" />
                    <Field label="Custom Confirmation Message" value={site.rsvpConfirmationMessage || ""} onChange={(v) => set("rsvpConfirmationMessage", v)} placeholder="Optional message to include in the guest's confirmation email" multiline rows={3} />
                  </div>
                </div>
              );

              if (type === "gift") return (
                <div>
                  <SectionTitle>Gift Registry</SectionTitle>
                  {renderBg("Gift Background Image")}
                  <Field label="Heading" value={site.giftHeading} onChange={(v) => set("giftHeading", v)} />
                  <Field label="Subheading" value={site.giftSubheading} onChange={(v) => set("giftSubheading", v)} multiline rows={3} />
                  <Field label="Footnote / Thank You Message" value={site.giftNote || ""} onChange={(v) => set("giftNote", v)} multiline rows={2} placeholder="e.g. Thank you for your generosity!" />
                  <div className="mt-8 mb-4 p-4 bg-[var(--dash-text)]/5 border border-[var(--dash-text)]/10 rounded-sm flex items-center justify-between">
                    <div>
                      <Label>Add Gift Items</Label>
                      <p className="text-[10px] text-[var(--dash-text)]/40 mt-1 uppercase tracking-wider">
                        {(site.giftEnableContributions ?? true)
                          ? "Guests pick from your gift list, then contribute an amount"
                          : "Guests go straight to the contribution form"}
                      </p>
                    </div>
                    <button
                      onClick={() => set("giftEnableContributions", !(site.giftEnableContributions ?? true))}
                      className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${(site.giftEnableContributions ?? true) ? "bg-[var(--dash-btn-bg)]" : "bg-[var(--dash-text)]/15"}`}
                    >
                      <span className={`absolute top-1 w-5 h-5 bg-[var(--dash-surface)] rounded-full shadow-sm transition-transform ${(site.giftEnableContributions ?? true) ? "left-6" : "left-1"}`} />
                    </button>
                  </div>

                  <div className="mb-4 p-4 bg-[var(--dash-text)]/5 border border-[var(--dash-text)]/10 rounded-sm flex items-center justify-between">
                    <div>
                      <Label>Show Guest Name Field</Label>
                      <p className="text-[10px] text-[var(--dash-text)]/40 mt-1 uppercase tracking-wider">Ask guests for their name on the contribution form</p>
                    </div>
                    <button
                      onClick={() => set("giftShowName", !(site.giftShowName ?? false))}
                      className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${(site.giftShowName ?? false) ? "bg-[var(--dash-btn-bg)]" : "bg-[var(--dash-text)]/15"}`}
                    >
                      <span className={`absolute top-1 w-5 h-5 bg-[var(--dash-surface)] rounded-full shadow-sm transition-transform ${(site.giftShowName ?? false) ? "left-6" : "left-1"}`} />
                    </button>
                  </div>

                  {/* Gift Items — only when toggle is on */}
                  {(site.giftEnableContributions ?? true) && (
                    <div className="mt-4 mb-10 animate-in fade-in slide-in-from-top-2 duration-300">
                      <Label>Gift Items</Label>
                      <p className="text-[10px] text-[var(--dash-text)]/40 mb-4 uppercase tracking-wider">Add gifts guests can contribute towards</p>

                      <SortableList
                        items={site.giftItems || []}
                        prefix={`gifts-${id}`}
                        onReorder={(items) => set("giftItems", items)}
                      >
                        {(item, i, sid) => (
                          <SortableCard key={sid} id={sid} title={item.name || `Gift ${i + 1}`} onRemove={() => set("giftItems", removeFromArray(site.giftItems || [], i))}>
                            <Field label="Name" value={item.name} onChange={(v) => set("giftItems", updateInArray(site.giftItems || [], i, { name: v }))} placeholder="e.g. Honeymoon Fund, KitchenAid Mixer" />
                            <Field label="Description" value={item.description} onChange={(v) => set("giftItems", updateInArray(site.giftItems || [], i, { description: v }))} placeholder="A short note about this gift" multiline rows={2} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <Field label="Suggested Amount" value={item.suggestedAmount || ""} onChange={(v) => set("giftItems", updateInArray(site.giftItems || [], i, { suggestedAmount: v }))} placeholder="e.g. 50" />
                              <Field label="Image URL (optional)" value={item.imageUrl || ""} onChange={(v) => set("giftItems", updateInArray(site.giftItems || [], i, { imageUrl: v }))} placeholder="https://..." />
                            </div>
                          </SortableCard>
                        )}
                      </SortableList>
                      <AddButton label="Add Gift Item" onClick={() => set("giftItems", [...(site.giftItems || []), { id: `gift-${Date.now()}`, name: "", description: "", suggestedAmount: "" }])} />
                    </div>
                  )}

                  <div className="mt-8 mb-10">
                    <Label>External Registry Links</Label>
                    <p className="text-[10px] text-[var(--dash-text)]/40 mb-4 uppercase tracking-wider">Link each account to the currencies it accepts</p>

                    <SortableList
                      items={site.giftPaymentLinks || []}
                      prefix={`reg-${id}`}
                      onReorder={(items) => set("giftPaymentLinks", items)}
                    >
                      {(link, i, sid) => (
                        <SortableCard key={sid} id={sid} onRemove={() => set("giftPaymentLinks", removeFromArray(site.giftPaymentLinks || [], i))}>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Field label="Label" value={link.label} onChange={(v) => set("giftPaymentLinks", updateInArray(site.giftPaymentLinks || [], i, { label: v }))} placeholder="e.g. PayPal, Revolut" />
                            <Field label="URL" value={link.url} onChange={(v) => set("giftPaymentLinks", updateInArray(site.giftPaymentLinks || [], i, { url: v }))} placeholder="https://..." />
                          </div>
                          <div className="mt-3">
                            <CurrencyPicker
                              selected={link.currencies || []}
                              onChange={(currencies) => set("giftPaymentLinks", updateInArray(site.giftPaymentLinks || [], i, { currencies }))}
                            />
                          </div>
                        </SortableCard>
                      )}
                    </SortableList>
                    <AddButton label="Add Registry/Payment Link" onClick={() => set("giftPaymentLinks", [...(site.giftPaymentLinks || []), { label: "", url: "", currencies: [] }])} />
                  </div>

                  <div className="mt-8">
                    <Label>Bank & Payment Options</Label>
                    <p className="text-[10px] text-[var(--dash-text)]/40 mb-4 uppercase tracking-wider">Add bank details with their accepted currencies</p>

                    <SortableList
                      items={site.giftBankDetails || []}
                      prefix={`banks-${id}`}
                      onReorder={(items) => set("giftBankDetails", items)}
                    >
                      {(bank, i, sid) => (
                        <SortableCard key={sid} id={sid} title={bank.label || `Option ${i + 1}`} onRemove={() => set("giftBankDetails", removeFromArray(site.giftBankDetails || [], i))}>
                          <Field label="Method Label" value={bank.label} onChange={(v) => set("giftBankDetails", updateInArray(site.giftBankDetails || [], i, { label: v }))} placeholder="e.g. Wise (International) or UK Bank" />
                          <div className="mt-3 mb-3">
                            <CurrencyPicker
                              selected={bank.currencies || []}
                              onChange={(currencies) => set("giftBankDetails", updateInArray(site.giftBankDetails || [], i, { currencies }))}
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Field label="Account Holder" value={bank.accountHolder || ""} onChange={(v) => set("giftBankDetails", updateInArray(site.giftBankDetails || [], i, { accountHolder: v }))} />
                            <Field label="Bank Name" value={bank.bankName || ""} onChange={(v) => set("giftBankDetails", updateInArray(site.giftBankDetails || [], i, { bankName: v }))} />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Field label="Account Number" value={bank.accountNumber || ""} onChange={(v) => set("giftBankDetails", updateInArray(site.giftBankDetails || [], i, { accountNumber: v }))} />
                            <Field label="Sort Code" value={bank.sortCode || ""} onChange={(v) => set("giftBankDetails", updateInArray(site.giftBankDetails || [], i, { sortCode: v }))} />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Field label="SWIFT/BIC" value={bank.swiftCode || ""} onChange={(v) => set("giftBankDetails", updateInArray(site.giftBankDetails || [], i, { swiftCode: v }))} />
                            <Field label="Email (for e-transfer)" value={bank.email || ""} onChange={(v) => set("giftBankDetails", updateInArray(site.giftBankDetails || [], i, { email: v }))} />
                          </div>
                          <Field label="Direct Payment Link (Wise, Venmo, PayPal)" value={bank.payLink || ""} onChange={(v) => set("giftBankDetails", updateInArray(site.giftBankDetails || [], i, { payLink: v }))} placeholder="https://wise.com/pay/..." />
                        </SortableCard>
                      )}
                    </SortableList>
                    <AddButton label="Add Payment Method" onClick={() => set("giftBankDetails", [...(site.giftBankDetails || []), { label: "", accountHolder: "" }])} />
                  </div>
                </div>
              );

              if (type === "contact") return (
                <div>
                  <SectionTitle>Contact Info</SectionTitle>
                  {renderBg("Contact Background Image")}
                  <Field label="Contact Heading" value={site.contactHeading || ""} onChange={(v) => set("contactHeading", v)} />
                  <SortableList items={site.contactEntries} prefix={`contacts-${id}`} onReorder={(items) => set("contactEntries", items)}>
                    {(c, i, sid) => (
                      <SortableCard key={sid} id={sid} onRemove={() => set("contactEntries", removeFromArray(site.contactEntries, i))}>
                        <Field label="Email" value={c.email} onChange={(v) => set("contactEntries", updateInArray(site.contactEntries, i, { email: v }))} />
                        <Field label="Phone" value={c.phone || ""} onChange={(v) => set("contactEntries", updateInArray(site.contactEntries, i, { phone: v }))} />
                      </SortableCard>
                    )}
                  </SortableList>
                  <AddButton label="Add Contact" onClick={() => set("contactEntries", [...site.contactEntries, { email: "", phone: "" }])} />
                </div>
              );

              if (type === "footer") return (
                <div>
                  <SectionTitle>Footer</SectionTitle>
                  {renderBg("Footer Background Image")}
                  <Field label="Names" value={site.footerNames} onChange={(v) => set("footerNames", v)} />
                  <Field label="Date Text" value={site.footerDateText} onChange={(v) => set("footerDateText", v)} />
                  <Field label="Copyright" value={site.footerCopyright} onChange={(v) => set("footerCopyright", v)} />
                </div>
              );

              return null;
            })()}
            </div>
          </div>

          {/* Draggable Divider */}
          {isPreview && (
            <div 
              onMouseDown={startResizing}
              onTouchStart={startResizing}
              className="w-1.5 h-full cursor-col-resize hover:bg-[var(--dash-text)]/10 active:bg-[var(--dash-text)]/20 transition-colors flex items-center justify-center group relative z-10 mx-1"
            >
              <div className="w-px h-12 bg-[var(--dash-text)]/10 group-hover:bg-[var(--dash-text)]/30 group-active:bg-[var(--dash-text)]/50 transition-colors" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-8 bg-transparent" /> {/* Larger hit area */}
            </div>
          )}

          {/* Preview Column */}
          {isPreview && (
            <div
              style={{ width: `${100 - editorWidth}%`, maxWidth: `${100 - editorWidth}%` }}
              className="sticky top-[3.5rem] h-[calc(100vh-3.5rem)] border border-[var(--dash-text)]/10 bg-[var(--dash-surface)] rounded-sm overflow-hidden flex flex-col shadow-xl transition-all min-w-0 shrink-0 hidden lg:flex"
            >
              <div className="bg-[var(--dash-text)]/[0.02] border-b border-[var(--dash-text)]/10 px-4 py-2 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--dash-text)]/40">Real-time Preview</span>
                <span className="text-[10px] text-[var(--dash-text)]/30">{previewDevice === "desktop" ? "Desktop Mode" : "Mobile View"} &bull; Auto-syncing</span>
              </div>
              <div className={`flex-1 overflow-hidden flex justify-center min-w-0 ${previewDevice === "mobile" ? "bg-[var(--dash-text)]/5 items-stretch py-3" : "bg-[var(--dash-text)]/[0.06] p-0 lg:p-4"}`}>
                <div
                  ref={previewContainerRef}
                  style={{ containerType: "inline-size" }}
                  className={`bg-[var(--dash-surface)] shadow-2xl transition-all origin-top overflow-y-auto overflow-x-hidden ${
                    previewDevice === "mobile" ? "w-[393px] max-w-full rounded-md border border-[var(--dash-text)]/10" : "w-full h-full"
                  } ${isDragging ? "pointer-events-none" : ""}`}

                  onClick={(e) => {
                    // Intercept anchor clicks in preview to prevent navigation
                    const target = (e.target as HTMLElement).closest("a");
                    if (target) {
                      e.preventDefault();
                      const href = target.getAttribute("href");
                      if (href?.startsWith("#")) {
                        const sectionId = href.slice(1);
                        handleTabChange(sectionId);
                      }
                    }
                  }}
                >
                  {site.layoutId === "modern" ? (
                    <ModernTemplate site={site} isPreview onFieldUpdate={handleFieldUpdate} />
                  ) : (
                    <ClassicTemplate site={site} isPreview onFieldUpdate={handleFieldUpdate} />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        )}
      </div>

      {/* Mobile full-screen preview overlay */}
      {isMobile && isPreview && view === "website" && (
        <div className="fixed inset-0 z-[100] bg-[var(--dash-surface)] flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--dash-text)]/10 bg-[var(--dash-bg)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--dash-text)]/40">Preview</span>
            <button
              onClick={() => setIsPreview(false)}
              className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-[var(--dash-btn-bg)] text-[var(--dash-btn-text)] rounded-sm"
            >
              Back to Edit
            </button>
          </div>
          <div className="flex-1 overflow-y-auto" style={{ containerType: "inline-size" }}>
            {site.layoutId === "modern" ? (
              <ModernTemplate site={site} isPreview onFieldUpdate={handleFieldUpdate} />
            ) : (
              <ClassicTemplate site={site} isPreview onFieldUpdate={handleFieldUpdate} />
            )}
          </div>
        </div>
      )}

      {/* URL Rename Confirmation Modal */}
      {showRenameConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowRenameConfirm(false)}>
          <div className="bg-[var(--dash-bg)] border border-[var(--dash-text)]/15 rounded-sm p-6 max-w-sm mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-medium mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Change Site URL</h3>
            <p className="text-sm text-[var(--dash-text)]/60 mb-2">Your site will move to:</p>
            <p className="text-sm font-medium text-[var(--dash-text)] bg-[var(--dash-text)]/5 border border-[var(--dash-text)]/10 rounded-sm px-3 py-2 mb-4 break-all">
              {site.slug}.ithinkshewifey.com
            </p>
            <p className="text-[10px] text-[var(--dash-text)]/40 uppercase tracking-wider mb-6">
              This will change your public website link. You will be redirected to the new dashboard.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowRenameConfirm(false)}
                className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--dash-text)]/50 hover:text-[var(--dash-text)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowRenameConfirm(false);
                  handleSave(false, true);
                }}
                className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-[var(--dash-btn-bg)] text-[var(--dash-bg)] rounded-sm hover:opacity-90 transition-opacity"
              >
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Domain Request Modal */}
      {showCancelDomainModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowCancelDomainModal(false)}>
          <div className="bg-[var(--dash-bg)] border border-[var(--dash-text)]/15 rounded-sm p-6 max-w-sm mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-medium mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Cancel Domain Request</h3>
            <p className="text-sm text-[var(--dash-text)]/60 mb-2">
              Are you sure you want to cancel your request for <strong>{site.customDomain}</strong>?
            </p>
            <p className="text-[10px] text-[var(--dash-text)]/40 uppercase tracking-wider mb-6">
              You can always request a new domain later.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowCancelDomainModal(false)}
                className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--dash-text)]/50 hover:text-[var(--dash-text)] transition-colors"
              >
                Keep Request
              </button>
              <button
                onClick={async () => {
                  setShowCancelDomainModal(false);
                  await fetch(`/api/sites/${site.slug}/domain-request`, { method: "DELETE" });
                  set("customDomain", null);
                }}
                className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-red-600 text-red-50 rounded-sm hover:bg-red-500 transition-colors"
              >
                Cancel Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Error Modal */}
      {showSaveErrorModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowSaveErrorModal(null)}>
          <div className="bg-[var(--dash-bg)] border border-[var(--dash-text)]/15 rounded-sm p-6 max-w-sm mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-medium mb-1 text-red-500" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Save Failed</h3>
            <p className="text-sm text-[var(--dash-text)]/70 mb-2 break-words">{showSaveErrorModal}</p>
            <p className="text-[10px] text-[var(--dash-text)]/40 uppercase tracking-wider mb-6">
              Your changes have not been saved. Please check your connection and try again.
            </p>
            <div className="flex items-center justify-end">
              <button
                onClick={() => setShowSaveErrorModal(null)}
                className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-[var(--dash-btn-bg)] text-[var(--dash-bg)] rounded-sm hover:opacity-90 transition-opacity"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Easy Mode */}
      {easyModeOpen ? (
        <EasyMode site={site} set={set} onClose={() => setEasyModeOpen(false)} />
      ) : !easyModeDismissed && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-1.5">
          <button
            onClick={() => setEasyModeOpen(true)}
            className="flex items-center gap-2 bg-[var(--dash-btn-bg)] text-[var(--dash-btn-text)] px-5 py-2.5 rounded-full shadow-lg hover:opacity-90 transition-opacity text-[12px] font-bold uppercase tracking-wider"
          >
            <span>✦</span>
            Easy Mode
          </button>
          <button
            onClick={() => setEasyModeDismissed(true)}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-[var(--dash-btn-bg)] text-[var(--dash-btn-text)] shadow-lg hover:opacity-90 transition-opacity text-xs"
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
