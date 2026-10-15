
const GEOCODING_API =
  "https://geocoding-api.open-meteo.com/v1/search";

const WEATHER_API =
  "https://api.open-meteo.com/v1/forecast";

const REQUEST_TIMEOUT_MS = 12_000;

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
  results?: unknown;
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isNumber(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every(isString)
  );
}

function isNumberArray(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.every(isNumber)
  );
}

function isCity(value: unknown): value is City {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isNumber(value.id) &&
    isString(value.name) &&
    isNumber(value.latitude) &&
    isNumber(value.longitude) &&
    value.latitude >= -90 &&
    value.latitude <= 90 &&
    value.longitude >= -180 &&
    value.longitude <= 180
  );
}

function isWeatherData(
  value: unknown,
): value is WeatherData {
  if (!isRecord(value)) {
    return false;
  }

  const current = value.current;
  const hourly = value.hourly;
  const daily = value.daily;

  if (
    !isNumber(value.latitude) ||
    !isNumber(value.longitude) ||
    !isString(value.timezone) ||
    !isRecord(current) ||
    !isRecord(hourly) ||
    !isRecord(daily)
  ) {
    return false;
  }

  const currentFields = [
    "temperature_2m",
    "relative_humidity_2m",
    "apparent_temperature",
    "is_day",
    "precipitation",
    "weather_code",
    "wind_speed_10m",
    "visibility",
  ];

  if (
    !isString(current.time) ||
    !currentFields.every((field) =>
      isNumber(current[field]),
    )
  ) {
    return false;
  }

  if (
    !isStringArray(hourly.time) ||
    !isNumberArray(hourly.temperature_2m) ||
    !isNumberArray(hourly.weather_code) ||
    hourly.time.length !== hourly.temperature_2m.length ||
    hourly.time.length !== hourly.weather_code.length
  ) {
    return false;
  }

  if (
    !isStringArray(daily.time) ||
    !isNumberArray(daily.weather_code) ||
    !isNumberArray(daily.temperature_2m_max) ||
    !isNumberArray(daily.temperature_2m_min) ||
    !isStringArray(daily.sunrise) ||
    !isStringArray(daily.sunset)
  ) {
    return false;
  }

  const dailyLength = daily.time.length;

  return (
    dailyLength > 0 &&
    daily.weather_code.length === dailyLength &&
    daily.temperature_2m_max.length === dailyLength &&
    daily.temperature_2m_min.length === dailyLength &&
    daily.sunrise.length === dailyLength &&
    daily.sunset.length === dailyLength
  );
}

async function fetchJson(
  url: string,
  errorMessage: string,
): Promise<unknown> {
  let response: Response;

  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: {
        Accept: "application/json",
      },
    });
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.name === "TimeoutError"
    ) {
      throw new Error(
        "The request took too long. Please try again.",
      );
    }

    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      throw new Error("The request was cancelled.");
    }

    throw new Error(
      "Unable to connect. Please check your internet connection.",
    );
  }

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error(
        "Too many requests. Please wait a moment and try again.",
      );
    }

    if (response.status >= 500) {
      throw new Error(
        "The weather service is temporarily unavailable. Please try again.",
      );
    }

    throw new Error(errorMessage);
  }

  try {
    return await response.json();
  } catch {
    throw new Error(
      "The server returned an invalid response. Please try again.",
    );
  }
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

  const data = (await fetchJson(
    `${GEOCODING_API}?${params.toString()}`,
    "Unable to search cities. Please try again.",
  )) as GeocodingResponse;

  if (!isRecord(data) || !("results" in data)) {
    // Open-Meteo may return no results for an unknown city.
    // A missing results field is treated as an empty search.
    return [];
  }

  if (!Array.isArray(data.results)) {
    throw new Error(
      "The city search returned an invalid response.",
    );
  }

  return data.results.filter(isCity);
}

export async function getWeather(
  latitude: number,
  longitude: number,
): Promise<WeatherData> {
  if (
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90
  ) {
    throw new Error("Invalid latitude provided.");
  }

  if (
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error("Invalid longitude provided.");
  }

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

  const data = await fetchJson(
    `${WEATHER_API}?${params.toString()}`,
    "Unable to load weather data. Please try again.",
  );

  if (!isWeatherData(data)) {
    throw new Error(
      "The weather service returned incomplete or invalid data.",
    );
  }

  return data;
}
