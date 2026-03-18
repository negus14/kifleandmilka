"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  stagger?: number; // ms delay between children
  threshold?: number;
  as?: "div" | "section";
}

export default function ScrollReveal({
  children,
  className = "",
  stagger = 120,
  threshold = 0.15,
  as: Tag = "div",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Set stagger delays on direct children
    const kids = Array.from(el.children) as HTMLElement[];
    kids.forEach((child, i) => {
      child.style.setProperty("--reveal-delay", `${i * stagger}ms`);
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed");
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: "0px 0px -60px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [stagger, threshold]);

  return (
    <Tag ref={ref as any} className={`scroll-reveal ${className}`}>
      {children}
    </Tag>
  );
}
