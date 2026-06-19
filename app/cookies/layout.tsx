import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'How GridMix uses cookies and similar technologies on the live UK National Grid dashboard.',
  alternates: {
    canonical: 'https://gridmix.co.uk/cookies',
  },
};

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
