"use client";

import { useActionState } from "react";

export default function LoginForm({
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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#faf1e1",
        fontFamily: "'DM Sans', sans-serif",
        padding: "2rem",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;1,400&display=swap"
        rel="stylesheet"
      />
      <div style={{ width: "100%", maxWidth: 380 }}>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.8rem",
            color: "#2d2b25",
            marginBottom: "0.5rem",
            textAlign: "center",
          }}
        >
          Welcome back
        </h1>
        <p
          style={{
            fontSize: "0.85rem",
            color: "#2d2b25",
            opacity: 0.5,
            textAlign: "center",
            marginBottom: "2rem",
          }}
        >
          Log in to edit your wedding site
        </p>

        <form action={formAction}>
          <div style={{ marginBottom: "1rem" }}>
            <label
              htmlFor="slug"
              style={{
                display: "block",
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase" as const,
                color: "#2d2b25",
                opacity: 0.6,
                marginBottom: "0.4rem",
              }}
            >
              Site Name
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              required
              autoComplete="username"
              placeholder="e.g. kifleandmilka"
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                border: "1px solid rgba(45,43,37,0.15)",
                background: "transparent",
                fontFamily: "inherit",
                fontSize: "0.95rem",
                color: "#2d2b25",
                outline: "none",
              }}
            />
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase" as const,
                color: "#2d2b25",
                opacity: 0.6,
                marginBottom: "0.4rem",
              }}
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                border: "1px solid rgba(45,43,37,0.15)",
                background: "transparent",
                fontFamily: "inherit",
                fontSize: "0.95rem",
                color: "#2d2b25",
                outline: "none",
              }}
            />
          </div>

          {state?.error && (
            <p
              style={{
                color: "#b04040",
                fontSize: "0.8rem",
                textAlign: "center",
                marginBottom: "1rem",
              }}
            >
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            style={{
              width: "100%",
              padding: "0.85rem",
              background: "#2d2b25",
              color: "#faf1e1",
              border: "none",
              fontFamily: "inherit",
              fontSize: "0.76rem",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase" as const,
              cursor: pending ? "wait" : "pointer",
              opacity: pending ? 0.7 : 1,
              marginBottom: "1rem",
            }}
          >
            {pending ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div style={{ position: "relative", textAlign: "center", margin: "1.5rem 0" }}>
          <div style={{ position: "absolute", top: "50%", left: 0, right: 0, borderBottom: "1px solid rgba(45,43,37,0.1)", zIndex: 0 }} />
          <span style={{ position: "relative", background: "#faf1e1", padding: "0 0.75rem", fontSize: "0.7rem", color: "#2d2b25", opacity: 0.4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Or
          </span>
        </div>

        <a
          href="/api/auth/google/login"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            width: "100%",
            padding: "0.75rem",
            background: "white",
            color: "#2d2b25",
            border: "1px solid rgba(45,43,37,0.15)",
            fontFamily: "inherit",
            fontSize: "0.85rem",
            fontWeight: 500,
            textDecoration: "none",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184L12.048 13.56c-.83.556-1.896.885-3.048.885-2.344 0-4.33-1.584-5.037-3.715H1.057v2.332A8.997 8.997 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.963 10.73A5.405 5.405 0 0 1 3.6 9c0-.603.104-1.187.291-1.73V4.938H1.057A8.998 8.998 0 0 0 0 9c0 1.51.374 2.934 1.057 4.192l2.906-2.462z" />
            <path fill="#EA4335" d="M9 3.555c1.322 0 2.508.454 3.442 1.345l2.582-2.58C13.463.806 11.426 0 9 0 5.537 0 2.582 1.963 1.057 4.938L3.963 7.27C4.67 5.139 6.656 3.555 9 3.555z" />
          </svg>
          Sign in with Google
        </a>
      </div>
    </div>
  );
}
