import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'UK Energy Insights & Analysis',
  description: 'Expert analysis and insights on the UK energy transition, renewable power, grid infrastructure, and the path to net zero. Learn about solar, wind, nuclear, and the future of British electricity.',
  keywords: [
    'UK energy insights',
    'energy transition UK',
    'renewable energy analysis',
    'net zero UK',
    'UK grid infrastructure',
    'solar power UK',
    'wind energy UK',
    'nuclear power UK',
    'energy policy UK',
    'electricity system UK',
    'green energy',
    'decarbonization',
    'energy storage',
    'interconnectors',
    'carbon intensity trends'
  ],
  openGraph: {
    title: 'UK Energy Insights & Analysis | GridMix',
    description: 'Expert analysis on the UK energy transition, renewable power, and the path to net zero.',
    url: 'https://gridmix.co.uk/insights',
  },
  alternates: {
    canonical: 'https://gridmix.co.uk/insights',
  },
};

export default function InsightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
