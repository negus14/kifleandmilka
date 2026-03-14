"use client";

import { useActionState } from "react";
import Link from "next/link";

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
    <div className="min-h-screen flex items-center justify-center bg-[#faf1e1] font-sans p-8">
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;1,400&display=swap"
        rel="stylesheet"
      />
      <div className="w-full max-w-[380px]">
        <h1 className="font-serif italic text-3xl text-[#2d2b25] mb-2 text-center">
          Create your site
        </h1>
        <p className="text-sm text-[#2d2b25]/50 text-center mb-8">
          Choose a URL and password to get started
        </p>

        <form action={formAction} className="space-y-4">
          <div>
            <label
              htmlFor="slug"
              className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-[#2d2b25]/60 mb-1.5"
            >
              Desired Site URL
            </label>
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
          
          <div>
            <label
              htmlFor="password"
              className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-[#2d2b25]/60 mb-1.5"
            >
              Create Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-4 py-3 border border-[#2d2b25]/15 bg-transparent font-inherit text-base text-[#2d2b25] outline-none focus:border-[#2d2b25]/40 transition-colors rounded-sm"
            />
          </div>

          {state?.error && (
            <p className="text-red-600 text-sm text-center">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-3.5 bg-[#2d2b25] text-[#faf1e1] font-semibold text-xs tracking-[0.15em] uppercase transition-all rounded-sm disabled:opacity-70 disabled:cursor-wait hover:opacity-90 mt-2"
          >
            {pending ? "Creating..." : "Create My Site"}
          </button>
          
          <p className="text-center text-sm opacity-60 mt-6">
            Already have a site? <Link href="/login" className="text-[#2d2b25] font-semibold no-underline hover:underline">Log In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
