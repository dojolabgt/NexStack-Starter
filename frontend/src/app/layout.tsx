"use client";

import { useEffect, useState } from "react";
import { Inter, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { MaintenanceCheck } from "@/components/maintenance-check";
import { getSettings, type AppSettings } from "@/lib/settings-service";
import { getImageUrl } from "@/lib/image-utils";
import { AuthProvider } from "@/contexts/auth-context";
import { ErrorBoundary } from "@/components/error-boundary";
import { TopLoader } from "@/components/ui/top-loader";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const generalSans = localFont({
  src: "../fonts/web/fonts/GeneralSans-Variable.woff2",
  variable: "--font-general-sans",
  weight: "100 900",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, setSettings] = useState<AppSettings | null>(null);

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getSettings();
        setSettings(data);
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };

    loadSettings();

    // Poll for settings changes every 30 seconds
    const interval = setInterval(loadSettings, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update page title and favicon when settings change
  useEffect(() => {
    if (!settings) return;

    // Update page title
    document.title = settings.appName || "Dashboard App";

    // Update favicon
    if (settings.appFavicon) {
      const faviconUrl = getImageUrl(settings.appFavicon);

      // Find existing favicon or create new one
      let favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;

      if (!favicon) {
        favicon = document.createElement("link");
        favicon.rel = "icon";
        document.head.appendChild(favicon);
      }

      // Update href with cache busting
      if (faviconUrl) {
        favicon.href = `${faviconUrl}?t=${Date.now()}`;
      }
    }
  }, [settings]);

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" id="favicon" />
      </head>
      <body
        className={`${inter.variable} ${generalSans.variable} ${geistMono.variable} font-body antialiased`}
      >
        <TopLoader />
        <ErrorBoundary>
          <AuthProvider>
            <MaintenanceCheck />
            {children}
            <Toaster position="top-left" richColors />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
