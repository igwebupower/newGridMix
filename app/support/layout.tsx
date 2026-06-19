import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support GridMix',
  description:
    'Support GridMix, the free real-time UK National Grid dashboard, with a one-time or recurring contribution. Helps cover hosting and data costs.',
  alternates: {
    canonical: 'https://gridmix.co.uk/support',
  },
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
