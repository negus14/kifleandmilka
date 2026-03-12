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
import { themes } from "@/lib/themes";
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

const TABS = [
  "Basics", "Layout", "Hero", "Story", "Details", "Schedule",
  "Menu", "Gallery", "Explore", "Stay", "RSVP", "Gift", "Footer",
] as const;
type Tab = (typeof TABS)[number];

// ─── Primitives ───

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-[#2d2b25]/60 mb-1 mt-4 first:mt-0">
      {children}
    </label>
  );
}

function Field({ label, value, onChange, placeholder, multiline, rows, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; multiline?: boolean; rows?: number; type?: string;
}) {
  return (
    <div className="mb-3">
      <Label>{label}</Label>
      {multiline ? (
        <textarea
          value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} rows={rows || 4}
          className="w-full px-3 py-2 border border-[#2d2b25]/15 bg-white/50 text-[#2d2b25] text-sm outline-none focus:border-[#2d2b25]/40 resize-y rounded-sm"
        />
      ) : (
        <input
          type={type}
          value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-[#2d2b25]/15 bg-white/50 text-[#2d2b25] text-sm outline-none focus:border-[#2d2b25]/40 rounded-sm"
        />
      )}
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

  return (
    <div className="mb-3">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <input
          value={value} onChange={(e) => {
            onChange(e.target.value);
            if (e.target.value && onAddRecentLink) onAddRecentLink(e.target.value);
          }}
          placeholder="Paste URL (Canva, Unsplash, etc.) or upload"
          className="flex-1 px-3 py-2 border border-[#2d2b25]/15 bg-white/50 text-[#2d2b25] text-sm outline-none focus:border-[#2d2b25]/40 rounded-sm"
        />
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
  // Migration logic for legacy data
  const migratedInitial = { ...initial };
  
  // 1. Migrate scheduleItems to weddingDays if weddingDays is empty
  if ((!migratedInitial.weddingDays || migratedInitial.weddingDays.length === 0) && migratedInitial.scheduleItems?.length > 0) {
    migratedInitial.weddingDays = [{
      label: "Wedding Day",
      date: migratedInitial.dateDisplayText,
      isPrivate: false,
      items: migratedInitial.scheduleItems
    }];
  }

  // 2. Migrate legacy gift payment fields to giftPaymentLinks
  if ((!migratedInitial.giftPaymentLinks || migratedInitial.giftPaymentLinks.length === 0) && migratedInitial.giftPaymentUrl && migratedInitial.giftPaymentLabel) {
    migratedInitial.giftPaymentLinks = [{
      label: migratedInitial.giftPaymentLabel,
      url: migratedInitial.giftPaymentUrl
    }];
  }

  // 3. Ensure legacy fields are correctly mapped if missing
  if (migratedInitial.dayTwoEvent && !migratedInitial.dayTwoEvent.heading) {
    // This is just to ensure it's not an empty object if it was supposed to be there
  }

  const [site, setSite] = useState(migratedInitial);
  
  // History stacks
  const [past, setPast] = useState<WeddingSite[]>([]);
  const [future, setFuture] = useState<WeddingSite[]>([]);

  const [tab, setTab] = useState<Tab>("Basics");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true); // Start as saved
  const [isPreview, setIsPreview] = useState(true);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [editorWidth, setEditorWidth] = useState(40); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const isResizing = useRef(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  function handleTabChange(newTab: Tab) {
    setTab(newTab);
    
    // Map tab name to section ID
    const tabToSection: Record<string, string> = {
      "Basics": "hero",
      "Hero": "hero",
      "Story": "story",
      "Details": "details",
      "Schedule": "schedule",
      "Menu": "menu",
      "Gallery": "gallery",
      "Explore": "explore",
      "Stay": "accommodations",
      "RSVP": "rsvp",
      "Gift": "gift",
      "Footer": "footer"
    };

    const sectionId = tabToSection[newTab];
    if (sectionId && isPreview && iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({
        type: "SCROLL_TO_SECTION",
        sectionId
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
      }

      if (event.data?.type === "SECTION_IN_VIEW") {
        const sectionId = event.data.sectionId;
        const sectionToTab: Record<string, Tab> = {
          "hero": "Hero",
          "story": "Story",
          "details": "Details",
          "schedule": "Schedule",
          "menu": "Menu",
          "gallery": "Gallery",
          "explore": "Explore",
          "accommodations": "Stay",
          "rsvp": "RSVP",
          "gift": "Gift",
          "footer": "Footer"
        };
        const targetTab = sectionToTab[sectionId];

        // We only update the tab if it's different AND if we aren't currently scrolling from a sidebar click
        // To keep it simple, we just check if it's different. 
        // If it causes loops, we'll add a ref to track manual scroll vs auto scroll.
        if (targetTab && targetTab !== tab) {
          setTab(targetTab);
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

  async function handleSave() {
    // 1. Check for slug rename
    if (site.slug !== initial.slug) {
      const confirmRename = window.confirm(
        `Are you sure you want to change your URL to /${site.slug}?\n\nThis will change your public website link and you will be redirected to the new dashboard.`
      );
      if (!confirmRename) return;
    }

    setSaving(true);
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

      // 2. Redirect if renamed
      if (result.newSlug) {
        router.push(`/dashboard/${result.newSlug}`);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#faf1e1]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#2d2b25]/[0.08] bg-[#faf1e1]/95 backdrop-blur-sm">
        <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="text-base" style={{ fontFamily: "'Playfair Display', serif" }}>
              I Think She Wifey
            </a>
            <span className="text-[#2d2b25]/30">/</span>
            <span className="text-sm text-[#2d2b25]/60">{site.partner1Name} & {site.partner2Name}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-[#2d2b25]/5 p-1 rounded-sm">
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

            <div className="flex items-center gap-2 px-3">
              <div className={`w-1.5 h-1.5 rounded-full transition-colors ${saving ? "bg-amber-400 animate-pulse" : saved ? "bg-green-500" : "bg-amber-400"}`} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#2d2b25]/40">
                {saving ? "Saving..." : saved ? "Changes Saved" : "Unsaved Changes"}
              </span>
            </div>

            <a href={`/${site.slug}`} target="_blank"
              className="text-xs tracking-wide uppercase text-[#2d2b25]/50 hover:text-[#2d2b25] transition-colors">
              View Live
            </a>
            
            <div className="flex bg-[#2d2b25]/5 rounded-sm p-1">
              <button 
                onClick={() => setIsPreview(!isPreview)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all ${
                  isPreview 
                  ? "bg-[#2d2b25] text-white shadow-sm" 
                  : "text-[#2d2b25]/60 hover:text-[#2d2b25]"
                }`}
              >
                {isPreview ? "Preview: On" : "Preview: Off"}
              </button>
            </div>

            {isPreview && (
              <div className="flex bg-[#2d2b25]/5 rounded-sm p-1">
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
            )}

            <form action="/api/auth/logout" method="POST">
              <button type="submit"
                className="text-xs tracking-wide uppercase text-[#2d2b25]/40 hover:text-red-500 transition-colors ml-2">
                Log Out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className={`mx-auto transition-all ${isPreview ? "max-w-[1600px] px-4" : "max-w-6xl px-6"} py-8 flex gap-8`}>
        {/* Sidebar */}
        <nav className={`shrink-0 sticky top-20 self-start transition-all ${isPreview ? "w-36" : "w-44"}`}>
          {TABS.map((t) => (
            <button key={t} onClick={() => handleTabChange(t)}
              className={`block w-full text-left px-3 py-2 text-sm rounded-sm mb-0.5 transition-colors ${
                tab === t ? "bg-[#2d2b25] text-[#faf1e1]" : "text-[#2d2b25]/60 hover:text-[#2d2b25] hover:bg-[#2d2b25]/5"
              }`}
            >{t}</button>
          ))}
        </nav>

        {/* Content Wrapper */}
        <div className={`flex transition-all ${isPreview ? "flex-1" : "flex-1 max-w-2xl gap-8"}`}>
          
          {/* Editor Column */}
          <div 
            style={isPreview ? { width: `${editorWidth}%` } : { width: '100%' }}
            className={`transition-all ${isPreview ? "h-[calc(100vh-10rem)] overflow-y-auto pr-6 custom-scrollbar" : "w-full"}`}
          >
            {/* ─── BASICS ─── */}
            {tab === "Basics" && (
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
                  <Field 
                    label="Wedding Start Date" 
                    type="datetime-local"
                    value={site.weddingDate ? new Date(site.weddingDate).toISOString().slice(0, 16) : ""} 
                    onChange={(v) => {
                      if (!v) { set("weddingDate", ""); return; }
                      set("weddingDate", new Date(v).toISOString());
                    }} 
                  />
                  <Field 
                    label="Wedding End Date (optional)" 
                    type="datetime-local"
                    value={site.weddingEndDate ? new Date(site.weddingEndDate).toISOString().slice(0, 16) : ""} 
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
                <Label>Color Palette</Label>                <div className="grid grid-cols-3 gap-3 mt-2 mb-4">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => set("templateId", theme.id)}
                      className={`relative text-left p-3 rounded-sm border-2 transition-all ${
                        site.templateId === theme.id
                          ? "border-[#2d2b25] shadow-sm"
                          : "border-[#2d2b25]/10 hover:border-[#2d2b25]/30"
                      }`}
                    >
                      <div className="flex gap-1.5 mb-2">
                        <span className="w-5 h-5 rounded-full border border-black/10" style={{ background: theme.colors.cream }} />
                        <span className="w-5 h-5 rounded-full border border-black/10" style={{ background: theme.colors.tan }} />
                        <span className="w-5 h-5 rounded-full border border-black/10" style={{ background: theme.colors.dark }} />
                      </div>
                      <p className="text-sm font-medium text-[#2d2b25]">{theme.name}</p>
                      {site.templateId === theme.id && (
                        <span className="absolute top-2 right-2 text-xs font-semibold tracking-wide uppercase text-[#2d2b25]/50">Active</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ─── LAYOUT ─── */}
            {tab === "Layout" && (
              <div>
                <SectionTitle>Section Order & Visibility</SectionTitle>
                <p className="text-xs text-[#2d2b25]/50 mb-4">
                  Drag to reorder sections. Toggle visibility with the eye icon.
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
                          <span className={`text-sm font-medium ${section.visible ? "text-[#2d2b25]" : "text-[#2d2b25]/30 line-through"}`}>
                            {SECTION_LABELS[section.id] || section.id}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const order = site.sectionOrder ?? DEFAULT_SECTION_ORDER;
                              const updated = order.map((s, j) =>
                                j === i ? { ...s, visible: !s.visible } : s
                              );
                              set("sectionOrder", updated);
                            }}
                            className={`text-lg px-2 transition-colors ${
                              section.visible
                                ? "text-[#2d2b25]/60 hover:text-[#2d2b25]"
                                : "text-[#2d2b25]/20 hover:text-[#2d2b25]/40"
                            }`}
                            title={section.visible ? "Hide section" : "Show section"}
                          >
                            {section.visible ? (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            ) : (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </SortableCard>
                  )}
                </SortableList>
              </div>
            )}

            {/* ─── HERO ─── */}
            {tab === "Hero" && (
              <div>
                <SectionTitle>Hero Section</SectionTitle>
                <Field label="Pre-text" value={site.heroPretext} onChange={(v) => set("heroPretext", v)} />
                <Field label="Tagline" value={site.heroTagline} onChange={(v) => set("heroTagline", v)} />
                <Field label="CTA Button Text" value={site.heroCta} onChange={(v) => set("heroCta", v)} />
                <ImageField 
                  label="Hero Image" 
                  value={site.heroImageUrl} 
                  onChange={(v) => set("heroImageUrl", v)} 
                  recentLinks={site.recentlyUsedLinks || []}
                  onAddRecentLink={addRecentLink}
                />
              </div>
            )}

            {/* ─── STORY ─── */}
            {tab === "Story" && (
              <div>
                <SectionTitle>Our Story</SectionTitle>
                <ImageField 
                  label="Story Section Background Image" 
                  value={site.sectionBackgrounds?.story || ""} 
                  onChange={(v) => {
                    const bgs = { ...(site.sectionBackgrounds || {}) };
                    if (v) bgs.story = v; else delete bgs.story;
                    set("sectionBackgrounds", bgs);
                  }} 
                  recentLinks={site.recentlyUsedLinks || []}
                  onAddRecentLink={addRecentLink}
                />
                <div className="h-px bg-[#2d2b25]/10 my-6" />
                <Field label="Subtitle" value={site.storySubtitle} onChange={(v) => set("storySubtitle", v)} />
                <Field label="Title" value={site.storyTitle} onChange={(v) => set("storyTitle", v)} />
                <Field label="Lead Quote" value={site.storyLeadQuote} onChange={(v) => set("storyLeadQuote", v)} multiline rows={3} />
                <Label>Story Paragraphs</Label>
                <SortableList items={site.storyBody} prefix="story" onReorder={(items) => set("storyBody", items)}>
                  {(p, i, id) => (
                    <SortableCard key={id} id={id} onRemove={() => set("storyBody", removeFromArray(site.storyBody, i))}>
                      <textarea value={p} rows={3}
                        onChange={(e) => set("storyBody", site.storyBody.map((x, j) => j === i ? e.target.value : x))}
                        className="w-full px-3 py-2 border border-[#2d2b25]/15 bg-white/50 text-[#2d2b25] text-sm outline-none focus:border-[#2d2b25]/40 resize-y rounded-sm"
                      />
                    </SortableCard>
                  )}
                </SortableList>
                <AddButton label="Add Paragraph" onClick={() => set("storyBody", [...site.storyBody, ""])} />
                <ImageField 
                  label="Story Image" 
                  value={site.storyImageUrl} 
                  onChange={(v) => set("storyImageUrl", v)} 
                  recentLinks={site.recentlyUsedLinks || []}
                  onAddRecentLink={addRecentLink}
                />

                <SectionTitle>Quote</SectionTitle>
                <ImageField 
                  label="Quote Section Background Image" 
                  value={site.sectionBackgrounds?.quote || ""} 
                  onChange={(v) => {
                    const bgs = { ...(site.sectionBackgrounds || {}) };
                    if (v) bgs.quote = v; else delete bgs.quote;
                    set("sectionBackgrounds", bgs);
                  }} 
                  recentLinks={site.recentlyUsedLinks || []}
                  onAddRecentLink={addRecentLink}
                />
                <div className="h-px bg-[#2d2b25]/10 my-6" />
                <Field label="Quote Text" value={site.quoteText} onChange={(v) => set("quoteText", v)} multiline rows={3} />
                <Field label="Attribution" value={site.quoteAttribution} onChange={(v) => set("quoteAttribution", v)} />

                <SectionTitle>Featured Photo</SectionTitle>
                <ImageField 
                  label="Featured Photo Section Background Image" 
                  value={site.sectionBackgrounds?.featuredPhoto || ""} 
                  onChange={(v) => {
                    const bgs = { ...(site.sectionBackgrounds || {}) };
                    if (v) bgs.featuredPhoto = v; else delete bgs.featuredPhoto;
                    set("sectionBackgrounds", bgs);
                  }} 
                  recentLinks={site.recentlyUsedLinks || []}
                  onAddRecentLink={addRecentLink}
                />
                <div className="h-px bg-[#2d2b25]/10 my-6" />
                <ImageField 
                  label="Featured Photo" 
                  value={site.featuredPhotoUrl} 
                  onChange={(v) => set("featuredPhotoUrl", v)} 
                  recentLinks={site.recentlyUsedLinks || []}
                  onAddRecentLink={addRecentLink}
                />
                <Field label="Caption" value={site.featuredPhotoCaption} onChange={(v) => set("featuredPhotoCaption", v)} />

                <SectionTitle>Love Letter</SectionTitle>
                <ImageField 
                  label="Love Letter Section Background Image" 
                  value={site.sectionBackgrounds?.letter || ""} 
                  onChange={(v) => {
                    const bgs = { ...(site.sectionBackgrounds || {}) };
                    if (v) bgs.letter = v; else delete bgs.letter;
                    set("sectionBackgrounds", bgs);
                  }} 
                  recentLinks={site.recentlyUsedLinks || []}
                  onAddRecentLink={addRecentLink}
                />
                <div className="h-px bg-[#2d2b25]/10 my-6" />
                <Field label="Opening" value={site.letterOpening} onChange={(v) => set("letterOpening", v)} />
                <Label>Body Paragraphs</Label>
                <SortableList items={site.letterBody} prefix="letter" onReorder={(items) => set("letterBody", items)}>
                  {(p, i, id) => (
                    <SortableCard key={id} id={id} onRemove={() => set("letterBody", removeFromArray(site.letterBody, i))}>
                      <textarea value={p} rows={3}
                        onChange={(e) => set("letterBody", site.letterBody.map((x, j) => j === i ? e.target.value : x))}
                        className="w-full px-3 py-2 border border-[#2d2b25]/15 bg-white/50 text-[#2d2b25] text-sm outline-none focus:border-[#2d2b25]/40 resize-y rounded-sm"
                      />
                    </SortableCard>
                  )}
                </SortableList>
                <AddButton label="Add Paragraph" onClick={() => set("letterBody", [...site.letterBody, ""])} />
                <Field label="Closing" value={site.letterClosing} onChange={(v) => set("letterClosing", v)} />
              </div>
            )}

            {/* ─── DETAILS (Venues) ─── */}
            {tab === "Details" && (
              <div>
                <SectionTitle>Details Background</SectionTitle>
                <ImageField 
                  label="Details Section Background Image" 
                  value={site.sectionBackgrounds?.details || ""} 
                  onChange={(v) => {
                    const bgs = { ...(site.sectionBackgrounds || {}) };
                    if (v) bgs.details = v; else delete bgs.details;
                    set("sectionBackgrounds", bgs);
                  }} 
                  recentLinks={site.recentlyUsedLinks || []}
                  onAddRecentLink={addRecentLink}
                />
                <div className="h-px bg-[#2d2b25]/10 my-6" />

                <SectionTitle>Details Layout Style</SectionTitle>
                <div className="grid grid-cols-3 gap-3 mb-8">
                  {(["grid", "split", "minimal"] as const).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => set("detailsStyle", style)}
                      className={`p-3 rounded-sm border-2 transition-all text-center ${
                        (site.detailsStyle || "grid") === style
                          ? "border-[#2d2b25] bg-[#2d2b25]/5"
                          : "border-[#2d2b25]/10 hover:border-[#2d2b25]/30"
                      }`}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#2d2b25]">
                        {style}
                      </p>
                    </button>
                  ))}
                </div>
                
                <SectionTitle>Venues</SectionTitle>
                <SortableList items={site.venues} prefix="venues" onReorder={(items) => set("venues", items)}>
                  {(v, i, id) => (
                    <SortableCard key={id} id={id} title={v.label || `Venue ${i + 1}`} onRemove={() => set("venues", removeFromArray(site.venues, i))}>
                      <Field label="Label" value={v.label} onChange={(val) => set("venues", updateInArray(site.venues, i, { label: val }))} placeholder="Ceremony / Reception" />
                      <Field label="Venue Name" value={v.name} onChange={(val) => set("venues", updateInArray(site.venues, i, { name: val }))} />
                      <Field label="Address" value={v.address} onChange={(val) => set("venues", updateInArray(site.venues, i, { address: val }))} multiline rows={2} />
                      <Field label="Time" value={v.time} onChange={(val) => set("venues", updateInArray(site.venues, i, { time: val }))} placeholder="2:00 PM" />
                      <Field label="Google Maps Link" value={v.mapsEmbedUrl || ""} onChange={(val) => set("venues", updateInArray(site.venues, i, { mapsEmbedUrl: val }))} placeholder="Paste Google Maps link for this venue" />
                    </SortableCard>
                  )}
                </SortableList>
                <AddButton label="Add Venue" onClick={() => set("venues", [...site.venues, { label: "", name: "", address: "", time: "", mapsEmbedUrl: "" }])} />

                <SectionTitle>Additional Venue Info</SectionTitle>
                <SortableList items={site.venueInfoBlocks} prefix="venueinfo" onReorder={(items) => set("venueInfoBlocks", items)}>
                  {(b, i, id) => (
                    <SortableCard key={id} id={id} onRemove={() => set("venueInfoBlocks", removeFromArray(site.venueInfoBlocks, i))}>
                      <Field label="Heading" value={b.heading || ""} onChange={(val) => set("venueInfoBlocks", updateInArray(site.venueInfoBlocks, i, { heading: val }))} />
                      <Field label="Subheading" value={b.subheading || ""} onChange={(val) => set("venueInfoBlocks", updateInArray(site.venueInfoBlocks, i, { subheading: val }))} />
                      <Field label="Text" value={b.text} onChange={(val) => set("venueInfoBlocks", updateInArray(site.venueInfoBlocks, i, { text: val }))} multiline rows={3} />
                    </SortableCard>
                  )}
                </SortableList>
                <AddButton label="Add Info Block" onClick={() => set("venueInfoBlocks", [...site.venueInfoBlocks, { text: "" }])} />

                <SectionTitle>Day Two Event</SectionTitle>
                <ImageField 
                  label="Day Two Section Background Image" 
                  value={site.sectionBackgrounds?.day2 || ""} 
                  onChange={(v) => {
                    const bgs = { ...(site.sectionBackgrounds || {}) };
                    if (v) bgs.day2 = v; else delete bgs.day2;
                    set("sectionBackgrounds", bgs);
                  }} 
                  recentLinks={site.recentlyUsedLinks || []}
                  onAddRecentLink={addRecentLink}
                />
                <div className="h-px bg-[#2d2b25]/10 my-6" />
                {site.dayTwoEvent ? (
                  <Card onRemove={() => set("dayTwoEvent", null)}>
                    <Field label="Heading" value={site.dayTwoEvent.heading} onChange={(v) => set("dayTwoEvent", { ...site.dayTwoEvent!, heading: v })} />
                    <Field label="Time" value={site.dayTwoEvent.time} onChange={(v) => set("dayTwoEvent", { ...site.dayTwoEvent!, time: v })} />
                    <Field label="Address" value={site.dayTwoEvent.address} onChange={(v) => set("dayTwoEvent", { ...site.dayTwoEvent!, address: v })} multiline rows={2} />
                    <Field label="Note" value={site.dayTwoEvent.note} onChange={(v) => set("dayTwoEvent", { ...site.dayTwoEvent!, note: v })} multiline rows={2} />
                  </Card>
                ) : (
                  <AddButton label="Add Day Two Event" onClick={() => set("dayTwoEvent", { heading: "Day Two Celebration", time: "", address: "", note: "" })} />
                )}
              </div>
            )}

            {/* ─── SCHEDULE ─── */}
            {tab === "Schedule" && (
              <div>
                <SectionTitle>Schedule Background</SectionTitle>
                <ImageField 
                  label="Schedule Section Background Image" 
                  value={site.sectionBackgrounds?.schedule || ""} 
                  onChange={(v) => {
                    const bgs = { ...(site.sectionBackgrounds || {}) };
                    if (v) bgs.schedule = v; else delete bgs.schedule;
                    set("sectionBackgrounds", bgs);
                  }} 
                  recentLinks={site.recentlyUsedLinks || []}
                  onAddRecentLink={addRecentLink}
                />
                <div className="h-px bg-[#2d2b25]/10 my-6" />
                
                <SectionTitle>Schedule Visualization Style</SectionTitle>
                <div className="grid grid-cols-3 gap-3 mb-8">
                  {(["classic", "minimal", "cards"] as const).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => set("scheduleStyle", style)}
                      className={`p-3 rounded-sm border-2 transition-all text-center ${
                        (site.scheduleStyle || "classic") === style
                          ? "border-[#2d2b25] bg-[#2d2b25]/5"
                          : "border-[#2d2b25]/10 hover:border-[#2d2b25]/30"
                      }`}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#2d2b25]">
                        {style}
                      </p>
                    </button>
                  ))}
                </div>

                <SectionTitle>Wedding Days</SectionTitle>
                <p className="text-xs text-[#2d2b25]/50 mb-4">
                  Add multiple days (wedding day, day two, bridal party, etc.). Private days are only visible to you.
                </p>
                {(site.weddingDays ?? []).map((day, di) => (
                  <div key={di} className="border-2 border-[#2d2b25]/10 rounded-sm p-4 mb-6 relative">
                    <button onClick={() => set("weddingDays", removeFromArray(site.weddingDays ?? [], di))} type="button"
                      className="absolute top-3 right-3 text-[#2d2b25]/30 hover:text-red-500 text-lg leading-none transition-colors"
                      title="Remove Day"
                    >&times;</button>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Day Label" value={day.label} onChange={(v) => set("weddingDays", updateInArray(site.weddingDays ?? [], di, { label: v }))} placeholder="Wedding Day" />
                      <Field label="Date" value={day.date || ""} onChange={(v) => set("weddingDays", updateInArray(site.weddingDays ?? [], di, { date: v }))} placeholder="Saturday, August 1st" />
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <input
                        type="checkbox"
                        id={`private-${di}`}
                        checked={day.isPrivate}
                        onChange={(e) => set("weddingDays", updateInArray(site.weddingDays ?? [], di, { isPrivate: e.target.checked }))}
                        className="accent-[#2d2b25]"
                      />
                      <label htmlFor={`private-${di}`} className="text-xs text-[#2d2b25]/60">
                        Private (hidden from public site — for bridal/groom party only)
                      </label>
                    </div>

                    <Label>Events</Label>
                    <SortableList items={day.items} prefix={`day-${di}`} onReorder={(items) => set("weddingDays", updateInArray(site.weddingDays ?? [], di, { items }))}>
                      {(item, i, id) => (
                        <SortableCard key={id} id={id} title={item.event || `Event ${i + 1}`} onRemove={() => {
                          const updated = { ...day, items: removeFromArray(day.items, i) };
                          set("weddingDays", updateInArray(site.weddingDays ?? [], di, updated));
                        }}>
                          <div className="grid grid-cols-2 gap-3">
                            <Field label="Time" value={item.hour} onChange={(v) => {
                              const updated = { ...day, items: updateInArray(day.items, i, { hour: v }) };
                              set("weddingDays", updateInArray(site.weddingDays ?? [], di, updated));
                            }} placeholder="2:00" />
                            <Field label="AM/PM" value={item.period} onChange={(v) => {
                              const updated = { ...day, items: updateInArray(day.items, i, { period: v }) };
                              set("weddingDays", updateInArray(site.weddingDays ?? [], di, updated));
                            }} placeholder="PM" />
                          </div>
                          <Field label="Event Name" value={item.event} onChange={(v) => {
                            const updated = { ...day, items: updateInArray(day.items, i, { event: v }) };
                            set("weddingDays", updateInArray(site.weddingDays ?? [], di, updated));
                          }} />
                          <Field label="Venue" value={item.venue} onChange={(v) => {
                            const updated = { ...day, items: updateInArray(day.items, i, { venue: v }) };
                            set("weddingDays", updateInArray(site.weddingDays ?? [], di, updated));
                          }} />
                          <Field label="Description" value={item.description} onChange={(v) => {
                            const updated = { ...day, items: updateInArray(day.items, i, { description: v }) };
                            set("weddingDays", updateInArray(site.weddingDays ?? [], di, updated));
                          }} multiline rows={2} />
                        </SortableCard>
                      )}
                    </SortableList>
                    <AddButton label="Add Event" onClick={() => {
                      const updated = { ...day, items: [...day.items, { hour: "", period: "PM", event: "", venue: "", description: "" }] };
                      set("weddingDays", updateInArray(site.weddingDays ?? [], di, updated));
                    }} />
                  </div>
                ))}
                <AddButton label="Add Day" onClick={() => set("weddingDays", [...(site.weddingDays ?? []), { label: "", date: "", isPrivate: false, items: [] }])} />
              </div>
            )}

            {/* ─── MENU ─── */}
            {tab === "Menu" && (
              <div>
                <SectionTitle>Menu Background</SectionTitle>
                <ImageField 
                  label="Menu Section Background Image" 
                  value={site.sectionBackgrounds?.menu || ""} 
                  onChange={(v) => {
                    const bgs = { ...(site.sectionBackgrounds || {}) };
                    if (v) bgs.menu = v; else delete bgs.menu;
                    set("sectionBackgrounds", bgs);
                  }} 
                  recentLinks={site.recentlyUsedLinks || []}
                  onAddRecentLink={addRecentLink}
                />
                <div className="h-px bg-[#2d2b25]/10 my-6" />
                
                <SectionTitle>Menu</SectionTitle>
                <SortableList items={site.menuItems} prefix="menu" onReorder={(items) => set("menuItems", items)}>
                  {(item, i, id) => (
                    <SortableCard key={id} id={id} title={item.name || `Item ${i + 1}`} onRemove={() => set("menuItems", removeFromArray(site.menuItems, i))}>
                      <Field label="Dish Name" value={item.name} onChange={(v) => set("menuItems", updateInArray(site.menuItems, i, { name: v }))} />
                      <Field label="Description" value={item.description} onChange={(v) => set("menuItems", updateInArray(site.menuItems, i, { description: v }))} multiline rows={2} />
                    </SortableCard>
                  )}
                </SortableList>
                <AddButton label="Add Menu Item" onClick={() => set("menuItems", [...site.menuItems, { name: "", description: "" }])} />
                <Field label="Menu Note" value={site.menuNote} onChange={(v) => set("menuNote", v)} />
              </div>
            )}

            {/* ─── GALLERY ─── */}
            {tab === "Gallery" && (
              <div>
                <SectionTitle>Gallery Background</SectionTitle>
                <ImageField 
                  label="Gallery Section Background Image" 
                  value={site.sectionBackgrounds?.gallery || ""} 
                  onChange={(v) => {
                    const bgs = { ...(site.sectionBackgrounds || {}) };
                    if (v) bgs.gallery = v; else delete bgs.gallery;
                    set("sectionBackgrounds", bgs);
                  }} 
                  recentLinks={site.recentlyUsedLinks || []}
                  onAddRecentLink={addRecentLink}
                />
                <div className="h-px bg-[#2d2b25]/10 my-6" />
                
                <SectionTitle>Gallery</SectionTitle>
                <SortableList items={site.galleryImages} prefix="gallery" onReorder={(items) => set("galleryImages", items)}>
                  {(img, i, id) => (
                    <SortableCard key={id} id={id} onRemove={() => set("galleryImages", removeFromArray(site.galleryImages, i))}>
                      <ImageField 
                        label="Image" 
                        value={img.url} 
                        onChange={(v) => set("galleryImages", updateInArray(site.galleryImages, i, { url: v }))} 
                        recentLinks={site.recentlyUsedLinks || []}
                        onAddRecentLink={addRecentLink}
                      />
                      <Field label="Alt Text" value={img.alt} onChange={(v) => set("galleryImages", updateInArray(site.galleryImages, i, { alt: v }))} />
                    </SortableCard>
                  )}
                </SortableList>
                <AddButton label="Add Image" onClick={() => set("galleryImages", [...site.galleryImages, { url: "", alt: "" }])} />
              </div>
            )}

            {/* ─── EXPLORE ─── */}
            {tab === "Explore" && (
              <div>
                <SectionTitle>Things to Do Background</SectionTitle>
                <ImageField 
                  label="Things to Do Section Background Image" 
                  value={site.sectionBackgrounds?.explore || ""} 
                  onChange={(v) => {
                    const bgs = { ...(site.sectionBackgrounds || {}) };
                    if (v) bgs.explore = v; else delete bgs.explore;
                    set("sectionBackgrounds", bgs);
                  }} 
                  recentLinks={site.recentlyUsedLinks || []}
                  onAddRecentLink={addRecentLink}
                />
                <div className="h-px bg-[#2d2b25]/10 my-6" />
                
                <SectionTitle>Things to Do</SectionTitle>
                <SortableList items={site.exploreGroups} prefix="explore" onReorder={(items) => set("exploreGroups", items)}>
                  {(group, i, id) => (
                    <SortableCard key={id} id={id} title={group.heading || `Group ${i + 1}`} onRemove={() => set("exploreGroups", removeFromArray(site.exploreGroups, i))}>
                      <Field label="Group Heading" value={group.heading} onChange={(v) => set("exploreGroups", updateInArray(site.exploreGroups, i, { heading: v }))} />
                      <Field label="Subheading (optional)" value={group.subheading || ""} onChange={(v) => set("exploreGroups", updateInArray(site.exploreGroups, i, { subheading: v || undefined }))} />
                      <Label>Links</Label>
                      {group.links.map((link, j) => (
                        <div key={j} className="flex gap-2 mb-2">
                          <input value={link.label} placeholder="Label"
                            onChange={(e) => {
                              const newLinks = [...group.links];
                              newLinks[j] = { ...newLinks[j], label: e.target.value };
                              set("exploreGroups", updateInArray(site.exploreGroups, i, { links: newLinks }));
                            }}
                            className="flex-1 px-3 py-2 border border-[#2d2b25]/15 bg-white/50 text-sm outline-none focus:border-[#2d2b25]/40 rounded-sm"
                          />
                          <input value={link.url} placeholder="URL"
                            onChange={(e) => {
                              const newLinks = [...group.links];
                              newLinks[j] = { ...newLinks[j], url: e.target.value };
                              set("exploreGroups", updateInArray(site.exploreGroups, i, { links: newLinks }));
                            }}
                            className="flex-1 px-3 py-2 border border-[#2d2b25]/15 bg-white/50 text-sm outline-none focus:border-[#2d2b25]/40 rounded-sm"
                          />
                          <button onClick={() => {
                            const newLinks = group.links.filter((_, k) => k !== j);
                            set("exploreGroups", updateInArray(site.exploreGroups, i, { links: newLinks }));
                          }} type="button" className="text-[#2d2b25]/30 hover:text-red-500 px-1">&times;</button>
                        </div>
                      ))}
                      <button onClick={() => {
                        const newLinks = [...group.links, { label: "", url: "" }];
                        set("exploreGroups", updateInArray(site.exploreGroups, i, { links: newLinks }));
                      }} type="button"
                        className="text-xs text-[#2d2b25]/40 hover:text-[#2d2b25] mt-1">+ Add Link</button>
                    </SortableCard>
                  )}
                </SortableList>
                <AddButton label="Add Group" onClick={() => set("exploreGroups", [...site.exploreGroups, { heading: "", links: [] }])} />
              </div>
            )}

            {/* ─── STAY ─── */}
            {tab === "Stay" && (
              <div>
                <SectionTitle>Accommodations Background</SectionTitle>
                <ImageField 
                  label="Accommodations Section Background Image" 
                  value={site.sectionBackgrounds?.accommodations || ""} 
                  onChange={(v) => {
                    const bgs = { ...(site.sectionBackgrounds || {}) };
                    if (v) bgs.accommodations = v; else delete bgs.accommodations;
                    set("sectionBackgrounds", bgs);
                  }} 
                  recentLinks={site.recentlyUsedLinks || []}
                  onAddRecentLink={addRecentLink}
                />
                <div className="h-px bg-[#2d2b25]/10 my-6" />
                
                <SectionTitle>Accommodations</SectionTitle>
                <SortableList items={site.accommodations} prefix="hotels" onReorder={(items) => set("accommodations", items)}>
                  {(hotel, i, id) => (
                    <SortableCard key={id} id={id} title={hotel.name || `Hotel ${i + 1}`} onRemove={() => set("accommodations", removeFromArray(site.accommodations, i))}>
                      <Field label="Hotel Name" value={hotel.name} onChange={(v) => set("accommodations", updateInArray(site.accommodations, i, { name: v }))} />
                      <Field label="Distance" value={hotel.distance} onChange={(v) => set("accommodations", updateInArray(site.accommodations, i, { distance: v }))} placeholder="10 min drive" />
                      <Field label="Description" value={hotel.description} onChange={(v) => set("accommodations", updateInArray(site.accommodations, i, { description: v }))} multiline rows={2} />
                      <Field label="Booking URL" value={hotel.bookingUrl} onChange={(v) => set("accommodations", updateInArray(site.accommodations, i, { bookingUrl: v }))} />
                      <Field label="Badge (optional)" value={hotel.badge || ""} onChange={(v) => set("accommodations", updateInArray(site.accommodations, i, { badge: v || undefined }))} placeholder="Reception Venue" />
                      <Field label="Discount Code (optional)" value={hotel.discountCode || ""} onChange={(v) => set("accommodations", updateInArray(site.accommodations, i, { discountCode: v || undefined }))} placeholder="WEDDING2026" />
                    </SortableCard>
                  )}
                </SortableList>
                <AddButton label="Add Hotel" onClick={() => set("accommodations", [...site.accommodations, { name: "", distance: "", description: "", bookingUrl: "" }])} />
              </div>
            )}

            {/* ─── RSVP ─── */}
            {tab === "RSVP" && (
              <div>
                <SectionTitle>RSVP Background</SectionTitle>
                <ImageField 
                  label="RSVP Section Background Image" 
                  value={site.sectionBackgrounds?.rsvp || ""} 
                  onChange={(v) => {
                    const bgs = { ...(site.sectionBackgrounds || {}) };
                    if (v) bgs.rsvp = v; else delete bgs.rsvp;
                    set("sectionBackgrounds", bgs);
                  }} 
                  recentLinks={site.recentlyUsedLinks || []}
                  onAddRecentLink={addRecentLink}
                />
                <div className="h-px bg-[#2d2b25]/10 my-6" />
                
                <SectionTitle>RSVP</SectionTitle>
                <Field label="Heading" value={site.rsvpHeading} onChange={(v) => set("rsvpHeading", v)} />
                <Field label="Deadline Text" value={site.rsvpDeadlineText} onChange={(v) => set("rsvpDeadlineText", v)} />
                
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    id="showHalalOption"
                    checked={site.showHalalOption ?? true}
                    onChange={(e) => set("showHalalOption", e.target.checked)}
                    className="accent-[#2d2b25]"
                  />
                  <label htmlFor="showHalalOption" className="text-xs text-[#2d2b25]/60">
                    Include Halal option for guests
                  </label>
                </div>

                <div className="mt-8 pt-8 border-t border-[#2d2b25]/10">
                  <SectionTitle>Meal Options</SectionTitle>
                  <p className="text-xs text-[#2d2b25]/50 mb-4">
                    Define the meal choices that guests can select from during RSVP.
                  </p>
                  <SortableList 
                    items={site.rsvpMealOptions || ["Chicken", "Beef", "Fish", "Vegetarian"]} 
                    prefix="meals" 
                    onReorder={(items) => set("rsvpMealOptions", items)}
                  >
                    {(option, i, id) => (
                      <SortableCard key={id} id={id} onRemove={() => {
                        const current = site.rsvpMealOptions || ["Chicken", "Beef", "Fish", "Vegetarian"];
                        set("rsvpMealOptions", removeFromArray(current, i));
                      }}>
                        <input 
                          value={option} 
                          onChange={(e) => {
                             const current = site.rsvpMealOptions || ["Chicken", "Beef", "Fish", "Vegetarian"];
                             set("rsvpMealOptions", current.map((x, j) => j === i ? e.target.value : x));
                          }}
                          placeholder="e.g. Chicken"
                          className="w-full px-3 py-2 border border-[#2d2b25]/15 bg-white/50 text-[#2d2b25] text-sm outline-none focus:border-[#2d2b25]/40 rounded-sm"
                        />
                      </SortableCard>
                    )}
                  </SortableList>
                  <AddButton 
                    label="Add Meal Option" 
                    onClick={() => {
                      const current = site.rsvpMealOptions || ["Chicken", "Beef", "Fish", "Vegetarian"];
                      set("rsvpMealOptions", [...current, ""]);
                    }} 
                  />
                </div>

                <div className="mt-8 pt-8 border-t border-[#2d2b25]/10">
                  <SectionTitle>Google Sheets Integration</SectionTitle>
                  <div className="text-xs text-[#2d2b25]/60 mb-6 leading-relaxed">
                    Link RSVPs directly to your Google Sheet.
                    <br />
                    1. Create a new Google Sheet.
                    <br />
                    2. Share it with <strong>edit</strong> access to:
                    <div className="mt-1 mb-3 flex items-center gap-2">
                      <div className="flex-1 px-3 py-2 bg-[#2d2b25]/5 border border-[#2d2b25]/10 font-mono text-[10px] text-[#2d2b25]/60 truncate rounded-sm">
                        {process.env.NEXT_PUBLIC_GOOGLE_SERVICE_ACCOUNT_EMAIL || "Configure email in settings"}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const email = process.env.NEXT_PUBLIC_GOOGLE_SERVICE_ACCOUNT_EMAIL;
                          if (!email) return alert("Email not configured.");
                          navigator.clipboard.writeText(email);
                          alert("Email copied! Go to your Google Sheet > Share, and invite this email as an Editor.");
                        }}
                        className="px-3 py-2 bg-white border border-[#2d2b25]/20 text-[#2d2b25] text-xs font-semibold uppercase tracking-wider hover:bg-[#2d2b25] hover:text-white transition-all rounded-sm shrink-0"
                      >
                        Copy Email
                      </button>
                    </div>
                    3. Copy these headers and paste them into cell A1:
                    <div className="mt-2 mb-4 flex items-center gap-2">
                      <div className="flex-1 px-3 py-2 bg-[#2d2b25]/5 border border-[#2d2b25]/10 font-mono text-[10px] text-[#2d2b25]/60 truncate rounded-sm">
                        Timestamp{"\t"}Submitter Email{"\t"}Guest Name{"\t"}...
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const headers = "Timestamp\tSubmitter Email\tGuest Name\tAttending\tMeal Choice\tHalal\tMessage";
                          navigator.clipboard.writeText(headers);
                          alert("Headers copied! Paste them into cell A1 of your Google Sheet.");
                        }}
                        className="px-3 py-2 bg-white border border-[#2d2b25]/20 text-[#2d2b25] text-xs font-semibold uppercase tracking-wider hover:bg-[#2d2b25] hover:text-white transition-all rounded-sm shrink-0"
                      >
                        Copy Headers
                      </button>
                    </div>
                    <br />
                    4. Paste the <strong>entire URL</strong> of your Google Sheet below.
                  </div>                
                  <Field 
                    label="Google Sheets Link" 
                    value={site.rsvpEmbedUrl || ""} 
                    onChange={(v) => set("rsvpEmbedUrl", v)} 
                    placeholder="Paste your full Google Sheets URL here"
                  />
                  <Field 
                    label="Sheet Name" 
                    value={site.googleSheetName || ""} 
                    onChange={(v) => set("googleSheetName", v)} 
                    placeholder="e.g. Sheet1"
                  />
                </div>
              </div>
            )}

            {/* ─── GIFT ─── */}
            {tab === "Gift" && (
              <div>
                <SectionTitle>Gift Background</SectionTitle>
                <ImageField 
                  label="Gift Section Background Image" 
                  value={site.sectionBackgrounds?.gift || ""} 
                  onChange={(v) => {
                    const bgs = { ...(site.sectionBackgrounds || {}) };
                    if (v) bgs.gift = v; else delete bgs.gift;
                    set("sectionBackgrounds", bgs);
                  }} 
                  recentLinks={site.recentlyUsedLinks || []}
                  onAddRecentLink={addRecentLink}
                />
                <div className="h-px bg-[#2d2b25]/10 my-6" />
                
                <SectionTitle>Gift</SectionTitle>
                <Field label="Heading" value={site.giftHeading} onChange={(v) => set("giftHeading", v)} />
                <Field label="Subheading" value={site.giftSubheading} onChange={(v) => set("giftSubheading", v)} multiline rows={3} />
                
                <div className="mt-8 pt-8 border-t border-[#2d2b25]/10">
                  <SectionTitle>Payment Links (e.g. PayPal, Venmo, CashApp)</SectionTitle>
                  <SortableList items={site.giftPaymentLinks || []} prefix="giftLinks" onReorder={(items) => set("giftPaymentLinks", items)}>
                    {(link, i, id) => (
                      <SortableCard key={id} id={id} onRemove={() => set("giftPaymentLinks", removeFromArray(site.giftPaymentLinks || [], i))}>
                        <Field label="Button Label" value={link.label} onChange={(v) => set("giftPaymentLinks", updateInArray(site.giftPaymentLinks || [], i, { label: v }))} placeholder="e.g. Pay with PayPal" />
                        <Field label="URL" value={link.url} onChange={(v) => set("giftPaymentLinks", updateInArray(site.giftPaymentLinks || [], i, { url: v }))} placeholder="https://paypal.me/yourname" />
                      </SortableCard>
                    )}
                  </SortableList>
                  <AddButton label="Add Payment Link" onClick={() => set("giftPaymentLinks", [...(site.giftPaymentLinks || []), { label: "Contribute here", url: "" }])} />
                </div>

                <div className="mt-8 pt-8 border-t border-[#2d2b25]/10">
                  <SectionTitle>International Bank Details (Optional)</SectionTitle>
                  <p className="text-[10px] text-[#2d2b25]/40 mb-4 uppercase tracking-wider">
                    Add multiple bank options (e.g. Canada Interac, UK Bank Transfer).
                  </p>
                  <SortableList items={site.giftBankDetails || []} prefix="bankDetails" onReorder={(items) => set("giftBankDetails", items)}>
                    {(bank, i, id) => (
                      <SortableCard key={id} id={id} onRemove={() => set("giftBankDetails", removeFromArray(site.giftBankDetails || [], i))}>
                        <Field label="Label (e.g. Canada Interac)" value={bank.label} onChange={(v) => set("giftBankDetails", updateInArray(site.giftBankDetails || [], i, { label: v }))} />
                        <Field label="Account Holder" value={bank.accountHolder || ""} onChange={(v) => set("giftBankDetails", updateInArray(site.giftBankDetails || [], i, { accountHolder: v }))} />
                        <div className="grid grid-cols-2 gap-4">
                          <Field label="Email (for Interac)" value={bank.email || ""} onChange={(v) => set("giftBankDetails", updateInArray(site.giftBankDetails || [], i, { email: v }))} />
                          <Field label="Bank Name" value={bank.bankName || ""} onChange={(v) => set("giftBankDetails", updateInArray(site.giftBankDetails || [], i, { bankName: v }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Field label="Sort Code" value={bank.sortCode || ""} onChange={(v) => set("giftBankDetails", updateInArray(site.giftBankDetails || [], i, { sortCode: v }))} />
                          <Field label="Account Number" value={bank.accountNumber || ""} onChange={(v) => set("giftBankDetails", updateInArray(site.giftBankDetails || [], i, { accountNumber: v }))} />
                        </div>
                        <Field label="SWIFT/BIC Code" value={bank.swiftCode || ""} onChange={(v) => set("giftBankDetails", updateInArray(site.giftBankDetails || [], i, { swiftCode: v }))} />
                      </SortableCard>
                    )}
                  </SortableList>
                  <AddButton label="Add Bank Option" onClick={() => set("giftBankDetails", [...(site.giftBankDetails || []), { label: "New Bank Option" }])} />
                </div>

                <div className="mt-8 pt-8 border-t border-[#2d2b25]/10">
                  <SectionTitle>Simple Bank Transfer (Legacy)</SectionTitle>
                  <Field label="Bank Name" value={site.giftBankName || ""} onChange={(v) => set("giftBankName", v)} />
                  <Field label="Account Holder" value={site.giftAccountHolder || ""} onChange={(v) => set("giftAccountHolder", v)} />
                  <Field label="Account Number" value={site.giftAccountNumber || ""} onChange={(v) => set("giftAccountNumber", v)} />
                  <Field label="SWIFT/BIC Code" value={site.giftSwiftCode || ""} onChange={(v) => set("giftSwiftCode", v)} />
                </div>

                <div className="mt-8 pt-8 border-t border-[#2d2b25]/10">
                  <Field label="Footer Note" value={site.giftNote} onChange={(v) => set("giftNote", v)} />
                </div>
              </div>
            )}

            {/* ─── FOOTER ─── */}
            {tab === "Footer" && (
              <div>
                <SectionTitle>Footer Background</SectionTitle>
                <ImageField 
                  label="Footer Section Background Image" 
                  value={site.sectionBackgrounds?.footer || ""} 
                  onChange={(v) => {
                    const bgs = { ...(site.sectionBackgrounds || {}) };
                    if (v) bgs.footer = v; else delete bgs.footer;
                    set("sectionBackgrounds", bgs);
                  }} 
                  recentLinks={site.recentlyUsedLinks || []}
                  onAddRecentLink={addRecentLink}
                />
                <div className="h-px bg-[#2d2b25]/10 my-6" />
                
                <SectionTitle>Footer</SectionTitle>
                <Field label="Names" value={site.footerNames} onChange={(v) => set("footerNames", v)} />
                <Field label="Date Text" value={site.footerDateText} onChange={(v) => set("footerDateText", v)} />
                <Field label="Copyright" value={site.footerCopyright} onChange={(v) => set("footerCopyright", v)} />

                <SectionTitle>Contact Info</SectionTitle>
                <Field label="Contact Section Heading" value={site.contactHeading || ""} onChange={(v) => set("contactHeading", v || undefined)} placeholder="Get in Touch" />
                <SortableList items={site.contactEntries} prefix="contacts" onReorder={(items) => set("contactEntries", items)}>
                  {(c, i, id) => (
                    <SortableCard key={id} id={id} onRemove={() => set("contactEntries", removeFromArray(site.contactEntries, i))}>
                      <Field label="Email" value={c.email} onChange={(v) => set("contactEntries", updateInArray(site.contactEntries, i, { email: v }))} />
                      <Field label="Phone" value={c.phone || ""} onChange={(v) => set("contactEntries", updateInArray(site.contactEntries, i, { phone: v }))} />
                    </SortableCard>
                  )}
                </SortableList>
                <AddButton label="Add Contact" onClick={() => set("contactEntries", [...site.contactEntries, { email: "", phone: "" }])} />
              </div>
            )}
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
