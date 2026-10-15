"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
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
  ArrowUpRight,
  RefreshCw,
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

  useEffect(() => {
    let cancelled = false;

    async function loadInitialWeather() {
      try {
        const data = await getWeather(
          INITIAL_CITY.latitude,
          INITIAL_CITY.longitude,
        );

        if (cancelled) return;

        setWeather(data);
        setError("");
      } catch {
        if (cancelled) return;

        setError("Unable to load weather. Please try again.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadInitialWeather();

    return () => {
      cancelled = true;
    };
  }, []);

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
    <main className="weather-atmosphere min-h-screen min-w-0 text-[#f4f7ff]">
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#080d1b]/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-14 w-full max-w-7xl items-center justify-between gap-3 px-3 sm:min-h-20 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <span className="relative flex size-9 shrink-0 items-center justify-center rounded-xl border border-blue-300/20 bg-gradient-to-br from-blue-300/20 to-violet-400/10 text-blue-200 shadow-[0_0_24px_rgba(96,165,250,0.12)] sm:size-11">
              <CloudSun size={23} />
              <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.9)]" />
            </span>

            <span className="min-w-0">
              <span className="block text-sm font-bold tracking-tight sm:text-lg">
                Live Weather<span className="text-blue-300">.</span>
              </span>
              <span className="hidden text-xs text-slate-400 sm:block">
                Feel the Sky. Plan Your Day.
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-xs text-slate-400 md:flex">
            <span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(134,239,172,0.65)]" />
            Live weather dashboard
          </div>

          <button
            type="button"
            aria-label="Focus city search"
            onClick={() => document.getElementById("city-search")?.focus()}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-200 transition hover:border-blue-300/30 hover:bg-blue-300/10 sm:size-10"
          >
            <Search size={18} />
          </button>
        </div>
      </header>

      <div className="relative z-0 mx-auto w-full max-w-7xl min-w-0 px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
        <section className="weather-enter mb-4 flex min-w-0 flex-col gap-3 sm:mb-7 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/15 bg-blue-300/[0.06] px-2.5 py-1 text-[10px] font-semibold tracking-[0.16em] text-blue-200 sm:text-xs">
              <span className="size-1.5 rounded-full bg-cyan-300" />
              YOUR WEATHER DASHBOARD
            </div>

            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:mt-4 sm:text-4xl">
              Good morning<span className="weather-gradient-text">!</span>
            </h1>

            <p className="mt-1.5 max-w-xl text-xs leading-5 text-slate-400 sm:mt-2 sm:text-sm sm:leading-6">
              A clearer look at the sky, so you can make the most of your day.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-xs text-slate-400 sm:self-auto">
            <Sun size={15} className="text-amber-200" />
            <span>Live conditions</span>
          </div>
        </section>

        <section className="weather-glass weather-enter weather-enter-delay-1 mb-3 rounded-2xl p-3 sm:mb-4 sm:p-5">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-blue-300/15 bg-gradient-to-br from-blue-300/15 to-violet-400/10 text-blue-200 sm:size-11">
                <LocateFixed size={19} />
              </span>

              <div className="min-w-0">
                <h2 className="text-xs font-semibold sm:text-sm">
                  Weather at your location
                </h2>
                <p className="mt-1 text-[11px] leading-4 text-slate-400 sm:text-xs sm:leading-5">
                  Optional: use your location or search for any city.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void requestCurrentLocation()}
              disabled={locating}
              className="weather-button min-h-9 w-full px-3 text-xs sm:min-h-11 sm:w-auto sm:px-4 sm:text-sm"
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
              className="mt-3 rounded-xl border border-white/[0.08] bg-black/10 px-3 py-2.5 text-[11px] leading-5 text-slate-300 sm:text-xs"
            >
              {locationMessage}
            </p>
          )}
        </section>

        <form
          onSubmit={handleSearch}
          className="weather-enter weather-enter-delay-1 mb-3 flex w-full min-w-0 gap-2 sm:mb-4"
        >
          <label className="weather-search-panel flex min-h-10 min-w-0 flex-1 items-center gap-2 px-3 sm:min-h-12 sm:gap-3 sm:px-4">
            <Search size={17} className="shrink-0 text-blue-200" />

            <input
              id="city-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search city or town..."
              aria-label="Search city"
              className="w-full min-w-0 bg-transparent text-xs text-white outline-none placeholder:text-slate-500 sm:text-sm"
            />
          </label>

          <button
            type="submit"
            disabled={searching}
            className="weather-button min-h-10 shrink-0 px-3 text-xs sm:min-h-12 sm:gap-2 sm:px-5 sm:text-sm"
          >
            {searching ? (
              <LoaderCircle size={15} className="animate-spin" />
            ) : (
              <Search size={15} />
            )}
            Search
          </button>
        </form>

        {searchError && (
          <p
            role="alert"
            className="mb-4 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] px-3 py-2.5 text-xs text-amber-100"
          >
            {searchError}
          </p>
        )}

        {cityResults.length > 0 && (
          <section className="weather-glass weather-enter mb-4 rounded-2xl p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">Choose your city</h2>
              <span className="text-xs text-slate-400">
                {cityResults.length} results
              </span>
            </div>

            <div className="grid min-w-0 gap-2 sm:grid-cols-2">
              {cityResults.map((result, index) => (
                <button
                  key={`${result.id}-${result.latitude}-${result.longitude}-${index}`}
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setLocationMessage("");
                    void loadWeather(result);
                  }}
                  className="weather-glass-hover flex min-w-0 items-center gap-3 rounded-xl p-3 text-left"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-300/10 text-blue-200">
                    <MapPin size={17} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {result.name}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-slate-400">
                      {[result.admin1, result.country]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </span>

                  <ArrowUpRight size={16} className="shrink-0 text-slate-500" />
                </button>
              ))}
            </div>
          </section>
        )}

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-red-300/20 bg-red-300/[0.06] p-4 sm:p-5"
          >
            <p className="text-sm font-semibold text-red-200">{error}</p>
            <button
              type="button"
              onClick={() => void loadWeather(city)}
              className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 text-xs font-medium transition hover:bg-white/10"
            >
              <RefreshCw size={14} />
              Try again
            </button>
          </div>
        )}

        {loading && !weather ? (
          <section
            aria-live="polite"
            className="weather-glass flex min-h-64 flex-col items-center justify-center gap-4 rounded-2xl sm:min-h-80"
          >
            <span className="flex size-14 items-center justify-center rounded-2xl border border-blue-300/15 bg-blue-300/[0.06] text-blue-200 shadow-[0_0_30px_rgba(96,165,250,0.12)]">
              <LoaderCircle size={28} className="animate-spin" />
            </span>
            <div className="text-center">
              <p className="text-sm font-medium">Reading the sky...</p>
              <p className="mt-1 text-xs text-slate-400">
                Loading live weather data
              </p>
            </div>
          </section>
        ) : weather && current && daily ? (
          <>
            <section className="grid min-w-0 grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3">
              <article className="weather-card-3d weather-enter min-w-0 rounded-2xl p-4 sm:p-7 lg:col-span-2">
                <div className="pointer-events-none absolute -right-12 -top-16 size-64 rounded-full bg-blue-400/[0.09] blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 right-16 size-52 rounded-full bg-violet-500/[0.08] blur-3xl" />

                <div className="relative flex min-w-0 items-start justify-between gap-2 sm:gap-4">
                  <div className="min-w-0">
                    <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/[0.09] bg-black/10 px-2.5 py-1.5 text-xs text-slate-300 sm:px-3">
                      <MapPin size={14} className="shrink-0 text-cyan-200" />
                      <span className="truncate">
                        {[city.name, city.country].filter(Boolean).join(", ")}
                      </span>
                    </div>

                    <p className="mt-4 text-xs font-medium text-slate-400 sm:mt-6 sm:text-sm">
                      Current temperature
                    </p>

                    <div className="mt-1 flex items-start">
                      <span className="weather-gradient-text text-6xl font-semibold leading-none tracking-[-0.075em] sm:text-8xl">
                        {Math.round(current.temperature_2m)}°
                      </span>
                      <span className="ml-2 mt-2 text-sm text-slate-400 sm:mt-3 sm:text-base">
                        C
                      </span>
                    </div>

                    <p className="mt-3 text-base font-semibold tracking-tight sm:text-xl">
                      {currentInfo?.condition}
                    </p>

                    <p className="mt-1.5 text-xs text-slate-400 sm:text-sm">
                      H: {Math.round(todayHigh ?? 0)}°
                      <span className="mx-2 text-slate-600">/</span>
                      L: {Math.round(todayLow ?? 0)}°
                    </p>
                  </div>

                  <div className="relative mt-2 flex size-24 shrink-0 items-center justify-center sm:mt-3 sm:size-40">
                    <div className="absolute inset-0 rounded-full bg-blue-400/[0.09] blur-2xl" />
                    <div className="weather-orb inset-0 m-auto" />
                    <CurrentIcon
                      size={70}
                      strokeWidth={1.15}
                      className="weather-icon-float weather-icon-glow relative z-10 text-amber-200 sm:size-32"
                    />
                    <span className="absolute right-1 top-2 size-2 rounded-full bg-cyan-200/70 shadow-[0_0_14px_rgba(103,232,249,0.8)] sm:right-3 sm:top-4" />
                    <span className="absolute bottom-3 left-2 size-1.5 rounded-full bg-violet-300/80 sm:bottom-5 sm:left-4" />
                  </div>
                </div>

                <div className="relative mt-6 grid grid-cols-2 gap-3 border-t border-white/[0.09] pt-4 sm:mt-8 sm:grid-cols-3 sm:gap-4 sm:pt-5">
                  <div className="rounded-xl bg-black/[0.10] p-3 sm:p-3.5">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Sunrise size={16} className="text-amber-200" />
                      Sunrise
                    </div>
                    <p className="mt-2 text-sm font-semibold">
                      {formatTime(daily.sunrise[0])}
                    </p>
                  </div>

                  <div className="rounded-xl bg-black/[0.10] p-3 sm:p-3.5">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Sunset size={16} className="text-violet-200" />
                      Sunset
                    </div>
                    <p className="mt-2 text-sm font-semibold">
                      {formatTime(daily.sunset[0])}
                    </p>
                  </div>

                  <div className="col-span-2 rounded-xl bg-black/[0.10] p-3 sm:col-span-1 sm:p-3.5">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Wind size={16} className="text-cyan-200" />
                      Wind speed
                    </div>
                    <p className="mt-2 text-sm font-semibold">
                      {Math.round(current.wind_speed_10m)} km/h
                    </p>
                  </div>
                </div>
              </article>

              <article className="weather-card-3d weather-enter weather-enter-delay-1 flex min-w-0 flex-col p-4 sm:p-6">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.16em] text-violet-200 sm:text-xs">
                      YOUR DAY
                    </p>
                    <h2 className="mt-1.5 text-base font-semibold sm:text-lg">
                      Today&apos;s summary
                    </h2>
                  </div>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-violet-300/15 bg-violet-300/[0.08] text-violet-200">
                    <Sun size={18} />
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-400">
                  {formatDate(daily.time[0])}
                </p>

                <div className="mt-5 flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/[0.10] p-3 sm:mt-6 sm:p-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-300/[0.08] text-amber-200">
                    <CurrentIcon size={25} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      {currentInfo?.condition}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Current conditions in your selected city.
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-white/[0.06] bg-black/[0.10] p-3 sm:mt-5 sm:p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-slate-400">Temperature range</p>
                    <Thermometer size={15} className="text-blue-200" />
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 text-sm">
                    <span className="font-semibold">
                      {Math.round(todayLow ?? 0)}°
                    </span>
                    <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-700/70">
                      <div className="h-full w-full rounded-full bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400" />
                    </div>
                    <span className="font-semibold">
                      {Math.round(todayHigh ?? 0)}°
                    </span>
                  </div>
                </div>

                <div className="mt-auto pt-4">
                  <p className="text-[11px] leading-5 text-slate-500">
                    Weather data provided by Open-Meteo.
                  </p>
                </div>
              </article>
            </section>

            <section className="weather-glass weather-enter weather-enter-delay-1 mt-4 rounded-2xl p-3 sm:mt-6 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-base font-semibold sm:text-lg">
                    Hourly forecast
                  </h2>
                  <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                    Weather throughout the day
                  </p>
                </div>

                <span className="shrink-0 rounded-full border border-blue-300/15 bg-blue-300/[0.06] px-2.5 py-1 text-[10px] text-blue-200 sm:text-xs">
                  Next hours
                </span>
              </div>

              {hourlyItems.length > 0 ? (
                <div className="mt-4 grid min-w-0 grid-cols-3 gap-2 sm:mt-5 sm:grid-cols-6 sm:gap-3">
                  {hourlyItems.map((hour, index) => {
                    const HourIcon = getWeatherInfo(hour.code).icon;

                    return (
                      <div
                        key={hour.time}
                        className={`weather-glass-hover flex min-w-0 flex-col items-center gap-2 rounded-xl px-1 py-3 sm:gap-3 sm:px-2 sm:py-4 ${
                          index === 0
                            ? "border-blue-300/25 bg-blue-300/[0.08]"
                            : ""
                        }`}
                      >
                        <span className="text-xs text-slate-400">
                          {index === 0 ? "Now" : formatTime(hour.time)}
                        </span>

                        <HourIcon
                          size={23}
                          strokeWidth={1.5}
                          className="text-blue-200"
                        />

                        <span className="text-base font-semibold">
                          {Math.round(hour.temperature)}°
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="py-6 text-sm text-slate-400">
                  Hourly forecast is unavailable.
                </p>
              )}
            </section>

            <section className="weather-enter weather-enter-delay-2 mt-5 sm:mt-7">
              <div className="mb-3 sm:mb-4">
                <p className="text-[10px] font-semibold tracking-[0.16em] text-cyan-200 sm:text-xs">
                  AT A GLANCE
                </p>
                <h2 className="mt-1.5 text-lg font-semibold sm:text-xl">
                  Weather details
                </h2>
                <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                  More information about current conditions
                </p>
              </div>

              <div className="grid min-w-0 grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
                {details.map((detail, index) => {
                  const DetailIcon = detail.icon;

                  return (
                    <article
                      key={detail.label}
                      className="weather-card-3d min-w-0 rounded-2xl p-3 sm:p-5"
                      style={{ animationDelay: `${index * 70}ms` }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-slate-400 sm:text-sm">
                          {detail.label}
                        </span>
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-blue-300/10 bg-blue-300/[0.07] text-blue-200">
                          <DetailIcon size={16} />
                        </span>
                      </div>

                      <p className="mt-3 text-xl font-semibold tracking-tight sm:mt-4 sm:text-2xl">
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

            <section className="weather-glass weather-enter weather-enter-delay-3 mt-5 rounded-2xl p-3 sm:mt-7 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold tracking-[0.16em] text-violet-200 sm:text-xs">
                    PLAN AHEAD
                  </p>
                  <h2 className="mt-1.5 text-base font-semibold sm:text-lg">
                    5-day forecast
                  </h2>
                  <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                    The days ahead, at a glance
                  </p>
                </div>

                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-violet-300/15 bg-violet-300/[0.06] text-violet-200 sm:size-10">
                  <CloudSun size={20} />
                </span>
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
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-300/[0.07] text-blue-200 sm:size-9">
                          <ForecastIcon size={18} />
                        </span>

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
          <section className="weather-glass rounded-2xl p-5 text-sm text-slate-400">
            Weather data is currently unavailable.
          </section>
        ) : null}
      </div>

      <footer className="relative z-10 mt-6 border-t border-white/[0.08] bg-[#080d1b]/50 sm:mt-8">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-col items-center justify-center gap-2 px-3 py-4 text-center text-xs text-slate-500 sm:min-h-20 sm:flex-row sm:justify-between sm:px-6 sm:py-5 lg:px-8">
          <p>© 2026 Live Weather</p>
          <p>Weather data by Open-Meteo · Feel the Sky. Plan Your Day.</p>
        </div>
      </footer>
    </main>
  );
}
