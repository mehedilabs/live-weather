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
} from "lucide-react";

const hourlyForecast = [
  { time: "Now", temperature: 28, icon: CloudSun },
  { time: "11 AM", temperature: 30, icon: Sun },
  { time: "12 PM", temperature: 32, icon: Sun },
  { time: "1 PM", temperature: 31, icon: CloudSun },
  { time: "2 PM", temperature: 29, icon: Cloud },
  { time: "3 PM", temperature: 28, icon: CloudRain },
];

const weeklyForecast = [
  {
    day: "Today",
    icon: CloudSun,
    condition: "Partly cloudy",
    high: 32,
    low: 25,
  },
  { day: "Wednesday", icon: Sun, condition: "Sunny", high: 33, low: 26 },
  { day: "Thursday", icon: Cloud, condition: "Cloudy", high: 30, low: 24 },
  {
    day: "Friday",
    icon: CloudRain,
    condition: "Light rain",
    high: 28,
    low: 23,
  },
  {
    day: "Saturday",
    icon: CloudSun,
    condition: "Partly cloudy",
    high: 31,
    low: 25,
  },
];

const weatherDetails = [
  {
    label: "Feels like",
    value: "31°",
    description: "Similar to actual temperature",
    icon: Thermometer,
  },
  {
    label: "Humidity",
    value: "72%",
    description: "Comfortable moisture level",
    icon: Droplets,
  },
  {
    label: "Wind speed",
    value: "12 km/h",
    description: "Light breeze",
    icon: Wind,
  },
  {
    label: "Visibility",
    value: "10 km",
    description: "Clear visibility",
    icon: Eye,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen min-w-0 bg-[#07111f] text-[#f4f7fb]">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl min-w-0 items-center justify-between gap-3 px-4 sm:min-h-20 sm:px-6 lg:px-8">
          <a href="/" className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-400/15 text-blue-300">
              <CloudSun size={23} />
            </span>

            <span className="min-w-0">
              <span className="block text-base font-bold tracking-tight sm:text-lg">
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
            aria-label="Search weather"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 transition hover:bg-white/5"
          >
            <Search size={19} />
          </button>
        </div>
      </header>

      {/* Dashboard */}
      <div className="mx-auto w-full max-w-7xl min-w-0 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Page heading and search */}
        <div className="mb-6 flex min-w-0 flex-col gap-4 sm:mb-8 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-blue-300">
              YOUR WEATHER DASHBOARD
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Good morning!
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Here&apos;s the weather update for your day.
            </p>
          </div>

          <form action="/" className="flex w-full min-w-0 gap-2 md:max-w-sm">
            <label className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-[#101d30] px-3">
              <Search
                size={18}
                className="shrink-0 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                name="city"
                placeholder="Search a city..."
                aria-label="Search city"
                className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-slate-500"
              />
            </label>

            <button
              type="submit"
              className="shrink-0 rounded-xl bg-blue-300 px-4 text-sm font-semibold text-[#07111f] transition hover:bg-blue-200"
            >
              Search
            </button>
          </form>
        </div>

        {/* Main weather and sun information */}
        <section className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Current weather */}
          <article className="relative min-w-0 overflow-hidden rounded-2xl border border-blue-300/15 bg-gradient-to-br from-[#173252] via-[#12243b] to-[#101d30] p-5 sm:p-7 lg:col-span-2">
            <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-blue-300/10 blur-3xl" />

            <div className="relative flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
                  <MapPin size={16} className="shrink-0 text-blue-300" />
                  <span>Dhaka, Bangladesh</span>
                </div>

                <p className="mt-4 text-sm text-slate-400">Current weather</p>

                <div className="mt-1 flex flex-wrap items-start gap-x-2">
                  <span className="text-6xl font-semibold tracking-tighter sm:text-7xl">
                    28°
                  </span>
                  <span className="mt-2 text-sm text-slate-400">C</span>
                </div>

                <p className="mt-2 text-lg font-medium">Partly cloudy</p>
                <p className="mt-1 text-sm text-slate-400">
                  H: 32° <span className="mx-1">·</span> L: 25°
                </p>
              </div>

              <CloudSun
                size={76}
                strokeWidth={1.25}
                className="mt-5 shrink-0 text-amber-200 sm:mr-4 sm:size-24"
                aria-label="Partly cloudy"
              />
            </div>

            <div className="relative mt-7 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 sm:grid-cols-3">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Sunrise size={16} />
                  Sunrise
                </div>
                <p className="mt-2 text-sm font-semibold">5:42 AM</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Sunset size={16} />
                  Sunset
                </div>
                <p className="mt-2 text-sm font-semibold">5:28 PM</p>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Wind size={16} />
                  Wind
                </div>
                <p className="mt-2 text-sm font-semibold">12 km/h</p>
              </div>
            </div>
          </article>

          {/* Weather summary */}
          <article className="flex min-w-0 flex-col rounded-2xl border border-white/10 bg-[#101d30] p-5 sm:p-6">
            <h2 className="text-base font-semibold">Today&apos;s summary</h2>
            <p className="mt-1 text-sm text-slate-400">A quick look at today</p>

            <div className="mt-6 flex items-center gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-300/10 text-amber-200">
                <Sun size={25} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium">Mostly pleasant</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Expect a mix of sunshine and clouds.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-white/[0.04] p-4">
              <p className="text-xs text-slate-400">Temperature range</p>
              <div className="mt-2 flex items-center justify-between gap-2 text-sm">
                <span>25°</span>
                <div className="h-2 min-w-0 flex-1 rounded-full bg-gradient-to-r from-blue-400 via-amber-300 to-orange-400" />
                <span>32°</span>
              </div>
            </div>

            <p className="mt-4 text-xs leading-5 text-slate-500">
              Sample weather data for the dashboard preview.
            </p>
          </article>
        </section>

        {/* Hourly forecast */}
        <section className="mt-6 min-w-0 rounded-2xl border border-white/10 bg-[#101d30] p-4 sm:mt-8 sm:p-6">
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
              Today
            </span>
          </div>

          <div className="mt-5 grid min-w-0 grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3">
            {hourlyForecast.map((hour) => {
              const WeatherIcon = hour.icon;

              return (
                <div
                  key={hour.time}
                  className={`flex min-w-0 flex-col items-center gap-3 rounded-xl px-1 py-4 sm:px-2 ${
                    hour.time === "Now"
                      ? "border border-blue-300/20 bg-blue-300/10"
                      : "bg-white/[0.03]"
                  }`}
                >
                  <span className="text-xs text-slate-400">{hour.time}</span>
                  <WeatherIcon
                    size={25}
                    strokeWidth={1.6}
                    className="text-blue-200"
                  />
                  <span className="text-base font-semibold">
                    {hour.temperature}°
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Weather details */}
        <section className="mt-6 min-w-0 sm:mt-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Weather details</h2>
            <p className="mt-1 text-sm text-slate-400">
              More information about current conditions
            </p>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {weatherDetails.map((detail) => {
              const DetailIcon = detail.icon;

              return (
                <article
                  key={detail.label}
                  className="min-w-0 rounded-2xl border border-white/10 bg-[#101d30] p-4 sm:p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-slate-400">
                      {detail.label}
                    </span>
                    <DetailIcon size={19} className="shrink-0 text-blue-300" />
                  </div>

                  <p className="mt-4 text-2xl font-semibold">{detail.value}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {detail.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Five-day forecast */}
        <section className="mt-6 min-w-0 rounded-2xl border border-white/10 bg-[#101d30] p-4 sm:mt-8 sm:p-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold sm:text-lg">
              5-day forecast
            </h2>
            <p className="mt-1 text-xs text-slate-400 sm:text-sm">
              Plan ahead for the days to come
            </p>
          </div>

          <div className="min-w-0">
            {weeklyForecast.map((day, index) => {
              const WeatherIcon = day.icon;

              return (
                <div
                  key={day.day}
                  className={`grid min-w-0 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto] sm:gap-4 ${
                    index !== weeklyForecast.length - 1
                      ? "border-b border-white/[0.07]"
                      : ""
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    <WeatherIcon size={23} className="shrink-0 text-blue-200" />
                    <span className="truncate text-sm font-medium">
                      {day.day}
                    </span>
                  </div>

                  <span className="hidden min-w-0 truncate text-sm text-slate-400 sm:block">
                    {day.condition}
                  </span>

                  <div className="flex shrink-0 items-center gap-2 text-sm">
                    <span className="font-semibold">{day.high}°</span>
                    <span className="text-slate-500">{day.low}°</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-4 border-t border-white/10 sm:mt-8">
        <div className="mx-auto flex min-h-20 w-full max-w-7xl flex-col items-center justify-center gap-2 px-4 py-5 text-center text-xs text-slate-500 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Live Weather</p>
          <p>Feel the Sky. Plan Your Day.</p>
        </div>
      </footer>
    </main>
  );
}
