declare module "airport-data-js" {
  export interface AirportRecord {
    iata: string;
    icao: string;
    time: string;
    utc: number;
    country_code: string;
    continent: string;
    airport: string;
    latitude: number;
    longitude: number;
    elevation_ft: number | string;
    type: string;
    scheduled_service: string;
    wikipedia: string;
    website: string;
    runway_length: number | string;
    flightradar24_url: string;
    radarbox_url: string;
    flightaware_url: string;
  }

  export function getAirportByIata(iata: string): Promise<AirportRecord[]>;
  export function getAirportByIcao(icao: string): Promise<AirportRecord[]>;
  export function getAirportByCountryCode(code: string): Promise<AirportRecord[]>;
  export function getAirportByContinent(continent: string): Promise<AirportRecord[]>;
  export function searchByName(name: string): Promise<AirportRecord[]>;
  export function getAutocompleteSuggestions(query: string): Promise<AirportRecord[]>;
  export function getAirportsByType(type: string): Promise<AirportRecord[]>;
  export function findNearbyAirports(lat: number, lon: number, radius: number): Promise<AirportRecord[]>;
  export function getAirportCount(): Promise<number>;
  export function validateIataCode(code: string): Promise<boolean>;
  export function validateIcaoCode(code: string): Promise<boolean>;
  export function isAirportOperational(code: string): Promise<boolean>;
}
