"use client";

import { useState, useRef, useId, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type {
  WeddingSite,
  WeddingDay,
  VenueItem,
  ScheduleItem,
  MenuItem,
  GalleryImage,
  ExploreGroup,
  AccommodationItem,
  ContactEntry,
  VenueInfoBlock,
} from "@/lib/types/wedding-site";
import { DEFAULT_SECTION_ORDER, SECTION_LABELS, type SectionConfig } from "@/lib/types/wedding-site";
import { themes, fontStyles } from "@/lib/themes";
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

const STATIC_TABS = ["Basics", "Layout"] as const;
type Tab = string; // Allows dynamic tabs like "story-123"

// ─── Primitives ───

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-[#2d2b25]/60 mb-3 mt-8 first:mt-0">
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
          className="w-full px-3 py-2 border border-[#2d2b25]/15 bg-white/50 text-[#2d2b25] text-sm outline-none focus:border-[#2d2b25]/40 resize-y rounded-sm"
        />
      ) : (
        <input
          type={type}
          value={val} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-[#2d2b25]/15 bg-white/50 text-[#2d2b25] text-sm outline-none focus:border-[#2d2b25]/40 rounded-sm"
        />
      )}
    </div>
  );
}

function DateTimePicker({ label, value, onChange }: { 
  label: string; 
  value: string; 
  onChange: (v: string) => void 
}) {
  const formatDateTime = (iso: string) => {
    if (!iso) return { date: "", time: "" };
    try {
      const d = new Date(iso);
      const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
      return { date, time };
    } catch (e) {
      return { date: "", time: "" };
    }
  };

  const formatForInput = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const { date, time } = formatDateTime(value);
  
  return (
    <div className="mb-4">
      <Label>{label}</Label>
      <div className="relative group">
        <input
          type="datetime-local"
          value={formatForInput(value)}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
        />
        <div className="flex items-center gap-2 w-full px-3 py-2 border border-[#2d2b25]/15 bg-white/50 text-[#2d2b25] text-sm outline-none focus-within:border-[#2d2b25]/40 rounded-sm transition-all group-hover:border-[#2d2b25]/30">
          <div className="text-[#2d2b25]/30">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div className="flex-1 flex justify-between items-center pr-1 overflow-hidden">
             <span className={`truncate ${value ? "text-[#2d2b25]" : "text-[#2d2b25]/30"}`}>
               {value ? date : "Select Date"}
             </span>
             <span className={`flex-shrink-0 ${value ? "text-[#2d2b25]/60 font-medium" : "text-[#2d2b25]/20"}`}>
               {value ? time : "--:--"}
             </span>
          </div>
          <div className="text-[#2d2b25]/20">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
      </div>
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
             className="w-full pl-9 pr-3 py-2 border border-[#2d2b25]/15 bg-white/50 text-[#2d2b25] text-sm outline-none focus:border-[#2d2b25]/40 rounded-sm transition-all group-hover:border-[#2d2b25]/30"
           />
           <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2d2b25]/30 group-focus-within:text-[#2d2b25]/50 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
           </div>
        </div>
        <div className="flex border border-[#2d2b25]/15 rounded-sm overflow-hidden bg-white/50">
          {(["AM", "PM"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onChange(hour, p)}
              className={`px-3 py-2 text-[10px] font-bold transition-all ${
                period === p ? "bg-[#2d2b25] text-[#faf1e1]" : "text-[#2d2b25]/40 hover:text-[#2d2b25] hover:bg-[#2d2b25]/5"
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
    <div className="border border-[#2d2b25]/10 bg-white/40 p-4 rounded-sm mb-3 relative">
      {title && <p className="text-xs font-semibold tracking-wide uppercase text-[#2d2b25]/40 mb-3">{title}</p>}
      {onRemove && (
        <button onClick={onRemove} type="button"
          className="absolute top-3 right-3 text-[#2d2b25]/30 hover:text-red-500 text-lg leading-none transition-colors"
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
      className="text-xs font-semibold tracking-[0.1em] uppercase text-[#2d2b25]/50 border border-dashed border-[#2d2b25]/20 px-4 py-2 hover:border-[#2d2b25]/40 hover:text-[#2d2b25] transition-colors w-full mt-1 mb-4 rounded-sm"
    >+ {label}</button>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>{children}</h2>;
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
      <div className="flex gap-2 mt-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id as any)}
            className={`group relative flex flex-col items-center gap-1.5 p-1 rounded-sm transition-all ${
              value === opt.id ? "bg-[#2d2b25]/5" : "hover:bg-[#2d2b25]/5"
            }`}
          >
            <div 
              className={`w-8 h-8 rounded-full border ${opt.border} border-[#2d2b25]/20 shadow-sm transition-transform group-hover:scale-105 ${
                value === opt.id ? "ring-2 ring-[#2d2b25] ring-offset-2" : ""
              }`}
              style={{ backgroundColor: opt.color }}
            />
            <span className={`text-[9px] font-bold uppercase tracking-wider ${
              value === opt.id ? "text-[#2d2b25]" : "text-[#2d2b25]/40"
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
  const [libTab, setLibTab] = useState<"uploads" | "recent">("uploads");

  useEffect(() => {
    async function loadMedia() {
      setLoading(true);
      try {
        const res = await fetch("/api/media");
        const data = await res.json();
        
        if (data.error) {
          console.error("Library API error:", data.error);
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2d2b25]/60 backdrop-blur-sm p-4">
      <div className="bg-[#faf1e1] w-full max-w-4xl max-h-[80vh] flex flex-col rounded-sm shadow-2xl border border-[#2d2b25]/10">
        <div className="p-6 border-b border-[#2d2b25]/10 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-serif italic">Media Library</h2>
            <div className="flex gap-4 mt-2">
              <button 
                onClick={() => setLibTab("uploads")}
                className={`text-[10px] font-bold uppercase tracking-widest pb-1 border-b-2 transition-all ${libTab === "uploads" ? "border-[#2d2b25] text-[#2d2b25]" : "border-transparent text-[#2d2b25]/40 hover:text-[#2d2b25]/60"}`}
              >
                Uploads
              </button>
              <button 
                onClick={() => setLibTab("recent")}
                className={`text-[10px] font-bold uppercase tracking-widest pb-1 border-b-2 transition-all ${libTab === "recent" ? "border-[#2d2b25] text-[#2d2b25]" : "border-transparent text-[#2d2b25]/40 hover:text-[#2d2b25]/60"}`}
              >
                Recently Used {recentLinks.length > 0 && `(${recentLinks.length})`}
              </button>
              <button 
                onClick={() => {
                  setImages([]);
                  setLoading(true);
                  async function refresh() {
                    try {
                      const res = await fetch("/api/media");
                      const data = await res.json();
                      if (data.images) setImages(data.images);
                    } catch (err) {
                      console.error("Refresh failed", err);
                    } finally {
                      setLoading(false);
                    }
                  }
                  refresh();
                }}
                className="text-[10px] font-bold uppercase tracking-widest text-[#2d2b25]/40 hover:text-[#2d2b25] ml-4 flex items-center gap-1"
              >
                <svg className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
          <button onClick={onClose} className="text-[#2d2b25]/40 hover:text-[#2d2b25] text-2xl">&times;</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {libTab === "uploads" ? (
            loading ? (
              <div className="flex items-center justify-center h-64 text-[#2d2b25]/40 italic uppercase tracking-widest text-xs">Loading your media...</div>
            ) : images.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-[#2d2b25]/40 gap-4">
                <p className="italic">Your library is empty.</p>
                <p className="text-[10px] uppercase tracking-widest text-center max-w-xs">Upload images using the "Upload" button in the editor to see them here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((img) => (
                  <button
                    key={img.key}
                    onClick={() => { onSelect(img.url); onClose(); }}
                    className="group relative aspect-square bg-white border border-[#2d2b25]/5 hover:border-[#2d2b25]/40 transition-all overflow-hidden rounded-sm"
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-[#2d2b25]/0 group-hover:bg-[#2d2b25]/10 transition-colors" />
                  </button>
                ))}
              </div>
            )
          ) : (
            recentLinks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-[#2d2b25]/40 gap-4">
                <p className="italic">No recently used links yet.</p>
                <p className="text-[10px] uppercase tracking-widest text-center max-w-xs">Any images you paste as a URL or upload will appear here for easy re-use.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recentLinks.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => { onSelect(url); onClose(); }}
                    className="group relative aspect-square bg-white border border-[#2d2b25]/5 hover:border-[#2d2b25]/40 transition-all overflow-hidden rounded-sm"
                  >
                    <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-[#2d2b25]/0 group-hover:bg-[#2d2b25]/10 transition-colors" />
                    <div className="absolute bottom-1 left-1 bg-white/80 px-1 py-0.5 rounded-[1px] text-[8px] uppercase tracking-widest font-bold text-[#2d2b25]/60 shadow-sm border border-[#2d2b25]/5">Recent</div>
                  </button>
                ))}
              </div>
            )
          )}
        </div>
        
        <div className="p-4 border-t border-[#2d2b25]/5 bg-[#2d2b25]/[0.02] text-right">
          <button onClick={onClose} className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-[#2d2b25]/60 hover:text-[#2d2b25]">Close Library</button>
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
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      if (!confirm("This image is quite large (>5MB). Large images can slow down your site. Would you like to proceed anyway?")) {
        return;
      }
    }
    setUploading(true);
    try {
      const url = await uploadFile(file);
      onChange(url);
      if (onAddRecentLink) onAddRecentLink(url);
    } catch (err: any) {
      alert(err.message || "Upload failed");
    }
    setUploading(false);
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
      <div className="flex gap-2">
        <input
          value={value} 
          onChange={(e) => {
            onChange(e.target.value);
            if (e.target.value && onAddRecentLink) onAddRecentLink(e.target.value);
          }}
          onPaste={handlePaste}
          placeholder="Paste URL or paste image directly (Ctrl+V)"
          className="flex-1 px-3 py-2 border border-[#2d2b25]/15 bg-white/50 text-[#2d2b25] text-sm outline-none focus:border-[#2d2b25]/40 rounded-sm"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="px-3 py-2 text-xs font-semibold tracking-wide uppercase border border-red-500/30 text-red-600/80 hover:text-red-700 hover:border-red-500/50 hover:bg-red-50 transition-colors rounded-sm whitespace-nowrap"
          >
            Clear
          </button>
        )}
        <button
          type="button"
          onClick={() => setShowLibrary(true)}
          className="px-3 py-2 text-xs font-semibold tracking-wide uppercase border border-[#2d2b25]/15 text-[#2d2b25]/60 hover:text-[#2d2b25] hover:border-[#2d2b25]/30 transition-colors rounded-sm whitespace-nowrap"
        >
          Library
        </button>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="px-3 py-2 text-xs font-semibold tracking-wide uppercase border border-[#2d2b25]/15 text-[#2d2b25]/60 hover:text-[#2d2b25] hover:border-[#2d2b25]/30 transition-colors rounded-sm disabled:opacity-50 whitespace-nowrap"
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
      <p className="text-[9px] text-[#2d2b25]/40 mt-1 uppercase tracking-tighter">
        Tip: You can paste a Canva "Shared Link" here, or upload an optimized image for better speed.
      </p>
      {value && (
        <img src={value} alt="Preview" className="w-full max-w-xs h-32 object-cover rounded-sm border border-[#2d2b25]/10 mt-2" />
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
    </div>
  );
}

// ─── Drag Handle ───

function DragHandle({ listeners, attributes }: { listeners?: Record<string, Function>; attributes?: Record<string, any> }) {
  return (
    <button
      type="button"
      className="absolute top-3 left-3 cursor-grab active:cursor-grabbing text-[#2d2b25]/25 hover:text-[#2d2b25]/50 touch-none"
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
      <div className="border border-[#2d2b25]/10 bg-white/40 p-4 pl-10 rounded-sm mb-3 relative">
        <DragHandle listeners={listeners} attributes={attributes} />
        {title && <p className="text-xs font-semibold tracking-wide uppercase text-[#2d2b25]/40 mb-3">{title}</p>}
        {onRemove && (
          <button onClick={onRemove} type="button"
            className="absolute top-3 right-3 text-[#2d2b25]/30 hover:text-red-500 text-lg leading-none transition-colors"
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

// ─── Main Editor ───

export default function DashboardEditor({ site: initial }: { site: WeddingSite }) {
  const router = useRouter();
  
  const [site, setSite] = useState(initial);
  
  // History stacks
  const [past, setPast] = useState<WeddingSite[]>([]);
  const [future, setFuture] = useState<WeddingSite[]>([]);

  const [tab, setTab] = useState<Tab>("Basics");
  
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
    }, 3000); // 3 second lock to allow preview to settle
    return () => clearTimeout(timer);
  }, []);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true); // Start as saved
  const [saveError, setSaveError] = useState<string | null>(null);
  const saveRetryCountRef = useRef(0);
  const MAX_SAVE_RETRIES = 2;
  const [isPreview, setIsPreview] = useState(true);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [editorWidth, setEditorWidth] = useState(40); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const isResizing = useRef(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
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
    lastManualTabClick.current = Date.now();
    
    // Static tabs (Basics, Layout) don't correspond to a specific scrollable section
    const isStatic = (STATIC_TABS as readonly string[]).includes(newTab);

    if (!isStatic && isPreview && iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({
        type: "SCROLL_TO_SECTION",
        sectionId: newTab
      }, "*");
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

  // Send updates to preview iframe
  useEffect(() => {
    if (isPreview && iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({ 
        type: "UPDATE_SITE", 
        site 
      }, "*");
    }
  }, [site, isPreview]);

  // Handle messages from iframe
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "PREVIEW_READY") {
        iframeRef.current?.contentWindow?.postMessage({
          type: "UPDATE_SITE",
          site
        }, "*");

        // NEW: Scroll to current tab on load if it's a dynamic section
        const isStatic = (STATIC_TABS as readonly string[]).includes(tab);
        if (!isStatic && isPreview) {
          // Add a small delay to ensure iframe layout is fully settled
          setTimeout(() => {
            iframeRef.current?.contentWindow?.postMessage({
              type: "SCROLL_TO_SECTION",
              sectionId: tab.toLowerCase() === "hero" ? "hero" : tab
            }, "*");
          }, 100);
        }
      }

      if (event.data?.type === "SECTION_IN_VIEW") {
        // If we recently clicked a tab OR if we are still initializing, 
        // ignore scroll-sync messages to prevent hijacking the user's view
        if (isInitialMount.current) return;
        if (Date.now() - lastManualTabClick.current < 1000) return;

        // NEW: If we're on a static tab (Basics, Layout), don't allow scroll-sync to change it.
        const isStatic = (STATIC_TABS as readonly string[]).includes(tab);
        if (isStatic) return;

        const sectionId = event.data.sectionId;
        // In the standardized system, the sectionId IS the tab ID
        if (sectionId && sectionId !== tab) {
          setTab(sectionId);
        }
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [site, tab]);
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

  function handleMouseMove(e: MouseEvent) {
    if (!isResizing.current) return;
    const newWidth = (e.clientX / window.innerWidth) * 100;
    if (newWidth > 20 && newWidth < 80) {
      setEditorWidth(newWidth);
    }
  }

  function handleTouchMove(e: TouchEvent) {
    if (!isResizing.current) return;
    const newWidth = (e.touches[0].clientX / window.innerWidth) * 100;
    if (newWidth > 20 && newWidth < 80) {
      setEditorWidth(newWidth);
    }
  }

  function set<K extends keyof WeddingSite>(key: K, value: WeddingSite[K]) {
    setPast((p) => [...p.slice(-49), site]); // Keep last 50 states
    setFuture([]); // Clear redo on new change
    setSite((s) => ({ ...s, [key]: value }));
    setSaved(false);
  }

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

  async function handleSave(isRetry = false) {
    // 1. Check for slug rename
    if (site.slug !== initial.slug) {
      const confirmRename = window.confirm(
        `Are you sure you want to change your URL to /${site.slug}?\n\nThis will change your public website link and you will be redirected to the new dashboard.`
      );
      if (!confirmRename) return;
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
        setTimeout(() => handleSave(true), 2000);
        return; // Don't clear saving state yet
      }

      setSaveError(message);
      saveRetryCountRef.current = 0;
      alert(`${message}\n\nYour changes have NOT been saved. Please check your connection and try again.`);
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
    <div className="min-h-screen bg-[#faf1e1]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* ... Existing Head/Scripts ... */}
      
      {!site.isPaid && (
        <div className="fixed inset-0 z-[200] bg-[#faf1e1]/80 backdrop-blur-md flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-white p-8 rounded-sm shadow-2xl border border-[#2d2b25]/10">
            <h2 className="text-2xl font-serif italic mb-4">Complete your setup</h2>
            <p className="text-[#2d2b25]/60 mb-8 leading-relaxed">
              Your wedding site is ready to be built! To publish your site and access all features, 
              there is a one-time fee of <strong>$29.00</strong>.
            </p>
            <ul className="text-left text-sm text-[#2d2b25]/70 space-y-3 mb-8 px-4">
              <li className="flex gap-3 items-start">
                <svg className="shrink-0 text-green-600 mt-0.5" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                Unlimited image uploads & media library
              </li>
              <li className="flex gap-3 items-start">
                <svg className="shrink-0 text-green-600 mt-0.5" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                Custom URL (e.g. ithinkshewifey.com/amyandjack)
              </li>
              <li className="flex gap-3 items-start">
                <svg className="shrink-0 text-green-600 mt-0.5" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                Google Sheets RSVP synchronization
              </li>
            </ul>
            <button
              onClick={handleCheckout}
              disabled={isPaying}
              className="w-full py-4 bg-[#2d2b25] text-[#faf1e1] font-bold uppercase tracking-widest text-xs rounded-sm hover:opacity-90 disabled:opacity-50 transition-all shadow-lg"
            >
              {isPaying ? "Preparing Checkout..." : "Unlock Full Access — $29"}
            </button>
            <form action="/api/auth/logout" method="POST" className="mt-6">
              <button type="submit" className="text-[10px] uppercase tracking-widest font-bold text-[#2d2b25]/30 hover:text-[#2d2b25] transition-colors">
                Sign Out
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#2d2b25]/[0.08] bg-[#faf1e1]/95 backdrop-blur-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-base hidden sm:block" style={{ fontFamily: "'Playfair Display', serif" }}>
              I Think She Wifey
            </a>
            <a href="/" className="text-base sm:hidden font-serif italic">ITSW</a>
            <span className="text-[#2d2b25]/30">/</span>
            <span className="text-xs sm:text-sm text-[#2d2b25]/60 truncate max-w-[100px] sm:max-w-none">{site.partner1Name} & {site.partner2Name}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-1 bg-[#2d2b25]/5 p-1 rounded-sm">
              <button
                onClick={undo}
                disabled={past.length === 0}
                className="p-1.5 rounded-sm hover:bg-white disabled:opacity-30 transition-all text-[#2d2b25]"
                title="Undo (Ctrl+Z)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
              </button>
              <button
                onClick={redo}
                disabled={future.length === 0}
                className="p-1.5 rounded-sm hover:bg-white disabled:opacity-30 transition-all text-[#2d2b25]"
                title="Redo (Ctrl+Y)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
              </button>
            </div>

            <div className="flex items-center gap-1.5 px-1 sm:px-3">
              <div className={`w-1.5 h-1.5 rounded-full transition-colors flex-shrink-0 ${saveError ? "bg-red-500 animate-pulse" : saving ? "bg-amber-400 animate-pulse" : saved ? "bg-green-500" : "bg-amber-400"}`} />
              <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${saveError ? "text-red-600" : "text-[#2d2b25]/40"}`}>
                {saveError ? "Error" : saving ? "Saving" : saved ? "Saved" : "Changes"}
              </span>
            </div>

            <a href={`/${site.slug}`} target="_blank"
              className="hidden sm:block text-xs tracking-wide uppercase text-[#2d2b25]/50 hover:text-[#2d2b25] transition-colors">
              View
            </a>
            
            <div className="flex bg-[#2d2b25]/5 rounded-sm p-1">
              <button 
                onClick={() => setIsPreview(!isPreview)}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all ${
                  isPreview 
                  ? "bg-[#2d2b25] text-white shadow-sm" 
                  : "text-[#2d2b25]/60 hover:text-[#2d2b25]"
                }`}
              >
                {isPreview ? "Live" : "Edit"}
              </button>
            </div>

            <div className="hidden lg:flex bg-[#2d2b25]/5 rounded-sm p-1">
              <button 
                onClick={() => setPreviewDevice("desktop")}
                className={`px-2 py-1.5 rounded-sm transition-all ${
                  previewDevice === "desktop" ? "bg-white shadow-sm text-[#2d2b25]" : "text-[#2d2b25]/40 hover:text-[#2d2b25]/60"
                }`}
                title="Desktop Preview"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
              </button>
              <button 
                onClick={() => setPreviewDevice("mobile")}
                className={`px-2 py-1.5 rounded-sm transition-all ${
                  previewDevice === "mobile" ? "bg-white shadow-sm text-[#2d2b25]" : "text-[#2d2b25]/40 hover:text-[#2d2b25]/60"
                }`}
                title="Mobile Preview"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
              </button>
            </div>

            <form action="/api/auth/logout" method="POST" className="hidden sm:block">
              <button type="submit"
                className="text-xs tracking-wide uppercase text-[#2d2b25]/40 hover:text-red-500 transition-colors ml-1">
                Out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className={`mx-auto transition-all ${isPreview ? "max-w-[1600px] px-0 lg:px-4" : "max-w-6xl px-6"} py-4 lg:py-8 flex flex-col lg:flex-row gap-0 lg:gap-8`}>
        {/* Sidebar / Mobile Tabs */}
        <nav className={`shrink-0 lg:sticky lg:top-20 self-start transition-all ${isPreview ? "lg:w-36" : "lg:w-44"} w-full overflow-x-auto lg:overflow-x-visible no-scrollbar mb-6 lg:mb-0 px-4 lg:px-0`}>
          <div className="flex lg:flex-col gap-1 min-w-max lg:min-w-0">
            {(() => {
              const order = site.sectionOrder ?? DEFAULT_SECTION_ORDER;
              const dynamicTabs: { label: string, id: string, type: string }[] = [
                { label: "Basics", id: "Basics", type: "static" },
                { label: "Layout", id: "Layout", type: "static" }
              ];
              
              const typeCounts: Record<string, number> = {};
              order.forEach(s => {
                const baseLabel = SECTION_LABELS[s.type] || SECTION_LABELS[s.id] || s.type;
                typeCounts[s.type] = (typeCounts[s.type] || 0) + 1;
                const label = typeCounts[s.type] > 1 ? `${baseLabel} ${typeCounts[s.type]}` : baseLabel;
                dynamicTabs.push({ label, id: s.id, type: s.type });
              });

              return dynamicTabs.map((t) => {
                const isHidden = t.type !== "static" && order.find(s => s.id === t.id)?.visible === false;

                return (
                  <button 
                    key={t.id} 
                    onClick={() => {
                      if (isHidden) {
                        alert(`The "${t.label}" section is currently hidden. Enable it in the "Layout" tab to edit its content and see it in the preview.`);
                        return;
                      }
                      handleTabChange(t.id);
                    }}
                    className={`whitespace-nowrap px-4 lg:px-3 py-2 text-[11px] lg:text-sm rounded-sm transition-all ${
                      tab === t.id 
                        ? "bg-[#2d2b25] text-[#faf1e1] shadow-sm font-bold" 
                        : isHidden
                          ? "text-[#2d2b25]/20 cursor-not-allowed italic"
                          : "text-[#2d2b25]/60 hover:text-[#2d2b25] hover:bg-[#2d2b25]/5"
                    }`}
                    title={isHidden ? `${t.label} is hidden in layout` : ""}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span>{t.label}</span>
                      {isHidden && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              });
            })()}
          </div>
        </nav>

        {/* Content Wrapper */}
        <div className={`flex flex-col lg:flex-row transition-all px-4 lg:px-0 ${isPreview ? "flex-1" : "flex-1 max-w-2xl gap-8"}`}>
          
          {/* Editor Column */}
          <div 
            style={isPreview ? { width: undefined } : { width: '100%' }}
            className={`transition-all ${isPreview ? "lg:flex-1 h-auto lg:h-[calc(100vh-10rem)] lg:overflow-y-auto lg:pr-6 custom-scrollbar" : "w-full"} ${isPreview && previewDevice === "desktop" ? "hidden lg:block" : "block"}`}
            // Only hide editor on small screens if we are in preview mode and want to see mobile preview
            // Actually, let's use isPreview to toggle between editor and preview on mobile
          >
            {/* Logic: if isPreview is true on mobile, show the iframe. if false, show editor. */}
            {(!isPreview || (isPreview && false)) && (
              // This is handled by the parent container logic
              null
            )}
            {/* The actual editor content is always rendered here, but hidden via classes on mobile */}
            <div className={isPreview ? "hidden lg:block" : "block"}>
              {/* ... existing dynamic content logic ... */}
            </div>
          </div>
            {(() => {
              if (tab === "Basics") return (
                <div>
                  <SectionTitle>Basic Info</SectionTitle>
                  
                  <div className="mb-6 p-4 bg-[#2d2b25]/5 border border-[#2d2b25]/10 rounded-sm">
                    <Label>Site URL</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-[#2d2b25]/40 shrink-0">ithinkshewifey.com/</span>
                      <input
                        type="text"
                        value={site.slug}
                        onChange={(e) => {
                          const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                          set("slug", val);
                        }}
                        className="flex-1 px-3 py-2 border border-[#2d2b25]/15 bg-white/50 text-[#2d2b25] text-sm font-medium outline-none focus:border-[#2d2b25]/40 rounded-sm"
                        placeholder="your-url-here"
                      />
                    </div>
                    <p className="text-[10px] text-[#2d2b25]/40 mt-2 uppercase tracking-wider">
                      Caution: Changing this will change your public website address.
                    </p>
                  </div>

                  <Field label="Partner 1 Name" value={site.partner1Name} onChange={(v) => set("partner1Name", v)} />
                  <Field label="Partner 2 Name" value={site.partner2Name} onChange={(v) => set("partner2Name", v)} />
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
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
                            ? "border-[#2d2b25] bg-[#2d2b25]/[0.02]"
                            : "border-[#2d2b25]/10 hover:border-[#2d2b25]/30"
                        }`}
                      >
                        <p className="text-sm font-bold text-[#2d2b25] uppercase tracking-tight">{layout.name}</p>
                        <p className="text-[10px] text-[#2d2b25]/50 mt-1 leading-tight">{layout.desc}</p>
                      </button>
                    ))}
                  </div>
                  <Label>Color Palette</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2 mb-6">
                    {themes.map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => set("templateId", theme.id)}
                        className={`relative text-left p-3 rounded-sm border-2 transition-all ${
                          site.templateId === theme.id
                            ? "border-[#2d2b25] shadow-sm bg-[#2d2b25]/[0.02]"
                            : "border-[#2d2b25]/10 hover:border-[#2d2b25]/30"
                        }`}
                      >
                        <div className="flex gap-1.5 mb-2">
                          <span className="w-5 h-5 rounded-full border border-black/10" style={{ background: theme.colors.primary }} />
                          <span className="w-5 h-5 rounded-full border border-black/10" style={{ background: theme.colors.accent }} />
                          <span className="w-5 h-5 rounded-full border border-black/10" style={{ background: theme.colors.dark }} />
                        </div>
                        <p className="text-[11px] font-bold uppercase tracking-tight text-[#2d2b25]">{theme.name}</p>
                        {site.templateId === theme.id && (
                          <span className="absolute top-2 right-2 text-[8px] font-bold uppercase tracking-widest text-[#2d2b25]/40">Active</span>
                        )}
                      </button>
                    ))}
                  </div>

                  <Label>Font Style</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2 mb-4">
                    {fontStyles.map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => set("fontStyleId", style.id)}
                        className={`relative text-left p-4 rounded-sm border-2 transition-all ${
                          (site.fontStyleId || "timeless") === style.id
                            ? "border-[#2d2b25] shadow-sm bg-[#2d2b25]/[0.02]"
                            : "border-[#2d2b25]/10 hover:border-[#2d2b25]/30"
                        }`}
                      >
                        <p className="text-sm font-bold text-[#2d2b25] uppercase tracking-tight mb-2">{style.name}</p>
                        <div className="flex flex-col gap-1 border-t border-[#2d2b25]/5 pt-2">
                          <span className="text-lg" style={{ fontFamily: style.fonts.script }}>The Wedding of</span>
                          <span className="text-xs uppercase tracking-widest" style={{ fontFamily: style.fonts.serif }}>Partner & Partner</span>
                          <span className="text-[9px] uppercase font-bold opacity-40" style={{ fontFamily: style.fonts.sans }}>Saturday, August 1st 2026</span>
                        </div>
                        {(site.fontStyleId || "timeless") === style.id && (
                          <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-widest text-[#2d2b25]/40">Active</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );

              if (tab === "Layout") return (
                <div>
                  <SectionTitle>Section Order & Visibility</SectionTitle>
                  <p className="text-xs text-[#2d2b25]/50 mb-4">
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
                              <span className={`text-sm font-medium ${section.visible ? "text-[#2d2b25]" : "text-[#2d2b25]/30 line-through"}`}>
                                {SECTION_LABELS[section.type] || SECTION_LABELS[section.id] || section.id}
                              </span>
                              <span className="text-[9px] font-bold uppercase tracking-widest text-[#2d2b25]/30">
                                {section.id}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => duplicateSection(i)}
                                className="p-1.5 text-[#2d2b25]/40 hover:text-[#2d2b25] transition-colors"
                                title="Duplicate Section"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                                </svg>
                              </button>

                              <button
                                type="button"
                                onClick={() => removeSection(i)}
                                className="p-1.5 text-[#2d2b25]/40 hover:text-red-500 transition-colors"
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
                                    ? "text-[#2d2b25]/60 hover:text-[#2d2b25]"
                                    : "text-[#2d2b25]/20 hover:text-[#2d2b25]/40"
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

                  <div className="mt-8 pt-8 border-t border-[#2d2b25]/10">
                    <SectionTitle>Add New Section</SectionTitle>
                    <p className="text-[10px] font-medium text-[#2d2b25]/40 uppercase tracking-widest mb-4">Click to append to layout</p>
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
                            className="text-[10px] font-bold uppercase tracking-wider px-3 py-2 border border-[#2d2b25]/10 bg-white/30 hover:border-[#2d2b25]/30 hover:bg-white/60 transition-all rounded-sm"
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
                <div className="flex flex-col items-center justify-center h-full text-[#2d2b25]/40 pt-20">
                  <p>Section not found or removed.</p>
                  <button onClick={() => handleTabChange("Basics")} className="mt-4 text-sm font-bold uppercase tracking-wider text-[#2d2b25] hover:underline">Go to Basics</button>
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

              const renderBg = (label: string) => (
                <div className="mb-6 pt-2">
                  <ColorPicker 
                    label="Background Color" 
                    value={bgColor} 
                    onChange={setBgColor as any} 
                    themeColors={activeTheme.colors}
                  />
                  <div className="h-px bg-[#2d2b25]/5 my-6" />
                  <ImageField 
                    label={label} 
                    value={bg} 
                    onChange={(v) => {
                      // If we set an image, we should probably clear the color?
                      // Or maybe not. Let's keep them independent for now.
                      setBg(v);
                    }} 
                    recentLinks={site.recentlyUsedLinks || []}
                    onAddRecentLink={addRecentLink}
                  />
                  <div className="h-px bg-[#2d2b25]/10 mt-6" />
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
                          className="w-full px-3 py-2 border border-[#2d2b25]/15 bg-white/50 text-[#2d2b25] text-sm outline-none focus:border-[#2d2b25]/40 resize-y rounded-sm"
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
                          className="w-full px-3 py-2 border border-[#2d2b25]/15 bg-white/50 text-[#2d2b25] text-sm outline-none focus:border-[#2d2b25]/40 resize-y rounded-sm"
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
                  <p className="text-xs text-[#2d2b25]/50 mb-6">
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
                          <div className="grid grid-cols-2 gap-4">
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
                                    (day.detailsStyle || "grid") === style ? "border-[#2d2b25] bg-[#2d2b25]/5" : "border-[#2d2b25]/10 hover:border-[#2d2b25]/30"
                                  }`}
                                >
                                  <p className="text-[9px] font-bold uppercase tracking-widest text-[#2d2b25]">{style}</p>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#2d2b25]/40">Venues & Locations</p>
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
                            <button type="button" onClick={() => set("eventDays", updateInArray(site.eventDays, di, { venues: [...day.venues, { label: "", name: "", address: "", time: "" }] }))} className="text-[10px] font-bold uppercase text-[#2d2b25]/40 hover:text-[#2d2b25] transition-colors">+ Add Venue</button>
                          </div>

                          <div className="space-y-4">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#2d2b25]/40">Information Blocks</p>
                            <SortableList items={day.infoBlocks} prefix={`info-${dayId}`} onReorder={(newBlocks) => set("eventDays", updateInArray(site.eventDays, di, { infoBlocks: newBlocks }))}>
                              {(b, bi, bId) => (
                                <SortableCard key={bId} id={bId} onRemove={() => set("eventDays", updateInArray(site.eventDays, di, { infoBlocks: removeFromArray(day.infoBlocks, bi) }))}>
                                  <Field label="Heading" value={b.heading || ""} onChange={(val) => set("eventDays", updateInArray(site.eventDays, di, { infoBlocks: updateInArray(day.infoBlocks, bi, { heading: val }) }))} />
                                  <Field label="Text" value={b.text} onChange={(val) => set("eventDays", updateInArray(site.eventDays, di, { infoBlocks: updateInArray(day.infoBlocks, bi, { text: val }) }))} multiline rows={3} />
                                </SortableCard>
                              )}
                            </SortableList>
                            <button type="button" onClick={() => set("eventDays", updateInArray(site.eventDays, di, { infoBlocks: [...day.infoBlocks, { text: "" }] }))} className="text-[10px] font-bold uppercase text-[#2d2b25]/40 hover:text-[#2d2b25] transition-colors">+ Add Info Block</button>
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
                      <button key={style} type="button" onClick={() => set("scheduleStyle", style)} className={`p-3 rounded-sm border-2 transition-all text-center ${(site.scheduleStyle || "classic") === style ? "border-[#2d2b25] bg-[#2d2b25]/5" : "border-[#2d2b25]/10 hover:border-[#2d2b25]/30"}`}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#2d2b25]">{style}</p>
                      </button>
                    ))}
                  </div>

                  <SortableList items={site.weddingDays ?? []} prefix={`schedule-${id}`} onReorder={(items) => set("weddingDays", items)}>
                    {(day, di, sid) => (
                      <SortableCard key={sid} id={sid} title={day.label || `Day ${di + 1}`} onRemove={() => set("weddingDays", removeFromArray(site.weddingDays ?? [], di))}>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Label" value={day.label} onChange={(v) => set("weddingDays", updateInArray(site.weddingDays ?? [], di, { label: v }))} placeholder="e.g. Wedding Day" />
                          <Field label="Date" value={day.date || ""} onChange={(v) => set("weddingDays", updateInArray(site.weddingDays ?? [], di, { date: v }))} placeholder="August 1st" />
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                          <input type="checkbox" id={`private-${di}`} checked={day.isPrivate} onChange={(e) => set("weddingDays", updateInArray(site.weddingDays ?? [], di, { isPrivate: e.target.checked }))} className="accent-[#2d2b25]" />
                          <label htmlFor={`private-${di}`} className="text-xs text-[#2d2b25]/60">Private (hidden from public site)</label>
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

              if (type === "menu") return (
                <div>
                  <SectionTitle>Wedding Menu</SectionTitle>
                  {renderBg("Menu Background Image")}
                  <Field label="Menu Note" value={site.menuNote} onChange={(v) => set("menuNote", v)} multiline rows={2} />
                  <SortableList items={site.menuItems} prefix={`menu-${id}`} onReorder={(items) => set("menuItems", items)}>
                    {(m, i, sid) => (
                      <SortableCard key={sid} id={sid} onRemove={() => set("menuItems", removeFromArray(site.menuItems, i))}>
                        <Field label="Name" value={m.name} onChange={(v) => set("menuItems", updateInArray(site.menuItems, i, { name: v }))} />
                        <Field label="Description" value={m.description} onChange={(v) => set("menuItems", updateInArray(site.menuItems, i, { description: v }))} multiline rows={2} />
                      </SortableCard>
                    )}
                  </SortableList>
                  <AddButton label="Add Menu Item" onClick={() => set("menuItems", [...site.menuItems, { name: "", description: "" }])} />
                </div>
              );

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
                  <SortableList items={site.accommodations} prefix={`hotels-${id}`} onReorder={(items) => set("accommodations", items)}>
                    {(h, i, sid) => (
                      <SortableCard key={sid} id={sid} title={h.name || `Hotel ${i + 1}`} onRemove={() => set("accommodations", removeFromArray(site.accommodations, i))}>
                        <Field label="Name" value={h.name} onChange={(v) => set("accommodations", updateInArray(site.accommodations, i, { name: v }))} />
                        <Field label="Distance" value={h.distance} onChange={(v) => set("accommodations", updateInArray(site.accommodations, i, { distance: v }))} />
                        <Field label="Discount Code" value={h.discountCode || ""} onChange={(v) => set("accommodations", updateInArray(site.accommodations, i, { discountCode: v }))} />
                        <Field label="Description" value={h.description} onChange={(v) => set("accommodations", updateInArray(site.accommodations, i, { description: v }))} multiline rows={2} />
                        <Field label="Booking URL" value={h.bookingUrl} onChange={(v) => set("accommodations", updateInArray(site.accommodations, i, { bookingUrl: v }))} />
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
                  <Field 
                    label="Google Sheets Link" 
                    value={site.rsvpEmbedUrl || (site.googleSheetId ? `https://docs.google.com/spreadsheets/d/${site.googleSheetId}` : "")} 
                    onChange={(v) => {
                      set("rsvpEmbedUrl", v);
                      // Try to extract and save the ID automatically
                      const match = v.match(/\/d\/([a-zA-Z0-9-_]+)/);
                      if (match && match[1]) set("googleSheetId", match[1]);
                    }} 
                    placeholder="Paste full Google Sheets URL here" 
                  />
                  {(site.rsvpEmbedUrl || site.googleSheetId) && (
                    <a 
                      href={site.rsvpEmbedUrl || `https://docs.google.com/spreadsheets/d/${site.googleSheetId}`} 
                      target="_blank" 
                      rel="noopener"
                      className="inline-flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#2d2b25]/60 hover:text-[#2d2b25] border border-[#2d2b25]/10 hover:border-[#2d2b25]/30 rounded-sm transition-all mb-6"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      Open Google Sheet
                    </a>
                  )}
                  <Field label="Google Sheet Tab Name" value={site.googleSheetName || "Sheet1"} onChange={(v) => set("googleSheetName", v)} placeholder="e.g. Sheet1 or RSVPs" />
                </div>
              );

              if (type === "gift") return (
                <div>
                  <SectionTitle>Gift Registry</SectionTitle>
                  {renderBg("Gift Background Image")}
                  <Field label="Heading" value={site.giftHeading} onChange={(v) => set("giftHeading", v)} />
                  <Field label="Subheading" value={site.giftSubheading} onChange={(v) => set("giftSubheading", v)} multiline rows={3} />
                  
                  <div className="mt-8 mb-10">
                    <Label>External Registry Links</Label>
                    <p className="text-[10px] text-[#2d2b25]/40 mb-4 uppercase tracking-wider">Simple links for PayPal, Monzo, Revolut, Wise, or Store Registries</p>
                    
                    <SortableList 
                      items={site.giftPaymentLinks || []} 
                      prefix={`reg-${id}`} 
                      onReorder={(items) => set("giftPaymentLinks", items)}
                    >
                      {(link, i, sid) => (
                        <SortableCard key={sid} id={sid} onRemove={() => set("giftPaymentLinks", removeFromArray(site.giftPaymentLinks || [], i))}>
                          <div className="grid grid-cols-2 gap-3">
                            <Field label="Label" value={link.label} onChange={(v) => set("giftPaymentLinks", updateInArray(site.giftPaymentLinks || [], i, { label: v }))} placeholder="e.g. PayPal, Monzo, Revolut" />
                            <Field label="URL" value={link.url} onChange={(v) => set("giftPaymentLinks", updateInArray(site.giftPaymentLinks || [], i, { url: v }))} placeholder="https://..." />
                          </div>
                        </SortableCard>
                      )}
                    </SortableList>
                    <AddButton label="Add Registry/Payment Link" onClick={() => set("giftPaymentLinks", [...(site.giftPaymentLinks || []), { label: "", url: "" }])} />
                  </div>

                  <div className="mt-8">
                    <Label>Bank & Payment Options</Label>
                    <p className="text-[10px] text-[#2d2b25]/40 mb-4 uppercase tracking-wider">Add bank details here</p>
                    
                    <SortableList 
                      items={site.giftBankDetails || []} 
                      prefix={`banks-${id}`} 
                      onReorder={(items) => set("giftBankDetails", items)}
                    >
                      {(bank, i, sid) => (
                        <SortableCard key={sid} id={sid} title={bank.label || `Option ${i + 1}`} onRemove={() => set("giftBankDetails", removeFromArray(site.giftBankDetails || [], i))}>
                          <Field label="Method Label" value={bank.label} onChange={(v) => set("giftBankDetails", updateInArray(site.giftBankDetails || [], i, { label: v }))} placeholder="e.g. Wise (International) or UK Bank" />
                          <div className="grid grid-cols-2 gap-3">
                            <Field label="Account Holder" value={bank.accountHolder || ""} onChange={(v) => set("giftBankDetails", updateInArray(site.giftBankDetails || [], i, { accountHolder: v }))} />
                            <Field label="Bank Name" value={bank.bankName || ""} onChange={(v) => set("giftBankDetails", updateInArray(site.giftBankDetails || [], i, { bankName: v }))} />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <Field label="Account Number" value={bank.accountNumber || ""} onChange={(v) => set("giftBankDetails", updateInArray(site.giftBankDetails || [], i, { accountNumber: v }))} />
                            <Field label="Sort Code" value={bank.sortCode || ""} onChange={(v) => set("giftBankDetails", updateInArray(site.giftBankDetails || [], i, { sortCode: v }))} />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
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

          {/* Draggable Divider */}
          {isPreview && (
            <div 
              onMouseDown={startResizing}
              onTouchStart={startResizing}
              className="w-1.5 h-full cursor-col-resize hover:bg-[#2d2b25]/10 active:bg-[#2d2b25]/20 transition-colors flex items-center justify-center group relative z-10 mx-1"
            >
              <div className="w-px h-12 bg-[#2d2b25]/10 group-hover:bg-[#2d2b25]/30 group-active:bg-[#2d2b25]/50 transition-colors" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-8 bg-transparent" /> {/* Larger hit area */}
            </div>
          )}

          {/* Preview Column */}
          {isPreview && (
            <div 
              style={{ width: `${100 - editorWidth}%` }}
              className="sticky top-20 h-[calc(100vh-10rem)] border border-[#2d2b25]/10 bg-white rounded-sm overflow-hidden flex flex-col shadow-xl"
            >
              <div className="bg-[#2d2b25]/[0.02] border-b border-[#2d2b25]/10 px-4 py-2 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2d2b25]/40">Real-time Preview</span>
                <span className="text-[10px] text-[#2d2b25]/30">{previewDevice === "desktop" ? "Desktop Mode" : "Mobile View"} &bull; Auto-syncing</span>
              </div>
              <div className="flex-1 bg-[#f0f0f0] overflow-hidden flex justify-center">
                <div 
                  className={`bg-white shadow-2xl transition-all h-full origin-top ${
                    previewDevice === "mobile" ? "w-[375px]" : "w-full"
                  } ${isDragging ? "pointer-events-none" : ""}`}
                >
                  <iframe
                    ref={iframeRef}
                    src={`/${site.slug}/preview`}
                    className="w-full h-full border-none"
                    title="Site Preview"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(45, 43, 37, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(45, 43, 37, 0.2);
        }
      `}</style>
    </div>
  );
}
