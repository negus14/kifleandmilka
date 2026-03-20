"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ImageShowcase from "@/components/ImageShowcase";

const SHOWCASE_IMAGES = [
  "/demo/images/photo-1.jpg",
  "/demo/images/photo-2.jpg",
  "/demo/images/photo-4.jpg",
];

export default function LoginForm({
  action,
}: {
  action: (formData: FormData) => Promise<{ error: string } | void>;
}) {
  const searchParams = useSearchParams();
  const loggedOut = searchParams.get("loggedOut") === "true";

  const [state, formAction, pending] = useActionState(
    async (_prev: { error: string } | null, formData: FormData) => {
      const result = await action(formData);
      return result ?? null;
    },
    null
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--dash-bg)] font-sans">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[var(--dash-bg)]/80 border-b border-[var(--dash-text)]/[0.06]">
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-[var(--dash-text)] text-xl font-bold italic"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            ITSW
          </Link>
          <Link
            href="/signup"
            className="font-['DM_Sans',sans-serif] text-[13px] font-semibold tracking-[0.08em] uppercase text-[var(--dash-text)]/60 hover:text-[var(--dash-text)] transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      <div className="flex flex-1 pt-16">
      {/* Left — Image Showcase (hidden on mobile) */}
      <div className="hidden lg:block lg:w-[55%] xl:w-[60%] relative">
        <ImageShowcase
          images={SHOWCASE_IMAGES}
          overlay={
            <div className="animate-[fadeUp_1s_ease_0.3s_both]">
              <p className="font-['Cormorant_Garamond',serif] text-[#faf1e1] text-4xl xl:text-5xl italic font-light leading-tight mb-4">
                Welcome home
              </p>
              <p className="font-['DM_Sans',sans-serif] text-[#faf1e1]/50 text-sm tracking-wide">
                Your wedding website is waiting for you
              </p>
              <div className="flex items-center gap-4 mt-8">
                <div className="h-px w-12 bg-[#faf1e1]/20" />
                <div className="w-1.5 h-1.5 rotate-45 bg-[#faf1e1]/30" />
                <div className="h-px w-12 bg-[#faf1e1]/20" />
              </div>
            </div>
          }
        />
      </div>

      {/* Right — Form */}
      <div className="w-full lg:w-[45%] xl:w-[40%] flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-[380px]">
          <div className="animate-[fieldReveal_0.6s_ease_0.1s_both]">
            <h1 className="font-['Cormorant_Garamond',serif] italic text-4xl text-[var(--dash-text)] mb-2 text-center lg:text-left font-light">
              Welcome back
            </h1>
            <p className="text-sm text-[var(--dash-text)]/50 text-center lg:text-left mb-2">
              Log in to edit your wedding site
            </p>
          </div>

          {/* Diamond divider */}
          <div className="flex items-center gap-3 my-8 animate-[fieldReveal_0.6s_ease_0.2s_both]">
            <div className="h-px flex-1 bg-[var(--dash-text)]/10" />
            <div className="w-1.5 h-1.5 rotate-45 border border-[#cdc1ab]" />
            <div className="h-px flex-1 bg-[var(--dash-text)]/10" />
          </div>

          <form action={formAction} className="space-y-5">
            <div className="animate-[fieldReveal_0.6s_ease_0.3s_both]">
              <label
                htmlFor="slug"
                className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-[var(--dash-text)]/60 mb-1.5"
              >
                Site Name
              </label>
              <div className="input-animated-wrap">
                <input
                  id="slug"
                  name="slug"
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="e.g. adamandeve"
                  className="w-full px-4 py-3 border border-[var(--dash-text)]/15 bg-transparent font-inherit text-base text-[var(--dash-text)] outline-none focus:border-[var(--dash-text)]/40 transition-colors rounded-sm"
                />
              </div>
            </div>
            <div className="animate-[fieldReveal_0.6s_ease_0.4s_both]">
              <label
                htmlFor="password"
                className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-[var(--dash-text)]/60 mb-1.5"
              >
                Password
              </label>
              <div className="input-animated-wrap">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 border border-[var(--dash-text)]/15 bg-transparent font-inherit text-base text-[var(--dash-text)] outline-none focus:border-[var(--dash-text)]/40 transition-colors rounded-sm"
                />
              </div>
            </div>

            {state?.error && (
              <p className="text-red-600 text-sm text-center">
                {state.error}
              </p>
            )}

            {loggedOut && !state?.error && (
              <p className="text-[var(--dash-text)] text-sm text-center bg-[var(--dash-text)]/5 p-2 rounded-sm">
                Logged out successfully
              </p>
            )}

            <div className="animate-[fieldReveal_0.6s_ease_0.5s_both]">
              <button
                type="submit"
                disabled={pending}
                className="group w-full py-3.5 bg-[var(--dash-btn-bg)] text-[var(--dash-btn-text)] font-semibold text-xs tracking-[0.15em] uppercase transition-all rounded-sm disabled:opacity-70 disabled:cursor-wait hover:opacity-90 relative overflow-hidden"
              >
                <span className="relative z-10">
                  {pending ? "Logging in..." : "Log In"}
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-[shimmer_1.5s_ease-in-out]" style={{ backgroundSize: "200% 100%" }} />
              </button>
            </div>

            <p className="text-center text-sm text-[var(--dash-text)]/50 mt-6 animate-[fieldReveal_0.6s_ease_0.6s_both]">
              Don&apos;t have a site yet?{" "}
              <Link
                href="/signup"
                className="text-[var(--dash-text)] font-semibold no-underline hover:underline"
              >
                Create one
              </Link>
            </p>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
}
