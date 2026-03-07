const MARKER = process.env.TRAVELPAYOUTS_MARKER || "travelly";

// ---------------------------------------------------------------------------
// Flight affiliate links — Aviasales (via TravelPayouts)
// ---------------------------------------------------------------------------

interface FlightLinkParams {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  adults?: number;
}

export function buildFlightLink({
  origin,
  destination,
  departDate,
  returnDate,
  adults = 1,
}: FlightLinkParams): string {
  const params = new URLSearchParams({
    origin_iata: origin,
    destination_iata: destination,
    depart_date: departDate,
    adults: String(adults),
    marker: MARKER,
  });
  if (returnDate) params.set("return_date", returnDate);
  return `https://www.aviasales.com/search?${params.toString()}`;
}

// ---------------------------------------------------------------------------
// Hotel affiliate links — Hotellook (via TravelPayouts)
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
    marker: MARKER,
    adults: String(adults),
    checkIn,
  });
  if (checkOut) params.set("checkOut", checkOut);
  return `https://search.hotellook.com/?destination=${encodeURIComponent(destination)}&${params.toString()}`;
}

// ---------------------------------------------------------------------------
// Generic deep link — wrap any partner URL with TravelPayouts marker
// ---------------------------------------------------------------------------

export function buildPartnerLink(url: string): string {
  const u = new URL(url);
  u.searchParams.set("marker", MARKER);
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
 * real affiliate markdown links.
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
