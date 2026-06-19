import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms and conditions for using the GridMix live UK National Grid dashboard and API.',
  alternates: {
    canonical: 'https://gridmix.co.uk/terms',
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
