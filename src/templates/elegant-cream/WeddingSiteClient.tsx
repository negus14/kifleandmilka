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

    return () => {
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
