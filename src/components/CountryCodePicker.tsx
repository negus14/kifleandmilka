"use client";

import { useState, useRef, useEffect } from "react";

export interface Country {
  iso: string;
  code: string;
  flag: string;
  name: string;
}

export const COUNTRIES: Country[] = [
  { iso: "AF", code: "+93", flag: "\u{1F1E6}\u{1F1EB}", name: "Afghanistan" },
  { iso: "AL", code: "+355", flag: "\u{1F1E6}\u{1F1F1}", name: "Albania" },
  { iso: "DZ", code: "+213", flag: "\u{1F1E9}\u{1F1FF}", name: "Algeria" },
  { iso: "AD", code: "+376", flag: "\u{1F1E6}\u{1F1E9}", name: "Andorra" },
  { iso: "AO", code: "+244", flag: "\u{1F1E6}\u{1F1F4}", name: "Angola" },
  { iso: "AG", code: "+1268", flag: "\u{1F1E6}\u{1F1EC}", name: "Antigua and Barbuda" },
  { iso: "AR", code: "+54", flag: "\u{1F1E6}\u{1F1F7}", name: "Argentina" },
  { iso: "AM", code: "+374", flag: "\u{1F1E6}\u{1F1F2}", name: "Armenia" },
  { iso: "AU", code: "+61", flag: "\u{1F1E6}\u{1F1FA}", name: "Australia" },
  { iso: "AT", code: "+43", flag: "\u{1F1E6}\u{1F1F9}", name: "Austria" },
  { iso: "AZ", code: "+994", flag: "\u{1F1E6}\u{1F1FF}", name: "Azerbaijan" },
  { iso: "BS", code: "+1242", flag: "\u{1F1E7}\u{1F1F8}", name: "Bahamas" },
  { iso: "BH", code: "+973", flag: "\u{1F1E7}\u{1F1ED}", name: "Bahrain" },
  { iso: "BD", code: "+880", flag: "\u{1F1E7}\u{1F1E9}", name: "Bangladesh" },
  { iso: "BB", code: "+1246", flag: "\u{1F1E7}\u{1F1E7}", name: "Barbados" },
  { iso: "BY", code: "+375", flag: "\u{1F1E7}\u{1F1FE}", name: "Belarus" },
  { iso: "BE", code: "+32", flag: "\u{1F1E7}\u{1F1EA}", name: "Belgium" },
  { iso: "BZ", code: "+501", flag: "\u{1F1E7}\u{1F1FF}", name: "Belize" },
  { iso: "BJ", code: "+229", flag: "\u{1F1E7}\u{1F1EF}", name: "Benin" },
  { iso: "BT", code: "+975", flag: "\u{1F1E7}\u{1F1F9}", name: "Bhutan" },
  { iso: "BO", code: "+591", flag: "\u{1F1E7}\u{1F1F4}", name: "Bolivia" },
  { iso: "BA", code: "+387", flag: "\u{1F1E7}\u{1F1E6}", name: "Bosnia and Herzegovina" },
  { iso: "BW", code: "+267", flag: "\u{1F1E7}\u{1F1FC}", name: "Botswana" },
  { iso: "BR", code: "+55", flag: "\u{1F1E7}\u{1F1F7}", name: "Brazil" },
  { iso: "BN", code: "+673", flag: "\u{1F1E7}\u{1F1F3}", name: "Brunei" },
  { iso: "BG", code: "+359", flag: "\u{1F1E7}\u{1F1EC}", name: "Bulgaria" },
  { iso: "BF", code: "+226", flag: "\u{1F1E7}\u{1F1EB}", name: "Burkina Faso" },
  { iso: "BI", code: "+257", flag: "\u{1F1E7}\u{1F1EE}", name: "Burundi" },
  { iso: "CV", code: "+238", flag: "\u{1F1E8}\u{1F1FB}", name: "Cabo Verde" },
  { iso: "KH", code: "+855", flag: "\u{1F1F0}\u{1F1ED}", name: "Cambodia" },
  { iso: "CM", code: "+237", flag: "\u{1F1E8}\u{1F1F2}", name: "Cameroon" },
  { iso: "CA", code: "+1", flag: "\u{1F1E8}\u{1F1E6}", name: "Canada" },
  { iso: "CF", code: "+236", flag: "\u{1F1E8}\u{1F1EB}", name: "Central African Republic" },
  { iso: "TD", code: "+235", flag: "\u{1F1F9}\u{1F1E9}", name: "Chad" },
  { iso: "CL", code: "+56", flag: "\u{1F1E8}\u{1F1F1}", name: "Chile" },
  { iso: "CN", code: "+86", flag: "\u{1F1E8}\u{1F1F3}", name: "China" },
  { iso: "CO", code: "+57", flag: "\u{1F1E8}\u{1F1F4}", name: "Colombia" },
  { iso: "KM", code: "+269", flag: "\u{1F1F0}\u{1F1F2}", name: "Comoros" },
  { iso: "CG", code: "+242", flag: "\u{1F1E8}\u{1F1EC}", name: "Congo" },
  { iso: "CD", code: "+243", flag: "\u{1F1E8}\u{1F1E9}", name: "Congo (DRC)" },
  { iso: "CR", code: "+506", flag: "\u{1F1E8}\u{1F1F7}", name: "Costa Rica" },
  { iso: "HR", code: "+385", flag: "\u{1F1ED}\u{1F1F7}", name: "Croatia" },
  { iso: "CU", code: "+53", flag: "\u{1F1E8}\u{1F1FA}", name: "Cuba" },
  { iso: "CY", code: "+357", flag: "\u{1F1E8}\u{1F1FE}", name: "Cyprus" },
  { iso: "CZ", code: "+420", flag: "\u{1F1E8}\u{1F1FF}", name: "Czech Republic" },
  { iso: "DK", code: "+45", flag: "\u{1F1E9}\u{1F1F0}", name: "Denmark" },
  { iso: "DJ", code: "+253", flag: "\u{1F1E9}\u{1F1EF}", name: "Djibouti" },
  { iso: "DM", code: "+1767", flag: "\u{1F1E9}\u{1F1F2}", name: "Dominica" },
  { iso: "DO", code: "+1809", flag: "\u{1F1E9}\u{1F1F4}", name: "Dominican Republic" },
  { iso: "EC", code: "+593", flag: "\u{1F1EA}\u{1F1E8}", name: "Ecuador" },
  { iso: "EG", code: "+20", flag: "\u{1F1EA}\u{1F1EC}", name: "Egypt" },
  { iso: "SV", code: "+503", flag: "\u{1F1F8}\u{1F1FB}", name: "El Salvador" },
  { iso: "GQ", code: "+240", flag: "\u{1F1EC}\u{1F1F6}", name: "Equatorial Guinea" },
  { iso: "ER", code: "+291", flag: "\u{1F1EA}\u{1F1F7}", name: "Eritrea" },
  { iso: "EE", code: "+372", flag: "\u{1F1EA}\u{1F1EA}", name: "Estonia" },
  { iso: "SZ", code: "+268", flag: "\u{1F1F8}\u{1F1FF}", name: "Eswatini" },
  { iso: "ET", code: "+251", flag: "\u{1F1EA}\u{1F1F9}", name: "Ethiopia" },
  { iso: "FJ", code: "+679", flag: "\u{1F1EB}\u{1F1EF}", name: "Fiji" },
  { iso: "FI", code: "+358", flag: "\u{1F1EB}\u{1F1EE}", name: "Finland" },
  { iso: "FR", code: "+33", flag: "\u{1F1EB}\u{1F1F7}", name: "France" },
  { iso: "GA", code: "+241", flag: "\u{1F1EC}\u{1F1E6}", name: "Gabon" },
  { iso: "GM", code: "+220", flag: "\u{1F1EC}\u{1F1F2}", name: "Gambia" },
  { iso: "GE", code: "+995", flag: "\u{1F1EC}\u{1F1EA}", name: "Georgia" },
  { iso: "DE", code: "+49", flag: "\u{1F1E9}\u{1F1EA}", name: "Germany" },
  { iso: "GH", code: "+233", flag: "\u{1F1EC}\u{1F1ED}", name: "Ghana" },
  { iso: "GR", code: "+30", flag: "\u{1F1EC}\u{1F1F7}", name: "Greece" },
  { iso: "GD", code: "+1473", flag: "\u{1F1EC}\u{1F1E9}", name: "Grenada" },
  { iso: "GT", code: "+502", flag: "\u{1F1EC}\u{1F1F9}", name: "Guatemala" },
  { iso: "GN", code: "+224", flag: "\u{1F1EC}\u{1F1F3}", name: "Guinea" },
  { iso: "GW", code: "+245", flag: "\u{1F1EC}\u{1F1FC}", name: "Guinea-Bissau" },
  { iso: "GY", code: "+592", flag: "\u{1F1EC}\u{1F1FE}", name: "Guyana" },
  { iso: "HT", code: "+509", flag: "\u{1F1ED}\u{1F1F9}", name: "Haiti" },
  { iso: "HN", code: "+504", flag: "\u{1F1ED}\u{1F1F3}", name: "Honduras" },
  { iso: "HK", code: "+852", flag: "\u{1F1ED}\u{1F1F0}", name: "Hong Kong" },
  { iso: "HU", code: "+36", flag: "\u{1F1ED}\u{1F1FA}", name: "Hungary" },
  { iso: "IS", code: "+354", flag: "\u{1F1EE}\u{1F1F8}", name: "Iceland" },
  { iso: "IN", code: "+91", flag: "\u{1F1EE}\u{1F1F3}", name: "India" },
  { iso: "ID", code: "+62", flag: "\u{1F1EE}\u{1F1E9}", name: "Indonesia" },
  { iso: "IR", code: "+98", flag: "\u{1F1EE}\u{1F1F7}", name: "Iran" },
  { iso: "IQ", code: "+964", flag: "\u{1F1EE}\u{1F1F6}", name: "Iraq" },
  { iso: "IE", code: "+353", flag: "\u{1F1EE}\u{1F1EA}", name: "Ireland" },
  { iso: "IL", code: "+972", flag: "\u{1F1EE}\u{1F1F1}", name: "Israel" },
  { iso: "IT", code: "+39", flag: "\u{1F1EE}\u{1F1F9}", name: "Italy" },
  { iso: "CI", code: "+225", flag: "\u{1F1E8}\u{1F1EE}", name: "Ivory Coast" },
  { iso: "JM", code: "+1876", flag: "\u{1F1EF}\u{1F1F2}", name: "Jamaica" },
  { iso: "JP", code: "+81", flag: "\u{1F1EF}\u{1F1F5}", name: "Japan" },
  { iso: "JO", code: "+962", flag: "\u{1F1EF}\u{1F1F4}", name: "Jordan" },
  { iso: "KZ", code: "+7", flag: "\u{1F1F0}\u{1F1FF}", name: "Kazakhstan" },
  { iso: "KE", code: "+254", flag: "\u{1F1F0}\u{1F1EA}", name: "Kenya" },
  { iso: "KI", code: "+686", flag: "\u{1F1F0}\u{1F1EE}", name: "Kiribati" },
  { iso: "XK", code: "+383", flag: "\u{1F1FD}\u{1F1F0}", name: "Kosovo" },
  { iso: "KW", code: "+965", flag: "\u{1F1F0}\u{1F1FC}", name: "Kuwait" },
  { iso: "KG", code: "+996", flag: "\u{1F1F0}\u{1F1EC}", name: "Kyrgyzstan" },
  { iso: "LA", code: "+856", flag: "\u{1F1F1}\u{1F1E6}", name: "Laos" },
  { iso: "LV", code: "+371", flag: "\u{1F1F1}\u{1F1FB}", name: "Latvia" },
  { iso: "LB", code: "+961", flag: "\u{1F1F1}\u{1F1E7}", name: "Lebanon" },
  { iso: "LS", code: "+266", flag: "\u{1F1F1}\u{1F1F8}", name: "Lesotho" },
  { iso: "LR", code: "+231", flag: "\u{1F1F1}\u{1F1F7}", name: "Liberia" },
  { iso: "LY", code: "+218", flag: "\u{1F1F1}\u{1F1FE}", name: "Libya" },
  { iso: "LI", code: "+423", flag: "\u{1F1F1}\u{1F1EE}", name: "Liechtenstein" },
  { iso: "LT", code: "+370", flag: "\u{1F1F1}\u{1F1F9}", name: "Lithuania" },
  { iso: "LU", code: "+352", flag: "\u{1F1F1}\u{1F1FA}", name: "Luxembourg" },
  { iso: "MO", code: "+853", flag: "\u{1F1F2}\u{1F1F4}", name: "Macao" },
  { iso: "MG", code: "+261", flag: "\u{1F1F2}\u{1F1EC}", name: "Madagascar" },
  { iso: "MW", code: "+265", flag: "\u{1F1F2}\u{1F1FC}", name: "Malawi" },
  { iso: "MY", code: "+60", flag: "\u{1F1F2}\u{1F1FE}", name: "Malaysia" },
  { iso: "MV", code: "+960", flag: "\u{1F1F2}\u{1F1FB}", name: "Maldives" },
  { iso: "ML", code: "+223", flag: "\u{1F1F2}\u{1F1F1}", name: "Mali" },
  { iso: "MT", code: "+356", flag: "\u{1F1F2}\u{1F1F9}", name: "Malta" },
  { iso: "MH", code: "+692", flag: "\u{1F1F2}\u{1F1ED}", name: "Marshall Islands" },
  { iso: "MR", code: "+222", flag: "\u{1F1F2}\u{1F1F7}", name: "Mauritania" },
  { iso: "MU", code: "+230", flag: "\u{1F1F2}\u{1F1FA}", name: "Mauritius" },
  { iso: "MX", code: "+52", flag: "\u{1F1F2}\u{1F1FD}", name: "Mexico" },
  { iso: "FM", code: "+691", flag: "\u{1F1EB}\u{1F1F2}", name: "Micronesia" },
  { iso: "MD", code: "+373", flag: "\u{1F1F2}\u{1F1E9}", name: "Moldova" },
  { iso: "MC", code: "+377", flag: "\u{1F1F2}\u{1F1E8}", name: "Monaco" },
  { iso: "MN", code: "+976", flag: "\u{1F1F2}\u{1F1F3}", name: "Mongolia" },
  { iso: "ME", code: "+382", flag: "\u{1F1F2}\u{1F1EA}", name: "Montenegro" },
  { iso: "MA", code: "+212", flag: "\u{1F1F2}\u{1F1E6}", name: "Morocco" },
  { iso: "MZ", code: "+258", flag: "\u{1F1F2}\u{1F1FF}", name: "Mozambique" },
  { iso: "MM", code: "+95", flag: "\u{1F1F2}\u{1F1F2}", name: "Myanmar" },
  { iso: "NA", code: "+264", flag: "\u{1F1F3}\u{1F1E6}", name: "Namibia" },
  { iso: "NR", code: "+674", flag: "\u{1F1F3}\u{1F1F7}", name: "Nauru" },
  { iso: "NP", code: "+977", flag: "\u{1F1F3}\u{1F1F5}", name: "Nepal" },
  { iso: "NL", code: "+31", flag: "\u{1F1F3}\u{1F1F1}", name: "Netherlands" },
  { iso: "NZ", code: "+64", flag: "\u{1F1F3}\u{1F1FF}", name: "New Zealand" },
  { iso: "NI", code: "+505", flag: "\u{1F1F3}\u{1F1EE}", name: "Nicaragua" },
  { iso: "NE", code: "+227", flag: "\u{1F1F3}\u{1F1EA}", name: "Niger" },
  { iso: "NG", code: "+234", flag: "\u{1F1F3}\u{1F1EC}", name: "Nigeria" },
  { iso: "KP", code: "+850", flag: "\u{1F1F0}\u{1F1F5}", name: "North Korea" },
  { iso: "MK", code: "+389", flag: "\u{1F1F2}\u{1F1F0}", name: "North Macedonia" },
  { iso: "NO", code: "+47", flag: "\u{1F1F3}\u{1F1F4}", name: "Norway" },
  { iso: "OM", code: "+968", flag: "\u{1F1F4}\u{1F1F2}", name: "Oman" },
  { iso: "PK", code: "+92", flag: "\u{1F1F5}\u{1F1F0}", name: "Pakistan" },
  { iso: "PW", code: "+680", flag: "\u{1F1F5}\u{1F1FC}", name: "Palau" },
  { iso: "PS", code: "+970", flag: "\u{1F1F5}\u{1F1F8}", name: "Palestine" },
  { iso: "PA", code: "+507", flag: "\u{1F1F5}\u{1F1E6}", name: "Panama" },
  { iso: "PG", code: "+675", flag: "\u{1F1F5}\u{1F1EC}", name: "Papua New Guinea" },
  { iso: "PY", code: "+595", flag: "\u{1F1F5}\u{1F1FE}", name: "Paraguay" },
  { iso: "PE", code: "+51", flag: "\u{1F1F5}\u{1F1EA}", name: "Peru" },
  { iso: "PH", code: "+63", flag: "\u{1F1F5}\u{1F1ED}", name: "Philippines" },
  { iso: "PL", code: "+48", flag: "\u{1F1F5}\u{1F1F1}", name: "Poland" },
  { iso: "PT", code: "+351", flag: "\u{1F1F5}\u{1F1F9}", name: "Portugal" },
  { iso: "PR", code: "+1787", flag: "\u{1F1F5}\u{1F1F7}", name: "Puerto Rico" },
  { iso: "QA", code: "+974", flag: "\u{1F1F6}\u{1F1E6}", name: "Qatar" },
  { iso: "RO", code: "+40", flag: "\u{1F1F7}\u{1F1F4}", name: "Romania" },
  { iso: "RU", code: "+7", flag: "\u{1F1F7}\u{1F1FA}", name: "Russia" },
  { iso: "RW", code: "+250", flag: "\u{1F1F7}\u{1F1FC}", name: "Rwanda" },
  { iso: "KN", code: "+1869", flag: "\u{1F1F0}\u{1F1F3}", name: "Saint Kitts and Nevis" },
  { iso: "LC", code: "+1758", flag: "\u{1F1F1}\u{1F1E8}", name: "Saint Lucia" },
  { iso: "VC", code: "+1784", flag: "\u{1F1FB}\u{1F1E8}", name: "Saint Vincent" },
  { iso: "WS", code: "+685", flag: "\u{1F1FC}\u{1F1F8}", name: "Samoa" },
  { iso: "SM", code: "+378", flag: "\u{1F1F8}\u{1F1F2}", name: "San Marino" },
  { iso: "ST", code: "+239", flag: "\u{1F1F8}\u{1F1F9}", name: "S\u00e3o Tom\u00e9 and Pr\u00edncipe" },
  { iso: "SA", code: "+966", flag: "\u{1F1F8}\u{1F1E6}", name: "Saudi Arabia" },
  { iso: "SN", code: "+221", flag: "\u{1F1F8}\u{1F1F3}", name: "Senegal" },
  { iso: "RS", code: "+381", flag: "\u{1F1F7}\u{1F1F8}", name: "Serbia" },
  { iso: "SC", code: "+248", flag: "\u{1F1F8}\u{1F1E8}", name: "Seychelles" },
  { iso: "SL", code: "+232", flag: "\u{1F1F8}\u{1F1F1}", name: "Sierra Leone" },
  { iso: "SG", code: "+65", flag: "\u{1F1F8}\u{1F1EC}", name: "Singapore" },
  { iso: "SK", code: "+421", flag: "\u{1F1F8}\u{1F1F0}", name: "Slovakia" },
  { iso: "SI", code: "+386", flag: "\u{1F1F8}\u{1F1EE}", name: "Slovenia" },
  { iso: "SB", code: "+677", flag: "\u{1F1F8}\u{1F1E7}", name: "Solomon Islands" },
  { iso: "SO", code: "+252", flag: "\u{1F1F8}\u{1F1F4}", name: "Somalia" },
  { iso: "ZA", code: "+27", flag: "\u{1F1FF}\u{1F1E6}", name: "South Africa" },
  { iso: "KR", code: "+82", flag: "\u{1F1F0}\u{1F1F7}", name: "South Korea" },
  { iso: "SS", code: "+211", flag: "\u{1F1F8}\u{1F1F8}", name: "South Sudan" },
  { iso: "ES", code: "+34", flag: "\u{1F1EA}\u{1F1F8}", name: "Spain" },
  { iso: "LK", code: "+94", flag: "\u{1F1F1}\u{1F1F0}", name: "Sri Lanka" },
  { iso: "SD", code: "+249", flag: "\u{1F1F8}\u{1F1E9}", name: "Sudan" },
  { iso: "SR", code: "+597", flag: "\u{1F1F8}\u{1F1F7}", name: "Suriname" },
  { iso: "SE", code: "+46", flag: "\u{1F1F8}\u{1F1EA}", name: "Sweden" },
  { iso: "CH", code: "+41", flag: "\u{1F1E8}\u{1F1ED}", name: "Switzerland" },
  { iso: "SY", code: "+963", flag: "\u{1F1F8}\u{1F1FE}", name: "Syria" },
  { iso: "TW", code: "+886", flag: "\u{1F1F9}\u{1F1FC}", name: "Taiwan" },
  { iso: "TJ", code: "+992", flag: "\u{1F1F9}\u{1F1EF}", name: "Tajikistan" },
  { iso: "TZ", code: "+255", flag: "\u{1F1F9}\u{1F1FF}", name: "Tanzania" },
  { iso: "TH", code: "+66", flag: "\u{1F1F9}\u{1F1ED}", name: "Thailand" },
  { iso: "TL", code: "+670", flag: "\u{1F1F9}\u{1F1F1}", name: "Timor-Leste" },
  { iso: "TG", code: "+228", flag: "\u{1F1F9}\u{1F1EC}", name: "Togo" },
  { iso: "TO", code: "+676", flag: "\u{1F1F9}\u{1F1F4}", name: "Tonga" },
  { iso: "TT", code: "+1868", flag: "\u{1F1F9}\u{1F1F9}", name: "Trinidad and Tobago" },
  { iso: "TN", code: "+216", flag: "\u{1F1F9}\u{1F1F3}", name: "Tunisia" },
  { iso: "TR", code: "+90", flag: "\u{1F1F9}\u{1F1F7}", name: "Turkey" },
  { iso: "TM", code: "+993", flag: "\u{1F1F9}\u{1F1F2}", name: "Turkmenistan" },
  { iso: "TV", code: "+688", flag: "\u{1F1F9}\u{1F1FB}", name: "Tuvalu" },
  { iso: "UG", code: "+256", flag: "\u{1F1FA}\u{1F1EC}", name: "Uganda" },
  { iso: "UA", code: "+380", flag: "\u{1F1FA}\u{1F1E6}", name: "Ukraine" },
  { iso: "AE", code: "+971", flag: "\u{1F1E6}\u{1F1EA}", name: "United Arab Emirates" },
  { iso: "GB", code: "+44", flag: "\u{1F1EC}\u{1F1E7}", name: "United Kingdom" },
  { iso: "US", code: "+1", flag: "\u{1F1FA}\u{1F1F8}", name: "United States" },
  { iso: "UY", code: "+598", flag: "\u{1F1FA}\u{1F1FE}", name: "Uruguay" },
  { iso: "UZ", code: "+998", flag: "\u{1F1FA}\u{1F1FF}", name: "Uzbekistan" },
  { iso: "VU", code: "+678", flag: "\u{1F1FB}\u{1F1FA}", name: "Vanuatu" },
  { iso: "VE", code: "+58", flag: "\u{1F1FB}\u{1F1EA}", name: "Venezuela" },
  { iso: "VN", code: "+84", flag: "\u{1F1FB}\u{1F1F3}", name: "Vietnam" },
  { iso: "YE", code: "+967", flag: "\u{1F1FE}\u{1F1EA}", name: "Yemen" },
  { iso: "ZM", code: "+260", flag: "\u{1F1FF}\u{1F1F2}", name: "Zambia" },
  { iso: "ZW", code: "+263", flag: "\u{1F1FF}\u{1F1FC}", name: "Zimbabwe" },
];

