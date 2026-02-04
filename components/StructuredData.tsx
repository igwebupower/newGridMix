// Structured Data (JSON-LD) Component for SEO
// Provides rich snippets for search engines

interface StructuredDataProps {
  type: 'website' | 'article' | 'organization';
  data: any;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const generateSchema = () => {
    switch (type) {
      case 'website':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'GridMix',
          alternateName: 'GridMix UK Energy Dashboard',
          url: 'https://gridmix.co.uk',
          description: 'Real-time UK National Grid dashboard tracking electricity generation, carbon intensity, renewable energy mix, and solar power.',
          inLanguage: 'en-GB',
          publisher: {
            '@type': 'Organization',
            name: 'GridMix',
            url: 'https://gridmix.co.uk',
            logo: {
              '@type': 'ImageObject',
              url: 'https://gridmix.co.uk/logo.png',
            },
          },
        };

      case 'organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'GridMix',
          url: 'https://gridmix.co.uk',
          logo: 'https://gridmix.co.uk/logo.png',
          description: 'UK National Grid real-time energy data dashboard',
          contactPoint: {
            '@type': 'ContactPoint',
            email: 'hello@gridmix.co.uk',
            contactType: 'Customer Service',
            areaServed: 'GB',
            availableLanguage: 'English',
          },
          sameAs: [
            'https://twitter.com/gridmix',
            'https://github.com/gridmix',
          ],
        };

      case 'article':
        return {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: data.title,
          description: data.excerpt,
          image: data.image || 'https://gridmix.co.uk/og-image.png',
          datePublished: data.date,
          dateModified: data.updatedDate || data.date,
          author: {
            '@type': 'Organization',
            name: 'GridMix',
            url: 'https://gridmix.co.uk',
          },
          publisher: {
            '@type': 'Organization',
            name: 'GridMix',
            url: 'https://gridmix.co.uk',
            logo: {
              '@type': 'ImageObject',
              url: 'https://gridmix.co.uk/logo.png',
            },
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': data.url || `https://gridmix.co.uk/${data.slug}`,
          },
          keywords: data.tags?.join(', '),
          articleSection: data.category,
        };

      default:
        return null;
    }
  };

  const schema = generateSchema();

  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Dashboard-specific structured data
export function DashboardStructuredData() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'GridMix Dashboard',
    applicationCategory: 'Utility Application',
    operatingSystem: 'Web Browser',
    description: 'Real-time UK National Grid dashboard showing live electricity generation, carbon intensity, renewable energy mix, solar power, grid frequency, and interconnector flows.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'GBP',
    },
    featureList: [
      'Real-time UK grid data',
      'Carbon intensity monitoring',
      'Renewable energy tracking',
      'Solar generation curves',
      'Grid frequency monitoring',
      'Interconnector flows',
      'Historical trends',
      'Forecast data',
    ],
    screenshot: 'https://gridmix.co.uk/og-image.png',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Breadcrumb structured data
export function BreadcrumbStructuredData({ items }: { items: Array<{ name: string; url: string }> }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
