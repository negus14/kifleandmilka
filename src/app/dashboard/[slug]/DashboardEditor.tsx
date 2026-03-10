"use client";

import { useState } from "react";
import type {
  WeddingSite,
  VenueItem,
  ScheduleItem,
  MenuItem,
  GalleryImage,
  ExploreGroup,
  AccommodationItem,
  ContactEntry,
  VenueInfoBlock,
} from "@/lib/types/wedding-site";

const TABS = [
  "Basics", "Hero", "Story", "Details", "Schedule",
  "Menu", "Gallery", "Explore", "Stay", "RSVP", "Gift", "Footer",
] as const;
type Tab = (typeof TABS)[number];

// ─── Primitives ───

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-[#2d2b25]/60 mb-1 mt-4 first:mt-0">
      {children}
    </label>
  );
}

function Field({ label, value, onChange, placeholder, multiline, rows }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; multiline?: boolean; rows?: number;
}) {
  return (
    <div className="mb-3">
      <Label>{label}</Label>
      {multiline ? (
        <textarea
          value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} rows={rows || 4}
          className="w-full px-3 py-2 border border-[#2d2b25]/15 bg-white/50 text-[#2d2b25] text-sm outline-none focus:border-[#2d2b25]/40 resize-y rounded-sm"
        />
      ) : (
        <input
          value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-[#2d2b25]/15 bg-white/50 text-[#2d2b25] text-sm outline-none focus:border-[#2d2b25]/40 rounded-sm"
        />
      )}
    </div>
  );
}

function Card({ children, onRemove, title }: { children: React.ReactNode; onRemove?: () => void; title?: string }) {
  return (
    <div className="border border-[#2d2b25]/10 bg-white/40 p-4 rounded-sm mb-3 relative">
      {title && <p className="text-xs font-semibold tracking-wide uppercase text-[#2d2b25]/40 mb-3">{title}</p>}
      {onRemove && (
        <button onClick={onRemove} type="button"
          className="absolute top-3 right-3 text-[#2d2b25]/30 hover:text-red-500 text-lg leading-none transition-colors"
          title="Remove"
        >&times;</button>
      )}
      {children}
    </div>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} type="button"
      className="text-xs font-semibold tracking-[0.1em] uppercase text-[#2d2b25]/50 border border-dashed border-[#2d2b25]/20 px-4 py-2 hover:border-[#2d2b25]/40 hover:text-[#2d2b25] transition-colors w-full mt-1 mb-4 rounded-sm"
    >+ {label}</button>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>{children}</h2>;
}

// ─── Main Editor ───