/** Find the best matching country for a full phone string like "+447123..." */
export function matchCountry(phone: string): Country | undefined {
  if (!phone) return undefined;
  // Sort longest code first so +251 matches before +2, +1868 before +1, etc.
  const sorted = [...COUNTRIES].sort((a, b) => b.code.length - a.code.length);
  return sorted.find(c => phone.startsWith(c.code));
}

interface CountryCodePickerProps {
  value: string;            // e.g. "+44"
  onChange: (code: string) => void;
  /** Optional class for the outer wrapper */
  className?: string;
  /** Compact mode for dashboard (smaller text) */
  compact?: boolean;
}

export default function CountryCodePicker({ value, onChange, className, compact }: CountryCodePickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = COUNTRIES.find(c => c.code === value) || COUNTRIES.find(c => c.iso === "GB")!;

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
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const filtered = search
    ? COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.includes(search) ||
        c.iso.toLowerCase().includes(search.toLowerCase())
      )
    : COUNTRIES;

  const textSize = compact ? "text-xs" : "text-base";

  // Scroll selected into view when opening
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open && listRef.current && !search) {
      const active = listRef.current.querySelector("[data-active='true']");
      if (active) active.scrollIntoView({ block: "center" });
    }
  }, [open, search]);

  return (
    <div ref={ref} className={`relative flex-shrink-0 ${className || ""}`} style={{ zIndex: open ? 50 : 1 }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-2 border border-r-0 h-full whitespace-nowrap transition-colors ${textSize}`}
        style={{
          borderColor: open ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.12)",
          borderTopLeftRadius: compact ? "2px" : "0",
          borderBottomLeftRadius: compact ? "2px" : "0",
          minWidth: compact ? "80px" : "100px",
          background: "rgba(0,0,0,0.02)",
          fontFamily: "inherit",
        }}
      >
        <span style={{ fontSize: compact ? "16px" : "18px" }}>{selected.flag}</span>
        <span style={{ opacity: 0.8, fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>{selected.code}</span>
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ opacity: 0.25, marginLeft: 2, flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <>
          {/* Backdrop for mobile */}
          <div className="fixed inset-0 z-40 sm:hidden" onClick={() => { setOpen(false); setSearch(""); }} />
          <div
            className="absolute left-0 top-full mt-1 bg-white border overflow-hidden z-50"
            style={{
              borderColor: "rgba(0,0,0,0.15)",
              borderRadius: "4px",
              width: compact ? "280px" : "320px",
              maxHeight: "350px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            {/* Search */}
            <div style={{ padding: "10px 10px 8px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              <div style={{ position: "relative" }}>
                <svg
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", opacity: 0.25, pointerEvents: "none" }}
                >
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search countries..."
                  style={{
                    width: "100%",
                    padding: "10px 10px 10px 34px",
                    fontSize: "14px",
                    border: "1px solid rgba(0,0,0,0.1)",
                    borderRadius: "3px",
                    outline: "none",
                    background: "rgba(0,0,0,0.02)",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(0,0,0,0.25)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(0,0,0,0.1)"; }}
                />
              </div>
            </div>

            {/* List */}
            <div ref={listRef} className="overflow-y-auto flex-1" style={{ maxHeight: "280px" }}>
              {filtered.length === 0 && (
                <div style={{ padding: "24px 16px", textAlign: "center", fontSize: "13px", opacity: 0.35 }}>
                  No countries match &ldquo;{search}&rdquo;
                </div>
              )}
              {filtered.map(c => {
                const isSelected = c.code === value && c.iso === selected.iso;
                return (
                  <button
                    key={c.iso}
                    type="button"
                    data-active={isSelected}
                    onClick={() => {
                      onChange(c.code);
                      setOpen(false);
                      setSearch("");
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "11px 16px",
                      textAlign: "left",
                      fontSize: "14px",
                      border: "none",
                      cursor: "pointer",
                      transition: "background 0.1s",
                      background: isSelected ? "rgba(0,0,0,0.06)" : "transparent",
                      borderLeft: isSelected ? "3px solid rgba(0,0,0,0.5)" : "3px solid transparent",
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "rgba(0,0,0,0.03)"; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                  >
                    <span style={{ fontSize: "20px", lineHeight: 1, flexShrink: 0 }}>{c.flag}</span>
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#1a1a1a", fontWeight: isSelected ? 500 : 400 }}>
                      {c.name}
                    </span>
                    <span style={{
                      fontSize: "13px",
                      opacity: 0.6,
                      fontVariantNumeric: "tabular-nums",
                      flexShrink: 0,
                      fontWeight: 500,
                    }}>
                      {c.code}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
