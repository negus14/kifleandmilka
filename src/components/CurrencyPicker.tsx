"use client";

import { useState, useRef, useEffect } from "react";

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const ALL_CURRENCIES: Currency[] = [
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone" },
  { code: "DKK", symbol: "kr", name: "Danish Krone" },
  { code: "ETB", symbol: "Br", name: "Ethiopian Birr" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "GHS", symbol: "₵", name: "Ghanaian Cedi" },
  { code: "TZS", symbol: "TSh", name: "Tanzanian Shilling" },
  { code: "UGX", symbol: "USh", name: "Ugandan Shilling" },
  { code: "RWF", symbol: "RF", name: "Rwandan Franc" },
  { code: "XOF", symbol: "CFA", name: "West African CFA" },
  { code: "XAF", symbol: "CFA", name: "Central African CFA" },
  { code: "EGP", symbol: "E£", name: "Egyptian Pound" },
  { code: "MAD", symbol: "MAD", name: "Moroccan Dirham" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee" },
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka" },
  { code: "LKR", symbol: "Rs", name: "Sri Lankan Rupee" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "KRW", symbol: "₩", name: "South Korean Won" },
  { code: "TWD", symbol: "NT$", name: "Taiwan Dollar" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  { code: "THB", symbol: "฿", name: "Thai Baht" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
  { code: "VND", symbol: "₫", name: "Vietnamese Dong" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
  { code: "ILS", symbol: "₪", name: "Israeli Shekel" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso" },
  { code: "ARS", symbol: "AR$", name: "Argentine Peso" },
  { code: "CLP", symbol: "CL$", name: "Chilean Peso" },
  { code: "COP", symbol: "CO$", name: "Colombian Peso" },
  { code: "PEN", symbol: "S/", name: "Peruvian Sol" },
  { code: "JMD", symbol: "J$", name: "Jamaican Dollar" },
  { code: "TTD", symbol: "TT$", name: "Trinidad Dollar" },
  { code: "PLN", symbol: "zł", name: "Polish Zloty" },
  { code: "HUF", symbol: "Ft", name: "Hungarian Forint" },
  { code: "CZK", symbol: "Kč", name: "Czech Koruna" },
  { code: "RON", symbol: "lei", name: "Romanian Leu" },
  { code: "BGN", symbol: "лв", name: "Bulgarian Lev" },
  { code: "UAH", symbol: "₴", name: "Ukrainian Hryvnia" },
  { code: "GEL", symbol: "₾", name: "Georgian Lari" },
  { code: "RUB", symbol: "₽", name: "Russian Ruble" },
];

export function getCurrencySymbol(code: string): string {
  return ALL_CURRENCIES.find(c => c.code === code)?.symbol || code;
}

/** Multi-select currency picker with searchable dropdown */
export default function CurrencyPicker({ selected, onChange }: {
  selected: string[];
  onChange: (currencies: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const available = ALL_CURRENCIES.filter(c => !selected.includes(c.code));
  const filtered = search
    ? available.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.symbol.includes(search)
      )
    : available;

  return (
    <div ref={ref} className="relative">
      <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#2d2b25]/50 mb-2">
        Accepted Currencies
      </label>

      {/* Selected tags */}
      <div
        className="flex flex-wrap gap-1.5 min-h-[38px] p-2 border border-[#2d2b25]/15 bg-white rounded-sm cursor-text"
        onClick={() => setOpen(true)}
      >
        {selected.map(code => {
          const c = ALL_CURRENCIES.find(x => x.code === code);
          return (
            <span key={code} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#2d2b25] text-white text-[10px] font-bold rounded-sm leading-tight">
              {c ? `${c.symbol} ${c.code}` : code}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange(selected.filter(x => x !== code)); }}
                className="opacity-60 hover:opacity-100 ml-0.5"
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </span>
          );
        })}
        {selected.length === 0 && (
          <span className="text-[#2d2b25]/30 text-xs py-0.5">Click to add currencies...</span>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute left-0 top-full mt-1 bg-white border border-[#2d2b25]/15 overflow-hidden z-50 flex flex-col"
          style={{ width: "100%", maxHeight: "300px", borderRadius: "4px", boxShadow: "0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)" }}
        >
          {/* Search */}
          <div className="p-2 border-b border-[#2d2b25]/6">
            <div className="relative">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#2d2b25]/25 pointer-events-none">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search currencies..."
                className="w-full pl-8 pr-3 py-2 text-sm border border-[#2d2b25]/10 rounded-sm outline-none focus:border-[#2d2b25]/30 bg-[#2d2b25]/[0.02] transition-colors"
              />
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1" style={{ maxHeight: "240px" }}>
            {filtered.length === 0 && (
              <div className="py-6 text-center text-xs text-[#2d2b25]/30">
                {search ? `No currencies match "${search}"` : "All currencies selected"}
              </div>
            )}
            {filtered.map(c => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  onChange([...selected, c.code]);
                  setSearch("");
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-[#2d2b25]/[0.04] transition-colors border-none cursor-pointer"
                style={{ background: "transparent", fontFamily: "inherit" }}
              >
                <span className="text-[#2d2b25]/70 font-bold w-8 text-right shrink-0">{c.symbol}</span>
                <span className="flex-1 text-[#2d2b25] truncate">{c.name}</span>
                <span className="text-[10px] font-bold text-[#2d2b25]/35 tracking-wider">{c.code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
