import Link from "next/link";
import { CloudSun, MapPin, Search } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <header className="border-b border-white/10">
        <div className="container flex min-h-20 items-center justify-between gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-blue-400/15 text-blue-300">
              <CloudSun size={24} />
            </span>

            <span>
              <span className="block text-lg font-bold tracking-tight">
                Live Weather
              </span>
              <span className="hidden text-xs text-slate-400 sm:block">
                Feel the Sky. Plan Your Day.
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-2 text-sm text-slate-400 sm:flex">
            <MapPin size={16} />
            <span>Your daily weather companion</span>
          </div>

          <button
            type="button"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 transition hover:bg-white/5"
            aria-label="Search for a city"
          >
            <Search size={19} />
          </button>
        </div>
      </header>

      <section className="container py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-300/10 px-4 py-2 text-sm text-blue-200">
            <span className="size-2 rounded-full bg-blue-300" />
            Your weather, beautifully simplified
          </span>

          <h1 className="mt-7 text-4xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            Feel the Sky.
            <span className="mt-2 block text-blue-300">Plan Your Day.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
            A clearer view of your day starts here. Discover the weather around
            you and make every plan with confidence.
          </p>

          <div className="mx-auto mt-9 flex max-w-xl flex-col gap-3 sm:flex-row">
            <div className="flex min-h-14 flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 text-left">
              <Search className="shrink-0 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search a city..."
                aria-label="City name"
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>

            <button
              type="button"
              className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-blue-300 px-6 font-semibold text-slate-950 transition hover:bg-blue-200"
            >
              <MapPin size={18} />
              Use My Location
            </button>
          </div>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            Search for a city or use your device location to get started.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-4 sm:mt-20 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <span className="text-sm text-slate-400">Current conditions</span>
            <h2 className="mt-3 text-xl font-semibold">Know your weather</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Get a clear picture of what the sky is doing right now.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <span className="text-sm text-slate-400">Coming up</span>
            <h2 className="mt-3 text-xl font-semibold">Plan ahead</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Make better everyday plans with weather forecasts.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <span className="text-sm text-slate-400">Made for you</span>
            <h2 className="mt-3 text-xl font-semibold">A simpler experience</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              A clean, responsive experience across your devices.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="container flex min-h-20 flex-col items-center justify-center gap-2 py-5 text-center text-xs text-slate-500 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Live Weather</p>
          <p>Feel the Sky. Plan Your Day.</p>
        </div>
      </footer>
    </main>
  );
}
