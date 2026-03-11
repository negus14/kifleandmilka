export interface VenueItem {
  label: string;
  name: string;
  address: string;
  time: string;
  mapsEmbedUrl?: string;
}

export interface VenueInfoBlock {
  heading?: string;
  subheading?: string;
  text: string;
}

export interface DayTwoEvent {
  heading: string;
  time: string;
  address: string;
  note: string;
}

export interface ScheduleItem {
  hour: string;
  period: string;
  event: string;
  venue: string;
  description: string;
}

export interface WeddingDay {
  label: string;         // e.g. "Wedding Day", "Day Two", "Bridal Party"
  date?: string;         // e.g. "Saturday, August 1st"
  isPrivate: boolean;    // hidden from public site, only visible in dashboard
  items: ScheduleItem[];
}

export interface MenuItem {
  name: string;
  description: string;
}

export interface GalleryImage {
  url: string;
  alt: string;
}

export interface ExploreGroup {
  heading: string;
  subheading?: string;
  links: { label: string; url: string }[];
}

export interface AccommodationItem {
  name: string;
  distance: string;
  description: string;
  bookingUrl: string;
  badge?: string;
  discountCode?: string;
}

export interface ContactEntry {
  email: string;
  phone?: string;
}

export interface SectionConfig {
  id: string;
  visible: boolean;
}

export const DEFAULT_SECTION_ORDER: SectionConfig[] = [
  { id: "hero", visible: true },
  { id: "story", visible: true },
  { id: "details", visible: true },
  { id: "day2", visible: true },
  { id: "quote", visible: true },
  { id: "featuredPhoto", visible: true },
  { id: "letter", visible: true },
  { id: "schedule", visible: true },
  { id: "menu", visible: true },
  { id: "gallery", visible: true },
  { id: "explore", visible: true },
  { id: "accommodations", visible: true },
  { id: "rsvp", visible: true },
  { id: "gift", visible: true },
  { id: "contact", visible: true },
  { id: "footer", visible: true },
];

export const SECTION_LABELS: Record<string, string> = {
  hero: "Hero",
  story: "Our Story",
  details: "Wedding Details",
  day2: "Day Two Event",
  quote: "Quote",
  featuredPhoto: "Featured Photo",
  letter: "Love Letter",
  schedule: "Schedule",
  menu: "Menu",
  gallery: "Gallery",
  explore: "Things to Do",
  accommodations: "Accommodations",
  rsvp: "RSVP",
  gift: "Gift",
  contact: "Contact",
  footer: "Footer",
};

export interface WeddingSite {
  slug: string;
  isPublished: boolean;
  templateId: string;
  passwordHash?: string;
  sectionOrder?: SectionConfig[];

  // Core
  partner1Name: string;
  partner2Name: string;
  weddingDate: string; // ISO string
  dateDisplayText: string;
  locationText: string;

  // Hero
  heroPretext: string;
  heroTagline: string;
  heroCta: string;
  heroImageUrl: string;

  // Story
  storySubtitle: string;
  storyTitle: string;
  storyLeadQuote: string;
  storyBody: string[];
  storyImageUrl: string;

  // Quote
  quoteText: string;
  quoteAttribution: string;

  // Featured Photo
  featuredPhotoUrl: string;
  featuredPhotoCaption: string;

  // Love Letter
  letterOpening: string;
  letterBody: string[];
  letterClosing: string;

  // RSVP
  rsvpHeading: string;
  rsvpDeadlineText: string;
  rsvpEmbedUrl: string;

  // Gift
  giftHeading: string;
  giftSubheading: string;
  giftPaymentUrl: string;
  giftPaymentLabel: string;
  giftNote: string;

  // Footer
  footerNames: string;
  footerDateText: string;
  footerCopyright: string;
  footerDevCredit?: string;

  // Contact
  contactHeading?: string;

  // Structured sections
  venues: VenueItem[];
  venueInfoBlocks: VenueInfoBlock[];
  dayTwoEvent: DayTwoEvent | null;
  scheduleItems: ScheduleItem[];
  weddingDays?: WeddingDay[];
  menuItems: MenuItem[];
  menuNote: string;
  galleryImages: GalleryImage[];
  exploreGroups: ExploreGroup[];
  accommodations: AccommodationItem[];
  contactEntries: ContactEntry[];
  navBrand: string;
}
