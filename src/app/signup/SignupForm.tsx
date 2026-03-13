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
          Create your site
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
          Choose a URL and password to get started
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
              Desired Site URL
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ 
                paddingLeft: '1rem',
                fontSize: '0.95rem',
                opacity: 0.3,
                whiteSpace: 'nowrap'
              }}>
                ithinkshewifey.com/
              </span>
              <input
                id="slug"
                name="slug"
                type="text"
                required
                placeholder="adamandeve"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem 0.75rem 0.2rem",
                  border: "1px solid rgba(45,43,37,0.15)",
                  borderLeft: 'none',
                  background: "transparent",
                  fontFamily: "inherit",
                  fontSize: "0.95rem",
                  color: "#2d2b25",
                  outline: "none",
                }}
              />
            </div>
            <div style={{ 
              height: '1px', 
              width: '100%', 
              background: 'rgba(45,43,37,0.15)',
              marginTop: '-1px' 
            }} />
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
              Create Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
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
              marginBottom: '1.5rem'
            }}
          >
            {pending ? "Creating..." : "Create My Site"}
          </button>
          
          <p style={{ textAlign: 'center', fontSize: '0.8rem', opacity: 0.6 }}>
            Already have a site? <Link href="/login" style={{ color: '#2d2b25', fontWeight: 600, textDecoration: 'none' }}>Log In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
