const PARTNER_ID = process.env.MAKEMYTRIP_PARTNER_ID || "";

// ---------------------------------------------------------------------------
// Date helper — MakeMyTrip uses dd/mm/yyyy format
// ---------------------------------------------------------------------------

function formatDateForMMT(date: string): string {
  // Input can be ISO "2026-04-15" or already dd/mm/yyyy
  if (date.includes("/")) return date;
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// ---------------------------------------------------------------------------
// Flight affiliate links — MakeMyTrip (via myPartner)
// ---------------------------------------------------------------------------

interface FlightLinkParams {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  adults?: number;
  children?: number;
  infants?: number;
  cabinClass?: "E" | "PE" | "B" | "F";
  international?: boolean;
  campaign?: string;
}

export function buildFlightLink({
  origin,
  destination,
  departDate,
  returnDate,
  adults = 1,
  children = 0,
  infants = 0,
  cabinClass = "E",
  international = false,
  campaign = "travelly-flights",
}: FlightLinkParams): string {
  const depFormatted = formatDateForMMT(departDate);
  let itinerary = `${origin}-${destination}-${depFormatted}`;

  const tripType = returnDate ? "R" : "O";
  if (returnDate) {
    const retFormatted = formatDateForMMT(returnDate);
    itinerary += `_${destination}-${origin}-${retFormatted}`;
  }

  const paxType = `A-${adults}_C-${children}_I-${infants}`;

  const params = new URLSearchParams({
    itinerary,
    tripType,
    paxType,
    intl: String(international),
    cabinClass,
  });

  // Affiliate tracking
  if (PARTNER_ID) {
    params.set("partnerid", PARTNER_ID);
  }
  params.set("utm_source", "travelly-app");
  params.set("utm_medium", "affiliate");
  if (campaign) {
    params.set("campaignid", campaign);
  }

  return `https://www.makemytrip.com/flight/search?${params.toString()}`;
}

// ---------------------------------------------------------------------------
// Hotel affiliate links — MakeMyTrip
// ---------------------------------------------------------------------------

interface HotelLinkParams {
  destination: string;
  checkIn: string;
  checkOut?: string;
  adults?: number;
}

export function buildHotelLink({
  destination,
  checkIn,
  checkOut,
  adults = 2,
}: HotelLinkParams): string {
  const params = new URLSearchParams({
    city: destination,
    checkin: formatDateForMMT(checkIn),
    checkout: checkOut ? formatDateForMMT(checkOut) : "",
    roomStayQualifier: `${adults}e0e`,
  });

  if (PARTNER_ID) {
    params.set("partnerid", PARTNER_ID);
  }
  params.set("utm_source", "travelly-app");
  params.set("utm_medium", "affiliate");
  params.set("campaignid", "travelly-hotels");

  return `https://www.makemytrip.com/hotels/hotel-listing/?${params.toString()}`;
}

// ---------------------------------------------------------------------------
// Generic deep link — wrap any MakeMyTrip URL with partner tracking
// ---------------------------------------------------------------------------

export function buildPartnerLink(url: string): string {
  const u = new URL(url);
  if (PARTNER_ID) {
    u.searchParams.set("partnerid", PARTNER_ID);
  }
  u.searchParams.set("utm_source", "travelly-app");
  u.searchParams.set("utm_medium", "affiliate");
  return u.toString();
}

// ---------------------------------------------------------------------------
// Tag replacement — convert agent {{BOOK_*}} tags to real affiliate links
// ---------------------------------------------------------------------------

const FLIGHT_TAG_RE =
  /\{\{BOOK_FLIGHT:([A-Z]{3}):([A-Z]{3}):(\d{4}-\d{2}-\d{2})(?::(\d{4}-\d{2}-\d{2}))?\}\}/g;

const HOTEL_TAG_RE =
  /\{\{BOOK_HOTEL:([^:}]+):(\d{4}-\d{2}-\d{2})(?::(\d{4}-\d{2}-\d{2}))?\}\}/g;

/**
 * Replace all {{BOOK_FLIGHT:...}} and {{BOOK_HOTEL:...}} tags in text with
 * real affiliate markdown links pointing to MakeMyTrip.
 */
export function replaceAffiliateTags(text: string): string {
  let result = text;

  result = result.replace(
    FLIGHT_TAG_RE,
    (_match, origin: string, dest: string, depart: string, ret?: string) => {
      const url = buildFlightLink({
        origin,
        destination: dest,
        departDate: depart,
        returnDate: ret || undefined,
        campaign: "travelly-chat",
      });
      return `[Book Flights ${origin} \u2192 ${dest}](${url})`;
    }
  );

  result = result.replace(
    HOTEL_TAG_RE,
    (_match, destination: string, checkIn: string, checkOut?: string) => {
      const url = buildHotelLink({
        destination,
        checkIn,
        checkOut: checkOut || undefined,
      });
      return `[Book Hotels in ${destination}](${url})`;
    }
  );

  return result;
}
