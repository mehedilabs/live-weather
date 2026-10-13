"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Cloud,
  CloudRain,
  CloudSun,
  Droplets,
  Eye,
  MapPin,
  Search,
  Sun,
  Sunrise,
  Sunset,
  Thermometer,
  Wind,
  LoaderCircle,
  CloudFog,
  CloudSnow,
  CloudLightning,
  LocateFixed,
} from "lucide-react";
import {
  getWeather,
  searchCities,
  type City,
  type WeatherData,
} from "@/lib/weather";

const INITIAL_CITY: City = {
  id: 0,
  name: "Dhaka",
  country: "Bangladesh",
  latitude: 23.8103,
  longitude: 90.4125,
};

function getWeatherInfo(code: number) {
  if (code === 0) return { condition: "Clear sky", icon: Sun };
  if (code === 1 || code === 2)
    return { condition: "Partly cloudy", icon: CloudSun };
  if (code === 3) return { condition: "Overcast", icon: Cloud };
  if ([45, 48].includes(code)) return { condition: "Foggy", icon: CloudFog };

  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return { condition: "Rain", icon: CloudRain };
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { condition: "Snow", icon: CloudSnow };
  }

  if ([95, 96, 99].includes(code)) {
    return { condition: "Thunderstorm", icon: CloudLightning };
  }

  return { condition: "Cloudy", icon: Cloud };
}

function formatTime(value: string) {
  const time = value.split("T")[1];
  if (!time) return value;

  const [hours, minutes] = time.split(":");
  const hour = Number(hours);
  const suffix = hour >= 12 ? "PM" : "AM";

  return `${hour % 12 || 12}:${minutes} ${suffix}`;
}

