"use client";

import { useEffect, useState } from "react";
import ElegantCreamTemplate from "@/templates/elegant-cream/Template";
import type { WeddingSite } from "@/lib/types/wedding-site";

export default function PreviewPage() {
  const [site, setSite] = useState<WeddingSite | null>(null);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "UPDATE_SITE") {
        setSite(event.data.site);
      }
    }

    window.addEventListener("message", handleMessage);
    // Notify parent that we are ready
    window.parent.postMessage({ type: "PREVIEW_READY" }, "*");

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (!site) {
    return (
      <div className="min-h-screen bg-[#faf1e1] flex items-center justify-center font-serif italic text-[#2d2b25]/40">
        Loading real-time preview...
      </div>
    );
  }

  return <ElegantCreamTemplate site={site} />;
}
