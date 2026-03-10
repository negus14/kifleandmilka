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
}

export interface ContactEntry {
  email: string;
  phone?: string;
}

export interface WeddingSite {
  slug: string;
  isPublished: boolean;
  templateId: string;
  passwordHash?: string;

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

  // Structured sections
  venues: VenueItem[];
  venueInfoBlocks: VenueInfoBlock[];
  dayTwoEvent: DayTwoEvent | null;
  scheduleItems: ScheduleItem[];
  menuItems: MenuItem[];
  menuNote: string;
  galleryImages: GalleryImage[];
  exploreGroups: ExploreGroup[];
  accommodations: AccommodationItem[];
  contactEntries: ContactEntry[];
  navBrand: string;
}
