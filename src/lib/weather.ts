export interface WeatherDay {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitation: number;
  precipitationProb: number;
  weatherCode: number;
  label: string;
  icon: string;
}

export interface WeatherResult {
  destination: string;
  type: "forecast" | "climate-average";
  days: WeatherDay[];
  message?: string;
}

const WEATHER_LABELS: Record<number, { label: string; icon: string }> = {
  0: { label: "Clear sky", icon: "sun" },
  1: { label: "Mainly clear", icon: "sun" },
  2: { label: "Partly cloudy", icon: "cloud-sun" },
  3: { label: "Overcast", icon: "cloud" },
  45: { label: "Foggy", icon: "cloud-fog" },
  48: { label: "Rime fog", icon: "cloud-fog" },
  51: { label: "Light drizzle", icon: "cloud-drizzle" },
  53: { label: "Drizzle", icon: "cloud-rain" },
  55: { label: "Heavy drizzle", icon: "cloud-rain" },
  61: { label: "Light rain", icon: "cloud-rain" },
  63: { label: "Rain", icon: "cloud-rain" },
  65: { label: "Heavy rain", icon: "cloud-lightning" },
  71: { label: "Light snow", icon: "snowflake" },
  73: { label: "Snow", icon: "snowflake" },
  75: { label: "Heavy snow", icon: "snowflake" },
  77: { label: "Snow grains", icon: "snowflake" },
  80: { label: "Light showers", icon: "cloud-drizzle" },
  81: { label: "Showers", icon: "cloud-rain" },
  82: { label: "Heavy showers", icon: "cloud-lightning" },
  85: { label: "Snow showers", icon: "snowflake" },
  86: { label: "Heavy snow", icon: "snowflake" },
  95: { label: "Thunderstorm", icon: "cloud-lightning" },
  96: { label: "Hail storm", icon: "cloud-lightning" },
  99: { label: "Severe storm", icon: "cloud-lightning" },
};

function getWeatherInfo(code: number): { label: string; icon: string } {
  return WEATHER_LABELS[code] || { label: "Unknown", icon: "thermometer" };
}

interface GeocodingResult {
  results?: { latitude: number; longitude: number; name: string }[];
}

interface ForecastResponse {
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
    weathercode: number[];
  };
}

export async function getWeatherForecast(
  destination: string,
  startDate: string,
  endDate: string
): Promise<WeatherResult> {
  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1&language=en&format=json`
  );
  const geoData: GeocodingResult = await geoRes.json();

  if (!geoData.results?.[0]) {
    throw new Error(`Location "${destination}" not found`);
  }

  const { latitude, longitude } = geoData.results[0];

  const now = new Date();
  const start = new Date(startDate);
  const daysUntilTrip = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilTrip > 16) {
    return {
      destination,
      type: "climate-average",
      days: [],
      message: `Trip is ${daysUntilTrip} days away. Weather forecast will be available within 16 days of departure.`,
    };
  }

  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    daily: "temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weathercode",
    timezone: "auto",
    start_date: startDate,
    end_date: endDate,
  });

  const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  const weatherData: ForecastResponse = await weatherRes.json();

  if (!weatherData.daily?.time) {
    throw new Error("No forecast data available");
  }

  const days: WeatherDay[] = weatherData.daily.time.map((date, i) => {
    const code = weatherData.daily!.weathercode[i];
    const info = getWeatherInfo(code);
    return {
      date,
      tempMax: Math.round(weatherData.daily!.temperature_2m_max[i]),
      tempMin: Math.round(weatherData.daily!.temperature_2m_min[i]),
      precipitation: weatherData.daily!.precipitation_sum[i],
      precipitationProb: weatherData.daily!.precipitation_probability_max[i],
      weatherCode: code,
      label: info.label,
      icon: info.icon,
    };
  });

  return {
    destination,
    type: "forecast",
    days,
  };
}
