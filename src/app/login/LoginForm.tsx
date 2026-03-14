"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";

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
    <div className="min-h-screen flex items-center justify-center bg-[#faf1e1] font-sans p-8">
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;1,400&display=swap"
        rel="stylesheet"
      />
      <div className="w-full max-w-[380px]">
        <h1 className="font-serif italic text-3xl text-[#2d2b25] mb-2 text-center">
          Welcome back
        </h1>
        <p className="text-sm text-[#2d2b25]/50 text-center mb-8">
          Log in to edit your wedding site
        </p>

        <form action={formAction} className="space-y-4">
          <div>
            <label
              htmlFor="slug"
              className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-[#2d2b25]/60 mb-1.5"
            >
              Site Name
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              required
              autoComplete="username"
              placeholder="e.g. adamandeve"
              className="w-full px-4 py-3 border border-[#2d2b25]/15 bg-transparent font-inherit text-base text-[#2d2b25] outline-none focus:border-[#2d2b25]/40 transition-colors rounded-sm"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-[#2d2b25]/60 mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 border border-[#2d2b25]/15 bg-transparent font-inherit text-base text-[#2d2b25] outline-none focus:border-[#2d2b25]/40 transition-colors rounded-sm"
            />
          </div>

          {state?.error && (
            <p className="text-red-600 text-sm text-center">
              {state.error}
            </p>
          )}

          {loggedOut && !state?.error && (
            <p className="text-[#2d2b25] text-sm text-center bg-[#2d2b25]/5 p-2 rounded-sm">
              Logged out successfully
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-3.5 bg-[#2d2b25] text-[#faf1e1] font-semibold text-xs tracking-[0.15em] uppercase transition-all rounded-sm disabled:opacity-70 disabled:cursor-wait hover:opacity-90"
          >
            {pending ? "Logging in..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}
