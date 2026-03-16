"use client";

import { useState } from "react";
import type { GiftItem } from "@/lib/types/wedding-site";
import { getCurrencySymbol } from "@/components/CurrencyPicker";

interface PaymentOption {
  label: string;
  url?: string;
  currencies?: string[];
}

interface GiftContributionFormProps {
  slug: string;
  giftItems: GiftItem[];
  currency: string;
  paymentOptions: PaymentOption[];
}

export default function GiftContributionForm({ slug, giftItems, currency, paymentOptions }: GiftContributionFormProps) {
  // Derive accepted currencies from payment options that have currencies set
  const acceptedCurrencies = [...new Set(
    paymentOptions.flatMap(o => o.currencies || [])
  )];
  // Fall back to the site default if no payment options have currencies
  const effectiveCurrencies = acceptedCurrencies.length > 0 ? acceptedCurrencies : [currency];

  const noItems = giftItems.length === 0;
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(
    noItems ? { id: "general", name: "General Contribution", description: "" } : null
  );
  const [guestName, setGuestName] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState(effectiveCurrencies[0]);
  const [message, setMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [status, setStatus] = useState<"idle" | "selecting" | "form" | "loading" | "success" | "error">(noItems ? "form" : "idle");
  const [errorMessage, setErrorMessage] = useState("");

  const currencySymbol = getCurrencySymbol(selectedCurrency);

  // Filter payment options to only show those matching the selected currency
  // Options without currencies set are shown for all currencies (backwards compat)
  const filteredPaymentOptions = paymentOptions.filter(
    o => !o.currencies || o.currencies.length === 0 || o.currencies.includes(selectedCurrency)
  );

  const selectGift = (gift: GiftItem) => {
    setSelectedGift(gift);
    setAmount(gift.suggestedAmount ? Math.floor(parseFloat(gift.suggestedAmount)).toString() : "");
    setStatus("form");
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || /^\d+$/.test(val)) {
      setAmount(val);
    }
  };

  const handleCurrencyChange = (code: string) => {
    setSelectedCurrency(code);
    // Reset payment method when switching currency since the options change
    setPaymentMethod("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/gift-contribution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          giftName: selectedGift?.name || "General Contribution",
          guestName,
          amount: amount ? `${amount}.00` : undefined,
          currency: selectedCurrency,
          message: message || undefined,
          paymentMethod: paymentMethod || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      if (data.redirectUrl) {
        window.open(data.redirectUrl, "_blank");
      }

      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Failed to submit. Please try again.");
    }
  };

  const reset = () => {
    setSelectedGift(null);
    setGuestName("");
    setAmount("");
    setMessage("");
    setPaymentMethod("");
    setStatus("idle");
    setErrorMessage("");
  };

  if (status === "success") {
    return (
      <div className="gift-contrib__success">
        <h3 className="gift-contrib__success-title">Thank You!</h3>
        <p className="gift-contrib__success-text">
          Your well wishes have been recorded.
          {paymentMethod && " You should have been redirected to complete your payment."}
        </p>
        <button onClick={reset} className="gift-contrib__btn gift-contrib__btn--outline" style={{ marginTop: "1.5rem" }}>
          Send Another Gift
        </button>
      </div>
    );
  }

  // Gift selection grid (skip if no items — go straight to form)
  if ((status === "idle" || status === "selecting") && giftItems.length > 0) {
    return (
      <div className="gift-contrib">
        <div className="gift-contrib__grid">
          {giftItems.map((gift) => (
            <button
              key={gift.id}
              type="button"
              onClick={() => selectGift(gift)}
              className="gift-contrib__card"
            >
              {gift.imageUrl && (
                <div className="gift-contrib__card-img">
                  <img src={gift.imageUrl} alt={gift.name} />
                </div>
              )}
              <h4 className="gift-contrib__card-name">{gift.name}</h4>
              {gift.description && <p className="gift-contrib__card-desc">{gift.description}</p>}
              {gift.suggestedAmount && (
                <p className="gift-contrib__card-amount">{currencySymbol}{gift.suggestedAmount}</p>
              )}
            </button>
          ))}
          <button
            type="button"
            onClick={() => { setSelectedGift({ id: "general", name: "General Contribution", description: "" }); setStatus("form"); }}
            className="gift-contrib__card gift-contrib__card--general"
          >
            <h4 className="gift-contrib__card-name">Custom Amount</h4>
            <p className="gift-contrib__card-desc">Choose your own amount</p>
          </button>
        </div>
      </div>
    );
  }


  // Contribution form
  return (
    <div className="gift-contrib">
      {!noItems && (
        <button type="button" onClick={reset} className="gift-contrib__back">
          &larr; Back to gifts
        </button>
      )}

      {!noItems && selectedGift?.name && (
        <div className="gift-contrib__selected">
          <h4>{selectedGift.name}</h4>
        </div>
      )}

      <form onSubmit={handleSubmit} className="gift-contrib__form">
        <div className="gift-contrib__field">
          <label className="gift-contrib__label">Your Name</label>
          <input
            type="text"
            required
            className="gift-contrib__input"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Your full name"
          />
        </div>

        {effectiveCurrencies.length > 1 && (
          <div className="gift-contrib__field">
            <label className="gift-contrib__label">Select Currency</label>
            <div className="gift-contrib__currency-grid">
              {effectiveCurrencies.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleCurrencyChange(code)}
                  className={`gift-contrib__currency-btn ${selectedCurrency === code ? "gift-contrib__currency-btn--active" : ""}`}
                >
                  {getCurrencySymbol(code)} {code}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="gift-contrib__field">
          <label className="gift-contrib__label">Amount ({selectedCurrency})</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-serif opacity-40">{currencySymbol}</span>
            <input
              type="text"
              required
              className="gift-contrib__input"
              style={{ paddingLeft: "2.5rem", paddingRight: "3.5rem" }}
              value={amount}
              onChange={handleAmountChange}
              placeholder="0"
              inputMode="numeric"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-serif opacity-40">.00</span>
          </div>
        </div>

        <div className="gift-contrib__field">
          <label className="gift-contrib__label">Well Wishes (Optional)</label>
          <textarea
            className="gift-contrib__textarea"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a message to the couple..."
          />
        </div>

        {filteredPaymentOptions.length > 0 && (
          <div className="gift-contrib__field">
            <label className="gift-contrib__label">Payment Method</label>
            <select
              className="gift-contrib__select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="">Select payment method...</option>
              {filteredPaymentOptions.map((opt) => (
                <option key={opt.label} value={opt.label}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}

        {status === "error" && <p className="gift-contrib__error">{errorMessage}</p>}

        <button
          type="submit"
          disabled={status === "loading"}
          className="gift-contrib__btn"
        >
          {status === "loading" ? "Sending..." : paymentMethod ? "Send & Pay" : "Send Well Wishes"}
        </button>
      </form>
    </div>
  );
}
