"use client";

import { useEffect } from "react";

export default function WeddingSiteClient({
  weddingDate,
}: {
  weddingDate: string;
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
    const nav = document.querySelector(".nav");
    let ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          nav?.classList.toggle("scrolled", window.scrollY > 80);
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener("scroll", onScroll);

    // Mobile menu
    const toggle = document.querySelector(".nav__toggle");
    const links = document.querySelector(".nav__links");
    function onToggle() {
      if (!links || !toggle) return;
      const isOpen = links.classList.toggle("open");
      toggle.classList.toggle("active");
      toggle.setAttribute("aria-expanded", String(isOpen));
    }
    toggle?.addEventListener("click", onToggle);
    const navLinks = links?.querySelectorAll(".nav__link");
    function closeMenu() {
      links?.classList.remove("open");
      toggle?.classList.remove("active");
      toggle?.setAttribute("aria-expanded", "false");
    }
    navLinks?.forEach((l) => l.addEventListener("click", closeMenu));

    // Lightbox
    const lb = document.getElementById("lightbox");
    const lbImg = document.getElementById("lightbox-img") as HTMLImageElement;
    function openLb(e: Event) {
      const img = e.currentTarget as HTMLImageElement;
      if (lbImg) { lbImg.src = img.src; lbImg.alt = img.alt; }
      lb?.classList.add("open");
      document.body.style.overflow = "hidden";
    }
    function closeLb() {
      lb?.classList.remove("open");
      document.body.style.overflow = "";
    }
    const zoomables = document.querySelectorAll("img[data-zoomable]");
    zoomables.forEach((img) => img.addEventListener("click", openLb));
    lb?.addEventListener("click", closeLb);
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && lb?.classList.contains("open")) closeLb();
    }
    document.addEventListener("keydown", onKey);

    // Gift dropdown logic
    function setupGiftDropdowns() {
      const toggles = document.querySelectorAll(".gift__dropdown-toggle");
      
      toggles.forEach((toggle) => {
        // Remove existing listener to prevent duplicates
        const newToggle = toggle.cloneNode(true) as HTMLElement;
        toggle.parentNode?.replaceChild(newToggle, toggle);

        newToggle.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          const parent = newToggle.closest(".gift__dropdown");
          const menu = parent?.querySelector(".gift__dropdown-menu");
          const isExpanded = newToggle.getAttribute("aria-expanded") === "true";
          
          // Close all other dropdowns
          document.querySelectorAll(".gift__dropdown-menu").forEach(m => {
            if (m !== menu) m.classList.remove("show");
          });
          document.querySelectorAll(".gift__dropdown-toggle").forEach(t => {
            if (t !== newToggle) t.setAttribute("aria-expanded", "false");
          });

          // Toggle current
          if (menu) {
            const willShow = !menu.classList.contains("show");
            menu.classList.toggle("show", willShow);
            newToggle.setAttribute("aria-expanded", String(willShow));
          }
        });
      });

      // Global click to close
      document.addEventListener("click", () => {
        document.querySelectorAll(".gift__dropdown-menu").forEach(m => m.classList.remove("show"));
        document.querySelectorAll(".gift__dropdown-toggle").forEach(t => t.setAttribute("aria-expanded", "false"));
      });
    }

    // Run setup with a small delay to ensure DOM is ready
    const timeout = setTimeout(() => {
      setupGiftDropdowns();
      setupClipboard();
    }, 100);

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

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      toggle?.removeEventListener("click", onToggle);
      navLinks?.forEach((l) => l.removeEventListener("click", closeMenu));
      zoomables.forEach((img) => img.removeEventListener("click", openLb));
      lb?.removeEventListener("click", closeLb);
      document.removeEventListener("keydown", onKey);
    };
  }, [weddingDate]);

  return null;
}
