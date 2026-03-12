"use client";

import { useEffect } from "react";

export default function WeddingSiteClient({
  weddingDate,
  scheduleStyle,
}: {
  weddingDate: string;
  scheduleStyle?: string;
}) {
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

    // Scroll reveal
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    // Nav scroll
    const nav = document.querySelector(".modern-nav");
    function onScroll() {
      nav?.classList.toggle("scrolled", window.scrollY > 80);
      
      // If at the very top, ensure Hero is selected
      if (window.scrollY < 50) {
        window.parent.postMessage({
          type: "SECTION_IN_VIEW",
          sectionId: "hero"
        }, "*");
      }
    }
    window.addEventListener("scroll", onScroll);

    // Section Observer for Sidebar Sync
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // When a section takes up a significant portion of the viewport,
          // or if it's smaller than the viewport but centered.
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            window.parent.postMessage({
              type: "SECTION_IN_VIEW",
              sectionId: entry.target.id
            }, "*");
          }
        });
      },
      { 
        threshold: [0.3, 0.5, 0.8], 
        rootMargin: "-20% 0px -20% 0px" 
      }
    );
    document.querySelectorAll("section[id], header[id], footer[id]").forEach((el) => {
      sectionObserver.observe(el);
    });

    // Handle messages from parent (Dashboard)
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "SCROLL_TO_SECTION") {
        const sectionId = event.data.sectionId;
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }
    window.addEventListener("message", handleMessage);

    // Gift dropdown logic
    function setupGiftDropdowns() {
      const toggles = document.querySelectorAll(".gift__dropdown-toggle");
      
      toggles.forEach((toggle) => {
        const newToggle = toggle.cloneNode(true) as HTMLElement;
        toggle.parentNode?.replaceChild(newToggle, toggle);

        newToggle.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          const parent = newToggle.closest(".gift__dropdown");
          const menu = parent?.querySelector(".gift__dropdown-menu");
          const isExpanded = newToggle.getAttribute("aria-expanded") === "true";
          
          document.querySelectorAll(".gift__dropdown-menu").forEach(m => {
            if (m !== menu) m.classList.remove("show");
          });
          document.querySelectorAll(".gift__dropdown-toggle").forEach(t => {
            if (t !== newToggle) t.setAttribute("aria-expanded", "false");
          });

          if (menu) {
            const willShow = !menu.classList.contains("show");
            menu.classList.toggle("show", willShow);
            newToggle.setAttribute("aria-expanded", String(willShow));
          }
        });
      });

      document.addEventListener("click", () => {
        document.querySelectorAll(".gift__dropdown-menu").forEach(m => m.classList.remove("show"));
        document.querySelectorAll(".gift__dropdown-toggle").forEach(t => t.setAttribute("aria-expanded", "false"));
      });
    }

    // Clipboard Copy logic
    function setupClipboard() {
      const copyBtns = document.querySelectorAll(".bank-copy-btn");
      copyBtns.forEach((btn) => {
        const newBtn = btn.cloneNode(true) as HTMLElement;
        btn.parentNode?.replaceChild(newBtn, btn);

        newBtn.addEventListener("click", async (e) => {
          e.preventDefault();
          e.stopPropagation();
          const text = newBtn.getAttribute("data-copy");
          if (!text) return;

          try {
            await navigator.clipboard.writeText(text);
            const originalText = newBtn.innerHTML;
            newBtn.innerHTML = "Copied!";
            newBtn.style.color = "#4ade80";
            setTimeout(() => {
              newBtn.innerHTML = originalText;
              newBtn.style.color = "";
            }, 2000);
          } catch (err) {
            console.error("Failed to copy:", err);
          }
        });
      });
    }

    // Run setup with a small delay
    const timeout = setTimeout(() => {
      setupGiftDropdowns();
      setupClipboard();
    }, 100);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [weddingDate, scheduleStyle]);

  return null;
}
