"use client";

import { useEffect } from "react";

export default function CountdownClient({ weddingDate }: { weddingDate: string }) {
  useEffect(() => {
    const target = new Date(weddingDate);

    function updateCountdown() {
      const days = document.getElementById("countdown-days");
      const hours = document.getElementById("countdown-hours");
      const mins = document.getElementById("countdown-mins");
      const secs = document.getElementById("countdown-secs");
      if (!days) return;

      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        days.textContent = "0";
        if (hours) hours.textContent = "0";
        if (mins) mins.textContent = "0";
        if (secs) secs.textContent = "0";
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      days.textContent = String(d);
      if (hours) hours.textContent = String(h).padStart(2, "0");
      if (mins) mins.textContent = String(m).padStart(2, "0");
      if (secs) secs.textContent = String(s).padStart(2, "0");
    }
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [weddingDate]);

  return null;
}
