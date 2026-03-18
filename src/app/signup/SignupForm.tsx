"use client";

import { useActionState } from "react";
import Link from "next/link";
import ImageShowcase from "@/components/ImageShowcase";

const SHOWCASE_IMAGES = [
  "/demo/images/photo-2.jpg",
  "/demo/images/photo-4.jpg",
  "/demo/images/photo-1.jpg",
];

export default function SignupForm({
  action,
}: {
  action: (formData: FormData) => Promise<{ error: string } | void>;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error: string } | null, formData: FormData) => {
      const result = await action(formData);
      return result ?? null;
    },
    null
  );

  return (
    <div className="min-h-screen flex bg-[#faf1e1] font-sans">
      {/* Left — Image Showcase (hidden on mobile) */}
      <div className="hidden lg:block lg:w-[55%] xl:w-[60%] relative">
        <ImageShowcase
          images={SHOWCASE_IMAGES}
          overlay={
            <div className="animate-[fadeUp_1s_ease_0.3s_both]">
              <p className="font-['Caveat',cursive] text-[#faf1e1]/70 text-xl mb-2">
                Begin your love story
              </p>
              <p className="font-['Cormorant_Garamond',serif] text-[#faf1e1] text-4xl xl:text-5xl italic font-light leading-tight mb-4">
                Create something
                <br />
                beautiful together
              </p>
              <p className="font-['DM_Sans',sans-serif] text-[#faf1e1]/50 text-sm tracking-wide">
                Your wedding website, ready in minutes
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
          {/* Mobile-only brand header */}
          <div className="lg:hidden text-center mb-8">
            <Link
              href="/"
              className="font-['Cormorant_Garamond',serif] text-lg font-medium text-[#2d2b25]/60"
            >
              I Think She Wifey
            </Link>
          </div>

          <div className="animate-[fieldReveal_0.6s_ease_0.1s_both]">
            <h1 className="font-['Cormorant_Garamond',serif] italic text-4xl text-[#2d2b25] mb-2 text-center lg:text-left font-light">
              Create your site
            </h1>
            <p className="text-sm text-[#2d2b25]/50 text-center lg:text-left mb-2">
              Choose a URL and password to get started
            </p>
          </div>

          {/* Diamond divider */}
          <div className="flex items-center gap-3 my-8 animate-[fieldReveal_0.6s_ease_0.2s_both]">
            <div className="h-px flex-1 bg-[#2d2b25]/10" />
            <div className="w-1.5 h-1.5 rotate-45 border border-[#cdc1ab]" />
            <div className="h-px flex-1 bg-[#2d2b25]/10" />
          </div>

          <form action={formAction} className="space-y-5">
            <div className="animate-[fieldReveal_0.6s_ease_0.3s_both]">
              <label
                htmlFor="slug"
                className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-[#2d2b25]/60 mb-1.5"
              >
                Desired Site URL
              </label>
              <div className="input-animated-wrap">
                <div className="flex items-center border border-[#2d2b25]/15 rounded-sm overflow-hidden focus-within:border-[#2d2b25]/40 transition-colors">
                  <span className="pl-4 py-3 text-base text-[#2d2b25]/30 whitespace-nowrap bg-transparent">
                    ithinkshewifey.com/
                  </span>
                  <input
                    id="slug"
                    name="slug"
                    type="text"
                    required
                    placeholder="adamandeve"
                    className="w-full pl-1 pr-4 py-3 bg-transparent font-inherit text-base text-[#2d2b25] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="animate-[fieldReveal_0.6s_ease_0.4s_both]">
              <label
                htmlFor="password"
                className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-[#2d2b25]/60 mb-1.5"
              >
                Create Password
              </label>
              <div className="input-animated-wrap">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-4 py-3 border border-[#2d2b25]/15 bg-transparent font-inherit text-base text-[#2d2b25] outline-none focus:border-[#2d2b25]/40 transition-colors rounded-sm"
                />
              </div>
            </div>

            {state?.error && (
              <p className="text-red-600 text-sm text-center">
                {state.error}
              </p>
            )}

            <div className="animate-[fieldReveal_0.6s_ease_0.5s_both]">
              <button
                type="submit"
                disabled={pending}
                className="group w-full py-3.5 bg-[#2d2b25] text-[#faf1e1] font-semibold text-xs tracking-[0.15em] uppercase transition-all rounded-sm disabled:opacity-70 disabled:cursor-wait hover:opacity-90 mt-2 relative overflow-hidden"
              >
                <span className="relative z-10">
                  {pending ? "Creating..." : "Create My Site"}
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-[shimmer_1.5s_ease-in-out]" style={{ backgroundSize: "200% 100%" }} />
              </button>
            </div>

            <p className="text-center text-sm text-[#2d2b25]/50 mt-6 animate-[fieldReveal_0.6s_ease_0.6s_both]">
              Already have a site?{" "}
              <Link
                href="/login"
                className="text-[#2d2b25] font-semibold no-underline hover:underline"
              >
                Log In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
