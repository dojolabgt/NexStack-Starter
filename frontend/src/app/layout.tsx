import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const generalSans = localFont({
  src: "../fonts/web/fonts/GeneralSans-Variable.woff2",
  variable: "--font-general-sans",
  weight: "200 700",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Portfolio",
  description: "Personal portfolio and projects showcase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${generalSans.variable} ${geistMono.variable} font-body antialiased`}
      >
        {children}
        <Toaster position="top-left" richColors />
      </body>
    </html>
  );
}
