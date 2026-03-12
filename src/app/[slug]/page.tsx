import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSiteBySlug } from "@/lib/data/sites";
import ClassicTemplate from "@/templates/classic/Template";
import ModernTemplate from "@/templates/modern/Template";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const site = await getSiteBySlug(slug);
  if (!site) return {};
  return {
    title: `${site.partner1Name} & ${site.partner2Name} — ${site.dateDisplayText}`,
    description: `Join us in celebrating the wedding of ${site.partner1Name} and ${site.partner2Name} — ${site.dateDisplayText} in ${site.locationText}.`,
  };
}

export default async function WeddingSitePage({ params }: Props) {
  const { slug } = await params;

  // Reserved slugs
  const reserved = ["dashboard", "api", "login", "signup", "pricing", "about", "admin"];
  if (reserved.includes(slug)) return notFound();

  const site = await getSiteBySlug(slug);
  if (!site || !site.isPublished) return notFound();

  if (site.layoutId === "modern") {
    return <ModernTemplate site={site} />;
  }

  return <ClassicTemplate site={site} />;
}
