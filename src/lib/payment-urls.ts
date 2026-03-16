export function buildPaymentUrl(baseUrl: string, amount: string): string {
  const url = baseUrl.trim().replace(/\/$/, "");

  // Monzo.me: https://monzo.me/username?amount=50
  if (url.includes("monzo.me")) return `${url}?amount=${amount}`;

  // PayPal.me: https://paypal.me/username/50
  if (url.includes("paypal.me")) return `${url}/${amount}`;

  // Revolut.me: no amount param supported
  // Wise: no standard URL pattern for amount
  // Generic: return base URL unchanged
  return url;
}
