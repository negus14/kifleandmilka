import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSiteByDomain } from "@/lib/data/sites";
import ClassicTemplate from "@/templates/classic/Template";
import ModernTemplate from "@/templates/modern/Template";

type Props = { params: Promise<{ domain: string; path?: string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain } = await params;
  const site = await getSiteByDomain(domain);
  if (!site || !site.isPublished || !site.isPaid) return {};

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.ithinkshewifey.com";

  return {
    metadataBase: new URL(baseUrl),
    title: `${site.partner1Name} & ${site.partner2Name} — ${site.dateDisplayText}`,
    description: `Join us in celebrating the wedding of ${site.partner1Name} and ${site.partner2Name} — ${site.dateDisplayText} in ${site.locationText}.`,
    openGraph: {
      title: `${site.partner1Name} & ${site.partner2Name}`,
      description: `Join us in celebrating the wedding of ${site.partner1Name} and ${site.partner2Name} — ${site.dateDisplayText} in ${site.locationText}.`,
      url: `https://${domain}`,
      type: "website",
      images: [`${baseUrl}/${site.slug}/opengraph-image`],
    },
    alternates: {
      canonical: `https://${domain}`,
    },
  };
}

export default async function CustomDomainPage({ params }: Props) {
  const { domain } = await params;

  const site = await getSiteByDomain(domain);
  if (!site) return notFound();
  if (!site.isPublished) return notFound();
  if (!site.isPaid) return notFound();

  return site.layoutId === "modern" ? (
    <ModernTemplate site={site} />
  ) : (
    <ClassicTemplate site={site} />
  );
}
