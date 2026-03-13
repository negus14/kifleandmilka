import { redirect } from "next/navigation";
import { createSession, getSession } from "@/lib/auth";
import { getSiteBySlug, createSite } from "@/lib/data/sites";
import { hash } from "bcryptjs";
import SignupForm from "./SignupForm";
import { DEFAULT_SECTION_ORDER, type WeddingSite } from "@/lib/types/wedding-site";

export const metadata = { title: "Sign Up — I Think She Wifey" };

const RESERVED_SLUGS = [
  "dashboard", "api", "login", "signup", "pricing", "about", "admin", "logout", "auth", "preview"
];

async function signupAction(formData: FormData) {
  "use server";

  const slug = (formData.get("slug") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!slug || !password) return { error: "Please fill in all fields." };

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { error: "URL can only contain lowercase letters, numbers, and hyphens." };
  }
  
  if (slug.length < 3) {
    return { error: "URL must be at least 3 characters long." };
  }

  if (RESERVED_SLUGS.includes(slug)) {
    return { error: "This URL is reserved." };
  }

  const existing = await getSiteBySlug(slug);
  if (existing) return { error: "This site URL is already taken." };

  const passwordHash = await hash(password, 10);

  // Initialize with default values
  const newSite: WeddingSite = {
    slug,
    passwordHash,
    isPublished: false,
    templateId: "classic-savannah",
    layoutId: "classic",
    fontStyleId: "timeless",
    partner1Name: "Partner One",
    partner2Name: "Partner Two",
    weddingDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
    dateDisplayText: "August 1st, 2026",
    locationText: "City, Country",
    navBrand: "P & P",
    
    heroPretext: "The Wedding of",
    heroTagline: "We're getting married",
    heroCta: "RSVP Now",
    heroImageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2560&auto=format&fit=crop",

    storySubtitle: "Our Journey",
    storyTitle: "Our Love Story",
    storyLeadQuote: "I have found the one whom my soul loves.",
    storyBody: ["We met...", "And then..."],
    storyImageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1200&auto=format&fit=crop",

    quoteText: "Love is patient, love is kind.",
    quoteAttribution: "1 Corinthians 13:4",

    featuredPhotoUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop",
    featuredPhotoCaption: "The Beginning",

    letterOpening: "Dear Family and Friends,",
    letterBody: ["We are so excited to celebrate with you!"],
    letterClosing: "With love, Partner One & Partner Two",

    rsvpHeading: "Kindly RSVP",
    rsvpDeadlineText: "Please respond by July 1st, 2026",
    rsvpEmbedUrl: "",
    
    giftHeading: "Registry",
    giftSubheading: "Your presence is enough, but if you wish to give...",
    giftPaymentUrl: "",
    giftPaymentLabel: "Honeymoon Fund",
    giftNote: "Thank you for your generosity.",

    footerNames: "P & P",
    footerDateText: "2026",
    footerCopyright: "Made with love",
    
    eventDays: [
      {
        id: "day-1",
        label: "Wedding Day",
        venues: [
          {
            name: "Venue Name",
            time: "4:00 PM",
            label: "Ceremony",
            address: "123 Street Name, City"
          }
        ],
        infoBlocks: [],
        detailsStyle: "grid"
      }
    ],
    scheduleItems: [
      {
        hour: "4:00",
        period: "PM",
        event: "Ceremony",
        venue: "Main Hall",
        description: "The exchange of vows."
      }
    ],
    menuItems: [],
    menuNote: "",
    galleryImages: [],
    exploreGroups: [],
    accommodations: [],
    contactEntries: [],
    sectionOrder: DEFAULT_SECTION_ORDER
  };

  await createSite(slug, newSite);
  await createSession(slug);
  redirect(`/dashboard/${slug}`);
}

export default async function SignupPage() {
  const session = await getSession();
  if (session) {
    redirect(`/dashboard/${session.slug}`);
  }

  return <SignupForm action={signupAction} />;
}
