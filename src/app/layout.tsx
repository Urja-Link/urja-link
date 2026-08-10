import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import Sidebar from "@/components/Sidebar";
import { LanguageProvider } from "@/context/LanguageContext";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

import { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#023e8a",
};

export const metadata: Metadata = {
  title: "Urja-Link India | AI-Powered Rooftop Solar Platform",
  description:
    "India's AI-powered national platform for rooftop solar potential estimation, PM Surya Ghar subsidies, and smart energy planning.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body>
        <LanguageProvider>
          <ThemeProvider>
            <Sidebar />
            {children}
          </ThemeProvider>
        </LanguageProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                      for(let registration of registrations) {
                          registration.unregister();
                      }
                  });
              }
            `
          }}
        />
      </body>
    </html>
  );
}
