"use client";

import { useState } from "react";
import type { GiftItem, BankDetail } from "@/lib/types/wedding-site";
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
  bankDetails?: BankDetail[];
  showName?: boolean;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      style={{
        padding: "0.35rem 0.85rem",
        fontSize: "0.65rem",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        cursor: "pointer",
        background: "var(--color-dark, #2d2b25)",
        color: "var(--color-primary, #faf1e1)",
        border: "1px solid var(--color-dark, #2d2b25)",
        borderRadius: "2px",
        whiteSpace: "nowrap",
        flexShrink: 0,
        fontFamily: "inherit",
      }}
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function BankDetailCard({ bank }: { bank: BankDetail }) {
  const [copiedAll, setCopiedAll] = useState(false);
  const fields: { label: string; value: string }[] = [];
  if (bank.accountHolder) fields.push({ label: "Account Holder", value: bank.accountHolder });
  if (bank.bankName) fields.push({ label: "Bank", value: bank.bankName });
  if (bank.accountNumber) fields.push({ label: "Account Number", value: bank.accountNumber });
  if (bank.sortCode) fields.push({ label: "Sort Code", value: bank.sortCode });
  if (bank.swiftCode) fields.push({ label: "SWIFT/BIC", value: bank.swiftCode });
  if (bank.email) fields.push({ label: "Email", value: bank.email });

  if (fields.length === 0) return null;

  const handleCopyAll = () => {
    const textToCopy = fields.map(f => `${f.label}: ${f.value}`).join("\n");
    navigator.clipboard.writeText(textToCopy);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div style={{
      padding: "1.25rem",
      background: "rgba(0,0,0,0.04)",
      border: "1px solid rgba(0,0,0,0.08)",
      borderRadius: "6px",
      marginBottom: "1rem",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <h4 style={{ fontSize: "0.95rem", fontWeight: 600, margin: 0 }}>{bank.label}</h4>
        {fields.length > 1 && (
          <button
            type="button"
            onClick={handleCopyAll}
            style={{
              padding: "0.35rem 0.85rem",
              fontSize: "0.65rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              cursor: "pointer",
              background: "var(--color-dark, #2d2b25)",
              color: "var(--color-primary, #faf1e1)",
              border: "1px solid var(--color-dark, #2d2b25)",
              borderRadius: "2px",
              whiteSpace: "nowrap",
              flexShrink: 0,
              fontFamily: "inherit",
            }}
          >
            {copiedAll ? "Copied All!" : "Copy All"}
          </button>
        )}
      </div>
      {fields.map((f) => (
        <div key={f.label} style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          padding: "0.55rem 0",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: "0.6rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              opacity: 0.4,
              marginBottom: "0.2rem",
            }}>{f.label}</div>
            <div style={{
              fontSize: "0.88rem",
              fontWeight: 500,
              wordBreak: "break-all",
            }}>{f.value}</div>
          </div>
          <CopyButton text={f.value} />
        </div>
      ))}
    </div>
  );
}

