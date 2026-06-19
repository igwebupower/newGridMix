import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How GridMix collects, uses, and protects your data when you use the live UK National Grid dashboard.',
  alternates: {
    canonical: 'https://gridmix.co.uk/privacy',
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
