import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CookieBanner } from "@/components/CookieBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GridMix - UK National Grid Live Dashboard",
  description: "Real-time visualization of UK National Grid data - supply, demand, carbon intensity, and energy mix",
  keywords: "UK grid, energy, carbon, renewables, electricity, dashboard",
  authors: [{ name: "GridMix" }],
  openGraph: {
    title: "GridMix - UK National Grid Live Dashboard",
    description: "Real-time visualization of UK National Grid data",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
