import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Travelly.in — Your AI Travel Companion",
  description:
    "Plan your perfect trip with 6 AI agents. Find flights, hotels, and hidden gems tailored for Indian travelers. Free AI-powered trip planning.",
  keywords: [
    "travel planner",
    "AI travel",
    "trip planner India",
    "cheap flights India",
    "group travel",
    "travel itinerary",
    "Travelly",
  ],
  authors: [{ name: "Travelly.in" }],
  openGraph: {
    title: "Travelly.in — Your AI Travel Companion",
    description:
      "Plan your perfect trip with 6 AI agents. Flights, hotels, hidden gems — all tailored for Indian travelers.",
    siteName: "Travelly.in",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
