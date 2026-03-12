import { WeddingSite, DEFAULT_SECTION_ORDER } from "./types/wedding-site";
import { getTheme } from "./themes";

/**
 * Maps a standard Google Maps URL to an embeddable format.
 */
export function toEmbedUrl(url: string): string {
  if (!url) return "";
  // Already an embed URL
  if (url.includes("/maps/embed") || url.includes("maps?output=embed")) return url;
  
  // Extract place name from Google Maps place URL
  const placeMatch = url.match(/\/place\/([^/@]+)/);
  if (placeMatch) {
    const query = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
    return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  }
  
  // Extract coordinates as fallback
  const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coordMatch) {
    return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&output=embed`;
  }
  
  return url;
}

/**
 * Generates CSS variables based on the site's theme.
 */
export function generateThemeVars(templateId: string): React.CSSProperties {
  const theme = getTheme(templateId);
  return {
    "--color-dark": theme.colors.dark,
    "--color-tan": theme.colors.tan,
    "--color-cream": theme.colors.cream,
    "--color-tan-light": theme.colors.tanLight,
    "--color-tan-dark": theme.colors.tanDark,
    "--color-cream-dark": theme.colors.creamDark,
    "--font-script": theme.fonts.script,
    "--font-serif": theme.fonts.serif,
    "--font-sans": theme.fonts.sans,
  } as React.CSSProperties;
}

/**
 * Helper to get visible sections and navigation items.
 */
export function getSectionData(site: WeddingSite) {
  const order = site.sectionOrder ?? DEFAULT_SECTION_ORDER;
  const visibleSections = order.filter((s) => s.visible);

  const typeToLabel: Record<string, string> = {
    hero: "Hero",
    story: "Story",
    quote: "Quote",
    featuredPhoto: "Photo",
    letter: "Letter",
    details: "Details",
    schedule: "Schedule",
    menu: "Menu",
    accommodations: "Stay",
    explore: "Explore",
    gallery: "Gallery",
    gift: "Gift",
    rsvp: "RSVP",
    contact: "Contact",
    footer: "Footer"
  };

  const navItems = visibleSections
    .filter(s => s.type !== 'hero' && s.type !== 'footer')
    .map(s => ({
      id: s.id,
      label: typeToLabel[s.type] || s.type
    }));

  return { order, visibleSections: new Set(visibleSections.map(s => s.id)), navItems };
}
