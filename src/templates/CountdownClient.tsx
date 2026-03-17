"use client";

import { useEffect } from "react";

export default function CountdownClient({ weddingDate }: { weddingDate: string }) {
  useEffect(() => {
    const target = new Date(weddingDate);
    const els = {
      days: document.getElementById("countdown-days"),
      hours: document.getElementById("countdown-hours"),
      mins: document.getElementById("countdown-mins"),
      secs: document.getElementById("countdown-secs"),
    };

    function updateCountdown() {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        if (els.days) els.days.textContent = "0";
        if (els.hours) els.hours.textContent = "0";
        if (els.mins) els.mins.textContent = "0";
        if (els.secs) els.secs.textContent = "0";
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (els.days) els.days.textContent = String(d);
      if (els.hours) els.hours.textContent = String(h).padStart(2, "0");
      if (els.mins) els.mins.textContent = String(m).padStart(2, "0");
      if (els.secs) els.secs.textContent = String(s).padStart(2, "0");
    }
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [weddingDate]);

  return null;
}
