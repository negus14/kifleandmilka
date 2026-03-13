import { WeddingSite, DEFAULT_SECTION_ORDER } from "./types/wedding-site";
import { getTheme, getFontStyle } from "./themes";

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
 * Generates CSS variables based on the site's theme and font style.
 */
export function generateThemeVars(site: WeddingSite): React.CSSProperties {
  const theme = getTheme(site.templateId);
  const fontStyle = getFontStyle(site.fontStyleId);

  return {
    "--color-dark": theme.colors.dark,
    "--color-accent": theme.colors.accent,
    "--color-primary": theme.colors.primary,
    "--color-accent-light": theme.colors.accentLight,
    "--color-accent-dark": theme.colors.accentDark,
    "--color-primary-dark": theme.colors.primaryDark,
    "--font-script": fontStyle.fonts.script,
    "--font-serif": fontStyle.fonts.serif,
    "--font-sans": fontStyle.fonts.sans,
    // Optical tuning overrides
    "--tracking-sans": fontStyle.overrides?.letterSpacingSans || "0em",
    "--tracking-serif": fontStyle.overrides?.letterSpacingSerif || "0em",
    "--line-height-script": fontStyle.overrides?.lineHeightScript || "1.1",
    "--weight-sans": fontStyle.overrides?.fontWeightSans || "400",
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
