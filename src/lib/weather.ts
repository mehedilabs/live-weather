
const GEOCODING_API =
  "https://geocoding-api.open-meteo.com/v1/search";

const WEATHER_API =
  "https://api.open-meteo.com/v1/forecast";

export interface City {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  timezone?: string;
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  timezone: string;

  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
    visibility: number;
  };

  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
  };

  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
  };
}

interface GeocodingResponse {
  results?: City[];
}

export async function searchCities(
  query: string,
): Promise<City[]> {
  const cityName = query.trim();

  if (!cityName) {
    return [];
  }

  const params = new URLSearchParams({
    name: cityName,
    count: "8",
    language: "en",
    format: "json",
  });

  const response = await fetch(
    `${GEOCODING_API}?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error(
      "Unable to search cities. Please try again.",
    );
  }

  const data: GeocodingResponse = await response.json();

  return data.results ?? [];
}

export async function getWeather(
  latitude: number,
  longitude: number,
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),

    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "is_day",
      "precipitation",
      "weather_code",
      "wind_speed_10m",
      "visibility",
    ].join(","),

    hourly: "temperature_2m,weather_code",

    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "sunrise",
      "sunset",
    ].join(","),

    timezone: "auto",
    forecast_days: "5",
  });

  const response = await fetch(
    `${WEATHER_API}?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error(
      "Unable to load weather data. Please try again.",
    );
  }

  return (await response.json()) as WeatherData;
}
