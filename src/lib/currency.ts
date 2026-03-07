export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  rate: number; // 1 INR = X units of this currency
  locale: string;
}

// Rates: 1 INR = X target currency (approximate, 2025)
export const CURRENCIES: Record<string, CurrencyInfo> = {
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee", rate: 1, locale: "en-IN" },
  USD: { code: "USD", symbol: "$", name: "US Dollar", rate: 0.0119, locale: "en-US" },
  EUR: { code: "EUR", symbol: "€", name: "Euro", rate: 0.0109, locale: "de-DE" },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", rate: 0.0094, locale: "en-GB" },
  AED: { code: "AED", symbol: "د.إ", name: "UAE Dirham", rate: 0.0437, locale: "ar-AE" },
  SGD: { code: "SGD", symbol: "S$", name: "Singapore Dollar", rate: 0.0159, locale: "en-SG" },
  THB: { code: "THB", symbol: "฿", name: "Thai Baht", rate: 0.408, locale: "th-TH" },
  MYR: { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", rate: 0.0527, locale: "ms-MY" },
  AUD: { code: "AUD", symbol: "A$", name: "Australian Dollar", rate: 0.0183, locale: "en-AU" },
  CAD: { code: "CAD", symbol: "C$", name: "Canadian Dollar", rate: 0.0164, locale: "en-CA" },
  JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen", rate: 1.78, locale: "ja-JP" },
  CNY: { code: "CNY", symbol: "¥", name: "Chinese Yuan", rate: 0.0863, locale: "zh-CN" },
  KRW: { code: "KRW", symbol: "₩", name: "South Korean Won", rate: 16.3, locale: "ko-KR" },
  CHF: { code: "CHF", symbol: "CHF", name: "Swiss Franc", rate: 0.0105, locale: "de-CH" },
  SAR: { code: "SAR", symbol: "﷼", name: "Saudi Riyal", rate: 0.0446, locale: "ar-SA" },
  LKR: { code: "LKR", symbol: "Rs", name: "Sri Lankan Rupee", rate: 3.56, locale: "si-LK" },
  NPR: { code: "NPR", symbol: "Rs", name: "Nepalese Rupee", rate: 1.60, locale: "ne-NP" },
  BDT: { code: "BDT", symbol: "৳", name: "Bangladeshi Taka", rate: 1.30, locale: "bn-BD" },
  IDR: { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", rate: 188.0, locale: "id-ID" },
  PHP: { code: "PHP", symbol: "₱", name: "Philippine Peso", rate: 0.668, locale: "fil-PH" },
  VND: { code: "VND", symbol: "₫", name: "Vietnamese Dong", rate: 298.0, locale: "vi-VN" },
  NZD: { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar", rate: 0.0199, locale: "en-NZ" },
  ZAR: { code: "ZAR", symbol: "R", name: "South African Rand", rate: 0.216, locale: "en-ZA" },
  TRY: { code: "TRY", symbol: "₺", name: "Turkish Lira", rate: 0.386, locale: "tr-TR" },
  BRL: { code: "BRL", symbol: "R$", name: "Brazilian Real", rate: 0.069, locale: "pt-BR" },
  MXN: { code: "MXN", symbol: "MX$", name: "Mexican Peso", rate: 0.204, locale: "es-MX" },
};

export const POPULAR_CURRENCIES = [
  "INR", "USD", "EUR", "GBP", "AED", "SGD", "THB", "AUD", "CAD", "JPY",
];

export function convertFromINR(amountINR: number, targetCurrency: string): number {
  const currency = CURRENCIES[targetCurrency];
  if (!currency) return amountINR;
  return amountINR * currency.rate;
}

export function formatCurrency(amount: number, currencyCode: string): string {
  const currency = CURRENCIES[currencyCode];
  if (!currency) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // JPY, KRW, VND, IDR use no decimals due to large unit values
  const noDecimalCurrencies = ["JPY", "KRW", "VND", "IDR", "INR"];
  const maxDecimals = noDecimalCurrencies.includes(currencyCode) ? 0 : 2;

  return new Intl.NumberFormat(currency.locale, {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: maxDecimals,
  }).format(amount);
}

export function formatDualCurrency(
  amountINR: number,
  secondaryCurrency: string | null
): string {
  const inrFormatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amountINR);

  if (!secondaryCurrency || secondaryCurrency === "INR") {
    return inrFormatted;
  }

  const converted = convertFromINR(amountINR, secondaryCurrency);
  const secondFormatted = formatCurrency(converted, secondaryCurrency);
  return `${inrFormatted} (${secondFormatted})`;
}

const TIMEZONE_CURRENCY_MAP: Record<string, string> = {
  "America/New_York": "USD",
  "America/Chicago": "USD",
  "America/Denver": "USD",
  "America/Los_Angeles": "USD",
  "America/Toronto": "CAD",
  "America/Vancouver": "CAD",
  "America/Mexico_City": "MXN",
  "America/Sao_Paulo": "BRL",
  "Europe/London": "GBP",
  "Europe/Paris": "EUR",
  "Europe/Berlin": "EUR",
  "Europe/Rome": "EUR",
  "Europe/Madrid": "EUR",
  "Europe/Amsterdam": "EUR",
  "Europe/Zurich": "CHF",
  "Europe/Istanbul": "TRY",
  "Asia/Kolkata": "INR",
  "Asia/Dubai": "AED",
  "Asia/Singapore": "SGD",
  "Asia/Bangkok": "THB",
  "Asia/Kuala_Lumpur": "MYR",
  "Asia/Tokyo": "JPY",
  "Asia/Seoul": "KRW",
  "Asia/Shanghai": "CNY",
  "Asia/Hong_Kong": "CNY",
  "Asia/Jakarta": "IDR",
  "Asia/Manila": "PHP",
  "Asia/Ho_Chi_Minh": "VND",
  "Asia/Colombo": "LKR",
  "Asia/Kathmandu": "NPR",
  "Asia/Dhaka": "BDT",
  "Asia/Riyadh": "SAR",
  "Australia/Sydney": "AUD",
  "Australia/Melbourne": "AUD",
  "Pacific/Auckland": "NZD",
  "Africa/Johannesburg": "ZAR",
};

export function detectUserCurrency(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TIMEZONE_CURRENCY_MAP[tz]) {
      return TIMEZONE_CURRENCY_MAP[tz];
    }
  } catch {
  }
  return "INR";
}

export function getSortedCurrencies(): CurrencyInfo[] {
  const popular = POPULAR_CURRENCIES
    .map((code) => CURRENCIES[code])
    .filter(Boolean);

  const rest = Object.values(CURRENCIES)
    .filter((c) => !POPULAR_CURRENCIES.includes(c.code))
    .sort((a, b) => a.name.localeCompare(b.name));

  return [...popular, ...rest];
}
