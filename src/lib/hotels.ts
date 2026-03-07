// ---------------------------------------------------------------------------
// Hotel price estimate engine + deep links to Booking.com / MakeMyTrip
// ---------------------------------------------------------------------------

export interface HotelEstimate {
  category: string;
  starRating: number;
  priceRange: { min: number; max: number };
  avgPerNight: number;
  description: string;
  bookingUrl: string;
  makemytripUrl: string;
}

export interface HotelEstimateResult {
  destination: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  currency: string;
  estimates: HotelEstimate[];
}

// Base price ranges per night in INR by region + star category
// These are realistic ranges for Indian travelers (2024-2026 data)
const REGION_MULTIPLIERS: Record<string, number> = {
  // India — baseline
  India: 1.0,
  // South Asia — slightly cheaper
  Nepal: 0.7,
  "Sri Lanka": 0.8,
  Bhutan: 1.3,
  // SE Asia — affordable
  Thailand: 0.9,
  Indonesia: 0.85,
  Vietnam: 0.7,
  Cambodia: 0.65,
  Malaysia: 0.95,
  Singapore: 2.0,
  // Middle East — premium
  UAE: 2.2,
  // East Asia
  Japan: 2.0,
  "South Korea": 1.8,
  China: 1.5,
  Taiwan: 1.4,
  "Hong Kong": 2.3,
  // Europe
  France: 2.5,
  UK: 2.8,
  Italy: 2.2,
  Spain: 1.8,
  Netherlands: 2.4,
  Germany: 2.0,
  Switzerland: 3.5,
  "Czech Republic": 1.6,
  Austria: 2.2,
  Greece: 1.7,
  Turkey: 1.3,
  Hungary: 1.4,
  Croatia: 1.8,
  Iceland: 3.0,
  Portugal: 1.7,
  Denmark: 2.6,
  Sweden: 2.5,
  Norway: 3.0,
  // Americas
  USA: 2.8,
  Canada: 2.5,
  Mexico: 1.4,
  Peru: 1.2,
  Brazil: 1.5,
  Argentina: 1.3,
  // Africa
  "South Africa": 1.3,
  Tanzania: 1.5,
  Morocco: 1.2,
  Egypt: 1.0,
  Seychelles: 3.0,
  Mauritius: 2.5,
  Kenya: 1.5,
  // Oceania
  Australia: 2.8,
  "New Zealand": 2.5,
  Fiji: 2.2,
  "French Polynesia": 4.0,
  // Maldives — premium
  Maldives: 3.5,
};

// Base INR prices per night by star category (India baseline)
const BASE_PRICES: { category: string; stars: number; min: number; max: number; desc: string }[] = [
  { category: "Budget", stars: 2, min: 800, max: 2000, desc: "Hostels, guesthouses & budget hotels" },
  { category: "Comfort", stars: 3, min: 2000, max: 5000, desc: "Mid-range hotels with good amenities" },
  { category: "Premium", stars: 4, min: 5000, max: 12000, desc: "4-star hotels with premium facilities" },
  { category: "Luxury", stars: 5, min: 12000, max: 35000, desc: "5-star luxury resorts & boutique hotels" },
];

// Seasonal multiplier — peak season is Nov-Mar for most destinations
function getSeasonMultiplier(month: number): number {
  if (month >= 11 || month <= 2) return 1.3; // Peak season
  if (month >= 3 && month <= 5) return 1.0;   // Shoulder
  return 0.85;                                  // Off-season (monsoon for India)
}

