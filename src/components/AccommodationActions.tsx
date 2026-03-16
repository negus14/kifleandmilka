"use client";

import { useState, useRef, useEffect } from "react";

interface AccommodationActionsProps {
  phone?: string;
  email?: string;
  bookingUrl?: string;
  buttonLabel?: string;
  variant?: "classic" | "modern";
}

export default function AccommodationActions({ phone, email, bookingUrl, buttonLabel, variant = "classic" }: AccommodationActionsProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const actions = [
    ...(bookingUrl ? [{ label: buttonLabel || "Visit Website", href: bookingUrl, target: "_blank" }] : []),
    ...(phone ? [{ label: `Call ${phone}`, href: `tel:${phone}`, target: undefined }] : []),
    ...(email ? [{ label: `Email ${email}`, href: `mailto:${email}`, target: undefined }] : []),
  ];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (actions.length === 0) return null;

  // Single action — just render a link, no dropdown
  if (actions.length === 1) {
    const a = actions[0];
    return (
      <a
        href={a.href}
        target={a.target}
        rel={a.target ? "noopener noreferrer" : undefined}
        className={variant === "classic" ? "hotel-card__link" : "modern-btn modern-btn--primary text-center"}
      >
        {a.label}
      </a>
    );
  }

  // Multiple actions — dropdown
  const isClassic = variant === "classic";

  return (
    <div ref={ref} className="relative" style={{ zIndex: open ? 10 : 1 }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={isClassic ? "hotel-card__link hotel-card__link--dropdown" : "modern-btn modern-btn--primary text-center w-full"}
      >
        <span>Contact</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginLeft: 8, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          <path d="M3 5l3 3 3-3" />
        </svg>
      </button>
      {open && (
        <div className={isClassic ? "hotel-card__dropdown" : "modern-dropdown"}>
          {actions.map((a) => (
            <a
              key={a.href}
              href={a.href}
              target={a.target}
              rel={a.target ? "noopener noreferrer" : undefined}
              className={isClassic ? "hotel-card__dropdown-item" : "modern-dropdown__item"}
              onClick={() => setOpen(false)}
            >
              {a.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
