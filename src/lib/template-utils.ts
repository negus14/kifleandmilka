import { WeddingSite, DEFAULT_SECTION_ORDER, SECTION_LABELS } from "./types/wedding-site";
import { getTheme, getFontStyle, buildGoogleFontsUrl } from "./themes";

/**
 * Ensures a site object has all required fields and conforms to the latest structure.
 * This is used when loading data from the DB to "silently" upgrade older records.
 */
export function normalizeSiteData(site: WeddingSite): WeddingSite {
  const data = { ...site };

  // 1. Ensure sectionOrder exists and is valid
  if (!data.sectionOrder || data.sectionOrder.length === 0) {
    data.sectionOrder = [...DEFAULT_SECTION_ORDER];
  } else {
    // Ensure all existing sections have a 'type' (legacy fix)
    data.sectionOrder = data.sectionOrder
      .filter(s => s.id !== "day2" && s.type !== "day2")
      .map(s => ({
        ...s,
        type: s.type || s.id
      }));

    // Mandatory sections: Hero must be first, Footer must be last.
    const hasHero = data.sectionOrder.some(s => s.type === "hero");
    if (!hasHero) {
      data.sectionOrder.unshift({ id: "hero", type: "hero", visible: true });
    }
    
    const hasFooter = data.sectionOrder.some(s => s.type === "footer");
    if (!hasFooter) {
      data.sectionOrder.push({ id: "footer", type: "footer", visible: true });
    }
  }

  // 2. Initialize empty containers for new features if missing
  if (data.faqs === undefined) {
    data.faqHeading = "Frequently Asked Questions";
    data.faqs = [];
  }
  
  if (!data.eventDays) {
    data.eventDays = [];
  }

  // 3. Ensure weddingDays exists
  if (!data.weddingDays || data.weddingDays.length === 0) {
    data.weddingDays = [];
  }

  return data;
}

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
 * Generates CSS variables based on the site's theme and font style,
 * merging any custom color/font overrides on top of presets.
 */
export function generateThemeVars(site: WeddingSite): React.CSSProperties {
  const theme = getTheme(site.templateId);
  const fontStyle = getFontStyle(site.fontStyleId);

  // Merge custom overrides on top of preset values
  const colors = { ...theme.colors, ...site.customColors };
  const fonts = { ...fontStyle.fonts, ...site.customFonts };

  return {
    "--color-dark": colors.dark,
    "--color-accent": colors.accent,
    "--color-primary": colors.primary,
    "--color-accent-light": colors.accentLight,
    "--color-accent-dark": colors.accentDark,
    "--color-primary-dark": colors.primaryDark,
    "--font-script": fonts.script,
    "--font-serif": fonts.serif,
    "--font-sans": fonts.sans,
    // Optical tuning overrides
    "--tracking-sans": fontStyle.overrides?.letterSpacingSans || "0em",
    "--tracking-serif": fontStyle.overrides?.letterSpacingSerif || "0em",
    "--line-height-script": fontStyle.overrides?.lineHeightScript || "1.1",
    "--weight-sans": fontStyle.overrides?.fontWeightSans || "400",
  } as React.CSSProperties;
}

/**
 * Returns the Google Fonts URL for the site, accounting for custom font overrides.
 */
export function getGoogleFontsUrl(site: WeddingSite): string {
  const fontStyle = getFontStyle(site.fontStyleId);
  if (!site.customFonts?.script && !site.customFonts?.serif && !site.customFonts?.sans) {
    return fontStyle.googleFontsUrl;
  }
  const mergedFonts = { ...fontStyle.fonts, ...site.customFonts };
  return buildGoogleFontsUrl(mergedFonts, fontStyle.googleFontsUrl);
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
