"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf1e1] p-8 text-center">
      <div className="max-w-md">
        <h2 className="text-2xl font-serif italic mb-4 text-[#2d2b25]">Something went wrong</h2>
        <p className="text-[#2d2b25]/60 mb-8">
          We've been notified and are looking into it. Please try refreshing the page.
        </p>
        <button
          onClick={() => reset()}
          className="px-8 py-3 bg-[#2d2b25] text-[#faf1e1] font-bold uppercase tracking-widest text-[10px] rounded-sm hover:opacity-90 transition-all shadow-sm"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
