import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API & MCP Docs',
  description:
    'Free UK National Grid data API: REST endpoints, the Watt natural-language assistant, and an MCP server for AI clients like Claude. No signup, no API key.',
  alternates: {
    canonical: 'https://gridmix.co.uk/api/docs',
  },
  openGraph: {
    title: 'API & MCP Docs | GridMix',
    description:
      'Free UK National Grid data API: REST endpoints, the Watt natural-language assistant, and an MCP server for AI clients like Claude.',
    url: 'https://gridmix.co.uk/api/docs',
  },
};

export default function ApiDocsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
