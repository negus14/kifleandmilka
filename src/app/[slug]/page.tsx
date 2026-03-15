import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSiteBySlug } from "@/lib/data/sites";
import ClassicTemplate from "@/templates/classic/Template";
import ModernTemplate from "@/templates/modern/Template";
import { getSession } from "@/lib/auth";
import Link from "next/link";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (slug.includes(".") || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) return {};
  const site = await getSiteBySlug(slug);
  if (!site) return {};
  return {
    title: `${site.partner1Name} & ${site.partner2Name} — ${site.dateDisplayText}`,
    description: `Join us in celebrating the wedding of ${site.partner1Name} and ${site.partner2Name} — ${site.dateDisplayText} in ${site.locationText}.`,
  };
}

export default async function WeddingSitePage({ params }: Props) {
  const { slug } = await params;

  // Block non-slug paths (files, reserved routes)
  if (slug.includes(".") || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) return notFound();
  const reserved = ["dashboard", "api", "login", "signup", "pricing", "about", "admin", "logout", "auth", "preview"];
  if (reserved.includes(slug)) return notFound();

  const site = await getSiteBySlug(slug);
  if (!site || !site.isPublished) return notFound();

  // Check if current user is logged into this specific site
  const session = await getSession();
  const isOwner = session?.slug === slug;

  return (
    <>
      {site.layoutId === "modern" ? (
        <ModernTemplate site={site} />
      ) : (
        <ClassicTemplate site={site} />
      )}

      {isOwner && (
        <div style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          zIndex: 9999,
        }}>
          <Link 
            href={`/dashboard/${slug}`}
            className="flex items-center gap-2 px-5 py-3 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95"
            style={{
              backgroundColor: "var(--color-dark, #2d2b25)",
              color: "var(--color-cream, #fdfcf9)",
              fontFamily: "var(--font-sans, sans-serif)",
              fontSize: "0.85rem",
              fontWeight: 600,
              letterSpacing: "0.05em",
              textDecoration: "none",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit in Dashboard
          </Link>
        </div>
      )}
    </>
  );
}
