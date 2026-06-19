import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/docs'],
        disallow: ['/api/', '/_next/'],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/api/docs'],
        disallow: ['/api/', '/_next/'],
      },
      {
        userAgent: 'Bingbot',
        allow: ['/', '/api/docs'],
        disallow: ['/api/', '/_next/'],
      },
    ],
    sitemap: 'https://gridmix.co.uk/sitemap.xml',
  };
}
