"use client";

import { useState, useEffect } from "react";
import SafeImage from "./SafeImage";

interface ImageShowcaseProps {
  images: string[];
  interval?: number; // ms between crossfades
  overlay?: ReactNode;
}

import type { ReactNode } from "react";

export default function ImageShowcase({
  images,
  interval = 6000,
  overlay,
}: ImageShowcaseProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(timer);
  }, [images.length, interval]);

  return (
    <div className="image-showcase">
      {images.map((src, i) => (
        <div
          key={src}
          className={`image-showcase__slide ${i === current ? "image-showcase__slide--active" : ""}`}
        >
          <SafeImage
            src={src}
            alt=""
            fill
            sizes="60vw"
            className="object-cover blur-[3px]"
            priority={i === 0}
          />
        </div>
      ))}
      {/* Ken Burns overlay gradient */}
      <div className="image-showcase__overlay" />
      {overlay && (
        <div className="image-showcase__content">{overlay}</div>
      )}
    </div>
  );
}
