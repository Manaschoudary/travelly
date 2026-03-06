import { NextRequest, NextResponse } from "next/server";

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

function generateTravelpayoutsLink(
  origin: string,
  destination: string,
  departDate: string,
  returnDate?: string
): string {
  const marker = process.env.TRAVELPAYOUTS_MARKER || "travelly";
  const base = "https://www.aviasales.com/search";
  const params = new URLSearchParams({
    origin_iata: origin,
    destination_iata: destination,
    depart_date: departDate,
    ...(returnDate && { return_date: returnDate }),
    adults: "1",
    marker,
  });
  return `${base}?${params.toString()}`;
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

    const affiliateLink = generateTravelpayoutsLink(
      origin,
      destination,
      departDate,
      returnDate
    );

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