function getCountryForDestination(destination: string): string {
  // Quick lookup from common destinations
  const DEST_COUNTRY: Record<string, string> = {
    Goa: "India", Manali: "India", Kashmir: "India", Rajasthan: "India",
    Kerala: "India", Ladakh: "India", Rishikesh: "India", Jaipur: "India",
    Udaipur: "India", Varanasi: "India", Shimla: "India", Munnar: "India",
    Ooty: "India", Agra: "India", Amritsar: "India", Jodhpur: "India",
    Darjeeling: "India", Kodaikanal: "India", Jaisalmer: "India",
    Nainital: "India", Coorg: "India", Hampi: "India", Pushkar: "India",
    Alleppey: "India", Pondicherry: "India", Dehradun: "India",
    Bali: "Indonesia", Bangkok: "Thailand", Phuket: "Thailand",
    "Chiang Mai": "Thailand", Krabi: "Thailand", Pattaya: "Thailand",
    Dubai: "UAE", "Abu Dhabi": "UAE", Singapore: "Singapore",
    "Kuala Lumpur": "Malaysia", Langkawi: "Malaysia",
    Maldives: "Maldives", "Sri Lanka": "Sri Lanka", Colombo: "Sri Lanka",
    Vietnam: "Vietnam", Hanoi: "Vietnam", "Da Nang": "Vietnam",
    "Ho Chi Minh City": "Vietnam", Kathmandu: "Nepal", Pokhara: "Nepal",
    Bhutan: "Bhutan", "Hong Kong": "Hong Kong", Tokyo: "Japan",
    Kyoto: "Japan", Osaka: "Japan", Seoul: "South Korea",
    Paris: "France", London: "UK", Rome: "Italy", Venice: "Italy",
    Florence: "Italy", Barcelona: "Spain", Madrid: "Spain",
    Amsterdam: "Netherlands", Prague: "Czech Republic", Vienna: "Austria",
    Zurich: "Switzerland", Interlaken: "Switzerland",
    Santorini: "Greece", Athens: "Greece", Istanbul: "Turkey",
    Cappadocia: "Turkey", Berlin: "Germany", Munich: "Germany",
    Budapest: "Hungary", Dubrovnik: "Croatia", Reykjavik: "Iceland",
    Lisbon: "Portugal", Copenhagen: "Denmark", Stockholm: "Sweden",
    "New York": "USA", "Los Angeles": "USA", "San Francisco": "USA",
    "Las Vegas": "USA", Hawaii: "USA", Miami: "USA",
    Toronto: "Canada", Vancouver: "Canada", Banff: "Canada",
    Cancun: "Mexico", "Rio de Janeiro": "Brazil", "Buenos Aires": "Argentina",
    "Cape Town": "South Africa", Zanzibar: "Tanzania", Marrakech: "Morocco",
    Egypt: "Egypt", Seychelles: "Seychelles", Mauritius: "Mauritius",
    Sydney: "Australia", Melbourne: "Australia", "New Zealand": "New Zealand",
    Queenstown: "New Zealand", Fiji: "Fiji", "Bora Bora": "French Polynesia",
  };
  return DEST_COUNTRY[destination] || "India";
}

// ---------------------------------------------------------------------------
// Deep link builders
// ---------------------------------------------------------------------------

export function buildBookingDeepLink(
  destination: string,
  checkIn: string,
  checkOut: string,
  adults = 2
): string {
  const params = new URLSearchParams({
    ss: destination,
    checkin: checkIn,
    checkout: checkOut,
    group_adults: String(adults),
    no_rooms: "1",
    lang: "en",
  });
  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}

export function buildMakeMyTripDeepLink(
  destination: string,
  checkIn: string,
  checkOut: string,
  adults = 2
): string {
  // MMT uses a specific URL format
  const cin = checkIn.replace(/-/g, "");
  const cout = checkOut.replace(/-/g, "");
  const params = new URLSearchParams({
    checkin: cin,
    checkout: cout,
    city: destination,
    roomStayQualifier: `${adults}e0e`,
    locusId: "",
    locusType: "city",
    searchText: destination,
  });
  return `https://www.makemytrip.com/hotels/hotel-listing/?${params.toString()}`;
}

// ---------------------------------------------------------------------------
// Main estimate function
// ---------------------------------------------------------------------------

export function getHotelEstimates(
  destination: string,
  checkIn: string,
  checkOut: string,
  adults = 2
): HotelEstimateResult {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const month = start.getMonth() + 1;

  const country = getCountryForDestination(destination);
  const regionMult = REGION_MULTIPLIERS[country] || 1.0;
  const seasonMult = getSeasonMultiplier(month);

  const estimates: HotelEstimate[] = BASE_PRICES.map((base) => {
    const min = Math.round(base.min * regionMult * seasonMult);
    const max = Math.round(base.max * regionMult * seasonMult);
    const avg = Math.round((min + max) / 2);

    return {
      category: base.category,
      starRating: base.stars,
      priceRange: { min: min * nights, max: max * nights },
      avgPerNight: avg,
      description: base.desc,
      bookingUrl: buildBookingDeepLink(destination, checkIn, checkOut, adults),
      makemytripUrl: buildMakeMyTripDeepLink(destination, checkIn, checkOut, adults),
    };
  });

  return {
    destination,
    checkIn,
    checkOut,
    nights,
    currency: "INR",
    estimates,
  };
}
