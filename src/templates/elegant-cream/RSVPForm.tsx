"use client";

import { useState } from "react";

interface Guest {
  id: string;
  name: string;
  attending: "yes" | "no";
  mealChoice: string;
  isHalal: boolean;
}

interface RSVPFormProps {
  slug: string;
}

export default function RSVPForm({ slug }: RSVPFormProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  
  const createEmptyGuest = (): Guest => ({
    id: crypto.randomUUID(),
    name: "",
    attending: "yes",
    mealChoice: "",
    isHalal: false,
  });

  const [guests, setGuests] = useState<Guest[]>([createEmptyGuest()]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const updateGuest = (id: string, field: keyof Guest, value: any) => {
    setGuests((prev) =>
      prev.map((g) => (g.id === id ? { ...g, [field]: value } : g))
    );
  };

  const addGuest = () => {
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
      isHalal: g.isHalal,
    }));

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          email,
          message,
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
    return (
      <div className="rsvp__success">
        <h3 className="rsvp__success-title">Thank You!</h3>
        <p className="rsvp__success-text">Your RSVP has been received.</p>
        <button 
          onClick={() => {
            setStatus("idle");
            setGuests([createEmptyGuest()]);
            setEmail("");
            setMessage("");
          }} 
          className="rsvp__button rsvp__button--outline"
          style={{ marginTop: '1.5rem' }}
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rsvp__form" style={{ textAlign: "left", maxWidth: "600px", margin: "0 auto" }}>
      <div className="rsvp__field">
        <label htmlFor="email" className="rsvp__label">Your Email Address</label>
        <input
          id="email"
          type="email"
          required
          className="rsvp__input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
        />
        <p style={{ fontSize: "0.8rem", opacity: 0.7, marginTop: "0.2rem" }}>We will send any updates here.</p>
      </div>

      <div style={{ marginTop: "2rem", marginBottom: "1rem" }}>
        <h3 className="rsvp__label" style={{ fontSize: "1.2rem", borderBottom: "1px solid rgba(0,0,0,0.1)", paddingBottom: "0.5rem" }}>Guest Details</h3>
      </div>

      {guests.map((guest, index) => (
        <div key={guest.id} style={{ 
          marginBottom: "1.5rem", 
          padding: "1rem", 
          background: "rgba(0,0,0,0.02)", 
          borderRadius: "8px",
          position: "relative"
        }}>
          {guests.length > 1 && (
            <button 
              type="button" 
              onClick={() => removeGuest(guest.id)}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "none",
                border: "none",
                color: "inherit",
                opacity: 0.5,
                cursor: "pointer",
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em"
              }}
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

          <div className="rsvp__row" style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <div className="rsvp__field" style={{ flex: "1 1 200px" }}>
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
              <div className="rsvp__field" style={{ flex: "1 1 200px" }}>
                <label className="rsvp__label">Meal Choice</label>
                <select
                  className="rsvp__select"
                  value={guest.mealChoice}
                  onChange={(e) => updateGuest(guest.id, "mealChoice", e.target.value)}
                  required={guest.attending === "yes"}
                >
                  <option value="" disabled>Select a meal...</option>
                  <option value="Chicken">Chicken</option>
                  <option value="Beef">Beef</option>
                  <option value="Fish">Fish</option>
                  <option value="Vegetarian">Vegetarian</option>
                </select>
              </div>
            )}
          </div>

          {guest.attending === "yes" && (
            <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.5rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.9rem" }}>
                <input 
                  type="checkbox" 
                  checked={guest.isHalal}
                  onChange={(e) => updateGuest(guest.id, "isHalal", e.target.checked)}
                />
                Halal
              </label>
            </div>
          )}
        </div>
      ))}

      <button 
        type="button" 
        onClick={addGuest}
        className="rsvp__button rsvp__button--outline"
        style={{ width: "100%", marginBottom: "2rem", padding: "0.8rem", borderStyle: "dashed" }}
      >
        + Add Partner / Family Member
      </button>

      <div className="rsvp__field">
        <label htmlFor="message" className="rsvp__label">Message to the Couple (Optional)</label>
        <textarea
          id="message"
          className="rsvp__textarea"
          rows={3}
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
        style={{ width: "100%", padding: "1rem", fontSize: "1.1rem" }}
      >
        {status === "loading" ? "Sending RSVP..." : "Submit RSVP"}
      </button>
    </form>
  );
}
