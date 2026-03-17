"use client";

import { useEffect, useLayoutEffect, useState, useRef, startTransition } from "react";
import ClassicTemplate from "@/templates/classic/Template";
import ModernTemplate from "@/templates/modern/Template";
import type { WeddingSite } from "@/lib/types/wedding-site";

export default function PreviewPage() {
  const [site, setSite] = useState<WeddingSite | null>(null);
  const scrollRef = useRef(0);
  const isUpdating = useRef(false);

  // Restore scroll synchronously before paint
  useLayoutEffect(() => {
    if (isUpdating.current && scrollRef.current > 0) {
      window.scrollTo(0, scrollRef.current);
      isUpdating.current = false;
    }
  });

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "UPDATE_SITE") {
        scrollRef.current = window.scrollY;
        isUpdating.current = true;
        setSite(event.data.site);

        // Fallback: restore scroll after a frame in case useLayoutEffect misses it
        const savedScroll = window.scrollY;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (Math.abs(window.scrollY - savedScroll) > 100) {
              window.scrollTo(0, savedScroll);
            }
          });
        });
      }
    }

    window.addEventListener("message", handleMessage);
    window.parent.postMessage({ type: "PREVIEW_READY" }, window.location.origin);

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (!site) {
    return (
      <div className="min-h-screen bg-[#faf1e1] flex items-center justify-center font-serif italic text-[#2d2b25]/40">
        Loading real-time preview...
      </div>
    );
  }

  if (site.layoutId === "modern") {
    return <ModernTemplate site={site} isPreview />;
  }

  return <ClassicTemplate site={site} isPreview />;
}
