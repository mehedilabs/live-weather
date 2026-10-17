# 🌤️ Live Weather

<div align="center">

### Feel the Sky. Plan Your Day.

A modern, responsive weather dashboard built with Next.js, React, TypeScript, and Tailwind CSS.

Search for any city or use your current location to explore current weather conditions, hourly updates, and a 5-day forecast.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Website-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://live-weather-sky.vercel.app/)

</div>

---

## 📖 About the Project

**Live Weather** is a weather dashboard designed to make checking the weather simple, fast, and enjoyable.

Featuring a modern dark interface, atmospheric gradients, glassmorphism-inspired cards, and smooth animations, the application presents weather information in a clean and easy-to-understand format.

You can search for cities around the world or use your device's location to check local weather conditions. The application retrieves weather information from public APIs without requiring an account or an API key.

🔗 **Live Website:** https://live-weather-sky.vercel.app/

## ✨ Features

- 🌍 **Global City Search** — Search for cities and explore matching locations using geocoding.
- 📍 **Current Location** — Get local weather using your browser's geolocation permission.
- 🌡️ **Current Weather** — View the current temperature, weather conditions, and daily high and low.
- ⏱️ **Hourly Forecast** — Check upcoming hourly temperatures and weather conditions.
- 📅 **5-Day Forecast** — Explore daily weather conditions with high and low temperatures.
- 💧 **Weather Details** — View information such as feels-like temperature, humidity, wind speed, and visibility.
- 🌅 **Sunrise & Sunset** — Check daily sunrise and sunset times.
- 🌦️ **Weather Condition Icons** — Understand weather conditions through descriptive labels and icons.
- ⚠️ **Loading & Error States** — Clear feedback when weather data is loading or a request fails.
- 📱 **Responsive Design** — A layout designed for mobile phones, tablets, and desktop screens.
- 🎨 **Modern Dark UI** — Atmospheric backgrounds, glass-style surfaces, and subtle animations.
- ♿ **Accessibility Considerations** — Semantic elements, accessible labels, and reduced-motion support where implemented.

## 🧰 Tech Stack

| Category          | Technology               |
| ----------------- | ------------------------ |
| Framework         | Next.js (App Router)     |
| UI Library        | React                    |
| Language          | TypeScript               |
| Styling           | Tailwind CSS             |
| Icons             | Lucide React             |
| Weather API       | Open-Meteo Forecast API  |
| Geocoding         | Open-Meteo Geocoding API |
| Reverse Geocoding | BigDataCloud             |
| Deployment        | Vercel                   |

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/) — version 20.9.0 or newer
- npm — included with Node.js
- Git

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/mehedilabs/live-weather.git
```

**2. Navigate to the project directory**

```bash
cd live-weather
```

**3. Install dependencies**

```bash
npm install
```

**4. Start the development server**

```bash
npm run dev
```

**5. Open the application**

Visit [http://localhost:3000](http://localhost:3000) in your browser.

The development server supports hot reloading while you work on the application.

### Available Scripts

| Command         | Description                                |
| --------------- | ------------------------------------------ |
| `npm run dev`   | Start the development server               |
| `npm run build` | Build the application for production       |
| `npm start`     | Start the production server after building |
| `npm run lint`  | Run the project's configured ESLint checks |

## 🔐 Environment Variables

The application is designed to use public weather APIs without requiring API keys.

If the current implementation does not introduce additional environment-dependent configuration, no `.env` file is needed to run the project locally.

## 🌐 Weather APIs & Data Sources

Live Weather uses public APIs to retrieve weather information and location details.

| Purpose                       | Provider                                      | Documentation                                                                               |
| ----------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Current weather and forecasts | [Open-Meteo](https://open-meteo.com/)         | [Forecast API](https://open-meteo.com/en/docs)                                              |
| City search                   | [Open-Meteo](https://open-meteo.com/)         | [Geocoding API](https://open-meteo.com/en/docs/geocoding-api)                               |
| Location name lookup          | [BigDataCloud](https://www.bigdatacloud.com/) | [Reverse Geocoding](https://www.bigdatacloud.com/free-api/free-reverse-geocode-to-city-api) |

Weather information is requested directly from public API endpoints. Availability and usage are subject to each provider's terms and service limits.

Please review the providers' documentation and attribution requirements before redistributing or extending the application.

## 📁 Project Structure

```text
live-weather/
├── public/
├── src/
│   ├── app/
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── lib/
│       └── weather.ts
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── package-lock.json
└── tsconfig.json
```

_Note: The tree above represents the expected structure described for this project. Adjust it if your actual repository contains different files or directories._

### Key Files

- `src/app/page.tsx` — Main weather dashboard and user interface.
- `src/app/layout.tsx` — Root layout and page metadata.
- `src/app/globals.css` — Global styles, design tokens, and animations.
- `src/lib/weather.ts` — Weather API utilities and data handling, if present.
- `package.json` — Project dependencies and npm scripts.

## 📦 Build & Deployment

### Create a Production Build

```bash
npm run build
```

### Run the Production Build Locally

```bash
npm start
```

Then visit [http://localhost:3000](http://localhost:3000).

### Deploy to Vercel

The project is hosted on Vercel.

To deploy your own copy:

1. Push the project to a GitHub repository.
2. Import the repository into [Vercel](https://vercel.com/new).
3. Confirm the framework and build settings.
4. Deploy the application.

For subsequent updates, push your changes to the connected GitHub branch to trigger a deployment according to your Vercel project settings.

## 👨‍💻 Author

**Mehedi Hasan — Full-Stack Developer**

- GitHub: [@mehedilabs](https://github.com/mehedilabs)
- Repository: [mehedilabs/live-weather](https://github.com/mehedilabs/live-weather)
- Live Demo: [Live Weather](https://live-weather-sky.vercel.app/)

---

<div align="center">

**Feel the Sky. Plan Your Day.** 🌤️

Built with Next.js and Open-Meteo weather data.

</div>
