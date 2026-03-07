"use client";

import { useState, useCallback } from "react";

interface CityAirport {
  city: string;
  airport: string;
  iata: string;
  lat: number;
  lng: number;
}

const INDIAN_CITIES: CityAirport[] = [
  { city: "Mumbai", airport: "Chhatrapati Shivaji Maharaj Intl", iata: "BOM", lat: 19.0896, lng: 72.8656 },
  { city: "Delhi", airport: "Indira Gandhi Intl", iata: "DEL", lat: 28.5562, lng: 77.1000 },
  { city: "Bangalore", airport: "Kempegowda Intl", iata: "BLR", lat: 13.1986, lng: 77.7066 },
  { city: "Hyderabad", airport: "Rajiv Gandhi Intl", iata: "HYD", lat: 17.2403, lng: 78.4294 },
  { city: "Chennai", airport: "Chennai Intl", iata: "MAA", lat: 12.9941, lng: 80.1709 },
  { city: "Kolkata", airport: "Netaji Subhas Chandra Bose Intl", iata: "CCU", lat: 22.6547, lng: 88.4467 },
  { city: "Ahmedabad", airport: "Sardar Vallabhbhai Patel Intl", iata: "AMD", lat: 23.0771, lng: 72.6347 },
  { city: "Pune", airport: "Pune Airport", iata: "PNQ", lat: 18.5822, lng: 73.9197 },
  { city: "Jaipur", airport: "Jaipur Intl", iata: "JAI", lat: 26.8242, lng: 75.8122 },
  { city: "Goa", airport: "Manohar Intl", iata: "GOX", lat: 15.3809, lng: 73.8314 },
  { city: "Kochi", airport: "Cochin Intl", iata: "COK", lat: 10.1520, lng: 76.4019 },
  { city: "Lucknow", airport: "Chaudhary Charan Singh Intl", iata: "LKO", lat: 26.7606, lng: 80.8893 },
  { city: "Guwahati", airport: "Lokpriya Gopinath Bordoloi Intl", iata: "GAU", lat: 26.1061, lng: 91.5859 },
  { city: "Chandigarh", airport: "Chandigarh Airport", iata: "IXC", lat: 30.6735, lng: 76.7885 },
  { city: "Thiruvananthapuram", airport: "Trivandrum Intl", iata: "TRV", lat: 8.4821, lng: 76.9199 },
  { city: "Bhopal", airport: "Raja Bhoj Airport", iata: "BHO", lat: 23.2875, lng: 77.3374 },
  { city: "Indore", airport: "Devi Ahilyabai Holkar Airport", iata: "IDR", lat: 22.7218, lng: 75.8011 },
  { city: "Nagpur", airport: "Dr. Babasaheb Ambedkar Intl", iata: "NAG", lat: 21.0922, lng: 79.0472 },
  { city: "Patna", airport: "Jay Prakash Narayan Intl", iata: "PAT", lat: 25.5913, lng: 85.0880 },
  { city: "Varanasi", airport: "Lal Bahadur Shastri Intl", iata: "VNS", lat: 25.4524, lng: 82.8593 },
  { city: "Coimbatore", airport: "Coimbatore Intl", iata: "CJB", lat: 11.0300, lng: 77.0434 },
  { city: "Visakhapatnam", airport: "Visakhapatnam Airport", iata: "VTZ", lat: 17.7215, lng: 83.2245 },
  { city: "Srinagar", airport: "Sheikh ul-Alam Intl", iata: "SXR", lat: 33.9871, lng: 74.7742 },
  { city: "Amritsar", airport: "Sri Guru Ram Dass Jee Intl", iata: "ATQ", lat: 31.7096, lng: 74.7973 },
  { city: "Ranchi", airport: "Birsa Munda Airport", iata: "IXR", lat: 23.3143, lng: 85.3217 },
  { city: "Mangalore", airport: "Mangalore Intl", iata: "IXE", lat: 12.9614, lng: 74.8901 },
  { city: "Raipur", airport: "Swami Vivekananda Airport", iata: "RPR", lat: 21.1804, lng: 81.7388 },
  { city: "Dehradun", airport: "Jolly Grant Airport", iata: "DED", lat: 30.1897, lng: 78.1803 },
  { city: "Udaipur", airport: "Maharana Pratap Airport", iata: "UDR", lat: 24.6177, lng: 73.8961 },
  { city: "Tiruchirappalli", airport: "Trichy Intl", iata: "TRZ", lat: 10.7654, lng: 78.7097 },
];

export { INDIAN_CITIES };
export type { CityAirport };

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findNearestCity(lat: number, lng: number): CityAirport {
  let nearest = INDIAN_CITIES[0];
  let minDist = Infinity;
  for (const city of INDIAN_CITIES) {
    const dist = haversineDistance(lat, lng, city.lat, city.lng);
    if (dist < minDist) {
      minDist = dist;
      nearest = city;
    }
  }
  return nearest;
}

interface GeolocationState {
  loading: boolean;
  error: string | null;
  detectedCity: CityAirport | null;
}

export default function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    loading: false,
    error: null,
    detectedCity: null,
  });

  const detect = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ loading: false, error: "Geolocation not supported", detectedCity: null });
      return;
    }

    setState({ loading: true, error: null, detectedCity: null });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nearest = findNearestCity(position.coords.latitude, position.coords.longitude);
        setState({ loading: false, error: null, detectedCity: nearest });
      },
      (err) => {
        const msg =
          err.code === 1
            ? "Location permission denied. Please select your city manually."
            : "Could not detect location. Please select manually.";
        setState({ loading: false, error: msg, detectedCity: null });
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  return { ...state, detect };
}
