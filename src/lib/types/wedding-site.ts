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

export interface EventDay {
  id: string;
  label: string;         // e.g. "Day One", "Farewell Brunch"
  date?: string;
  venues: VenueItem[];
  infoBlocks: VenueInfoBlock[];
  note?: string;
  detailsStyle?: "grid" | "split" | "minimal";
  sectionBackground?: string; // Image URL
  sectionBackgroundColor?: "primary" | "accent" | "dark" | "transparent";
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
  dietaryOptions?: string[]; // e.g. ["Halal", "Kosher", "Vegan", "Gluten-Free"]
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
  phone?: string;
  email?: string;
  buttonLabel?: string;
}

export interface BankDetail {
  label: string; // e.g. "Canada (Interac e-Transfer)", "UK (Bank Transfer)"
  currencies?: string[];
  bankName?: string;
  accountHolder?: string;
  accountNumber?: string;
  sortCode?: string;
  swiftCode?: string;
  email?: string;
  payLink?: string;
}

export interface ContactEntry {
  email: string;
  phone?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface GiftItem {
  id: string;
  name: string;
  description: string;
  suggestedAmount?: string;
  imageUrl?: string;
}

export interface SectionConfig {
  id: string;   // Unique instance ID, e.g. "quote-1710264000"
  type: string; // Section type, e.g. "quote", "story", "featuredPhoto"
  visible: boolean;
}
export const DEFAULT_SECTION_ORDER: SectionConfig[] = [
  { id: "hero", type: "hero", visible: true },
  { id: "story", type: "story", visible: false },
  { id: "details", type: "details", visible: true },
  { id: "quote", type: "quote", visible: true },
  { id: "featuredPhoto", type: "featuredPhoto", visible: true },
  { id: "letter", type: "letter", visible: true },
  { id: "schedule", type: "schedule", visible: true },
  { id: "menu", type: "menu", visible: true },
  { id: "faqs", type: "faqs", visible: false },
  { id: "gallery", type: "gallery", visible: true },
  { id: "explore", type: "explore", visible: true },
  { id: "accommodations", type: "accommodations", visible: false },
  { id: "rsvp", type: "rsvp", visible: true },
  { id: "gift", type: "gift", visible: true },
  { id: "contact", type: "contact", visible: true },
  { id: "footer", type: "footer", visible: true },
];

export const SECTION_LABELS: Record<string, string> = {
  hero: "Hero",
  story: "Our Story",
  details: "Wedding Details",
  quote: "Quote",
  featuredPhoto: "Photo",
  letter: "Letter",
  schedule: "Schedule",
  menu: "Menu",
  faqs: "FAQs",
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
  isPaid?: string | Date | null;
  stripeCustomerId?: string | null;
  templateId: string;
  fontStyleId?: "timeless" | "modern" | "playful" | "vintage" | "editorial" | "bohemian" | "classic-serif" | "bold-modern";
  layoutId?: "classic" | "modern";
  passwordHash?: string;
  sectionOrder?: SectionConfig[];

  // Core
  partner1Name: string;
  partner2Name: string;
  weddingDate: string; // ISO string (Start Date)
  weddingEndDate?: string; // ISO string (End Date)
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

  // Photo
  featuredPhotoUrl: string;
  featuredPhotoCaption: string;

  // Letter
  letterOpening: string;
  letterBody: string[];
  letterClosing: string;

  // RSVP
  rsvpHeading: string;
  rsvpDeadlineText: string;
  rsvpEmbedUrl: string;
  rsvpMealOptions?: string[];
  showHalalOption?: boolean;
  rsvpConfirmationMessage?: string;
  coupleEmail?: string;
  googleSheetId?: string;
  googleSheetName?: string;

  // FAQs
  faqHeading: string;
  faqs: FAQItem[];

  // Gift
  giftHeading: string;
  giftSubheading: string;
  giftPaymentLinks?: { label: string; url: string; currencies?: string[] }[];
  giftNote: string;
  giftBankDetails?: BankDetail[];
  giftItems?: GiftItem[];
  giftCurrency?: string;
  giftAcceptedCurrencies?: string[];
  giftEnableContributions?: boolean;
  giftShowName?: boolean;

  // Footer
  footerNames: string;
  footerDateText: string;
  footerCopyright: string;
  footerDevCredit?: string;

  // Contact
  contactHeading?: string;
  contactSubheading?: string;

  // Structured sections
  eventDays: EventDay[];
  
  weddingDays?: WeddingDay[];
  scheduleStyle?: "classic" | "minimal" | "cards";
  menuItems: MenuItem[];
  menuNote: string;
  galleryImages: GalleryImage[];
  exploreGroups: ExploreGroup[];
  accommodations: AccommodationItem[];
  accommodationNote: string;
  contactEntries: ContactEntry[];
  navBrand: string;
  sectionBackgrounds?: Record<string, string>;
  sectionBackgroundColors?: Record<string, "primary" | "accent" | "dark" | "transparent">;
  sectionData?: Record<string, any>; // Instance-specific data for duplicate sections
  recentlyUsedLinks?: string[];
  customDomain?: string | null;
}
