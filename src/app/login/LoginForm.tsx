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
            }}
          >
            {pending ? "Logging in..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}
