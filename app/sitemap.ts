import { MetadataRoute } from 'next';
import { getAllInsights } from '@/lib/insights';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://gridmix.co.uk';

  // Get all insight articles
  const insights = getAllInsights();

  // Generate insight URLs
  const insightUrls = insights.map((insight) => ({
    url: `${baseUrl}/insights/${insight.id}`,
    lastModified: insight.date,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    {
      url: `${baseUrl}/insights`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    ...insightUrls,
    {
      url: `${baseUrl}/support`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];
}