export default function GiftContributionForm({ slug, giftItems, currency, paymentOptions, bankDetails = [], showName = false }: GiftContributionFormProps) {
  // Derive accepted currencies from all payment options and bank details
  const acceptedCurrencies = [...new Set(
    [...paymentOptions, ...bankDetails].flatMap(o => o.currencies || [])
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

  // Filter payment options (redirect-based only) matching selected currency
  const filteredPaymentOptions = paymentOptions.filter(
    o => !o.currencies || o.currencies.length === 0 || o.currencies.includes(selectedCurrency)
  );
  // Filter bank details matching selected currency
  const filteredBankDetails = bankDetails.filter(
    b => !b.currencies || b.currencies.length === 0 || b.currencies.includes(selectedCurrency)
  );

  // Unified payment methods
  const allMethods = [
    ...filteredPaymentOptions.map(o => ({ ...o, type: "link" as const })),
    ...filteredBankDetails.map(b => ({ ...b, type: "bank" as const })),
  ];

  // Auto-select if only one method
  if (allMethods.length === 1 && !paymentMethod) {
    setPaymentMethod(allMethods[0].label);
  }

  const selectedMethodObj = allMethods.find(m => m.label === paymentMethod);

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

    // Open window synchronously so iOS Safari doesn't block it as a popup
    const isRedirect = selectedMethodObj?.type === "link";
    const payWindow = isRedirect ? window.open("about:blank", "_blank") : null;

    try {
      const res = await fetch("/api/gift-contribution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          giftName: selectedGift?.name || "General Contribution",
          guestName: guestName || "Anonymous",
          amount: amount ? `${amount}.00` : undefined,
          currency: selectedCurrency,
          message: message || undefined,
          paymentMethod: paymentMethod || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      if (data.redirectUrl && payWindow) {
        payWindow.location.href = data.redirectUrl;
      } else if (payWindow) {
        payWindow.close();
      }

      setStatus("success");
    } catch (err: unknown) {
      payWindow?.close();
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
          {selectedMethodObj?.type === "bank" && " Please complete your bank transfer using the details provided below."}
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
        {showName && (
          <div className="gift-contrib__field gift-contrib__field--centered">
            <label className="gift-contrib__label">Your Name</label>
            <input
              type="text"
              required
              className="gift-contrib__input gift-contrib__input--narrow"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Your full name"
            />
          </div>
        )}

        <div className="gift-contrib__field gift-contrib__field--centered">
          <label className="gift-contrib__label">Amount</label>
          <div className="gift-contrib__amount-row">
            {effectiveCurrencies.length > 1 ? (
              <select
                value={selectedCurrency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                style={{
                  padding: "0.6rem 0.5rem",
                  fontSize: "0.8rem",
                  fontFamily: "inherit",
                  background: "rgba(0,0,0,0.06)",
                  border: "1px solid rgba(0,0,0,0.12)",
                  borderRight: "none",
                  borderRadius: "4px 0 0 4px",
                  color: "inherit",
                  cursor: "pointer",
                  outline: "none",
                  appearance: "auto",
                  minWidth: "4.5rem",
                }}
              >
                {effectiveCurrencies.map((code) => (
                  <option key={code} value={code}>
                    {getCurrencySymbol(code)} {code}
                  </option>
                ))}
              </select>
            ) : (
              <span style={{
                display: "flex",
                alignItems: "center",
                padding: "0.6rem 0.65rem",
                fontSize: "0.8rem",
                fontFamily: "inherit",
                background: "rgba(0,0,0,0.06)",
                border: "1px solid rgba(0,0,0,0.12)",
                borderRight: "none",
                borderRadius: "4px 0 0 4px",
                opacity: 0.6,
              }}>
                {currencySymbol}
              </span>
            )}
            <div className="relative" style={{ flex: 1 }}>
              <input
                type="text"
                required
                className="gift-contrib__input"
                style={{
                  paddingLeft: "0.85rem",
                  paddingRight: "3rem",
                  borderRadius: effectiveCurrencies.length > 1 ? "0 4px 4px 0" : "0 4px 4px 0",
                  borderLeft: "none",
                  margin: 0,
                }}
                value={amount}
                onChange={handleAmountChange}
                placeholder="0"
                inputMode="numeric"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-serif opacity-40" style={{ fontSize: "0.85rem" }}>.00</span>
            </div>
          </div>
        </div>

        <div className="gift-contrib__field">
          <label className="gift-contrib__label">Well Wishes (Optional)</label>
          <textarea
            className="gift-contrib__textarea"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a message to the couple..."
          />
        </div>

        {allMethods.length > 1 && (
          <div className="gift-contrib__field">
            <label className="gift-contrib__label">Payment Method</label>
            <div className="gift-contrib__currency-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
              {allMethods.map((method) => (
                <button
                  key={method.label}
                  type="button"
                  onClick={() => {
                    setPaymentMethod(method.label);
                  }}
                  className={`gift-contrib__currency-btn ${paymentMethod === method.label ? "gift-contrib__currency-btn--active" : ""}`}
                  style={{ fontSize: "0.75rem", padding: "0.75rem 0.5rem" }}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedMethodObj?.type === "bank" && (
          <div className="gift-contrib__banks" style={{ marginTop: "1.5rem" }}>
            <BankDetailCard bank={selectedMethodObj as BankDetail} />
          </div>
        )}

        {status === "error" && <p className="gift-contrib__error">{errorMessage}</p>}

        <button
          type="submit"
          disabled={status === "loading"}
          className="gift-contrib__btn"
        >
          {status === "loading" 
            ? "Sending..." 
            : selectedMethodObj?.type === "link" 
              ? "Send & Continue" 
              : "Send Well Wishes"}
        </button>

        {selectedMethodObj?.type === "link" && !status.includes("loading") && (
          <p style={{ 
            fontSize: "0.7rem", 
            opacity: 0.5, 
            textAlign: "center", 
            marginTop: "0.75rem",
            fontFamily: "var(--font-sans)",
            letterSpacing: "0.02em"
          }}>
            You'll be redirected to {selectedMethodObj.label} to complete your payment.
          </p>
        )}

        {selectedMethodObj?.type === "bank" && !status.includes("loading") && (
          <p style={{ 
            fontSize: "0.7rem", 
            opacity: 0.5, 
            textAlign: "center", 
            marginTop: "0.75rem",
            fontFamily: "var(--font-sans)",
            letterSpacing: "0.02em"
          }}>
            Your message will be sent, and you can then complete the transfer using the details provided.
          </p>
        )}
      </form>
    </div>
  );
}
