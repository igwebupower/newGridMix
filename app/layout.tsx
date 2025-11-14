import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CookieBanner } from "@/components/CookieBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://gridmix.co.uk'),
  title: {
    default: 'GridMix - Live UK Energy Data & National Grid Dashboard',
    template: '%s | GridMix - UK Energy Data'
  },
  description: 'Real-time UK National Grid dashboard tracking electricity generation, carbon intensity, renewable energy mix, solar power, and interconnector flows. Live energy data updated every 30 seconds from Elexon BMRS and Sheffield Solar.',
  keywords: [
    'UK energy data',
    'National Grid live data',
    'UK electricity dashboard',
    'carbon intensity UK',
    'renewable energy UK',
    'solar generation UK',
    'UK grid frequency',
    'electricity generation mix',
    'Elexon BMRS data',
    'UK energy transition',
    'fossil fuel tracking',
    'low carbon energy',
    'grid interconnectors',
    'UK power system',
    'real-time energy monitoring',
    'Sheffield Solar PVLive',
    'UK electricity demand',
    'energy statistics UK',
    'net zero tracker',
    'British energy grid'
  ],
  authors: [{ name: 'GridMix', url: 'https://gridmix.co.uk' }],
  creator: 'GridMix',
  publisher: 'GridMix',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://gridmix.co.uk',
    siteName: 'GridMix',
    title: 'GridMix - Live UK Energy Data & National Grid Dashboard',
    description: 'Real-time UK National Grid dashboard with live electricity generation, carbon intensity, renewable energy tracking, and solar power data updated every 30 seconds.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GridMix - UK National Grid Live Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GridMix - Live UK Energy Data & National Grid Dashboard',
    description: 'Real-time UK National Grid dashboard with live electricity generation, carbon intensity, and renewable energy tracking.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://gridmix.co.uk',
  },
  category: 'technology',
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
