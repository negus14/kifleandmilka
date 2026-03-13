"use client";

import { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";

interface SafeImageProps extends ImageProps {
  fallbackSrc?: string;
}

export default function SafeImage({ 
  src, 
  fallbackSrc = "/placeholder.svg", 
  alt, 
  className = "",
  ...props 
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  // Deriving visibility
  const isInvalid = !src || src === "";
  const showPlaceholder = isInvalid || hasError;

  // Reset error state when src changes (e.g. user updates image in dashboard)
  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (showPlaceholder) {
    return (
      <div 
        className={`${className} flex flex-col items-center justify-center bg-[var(--color-accent-light,rgba(45,43,37,0.05))] border border-[var(--color-dark,rgba(45,43,37,0.1))] text-[var(--color-dark,#2d2b25)] p-4 text-center`}
        style={{ 
          ...(props.fill ? { position: 'absolute', inset: 0 } : { 
            maxHeight: '90vh',
            height: 'auto',
            width: '100%',
            aspectRatio: props.width && props.height ? `${props.width}/${props.height}` : 'auto',
          }),
          fontFamily: 'var(--font-serif)',
          ...((props.style as any) || {})
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-20 mb-2">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
        </svg>
        <span className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-semibold">
          {alt || "Photo coming soon"}
        </span>
      </div>
    );
  }

  return (
    <Image
      {...props}
      className={className}
      src={src}
      alt={alt}
      style={{ 
        maxWidth: '100%', 
        ...(props.fill ? {} : { height: 'auto', maxHeight: '90vh' }),
        objectFit: (props.style as any)?.objectFit || 'cover',
        ...((props.style as any) || {}) 
      }}
      onError={() => {
        setHasError(true);
      }}
    />
  );
}
