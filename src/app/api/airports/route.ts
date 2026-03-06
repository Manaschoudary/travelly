import { NextRequest, NextResponse } from "next/server";
import {
  getAutocompleteSuggestions,
  getAirportByIata,
} from "airport-data-js";
import type { AirportRecord } from "airport-data-js";

// airport-data-js only searches by airport name, not city name.
// "Delhi" won't match "Indira Gandhi International Airport" without this.
const CITY_TO_IATA: Record<string, string[]> = {
  "delhi": ["DEL"],
  "new delhi": ["DEL"],
  "mumbai": ["BOM"],
  "bombay": ["BOM"],
  "bengaluru": ["BLR"],
  "bangalore": ["BLR"],
  "hyderabad": ["HYD"],
  "kolkata": ["CCU"],
  "calcutta": ["CCU"],
  "chennai": ["MAA"],
  "madras": ["MAA"],
  "ahmedabad": ["AMD"],
  "pune": ["PNQ"],
  "jaipur": ["JAI"],
  "lucknow": ["LKO"],
  "goa": ["GOI"],
  "kochi": ["COK"],
  "cochin": ["COK"],
  "thiruvananthapuram": ["TRV"],
  "trivandrum": ["TRV"],
  "guwahati": ["GAU"],
  "chandigarh": ["IXC"],
  "patna": ["PAT"],
  "bhubaneswar": ["BBI"],
  "indore": ["IDR"],
  "nagpur": ["NAG"],
  "coimbatore": ["CJB"],
  "varanasi": ["VNS"],
  "srinagar": ["SXR"],
  "amritsar": ["ATQ"],
  "visakhapatnam": ["VTZ"],
  "vizag": ["VTZ"],
  "mangalore": ["IXE"],
  "mangaluru": ["IXE"],
  "ranchi": ["IXR"],
  "raipur": ["RPR"],
  "udaipur": ["UDR"],
  "dehradun": ["DED"],
  "imphal": ["IMF"],
  "agartala": ["IXA"],
  "dibrugarh": ["DIB"],
  "leh": ["IXL"],
  "madurai": ["IXM"],
  "tiruchirappalli": ["TRZ"],
  "trichy": ["TRZ"],
  "bagdogra": ["IXB"],
  "siliguri": ["IXB"],
  "port blair": ["IXZ"],
  "andaman": ["IXZ"],
  "dubai": ["DXB", "DWC"],
  "abu dhabi": ["AUH"],
  "doha": ["DOH"],
  "riyadh": ["RUH"],
  "jeddah": ["JED"],
  "muscat": ["MCT"],
  "bahrain": ["BAH"],
  "kuwait": ["KWI"],
  "singapore": ["SIN"],
  "bangkok": ["BKK", "DMK"],
  "kuala lumpur": ["KUL"],
  "bali": ["DPS"],
  "jakarta": ["CGK"],
  "hanoi": ["HAN"],
  "ho chi minh": ["SGN"],
  "manila": ["MNL"],
  "colombo": ["CMB"],
  "kathmandu": ["KTM"],
  "dhaka": ["DAC"],
  "yangon": ["RGN"],
  "tokyo": ["NRT", "HND"],
  "osaka": ["KIX"],
  "seoul": ["ICN", "GMP"],
  "beijing": ["PEK", "PKX"],
  "shanghai": ["PVG", "SHA"],
  "hong kong": ["HKG"],
  "taipei": ["TPE"],
  "london": ["LHR", "LGW", "STN", "LTN", "LCY"],
  "paris": ["CDG", "ORY"],
  "amsterdam": ["AMS"],
  "frankfurt": ["FRA"],
  "munich": ["MUC"],
  "berlin": ["BER"],
  "rome": ["FCO", "CIA"],
  "milan": ["MXP", "LIN"],
  "madrid": ["MAD"],
  "barcelona": ["BCN"],
  "lisbon": ["LIS"],
  "zurich": ["ZRH"],
  "geneva": ["GVA"],
  "vienna": ["VIE"],
  "prague": ["PRG"],
  "istanbul": ["IST", "SAW"],
  "athens": ["ATH"],
  "dublin": ["DUB"],
  "edinburgh": ["EDI"],
  "copenhagen": ["CPH"],
  "oslo": ["OSL"],
  "stockholm": ["ARN"],
  "helsinki": ["HEL"],
  "warsaw": ["WAW"],
  "budapest": ["BUD"],
  "brussels": ["BRU"],
  "new york": ["JFK", "EWR", "LGA"],
  "los angeles": ["LAX"],
  "chicago": ["ORD", "MDW"],
  "san francisco": ["SFO"],
  "dallas": ["DFW", "DAL"],
  "houston": ["IAH", "HOU"],
  "miami": ["MIA"],
  "atlanta": ["ATL"],
  "boston": ["BOS"],
  "seattle": ["SEA"],
  "denver": ["DEN"],
  "washington": ["IAD", "DCA"],
  "toronto": ["YYZ"],
  "vancouver": ["YVR"],
  "montreal": ["YUL"],
  "mexico city": ["MEX"],
  "sydney": ["SYD"],
  "melbourne": ["MEL"],
  "auckland": ["AKL"],
  "brisbane": ["BNE"],
  "perth": ["PER"],
  "johannesburg": ["JNB"],
  "cairo": ["CAI"],
  "nairobi": ["NBO"],
  "cape town": ["CPT"],
  "lagos": ["LOS"],
  "addis ababa": ["ADD"],
  "casablanca": ["CMN"],
  "sao paulo": ["GRU"],
  "rio de janeiro": ["GIG"],
  "buenos aires": ["EZE"],
  "santiago": ["SCL"],
  "lima": ["LIM"],
  "bogota": ["BOG"],
};

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get("q")?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ airports: [] });
    }

    const queryLower = query.toLowerCase();
    const isIataCode = /^[A-Z]{3}$/i.test(query);
    let results: AirportRecord[] = [];

    if (isIataCode) {
      const exact = await getAirportByIata(query.toUpperCase());
      if (exact && exact.length > 0) {
        results = exact;
      }
    }

    const cityIataCodes: string[] = [];
    for (const [city, codes] of Object.entries(CITY_TO_IATA)) {
      if (city.startsWith(queryLower) || city.includes(queryLower)) {
        cityIataCodes.push(...codes);
      }
    }

    if (cityIataCodes.length > 0) {
      const existingCodes = new Set(results.map((r) => r.iata));
      for (const code of cityIataCodes) {
        if (!existingCodes.has(code)) {
          const airport = await getAirportByIata(code);
          if (airport && airport.length > 0) {
            results.push(...airport);
            existingCodes.add(code);
          }
        }
      }
    }

    const autocomplete = await getAutocompleteSuggestions(query);
    if (autocomplete && autocomplete.length > 0) {
      const existingCodes = new Set(results.map((r) => r.iata));
      for (const airport of autocomplete) {
        if (!existingCodes.has(airport.iata)) {
          results.push(airport);
        }
      }
    }

    const filtered = results
      .filter(
        (a) =>
          a.iata &&
          a.iata.length === 3 &&
          a.scheduled_service === "TRUE" &&
          (a.type === "large_airport" || a.type === "medium_airport")
      )
      .slice(0, 20)
      .map((a) => ({
        code: a.iata,
        name: a.airport,
        country: a.country_code,
      }));

    return NextResponse.json({ airports: filtered });
  } catch (error) {
    console.error("Airport search error:", error);
    return NextResponse.json({ airports: [] });
  }
}
