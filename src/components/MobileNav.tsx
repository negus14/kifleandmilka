"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

const NAV_LINKS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Demo", href: "/demo" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden relative w-8 h-8 flex items-center justify-center"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        <span className="sr-only">{open ? "Close" : "Menu"}</span>
        <div className="w-5 flex flex-col gap-[5px]">
          <span
            className={`block h-[1.5px] bg-[#2d2b25] transition-all duration-300 origin-center ${
              open ? "rotate-45 translate-y-[6.5px]" : ""
            }`}
          />
          <span
            className={`block h-[1.5px] bg-[#2d2b25] transition-all duration-300 ${
              open ? "opacity-0 scale-x-0" : ""
            }`}
          />
          <span
            className={`block h-[1.5px] bg-[#2d2b25] transition-all duration-300 origin-center ${
              open ? "-rotate-45 -translate-y-[6.5px]" : ""
            }`}
          />
        </div>
      </button>

      {/* Portal out of nav's stacking context (backdrop-blur creates a new one) */}
      {typeof document !== "undefined" && createPortal(<>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-[#2d2b25]/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Slide-out panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-[#faf1e1] shadow-2xl transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-[#2d2b25]/[0.06]">
          <span className="font-['Cormorant_Garamond',serif] text-lg font-medium text-[#2d2b25]">
            Menu
          </span>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center text-[#2d2b25]/40 hover:text-[#2d2b25] transition-colors"
            aria-label="Close menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="px-6 py-8 flex flex-col gap-1">
          {NAV_LINKS.map((link, i) => {
            const isExternal = link.href.startsWith("/");
            const Component = isExternal ? Link : "a";
            return (
              <Component
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block py-3 px-3 font-['DM_Sans',sans-serif] text-[15px] font-medium text-[#2d2b25]/70 hover:text-[#2d2b25] hover:bg-[#2d2b25]/[0.03] rounded-sm transition-all"
                style={{
                  animation: open ? `fieldReveal 0.4s ease ${0.1 + i * 0.06}s both` : "none",
                }}
              >
                {link.label}
              </Component>
            );
          })}
        </nav>

        {/* Diamond divider */}
        <div className="flex items-center gap-3 mx-6 mb-6">
          <div className="h-px flex-1 bg-[#2d2b25]/10" />
          <div className="w-1.5 h-1.5 rotate-45 border border-[#cdc1ab]" />
          <div className="h-px flex-1 bg-[#2d2b25]/10" />
        </div>

        {/* Auth buttons */}
        <div
          className="px-6 flex flex-col gap-3"
          style={{
            animation: open ? "fieldReveal 0.4s ease 0.4s both" : "none",
          }}
        >
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="block text-center py-3 font-['DM_Sans',sans-serif] text-[13px] font-semibold tracking-[0.12em] uppercase text-[#2d2b25]/70 border border-[#2d2b25]/15 hover:border-[#2d2b25]/40 transition-colors rounded-sm"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            onClick={() => setOpen(false)}
            className="block text-center py-3 font-['DM_Sans',sans-serif] text-[13px] font-semibold tracking-[0.12em] uppercase bg-[#2d2b25] text-[#faf1e1] hover:bg-[#1a1812] transition-colors rounded-sm"
          >
            Get Started
          </Link>
        </div>

        {/* Bottom brand */}
        <div className="absolute bottom-8 left-6 right-6">
          <p className="font-['Cormorant_Garamond',serif] text-sm italic text-[#2d2b25]/25 text-center">
            Wedding websites, elevated.
          </p>
        </div>
      </div>
      </>, document.body)}
    </>
  );
}