export default function DashboardEditor({ site: initial }: { site: WeddingSite }) {
  const [site, setSite] = useState(initial);
  const [tab, setTab] = useState<Tab>("Basics");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof WeddingSite>(key: K, value: WeddingSite[K]) {
    setSite((s) => ({ ...s, [key]: value }));
    setSaved(false);
  }

  function updateInArray<T>(arr: T[], index: number, patch: Partial<T>): T[] {
    return arr.map((item, i) => (i === index ? { ...item, ...patch } : item));
  }

  function removeFromArray<T>(arr: T[], index: number): T[] {
    return arr.filter((_, i) => i !== index);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const { passwordHash, ...data } = site;
      await fetch(`/api/sites/${site.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setSaved(true);
    } catch (err) {
      alert("Failed to save. Please try again.");
    }
    setSaving(false);
  }

  return (
    <div className="min-h-screen bg-[#faf1e1]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#2d2b25]/[0.08] bg-[#faf1e1]/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="text-base" style={{ fontFamily: "'Playfair Display', serif" }}>
              I Think She Wifey
            </a>
            <span className="text-[#2d2b25]/30">/</span>
            <span className="text-sm text-[#2d2b25]/60">{site.partner1Name} & {site.partner2Name}</span>
          </div>
          <div className="flex items-center gap-3">
            <a href={`/${site.slug}`} target="_blank"
              className="text-xs tracking-wide uppercase text-[#2d2b25]/50 hover:text-[#2d2b25] transition-colors">
              View Site
            </a>
            <button onClick={handleSave} disabled={saving}
              className="bg-[#2d2b25] text-[#faf1e1] px-5 py-2 text-xs font-semibold tracking-[0.1em] uppercase disabled:opacity-60 hover:bg-[#1a1812] transition-colors">
              {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </button>
            <form action="/api/auth/logout" method="POST">
              <button type="submit"
                className="text-xs tracking-wide uppercase text-[#2d2b25]/40 hover:text-red-500 transition-colors">
                Log Out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar */}
        <nav className="w-44 shrink-0 sticky top-20 self-start">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`block w-full text-left px-3 py-2 text-sm rounded-sm mb-0.5 transition-colors ${
                tab === t ? "bg-[#2d2b25] text-[#faf1e1]" : "text-[#2d2b25]/60 hover:text-[#2d2b25] hover:bg-[#2d2b25]/5"
              }`}
            >{t}</button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 max-w-2xl">

          {/* ─── BASICS ─── */}
          {tab === "Basics" && (
            <div>
              <SectionTitle>Basic Info</SectionTitle>
              <Field label="Partner 1 Name" value={site.partner1Name} onChange={(v) => set("partner1Name", v)} />
              <Field label="Partner 2 Name" value={site.partner2Name} onChange={(v) => set("partner2Name", v)} />
              <Field label="Wedding Date" value={site.weddingDate} onChange={(v) => set("weddingDate", v)} placeholder="2026-08-01T14:00:00-05:00" />
              <Field label="Display Date Text" value={site.dateDisplayText} onChange={(v) => set("dateDisplayText", v)} />
              <Field label="Location" value={site.locationText} onChange={(v) => set("locationText", v)} />
              <Field label="Nav Brand Text" value={site.navBrand} onChange={(v) => set("navBrand", v)} placeholder="K & M" />
            </div>
          )}

          {/* ─── HERO ─── */}
          {tab === "Hero" && (
            <div>
              <SectionTitle>Hero Section</SectionTitle>
              <Field label="Pre-text" value={site.heroPretext} onChange={(v) => set("heroPretext", v)} />
              <Field label="Tagline" value={site.heroTagline} onChange={(v) => set("heroTagline", v)} />
              <Field label="CTA Button Text" value={site.heroCta} onChange={(v) => set("heroCta", v)} />
              <Field label="Hero Image URL" value={site.heroImageUrl} onChange={(v) => set("heroImageUrl", v)} />
              {site.heroImageUrl && (
                <div className="mt-2 mb-4">
                  <img src={site.heroImageUrl} alt="Hero preview" className="w-full max-w-xs h-32 object-cover rounded-sm border border-[#2d2b25]/10" />
                </div>
              )}
            </div>
          )}

          {/* ─── STORY ─── */}
          {tab === "Story" && (
            <div>
              <SectionTitle>Our Story</SectionTitle>
              <Field label="Subtitle" value={site.storySubtitle} onChange={(v) => set("storySubtitle", v)} />
              <Field label="Title" value={site.storyTitle} onChange={(v) => set("storyTitle", v)} />
              <Field label="Lead Quote" value={site.storyLeadQuote} onChange={(v) => set("storyLeadQuote", v)} multiline rows={3} />
              <Label>Story Paragraphs</Label>
              {site.storyBody.map((p, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <textarea value={p} rows={3}
                    onChange={(e) => set("storyBody", site.storyBody.map((x, j) => j === i ? e.target.value : x))}
                    className="flex-1 px-3 py-2 border border-[#2d2b25]/15 bg-white/50 text-[#2d2b25] text-sm outline-none focus:border-[#2d2b25]/40 resize-y rounded-sm"
                  />
                  <button onClick={() => set("storyBody", removeFromArray(site.storyBody, i))} type="button"
                    className="text-[#2d2b25]/30 hover:text-red-500 px-2 self-start mt-2">&times;</button>
                </div>
              ))}
              <AddButton label="Add Paragraph" onClick={() => set("storyBody", [...site.storyBody, ""])} />
              <Field label="Story Image URL" value={site.storyImageUrl} onChange={(v) => set("storyImageUrl", v)} />
              {site.storyImageUrl && (
                <img src={site.storyImageUrl} alt="Story preview" className="w-full max-w-xs h-32 object-cover rounded-sm border border-[#2d2b25]/10 mb-4" />
              )}

              <SectionTitle>Quote</SectionTitle>
              <Field label="Quote Text" value={site.quoteText} onChange={(v) => set("quoteText", v)} multiline rows={3} />
              <Field label="Attribution" value={site.quoteAttribution} onChange={(v) => set("quoteAttribution", v)} />

              <SectionTitle>Featured Photo</SectionTitle>
              <Field label="Photo URL" value={site.featuredPhotoUrl} onChange={(v) => set("featuredPhotoUrl", v)} />
              <Field label="Caption" value={site.featuredPhotoCaption} onChange={(v) => set("featuredPhotoCaption", v)} />

              <SectionTitle>Love Letter</SectionTitle>
              <Field label="Opening" value={site.letterOpening} onChange={(v) => set("letterOpening", v)} />
              <Label>Body Paragraphs</Label>
              {site.letterBody.map((p, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <textarea value={p} rows={3}
                    onChange={(e) => set("letterBody", site.letterBody.map((x, j) => j === i ? e.target.value : x))}
                    className="flex-1 px-3 py-2 border border-[#2d2b25]/15 bg-white/50 text-[#2d2b25] text-sm outline-none focus:border-[#2d2b25]/40 resize-y rounded-sm"
                  />
                  <button onClick={() => set("letterBody", removeFromArray(site.letterBody, i))} type="button"
                    className="text-[#2d2b25]/30 hover:text-red-500 px-2 self-start mt-2">&times;</button>
                </div>
              ))}
              <AddButton label="Add Paragraph" onClick={() => set("letterBody", [...site.letterBody, ""])} />
              <Field label="Closing" value={site.letterClosing} onChange={(v) => set("letterClosing", v)} />
            </div>
          )}

          {/* ─── DETAILS (Venues) ─── */}
          {tab === "Details" && (
            <div>
              <SectionTitle>Venues</SectionTitle>
              {site.venues.map((v, i) => (
                <Card key={i} title={v.label || `Venue ${i + 1}`} onRemove={() => set("venues", removeFromArray(site.venues, i))}>
                  <Field label="Label" value={v.label} onChange={(val) => set("venues", updateInArray(site.venues, i, { label: val }))} placeholder="Ceremony / Reception" />
                  <Field label="Venue Name" value={v.name} onChange={(val) => set("venues", updateInArray(site.venues, i, { name: val }))} />
                  <Field label="Address" value={v.address} onChange={(val) => set("venues", updateInArray(site.venues, i, { address: val }))} multiline rows={2} />
                  <Field label="Time" value={v.time} onChange={(val) => set("venues", updateInArray(site.venues, i, { time: val }))} placeholder="2:00 PM" />
                  <Field label="Google Maps Embed URL" value={v.mapsEmbedUrl || ""} onChange={(val) => set("venues", updateInArray(site.venues, i, { mapsEmbedUrl: val }))} />
                </Card>
              ))}
              <AddButton label="Add Venue" onClick={() => set("venues", [...site.venues, { label: "", name: "", address: "", time: "", mapsEmbedUrl: "" }])} />

              <SectionTitle>Additional Venue Info</SectionTitle>
              {site.venueInfoBlocks.map((b, i) => (
                <Card key={i} onRemove={() => set("venueInfoBlocks", removeFromArray(site.venueInfoBlocks, i))}>
                  <Field label="Heading" value={b.heading || ""} onChange={(val) => set("venueInfoBlocks", updateInArray(site.venueInfoBlocks, i, { heading: val }))} />
                  <Field label="Subheading" value={b.subheading || ""} onChange={(val) => set("venueInfoBlocks", updateInArray(site.venueInfoBlocks, i, { subheading: val }))} />
                  <Field label="Text" value={b.text} onChange={(val) => set("venueInfoBlocks", updateInArray(site.venueInfoBlocks, i, { text: val }))} multiline rows={3} />
                </Card>
              ))}
              <AddButton label="Add Info Block" onClick={() => set("venueInfoBlocks", [...site.venueInfoBlocks, { text: "" }])} />

              <SectionTitle>Day Two Event</SectionTitle>
              {site.dayTwoEvent ? (
                <Card onRemove={() => set("dayTwoEvent", null)}>
                  <Field label="Heading" value={site.dayTwoEvent.heading} onChange={(v) => set("dayTwoEvent", { ...site.dayTwoEvent!, heading: v })} />
                  <Field label="Time" value={site.dayTwoEvent.time} onChange={(v) => set("dayTwoEvent", { ...site.dayTwoEvent!, time: v })} />
                  <Field label="Address" value={site.dayTwoEvent.address} onChange={(v) => set("dayTwoEvent", { ...site.dayTwoEvent!, address: v })} multiline rows={2} />
                  <Field label="Note" value={site.dayTwoEvent.note} onChange={(v) => set("dayTwoEvent", { ...site.dayTwoEvent!, note: v })} multiline rows={2} />
                </Card>
              ) : (
                <AddButton label="Add Day Two Event" onClick={() => set("dayTwoEvent", { heading: "Day Two Celebration", time: "", address: "", note: "" })} />
              )}
            </div>
          )}

          {/* ─── SCHEDULE ─── */}
          {tab === "Schedule" && (
            <div>
              <SectionTitle>Schedule</SectionTitle>
              {site.scheduleItems.map((item, i) => (
                <Card key={i} title={item.event || `Event ${i + 1}`} onRemove={() => set("scheduleItems", removeFromArray(site.scheduleItems, i))}>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Time" value={item.hour} onChange={(v) => set("scheduleItems", updateInArray(site.scheduleItems, i, { hour: v }))} placeholder="2:00" />
                    <Field label="AM/PM" value={item.period} onChange={(v) => set("scheduleItems", updateInArray(site.scheduleItems, i, { period: v }))} placeholder="PM" />
                  </div>
                  <Field label="Event Name" value={item.event} onChange={(v) => set("scheduleItems", updateInArray(site.scheduleItems, i, { event: v }))} />
                  <Field label="Venue" value={item.venue} onChange={(v) => set("scheduleItems", updateInArray(site.scheduleItems, i, { venue: v }))} />
                  <Field label="Description" value={item.description} onChange={(v) => set("scheduleItems", updateInArray(site.scheduleItems, i, { description: v }))} multiline rows={2} />
                </Card>
              ))}
              <AddButton label="Add Schedule Item" onClick={() => set("scheduleItems", [...site.scheduleItems, { hour: "", period: "PM", event: "", venue: "", description: "" }])} />
            </div>
          )}

          {/* ─── MENU ─── */}
          {tab === "Menu" && (
            <div>
              <SectionTitle>Menu</SectionTitle>
              {site.menuItems.map((item, i) => (
                <Card key={i} title={item.name || `Item ${i + 1}`} onRemove={() => set("menuItems", removeFromArray(site.menuItems, i))}>
                  <Field label="Dish Name" value={item.name} onChange={(v) => set("menuItems", updateInArray(site.menuItems, i, { name: v }))} />
                  <Field label="Description" value={item.description} onChange={(v) => set("menuItems", updateInArray(site.menuItems, i, { description: v }))} multiline rows={2} />
                </Card>
              ))}
              <AddButton label="Add Menu Item" onClick={() => set("menuItems", [...site.menuItems, { name: "", description: "" }])} />
              <Field label="Menu Note" value={site.menuNote} onChange={(v) => set("menuNote", v)} />
            </div>
          )}

          {/* ─── GALLERY ─── */}
          {tab === "Gallery" && (
            <div>
              <SectionTitle>Gallery</SectionTitle>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {site.galleryImages.map((img, i) => (
                  <Card key={i} onRemove={() => set("galleryImages", removeFromArray(site.galleryImages, i))}>
                    {img.url && (
                      <img src={img.url} alt={img.alt} className="w-full h-32 object-cover rounded-sm mb-3 border border-[#2d2b25]/10" />
                    )}
                    <Field label="Image URL" value={img.url} onChange={(v) => set("galleryImages", updateInArray(site.galleryImages, i, { url: v }))} />
                    <Field label="Alt Text" value={img.alt} onChange={(v) => set("galleryImages", updateInArray(site.galleryImages, i, { alt: v }))} />
                  </Card>
                ))}
              </div>
              <AddButton label="Add Image" onClick={() => set("galleryImages", [...site.galleryImages, { url: "", alt: "" }])} />
            </div>
          )}

          {/* ─── EXPLORE ─── */}
          {tab === "Explore" && (
            <div>
              <SectionTitle>Things to Do</SectionTitle>
              {site.exploreGroups.map((group, i) => (
                <Card key={i} title={group.heading || `Group ${i + 1}`} onRemove={() => set("exploreGroups", removeFromArray(site.exploreGroups, i))}>
                  <Field label="Group Heading" value={group.heading} onChange={(v) => set("exploreGroups", updateInArray(site.exploreGroups, i, { heading: v }))} />
                  <Field label="Subheading (optional)" value={group.subheading || ""} onChange={(v) => set("exploreGroups", updateInArray(site.exploreGroups, i, { subheading: v || undefined }))} />
                  <Label>Links</Label>
                  {group.links.map((link, j) => (
                    <div key={j} className="flex gap-2 mb-2">
                      <input value={link.label} placeholder="Label"
                        onChange={(e) => {
                          const newLinks = [...group.links];
                          newLinks[j] = { ...newLinks[j], label: e.target.value };
                          set("exploreGroups", updateInArray(site.exploreGroups, i, { links: newLinks }));
                        }}
                        className="flex-1 px-3 py-2 border border-[#2d2b25]/15 bg-white/50 text-sm outline-none focus:border-[#2d2b25]/40 rounded-sm"
                      />
                      <input value={link.url} placeholder="URL"
                        onChange={(e) => {
                          const newLinks = [...group.links];
                          newLinks[j] = { ...newLinks[j], url: e.target.value };
                          set("exploreGroups", updateInArray(site.exploreGroups, i, { links: newLinks }));
                        }}
                        className="flex-1 px-3 py-2 border border-[#2d2b25]/15 bg-white/50 text-sm outline-none focus:border-[#2d2b25]/40 rounded-sm"
                      />
                      <button onClick={() => {
                        const newLinks = group.links.filter((_, k) => k !== j);
                        set("exploreGroups", updateInArray(site.exploreGroups, i, { links: newLinks }));
                      }} type="button" className="text-[#2d2b25]/30 hover:text-red-500 px-1">&times;</button>
                    </div>
                  ))}
                  <button onClick={() => {
                    const newLinks = [...group.links, { label: "", url: "" }];
                    set("exploreGroups", updateInArray(site.exploreGroups, i, { links: newLinks }));
                  }} type="button"
                    className="text-xs text-[#2d2b25]/40 hover:text-[#2d2b25] mt-1">+ Add Link</button>
                </Card>
              ))}
              <AddButton label="Add Group" onClick={() => set("exploreGroups", [...site.exploreGroups, { heading: "", links: [] }])} />
            </div>
          )}

          {/* ─── STAY ─── */}
          {tab === "Stay" && (
            <div>
              <SectionTitle>Accommodations</SectionTitle>
              {site.accommodations.map((hotel, i) => (
                <Card key={i} title={hotel.name || `Hotel ${i + 1}`} onRemove={() => set("accommodations", removeFromArray(site.accommodations, i))}>
                  <Field label="Hotel Name" value={hotel.name} onChange={(v) => set("accommodations", updateInArray(site.accommodations, i, { name: v }))} />
                  <Field label="Distance" value={hotel.distance} onChange={(v) => set("accommodations", updateInArray(site.accommodations, i, { distance: v }))} placeholder="10 min drive" />
                  <Field label="Description" value={hotel.description} onChange={(v) => set("accommodations", updateInArray(site.accommodations, i, { description: v }))} multiline rows={2} />
                  <Field label="Booking URL" value={hotel.bookingUrl} onChange={(v) => set("accommodations", updateInArray(site.accommodations, i, { bookingUrl: v }))} />
                  <Field label="Badge (optional)" value={hotel.badge || ""} onChange={(v) => set("accommodations", updateInArray(site.accommodations, i, { badge: v || undefined }))} placeholder="Reception Venue" />
                </Card>
              ))}
              <AddButton label="Add Hotel" onClick={() => set("accommodations", [...site.accommodations, { name: "", distance: "", description: "", bookingUrl: "" }])} />
            </div>
          )}

          {/* ─── RSVP ─── */}
          {tab === "RSVP" && (
            <div>
              <SectionTitle>RSVP</SectionTitle>
              <Field label="Heading" value={site.rsvpHeading} onChange={(v) => set("rsvpHeading", v)} />
              <Field label="Deadline Text" value={site.rsvpDeadlineText} onChange={(v) => set("rsvpDeadlineText", v)} />
              <Field label="Tally Form Embed URL" value={site.rsvpEmbedUrl} onChange={(v) => set("rsvpEmbedUrl", v)} />
              <p className="text-xs text-[#2d2b25]/40 -mt-1 mb-4">
                Paste your Tally.so embed URL here. Connect Tally to Google Sheets to track responses.
              </p>
            </div>
          )}

          {/* ─── GIFT ─── */}
          {tab === "Gift" && (
            <div>
              <SectionTitle>Gift</SectionTitle>
              <Field label="Heading" value={site.giftHeading} onChange={(v) => set("giftHeading", v)} />
              <Field label="Subheading" value={site.giftSubheading} onChange={(v) => set("giftSubheading", v)} multiline rows={3} />
              <Field label="Payment URL" value={site.giftPaymentUrl} onChange={(v) => set("giftPaymentUrl", v)} />
              <Field label="Button Label" value={site.giftPaymentLabel} onChange={(v) => set("giftPaymentLabel", v)} />
              <Field label="Note" value={site.giftNote} onChange={(v) => set("giftNote", v)} />
            </div>
          )}

          {/* ─── FOOTER ─── */}
          {tab === "Footer" && (
            <div>
              <SectionTitle>Footer</SectionTitle>
              <Field label="Names" value={site.footerNames} onChange={(v) => set("footerNames", v)} />
              <Field label="Date Text" value={site.footerDateText} onChange={(v) => set("footerDateText", v)} />
              <Field label="Copyright" value={site.footerCopyright} onChange={(v) => set("footerCopyright", v)} />

              <SectionTitle>Contact Info</SectionTitle>
              {site.contactEntries.map((c, i) => (
                <Card key={i} onRemove={() => set("contactEntries", removeFromArray(site.contactEntries, i))}>
                  <Field label="Email" value={c.email} onChange={(v) => set("contactEntries", updateInArray(site.contactEntries, i, { email: v }))} />
                  <Field label="Phone" value={c.phone || ""} onChange={(v) => set("contactEntries", updateInArray(site.contactEntries, i, { phone: v }))} />
                </Card>
              ))}
              <AddButton label="Add Contact" onClick={() => set("contactEntries", [...site.contactEntries, { email: "", phone: "" }])} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