function formatDay(value: string, index: number) {
  if (index === 0) return "Today";

  return new Date(`${value}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
  });
}

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function getWindDescription(speed: number) {
  if (speed < 5) return "Calm conditions";
  if (speed < 20) return "Light breeze";
  if (speed < 40) return "Moderate wind";
  return "Strong wind";
}

export default function HomePage() {
  const [city, setCity] = useState<City>(INITIAL_CITY);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [query, setQuery] = useState("");
  const [cityResults, setCityResults] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const [searchError, setSearchError] = useState("");
  const [locationMessage, setLocationMessage] = useState("");

  async function loadWeather(selectedCity: City): Promise<boolean> {
    setLoading(true);
    setError("");
    setCity(selectedCity);
    setCityResults([]);
    setSearchError("");

    try {
      const data = await getWeather(
        selectedCity.latitude,
        selectedCity.longitude,
      );

      setWeather(data);
      return true;
    } catch {
      setError("Unable to load weather. Please try again.");
      setWeather(null);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function requestCurrentLocation() {
    if (locating) return;

    setLocationMessage("");
    setSearchError("");

    if (!navigator.geolocation) {
      setLocationMessage(
        "Location is not supported by your browser. Please search for a city.",
      );
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        let locationCity: City = {
          id: Date.now(),
          name: "Your Location",
          country: "",
          latitude,
          longitude,
        };

        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          );

          if (response.ok) {
            const place = await response.json();

            locationCity = {
              ...locationCity,
              name:
                place.city ||
                place.locality ||
                place.localityInfo?.administrative?.[0]?.name ||
                "Your Location",
              country: place.countryName || "",
              admin1: place.principalSubdivision || "",
            };
          }
        } catch {
          // Weather can still load using the coordinates.
        }

        const success = await loadWeather(locationCity);

        setLocationMessage(
          success
            ? "Weather loaded for your current location."
            : "Unable to load weather for your location. Please search for a city.",
        );

        setLocating(false);
      },
      (geoError) => {
        let message =
          "Unable to get your location. You can search for a city instead.";

        if (geoError.code === geoError.PERMISSION_DENIED) {
          message =
            "Location access was not allowed. You can continue using the current city or search for another.";
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          message =
            "Your location is unavailable right now. Please search for a city.";
        } else if (geoError.code === geoError.TIMEOUT) {
          message =
            "Getting your location took too long. Please try again or search for a city.";
        }

        setLocationMessage(message);
        setLocating(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 12000,
        maximumAge: 300000,
      },
    );
  }

  useEffect(() => {
    void loadWeather(INITIAL_CITY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!query.trim()) {
      setSearchError("Please enter a city name.");
      setCityResults([]);
      return;
    }

    setSearching(true);
    setSearchError("");
    setCityResults([]);

    try {
      const results = await searchCities(query);

      if (results.length === 0) {
        setSearchError("No cities found. Try another city name.");
      } else if (results.length === 1) {
        setQuery("");
        setLocationMessage("");
        await loadWeather(results[0]);
      } else {
        setCityResults(results);
      }
    } catch {
      setSearchError("City search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  }

  const current = weather?.current;
  const daily = weather?.daily;
  const hourly = weather?.hourly;

  const currentInfo = current ? getWeatherInfo(current.weather_code) : null;
  const CurrentIcon = currentInfo?.icon ?? CloudSun;

  const todayHigh = daily?.temperature_2m_max[0];
  const todayLow = daily?.temperature_2m_min[0];

  const currentHour = current?.time.slice(0, 13);
  const currentHourIndex =
    hourly?.time.findIndex((time) => time.startsWith(currentHour ?? "")) ?? -1;

  const hourlyItems =
    hourly && currentHourIndex >= 0
      ? hourly.time
          .slice(currentHourIndex, currentHourIndex + 6)
          .map((time, index) => ({
            time,
            temperature: hourly.temperature_2m[currentHourIndex + index],
            code: hourly.weather_code[currentHourIndex + index],
          }))
      : [];

  const details = current
    ? [
        {
          label: "Feels like",
          value: `${Math.round(current.apparent_temperature)}°C`,
          description: "Perceived temperature",
          icon: Thermometer,
        },
        {
          label: "Humidity",
          value: `${current.relative_humidity_2m}%`,
          description: "Relative humidity",
          icon: Droplets,
        },
        {
          label: "Wind speed",
          value: `${Math.round(current.wind_speed_10m)} km/h`,
          description: getWindDescription(current.wind_speed_10m),
          icon: Wind,
        },
        {
          label: "Visibility",
          value: `${(current.visibility / 1000).toFixed(1)} km`,
          description: "Current visibility range",
          icon: Eye,
        },
      ]
    : [];

  return (
    <main className="min-h-screen min-w-0 bg-[#07111f] text-[#f4f7fb]">
      <header className="border-b border-white/10">
        <div className="mx-auto flex min-h-14 w-full max-w-7xl items-center justify-between gap-3 px-3 sm:min-h-20 sm:px-6 lg:px-8">
          <a href="/" className="flex min-w-0 items-center gap-2 sm:gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-400/15 text-blue-300 sm:size-10 sm:rounded-xl">
              <CloudSun size={21} />
            </span>

            <span className="min-w-0">
              <span className="block text-sm font-bold tracking-tight sm:text-lg">
                Live Weather
              </span>
              <span className="hidden text-xs text-slate-400 sm:block">
                Feel the Sky. Plan Your Day.
              </span>
            </span>
          </a>

          <div className="hidden items-center gap-2 text-sm text-slate-400 sm:flex">
            <MapPin size={16} className="text-blue-300" />
            <span>Your daily weather companion</span>
          </div>

          <button
            type="button"
            aria-label="Focus city search"
            onClick={() => document.getElementById("city-search")?.focus()}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 transition hover:bg-white/5 sm:size-10 sm:rounded-xl"
          >
            <Search size={18} />
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl min-w-0 px-3 py-3 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-3 flex min-w-0 flex-col gap-1 sm:mb-8 sm:gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-medium tracking-wide text-blue-300 sm:text-sm">
              YOUR WEATHER DASHBOARD
            </p>

            <h1 className="mt-1 text-xl font-bold tracking-tight sm:mt-2 sm:text-3xl">
              Good morning!
            </h1>

            <p className="mt-1 text-xs leading-4 text-slate-400 sm:mt-2 sm:text-sm sm:leading-6">
              Here&apos;s the weather update for your day.
            </p>
          </div>
        </div>

        <section className="mb-2 rounded-xl border border-blue-300/15 bg-[#101d30] p-2.5 sm:mb-4 sm:rounded-2xl sm:p-5">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="flex min-w-0 items-start gap-2 sm:gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-300/10 text-blue-200 sm:size-10 sm:rounded-xl">
                <LocateFixed size={18} />
              </span>

              <div className="min-w-0">
                <h2 className="text-xs font-semibold sm:text-sm">
                  Get weather for your location
                </h2>
                <p className="mt-0.5 text-[11px] leading-4 text-slate-400 sm:mt-1 sm:text-xs sm:leading-5">
                  Use your location if you want, or search for any city
                  manually. Location access is optional.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void requestCurrentLocation()}
              disabled={locating}
              className="flex min-h-8 w-full shrink-0 items-center justify-center gap-1.5 rounded-lg bg-blue-300 px-3 text-xs font-semibold text-[#07111f] transition hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-11 sm:w-auto sm:gap-2 sm:rounded-xl sm:px-4 sm:text-sm"
            >
              {locating ? (
                <LoaderCircle size={15} className="animate-spin" />
              ) : (
                <LocateFixed size={15} />
              )}
              {locating ? "Finding location..." : "Use My Location"}
            </button>
          </div>

          {locationMessage && (
            <p
              role="status"
              className="mt-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-[11px] leading-4 text-slate-300 sm:mt-3 sm:rounded-xl sm:px-3 sm:py-2.5 sm:text-xs sm:leading-5"
            >
              {locationMessage}
            </p>
          )}
        </section>

        <form
          onSubmit={handleSearch}
          className="mb-2 flex w-full min-w-0 gap-1.5 sm:mb-4 sm:gap-2"
        >
          <label className="flex min-h-8 min-w-0 flex-1 items-center gap-1.5 rounded-lg border border-white/10 bg-[#101d30] px-2 sm:min-h-11 sm:gap-2 sm:rounded-xl sm:px-3">
            <Search
              size={16}
              className="shrink-0 text-slate-400 sm:size-[18px]"
              aria-hidden="true"
            />

            <input
              id="city-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search a city..."
              aria-label="Search city"
              className="w-full min-w-0 bg-transparent text-xs outline-none placeholder:text-slate-500 sm:text-sm"
            />
          </label>

          <button
            type="submit"
            disabled={searching}
            className="flex min-h-8 shrink-0 items-center justify-center gap-1 rounded-lg bg-blue-300 px-3 text-xs font-semibold text-[#07111f] transition hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-11 sm:gap-2 sm:rounded-xl sm:px-4 sm:text-sm"
          >
            {searching && <LoaderCircle size={14} className="animate-spin" />}
            Search
          </button>
        </form>

        {searchError && (
          <p
            role="alert"
            className="mb-3 rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs text-amber-200 sm:mb-4 sm:px-4 sm:py-3 sm:text-sm"
          >
            {searchError}
          </p>
        )}

        {cityResults.length > 0 && (
          <section className="mb-4 rounded-2xl border border-white/10 bg-[#101d30] p-3 sm:p-4">
            <h2 className="mb-3 text-sm font-semibold">Select a city</h2>

            <div className="grid gap-2 sm:grid-cols-2">
              {cityResults.map((result, index) => (
                <button
                  key={`${result.id}-${result.latitude}-${result.longitude}-${index}`}
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setLocationMessage("");
                    void loadWeather(result);
                  }}
                  className="flex min-w-0 items-center gap-3 rounded-xl border border-white/10 p-3 text-left transition hover:bg-white/5"
                >
                  <MapPin size={18} className="shrink-0 text-blue-300" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {result.name}
                    </span>
                    <span className="block truncate text-xs text-slate-400">
                      {[result.admin1, result.country]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-red-300/20 bg-red-300/10 p-5"
          >
            <p className="font-semibold text-red-200">{error}</p>
            <button
              type="button"
              onClick={() => void loadWeather(city)}
              className="mt-3 rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
            >
              Try again
            </button>
          </div>
        )}

        {loading && !weather ? (
          <section
            aria-live="polite"
            className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-[#101d30] sm:min-h-80"
          >
            <LoaderCircle size={32} className="animate-spin text-blue-300" />
            <p className="text-sm text-slate-400">
              Loading real-time weather...
            </p>
          </section>
        ) : weather && current && daily ? (
          <>
            <section className="grid min-w-0 grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3">
              <article className="relative min-w-0 overflow-hidden rounded-2xl border border-blue-300/15 bg-gradient-to-br from-[#173252] via-[#12243b] to-[#101d30] p-4 sm:p-7 lg:col-span-2">
                <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-blue-300/10 blur-3xl" />

                <div className="relative flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
                      <MapPin size={16} className="shrink-0 text-blue-300" />
                      <span>
                        {[city.name, city.country].filter(Boolean).join(", ")}
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-slate-400 sm:mt-4 sm:text-sm">
                      Current weather
                    </p>

                    <div className="mt-1 flex flex-wrap items-start gap-x-2">
                      <span className="text-5xl font-semibold tracking-tighter sm:text-7xl">
                        {Math.round(current.temperature_2m)}°
                      </span>
                      <span className="mt-2 text-sm text-slate-400">C</span>
                    </div>

                    <p className="mt-2 text-base font-medium sm:text-lg">
                      {currentInfo?.condition}
                    </p>

                    <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                      H: {Math.round(todayHigh ?? 0)}°
                      <span className="mx-1">·</span>
                      L: {Math.round(todayLow ?? 0)}°
                    </p>
                  </div>

                  <CurrentIcon
                    size={60}
                    strokeWidth={1.25}
                    className="mt-5 shrink-0 text-amber-200 sm:mr-4 sm:size-24"
                  />
                </div>

                <div className="relative mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 sm:mt-7 sm:grid-cols-3 sm:pt-5">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Sunrise size={16} />
                      Sunrise
                    </div>
                    <p className="mt-2 text-sm font-semibold">
                      {formatTime(daily.sunrise[0])}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Sunset size={16} />
                      Sunset
                    </div>
                    <p className="mt-2 text-sm font-semibold">
                      {formatTime(daily.sunset[0])}
                    </p>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Wind size={16} />
                      Wind
                    </div>
                    <p className="mt-2 text-sm font-semibold">
                      {Math.round(current.wind_speed_10m)} km/h
                    </p>
                  </div>
                </div>
              </article>

              <article className="flex min-w-0 flex-col rounded-2xl border border-white/10 bg-[#101d30] p-4 sm:p-6">
                <h2 className="text-base font-semibold">
                  Today&apos;s summary
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {formatDate(daily.time[0])}
                </p>

                <div className="mt-5 flex items-center gap-4 sm:mt-6">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-300/10 text-amber-200">
                    <CurrentIcon size={25} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {currentInfo?.condition}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Current conditions for your selected city.
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-white/[0.04] p-3 sm:mt-5 sm:p-4">
                  <p className="text-xs text-slate-400">Temperature range</p>
                  <div className="mt-2 flex items-center justify-between gap-2 text-sm">
                    <span>{Math.round(todayLow ?? 0)}°</span>
                    <div className="h-2 min-w-0 flex-1 rounded-full bg-gradient-to-r from-blue-400 via-amber-300 to-orange-400" />
                    <span>{Math.round(todayHigh ?? 0)}°</span>
                  </div>
                </div>

                <p className="mt-4 text-xs leading-5 text-slate-500">
                  Weather data provided by Open-Meteo.
                </p>
              </article>
            </section>

            <section className="mt-4 min-w-0 rounded-2xl border border-white/10 bg-[#101d30] p-3 sm:mt-8 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-base font-semibold sm:text-lg">
                    Hourly forecast
                  </h2>
                  <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                    Weather throughout the day
                  </p>
                </div>
                <span className="shrink-0 text-xs text-blue-300 sm:text-sm">
                  Next hours
                </span>
              </div>

              <div className="mt-4 grid min-w-0 grid-cols-3 gap-2 sm:mt-5 sm:grid-cols-6 sm:gap-3">
                {hourlyItems.map((hour, index) => {
                  const HourIcon = getWeatherInfo(hour.code).icon;

                  return (
                    <div
                      key={hour.time}
                      className={`flex min-w-0 flex-col items-center gap-2 rounded-xl px-1 py-3 sm:gap-3 sm:px-2 sm:py-4 ${
                        index === 0
                          ? "border border-blue-300/20 bg-blue-300/10"
                          : "bg-white/[0.03]"
                      }`}
                    >
                      <span className="text-xs text-slate-400">
                        {index === 0 ? "Now" : formatTime(hour.time)}
                      </span>
                      <HourIcon
                        size={23}
                        strokeWidth={1.6}
                        className="text-blue-200"
                      />
                      <span className="text-base font-semibold">
                        {Math.round(hour.temperature)}°
                      </span>
                    </div>
                  );
                })}
              </div>

              {hourlyItems.length === 0 && (
                <p className="py-6 text-sm text-slate-400">
                  Hourly forecast is unavailable.
                </p>
              )}
            </section>

            <section className="mt-4 min-w-0 sm:mt-8">
              <div className="mb-3 sm:mb-4">
                <h2 className="text-lg font-semibold">Weather details</h2>
                <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                  More information about current conditions
                </p>
              </div>

              <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
                {details.map((detail) => {
                  const DetailIcon = detail.icon;

                  return (
                    <article
                      key={detail.label}
                      className="min-w-0 rounded-xl border border-white/10 bg-[#101d30] p-3 sm:rounded-2xl sm:p-5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-slate-400 sm:text-sm">
                          {detail.label}
                        </span>
                        <DetailIcon
                          size={18}
                          className="shrink-0 text-blue-300"
                        />
                      </div>

                      <p className="mt-3 text-xl font-semibold sm:mt-4 sm:text-2xl">
                        {detail.value}
                      </p>
                      <p className="mt-2 text-[11px] leading-4 text-slate-500 sm:text-xs sm:leading-5">
                        {detail.description}
                      </p>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="mt-4 min-w-0 rounded-2xl border border-white/10 bg-[#101d30] p-3 sm:mt-8 sm:p-6">
              <div className="mb-4 sm:mb-5">
                <h2 className="text-base font-semibold sm:text-lg">
                  5-day forecast
                </h2>
                <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                  Plan ahead for the days to come
                </p>
              </div>

              <div className="min-w-0">
                {daily.time.map((date, index) => {
                  const forecastInfo = getWeatherInfo(
                    daily.weather_code[index],
                  );
                  const ForecastIcon = forecastInfo.icon;

                  return (
                    <div
                      key={date}
                      className={`grid min-w-0 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto] sm:gap-4 sm:py-4 ${
                        index !== daily.time.length - 1
                          ? "border-b border-white/[0.07]"
                          : ""
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                        <ForecastIcon
                          size={21}
                          className="shrink-0 text-blue-200"
                        />
                        <span className="truncate text-xs font-medium sm:text-sm">
                          {formatDay(date, index)}
                        </span>
                      </div>

                      <span className="hidden min-w-0 truncate text-sm text-slate-400 sm:block">
                        {forecastInfo.condition}
                      </span>

                      <div className="flex shrink-0 items-center gap-2 text-xs sm:text-sm">
                        <span className="font-semibold">
                          {Math.round(daily.temperature_2m_max[index])}°
                        </span>
                        <span className="text-slate-500">
                          {Math.round(daily.temperature_2m_min[index])}°
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        ) : !error ? (
          <section className="rounded-2xl border border-white/10 bg-[#101d30] p-5 text-sm text-slate-400">
            Weather data is currently unavailable.
          </section>
        ) : null}
      </div>

      <footer className="mt-4 border-t border-white/10 sm:mt-8">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-col items-center justify-center gap-2 px-3 py-4 text-center text-xs text-slate-500 sm:min-h-20 sm:flex-row sm:justify-between sm:px-6 sm:py-5 lg:px-8">
          <p>© 2026 Live Weather</p>
          <p>Weather data by Open-Meteo · Feel the Sky. Plan Your Day.</p>
        </div>
      </footer>
    </main>
  );
}
