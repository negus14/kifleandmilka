"use client";

import { useState } from "react";
import CountryCodePicker from "./CountryCodePicker";

interface Guest {
  id: string;
  name: string;
  attending: "yes" | "no";
  mealChoice: string;
  isHalal: boolean;
  dietaryPreference: string;
}

interface CalendarInfo {
  partner1Name: string;
  partner2Name: string;
  weddingDate: string;
  weddingEndDate?: string;
  dateDisplayText?: string;
  locationText?: string;
  siteSlug: string;
}

interface RSVPFormProps {
  slug: string;
  mealOptions?: string[];
  /** Map of meal name → available dietary options, e.g. { "Chicken": ["Halal", "Kosher"] } */
  mealDietaryOptions?: Record<string, string[]>;
  calendarInfo?: CalendarInfo;
}

function fmtCalDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const h = String(d.getUTCHours()).padStart(2, "0");
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  const s = String(d.getUTCSeconds()).padStart(2, "0");
  return `${y}${m}${day}T${h}${min}${s}`;
}

function buildGoogleCalendarUrl(info: CalendarInfo): string {
  const start = fmtCalDate(info.weddingDate);
  const end = info.weddingEndDate
    ? fmtCalDate(info.weddingEndDate)
    : fmtCalDate(new Date(new Date(info.weddingDate).getTime() + 4 * 60 * 60 * 1000).toISOString());
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${info.partner1Name} & ${info.partner2Name} Wedding`,
    dates: `${start}/${end}`,
    details: `Details: https://ithinkshewifey.com/${info.siteSlug}`,
    location: info.locationText || "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function buildOutlookCalendarUrl(info: CalendarInfo): string {
  const toISO = (iso: string) => new Date(iso).toISOString();
  const start = toISO(info.weddingDate);
  const end = info.weddingEndDate
    ? toISO(info.weddingEndDate)
    : toISO(new Date(new Date(info.weddingDate).getTime() + 4 * 60 * 60 * 1000).toISOString());
  const params = new URLSearchParams({
    rru: "addevent",
    startdt: start,
    enddt: end,
    subject: `${info.partner1Name} & ${info.partner2Name} Wedding`,
    body: `Details: https://ithinkshewifey.com/${info.siteSlug}`,
    location: info.locationText || "",
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

function buildICSContent(info: CalendarInfo): string {
  const fmt = (iso: string) => {
    const d = new Date(iso);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    const h = String(d.getUTCHours()).padStart(2, "0");
    const min = String(d.getUTCMinutes()).padStart(2, "0");
    const s = String(d.getUTCSeconds()).padStart(2, "0");
    return `${y}${m}${day}T${h}${min}${s}Z`;
  };
  const start = fmt(info.weddingDate);
  const end = info.weddingEndDate
    ? fmt(info.weddingEndDate)
    : fmt(new Date(new Date(info.weddingDate).getTime() + 4 * 60 * 60 * 1000).toISOString());
  const now = fmt(new Date().toISOString());
  const summary = `${info.partner1Name} & ${info.partner2Name} Wedding`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ithinkshewifey//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${summary}`,
    ...(info.locationText ? [`LOCATION:${info.locationText}`] : []),
    `URL:https://ithinkshewifey.com/${info.siteSlug}`,
    `UID:${info.siteSlug}@ithinkshewifey.com`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ];
  return lines.join("\r\n");
}

/** Safari-safe ICS download: uses data URI + window.open for iOS Safari compatibility */
function downloadICS(info: CalendarInfo) {
  const content = buildICSContent(info);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  if (isSafari) {
    // Safari/iOS: open data URI — triggers native calendar "Add Event" prompt
    window.open(`data:text/calendar;charset=utf-8,${encodeURIComponent(content)}`);
  } else {
    // Chrome/Firefox/Edge: use blob download
    const blob = new Blob([content], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${info.partner1Name}-${info.partner2Name}-wedding.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export default function RSVPForm({ slug, mealOptions, mealDietaryOptions, calendarInfo }: RSVPFormProps) {
  const [email, setEmail] = useState("");
  const [dialCode, setDialCode] = useState("+44");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [message, setMessage] = useState("");
  const [allergies, setAllergies] = useState<string[]>([]);
  
  const options = (mealOptions && mealOptions.length > 0) 
    ? mealOptions 
    : ["Chicken", "Beef", "Fish", "Vegetarian"];
  
  // Collect all unique dietary options across all menu items
  const allDietaryOptions = mealDietaryOptions
    ? [...new Set(Object.values(mealDietaryOptions).flat())]
    : [];
  const hasDietaryOptions = allDietaryOptions.length > 0;

  const createEmptyGuest = (): Guest => ({
    id: crypto.randomUUID(),
    name: "",
    attending: "yes",
    mealChoice: "",
    isHalal: false,
    dietaryPreference: "",
  });

  const [guests, setGuests] = useState<Guest[]>([createEmptyGuest()]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const updateGuest = (id: string, field: keyof Guest, value: any) => {
    setGuests((prev) =>
      prev.map((g) => (g.id === id ? { ...g, [field]: value } : g))
    );
  };

  const MAX_GUESTS = 10;

  const addGuest = () => {
    if (guests.length >= MAX_GUESTS) return;
    setGuests((prev) => [...prev, createEmptyGuest()]);
  };

  const removeGuest = (id: string) => {
    if (guests.length > 1) {
      setGuests((prev) => prev.filter((g) => g.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    // Format for API
    const formattedGuests = guests.map((g) => ({
      name: g.name,
      attending: g.attending === "yes",
      mealChoice: g.mealChoice,
      isHalal: hasDietaryOptions ? g.dietaryPreference === "Halal" : g.isHalal,
      dietaryPreference: g.dietaryPreference || undefined,
    }));

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          email,
          phone: phoneLocal ? `${dialCode}${phoneLocal.replace(/[^0-9]/g, "").replace(/^0/, "")}` : undefined,
          message: [message, allergies.length > 0 ? `Allergies: ${allergies.join(", ")}` : ""].filter(Boolean).join("\n") || undefined,
          guests: formattedGuests,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      setStatus("success");
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMessage(err.message || "Failed to submit RSVP. Please try again.");
    }
  };

  if (status === "success") {
    const hasAttending = guests.some((g) => g.attending === "yes");
    const showCalendar = hasAttending && calendarInfo?.weddingDate;

    return (
      <div className="rsvp__success">
        <h3 className="rsvp__success-title">Thank You!</h3>
        <p className="rsvp__success-text">Your RSVP has been received.</p>
        {showCalendar && (
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap", marginTop: "1.5rem" }}>
            <button
              type="button"
              onClick={() => window.open(buildGoogleCalendarUrl(calendarInfo!), "_blank", "noopener,noreferrer")}
              className="rsvp__button"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.7rem", padding: "0.6rem 1rem" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Google
            </button>
            <button
              type="button"
              onClick={() => window.open(buildOutlookCalendarUrl(calendarInfo!), "_blank", "noopener,noreferrer")}
              className="rsvp__button"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.7rem", padding: "0.6rem 1rem" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Outlook
            </button>
            <button
              type="button"
              onClick={() => downloadICS(calendarInfo!)}
              className="rsvp__button rsvp__button--outline"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.7rem", padding: "0.6rem 1rem" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Apple / Other
            </button>
          </div>
        )}
        <button
          onClick={() => {
            setStatus("idle");
            setGuests([createEmptyGuest()]);
            setEmail("");
            setPhoneLocal("");
            setAllergies([]);
            setMessage("");
          }}
          className="rsvp__button rsvp__button--outline"
          style={{ marginTop: '1rem' }}
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rsvp__form">
      <div className="rsvp__field rsvp__field--centered">
        <label htmlFor="email" className="rsvp__label">Your Email Address</label>
        <input
          id="email"
          type="email"
          required
          className="rsvp__input rsvp__input--narrow"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
        />
        <p style={{ fontSize: "0.8rem", opacity: 0.7, marginTop: "0.2rem" }}>We will send any updates here.</p>
      </div>

      <div className="rsvp__field rsvp__field--centered">
        <label htmlFor="phone" className="rsvp__label">WhatsApp Number (Optional)</label>
        <div className="rsvp__phone-row rsvp__phone-row--narrow">
          <CountryCodePicker
            value={dialCode}
            onChange={setDialCode}
            className="rsvp__phone-picker"
          />
          <input
            id="phone"
            type="tel"
            className="rsvp__input rsvp__phone-input"
            value={phoneLocal}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9\s\-]/g, "");
              setPhoneLocal(val);
            }}
            placeholder="7123 456789"
          />
        </div>
        <p style={{ fontSize: "0.8rem", opacity: 0.7, marginTop: "0.2rem" }}>For WhatsApp updates and calendar invites.</p>
      </div>

      <div className="rsvp__guest-heading-wrap">
        <h3 className="rsvp__label rsvp__guest-heading">Guest Details</h3>
      </div>

      {guests.map((guest, index) => (
        <div key={guest.id} className="rsvp__guest-card">
          {guests.length > 1 && (
            <button
              type="button"
              onClick={() => removeGuest(guest.id)}
              className="rsvp__guest-remove"
            >
              Remove
            </button>
          )}

          <h4 style={{ margin: "0 0 1rem 0", fontSize: "1rem", fontWeight: 500 }}>
            {index === 0 ? "Primary Guest" : `Guest ${index + 1}`}
          </h4>

          <div className="rsvp__field">
            <label className="rsvp__label">Full Name</label>
            <input
              type="text"
              required
              className="rsvp__input"
              value={guest.name}
              onChange={(e) => updateGuest(guest.id, "name", e.target.value)}
              placeholder="Guest full name"
            />
          </div>

          <div className="rsvp__row">
            <div className="rsvp__field">
              <label className="rsvp__label">Will attend?</label>
              <select
                className="rsvp__select"
                value={guest.attending}
                onChange={(e) => updateGuest(guest.id, "attending", e.target.value)}
              >
                <option value="yes">Joyfully Accept</option>
                <option value="no">Regretfully Decline</option>
              </select>
            </div>

            {guest.attending === "yes" && (
              <div className="rsvp__field">
                <label className="rsvp__label">Meal Choice</label>
                <select
                  className="rsvp__select"
                  value={guest.mealChoice}
                  onChange={(e) => updateGuest(guest.id, "mealChoice", e.target.value)}
                  required={guest.attending === "yes"}
                >
                  <option value="" disabled>Select a meal...</option>
                  {options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {guest.attending === "yes" && hasDietaryOptions && (() => {
            const availableForMeal = guest.mealChoice && mealDietaryOptions?.[guest.mealChoice];
            if (!availableForMeal || availableForMeal.length === 0) return null;
            return (
              <div className="rsvp__field" style={{ marginTop: "0.5rem" }}>
                <label className="rsvp__label">Dietary Requirement</label>
                <select
                  className="rsvp__select"
                  value={guest.dietaryPreference}
                  onChange={(e) => updateGuest(guest.id, "dietaryPreference", e.target.value)}
                >
                  <option value="">None</option>
                  {availableForMeal.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            );
          })()}
        </div>
      ))}

      {guests.length < MAX_GUESTS && (
        <button
          type="button"
          onClick={addGuest}
          className="rsvp__button rsvp__button--outline"
        >
          + Add Partner / Family Member
        </button>
      )}

      <div className="rsvp__field">
        <label htmlFor="message" className="rsvp__label">Message to the Couple (Optional)</label>
        <textarea
          id="message"
          className="rsvp__textarea"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Any additional notes or well wishes"
        />
      </div>

      {status === "error" && <p className="rsvp__error" style={{ color: "red", marginBottom: "1rem" }}>{errorMessage}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="rsvp__button"
      >
        {status === "loading" ? "Sending RSVP..." : "Submit RSVP"}
      </button>
    </form>
  );
}
