import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Live Weather | Feel the Sky. Plan Your Day.",
    template: "%s | Live Weather",
  },
  description:
    "Check current weather conditions and forecasts for your city. Live Weather helps you understand the sky and plan your day.",
  applicationName: "Live Weather",
  keywords: [
    "Live Weather",
    "weather forecast",
    "current weather",
    "weather by city",
  ],
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
