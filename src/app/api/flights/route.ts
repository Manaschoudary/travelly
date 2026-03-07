import { NextRequest, NextResponse } from "next/server";
import { buildFlightLink } from "@/lib/affiliate";

interface AmadeusToken {
  access_token: string;
  expires_in: number;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAmadeusToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const response = await fetch(
    "https://api.amadeus.com/v1/security/oauth2/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.AMADEUS_CLIENT_ID || "",
        client_secret: process.env.AMADEUS_CLIENT_SECRET || "",
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to authenticate with Amadeus API");
  }

  const data: AmadeusToken = await response.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return cachedToken.token;
}

interface TravelpayoutsOffer {
  origin: string;
  destination: string;
  origin_airport: string;
  destination_airport: string;
  price: number;
  airline: string;
  flight_number: string;
  departure_at: string;
  return_at: string | null;
  transfers: number;
  return_transfers: number;
  duration: number;
  duration_to: number;
  duration_back: number;
  link: string;
}

async function searchTravelpayouts(
  origin: string,
  destination: string,
  departDate: string,
  returnDate: string | undefined,
  affiliateLink: string
): Promise<Record<string, unknown>[] | null> {
  const token = process.env.TRAVELPAYOUTS_TOKEN;
  if (!token) return null;

  const searchParams = new URLSearchParams({
    origin,
    destination,
    departure_at: departDate,
    currency: "INR",
    limit: "10",
    sorting: "price",
    direct: "false",
    one_way: returnDate ? "false" : "true",
  });

  if (returnDate) {
    searchParams.set("return_at", returnDate);
  }

  const res = await fetch(
    `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${searchParams}`,
    {
      headers: { "X-Access-Token": token },
    }
  );

  if (!res.ok) return null;

  const data = await res.json();
  if (!data.success || !Array.isArray(data.data) || data.data.length === 0) {
    return null;
  }

  const marker = process.env.TRAVELPAYOUTS_MARKER || "";

  return data.data.map((offer: TravelpayoutsOffer, i: number) => {
    const durationTo = offer.duration_to || offer.duration || 0;
    const hours = Math.floor(durationTo / 60);
    const mins = durationTo % 60;

    const depDate = new Date(offer.departure_at);
    const departTime = depDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    });

    const arrDate = new Date(depDate.getTime() + durationTo * 60000);
    const arrivalTime = arrDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    });

    return {
      id: `tp-${i}`,
      airline: getAirlineName(offer.airline),
      airlineCode: offer.airline,
      price: offer.price,
      currency: "INR",
      origin: offer.origin_airport || origin,
      destination: offer.destination_airport || destination,
      departDate,
      returnDate: offer.return_at || returnDate,
      departTime,
      arrivalTime,
      duration: `${hours}h ${mins}m`,
      stops: offer.transfers,
      type: offer.transfers === 0 ? "direct" : "connecting",
      bookingLink:
        offer.link
          ? `https://www.aviasales.com${offer.link}&marker=${marker}`
          : affiliateLink,
      isSample: false,
    };
  });
}

function getAirlineName(code: string): string {
  const airlines: Record<string, string> = {
    "6E": "IndiGo",
    AI: "Air India",
    SG: "SpiceJet",
    UK: "Vistara",
    QP: "Akasa Air",
    I5: "AirAsia India",
    EK: "Emirates",
    QR: "Qatar Airways",
    SQ: "Singapore Airlines",
    TG: "Thai Airways",
    LH: "Lufthansa",
    BA: "British Airways",
    EY: "Etihad",
    IX: "Air India Express",
    G8: "Go First",
  };
  return airlines[code] || code;
}

export async function POST(req: NextRequest) {
  try {
    const {
      origin,
      destination,
      departDate,
      returnDate,
      passengers,
      cabinClass,
    } = await req.json();

    if (!origin || !destination || !departDate) {
      return NextResponse.json(
        { error: "Origin, destination, and departure date are required" },
        { status: 400 }
      );
    }

    const affiliateLink = buildFlightLink({
      origin,
      destination,
      departDate,
      returnDate,
      adults: passengers || 1,
    });

    let flights: Record<string, unknown>[] = [];
    let apiSource = "mock";

    if (process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET) {
      try {
        const token = await getAmadeusToken();
        const searchParams = new URLSearchParams({
          originLocationCode: origin,
          destinationLocationCode: destination,
          departureDate: departDate,
          adults: String(passengers || 1),
          travelClass: (cabinClass || "ECONOMY").toUpperCase(),
          max: "10",
          currencyCode: "INR",
        });

        if (returnDate) {
          searchParams.set("returnDate", returnDate);
        }

        const flightResponse = await fetch(
          `https://api.amadeus.com/v2/shopping/flight-offers?${searchParams}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (flightResponse.ok) {
          const data = await flightResponse.json();
          flights = (data.data || []).map(
            (offer: Record<string, unknown>) => ({
              id: offer.id,
              price: (offer.price as Record<string, unknown>)?.grandTotal,
              currency: (offer.price as Record<string, unknown>)?.currency,
              itineraries: offer.itineraries,
              airlines:
                offer.validatingAirlineCodes ||
                (offer as Record<string, unknown[]>).airlines,
              bookingLink: affiliateLink,
            })
          );
          apiSource = "amadeus";
        }
      } catch (apiError) {
        console.error("Amadeus API error:", apiError);
      }
    }

    if (flights.length === 0) {
      try {
        const tpFlights = await searchTravelpayouts(
          origin,
          destination,
          departDate,
          returnDate,
          affiliateLink
        );
        if (tpFlights && tpFlights.length > 0) {
          flights = tpFlights;
          apiSource = "travelpayouts";
        }
      } catch (tpError) {
        console.error("Travelpayouts API error:", tpError);
      }
    }

    if (flights.length === 0) {
      flights = generateSampleFlights(
        origin,
        destination,
        departDate,
        returnDate,
        affiliateLink
      );
      apiSource = "sample";
    }

    return NextResponse.json({
      flights,
      affiliateLink,
      source: apiSource,
      searchParams: {
        origin,
        destination,
        departDate,
        returnDate,
        passengers,
        cabinClass,
      },
    });
  } catch (error) {
    console.error("Flight search error:", error);
    return NextResponse.json(
      { error: "Flight search failed" },
      { status: 500 }
    );
  }
}

function generateSampleFlights(
  origin: string,
  destination: string,
  departDate: string,
  returnDate: string | undefined,
  affiliateLink: string
) {
  const airlines = [
    { code: "6E", name: "IndiGo", type: "budget" },
    { code: "AI", name: "Air India", type: "full-service" },
    { code: "SG", name: "SpiceJet", type: "budget" },
    { code: "UK", name: "Vistara", type: "full-service" },
    { code: "QP", name: "Akasa Air", type: "budget" },
  ];

  return airlines.map((airline, i) => {
    const basePrice = airline.type === "budget" ? 3500 : 5500;
    const price = basePrice + Math.floor(Math.random() * 3000);

    return {
      id: `sample-${i}`,
      airline: airline.name,
      airlineCode: airline.code,
      price: returnDate ? price * 2 - 500 : price,
      currency: "INR",
      origin,
      destination,
      departDate,
      returnDate,
      departTime: `${6 + i * 3}:${i % 2 === 0 ? "00" : "30"}`,
      arrivalTime: `${8 + i * 3}:${i % 2 === 0 ? "45" : "15"}`,
      duration: `${2 + Math.floor(i / 2)}h ${15 + i * 10}m`,
      stops: i < 3 ? 0 : 1,
      type: airline.type,
      bookingLink: affiliateLink,
      isSample: true,
    };
  });
}
