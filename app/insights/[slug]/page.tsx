import { Header } from '@/components/Header';
import { getInsightBySlug, getAllInsights, formatDate, getCategoryLabel, getCategoryColor } from '@/lib/insights';
import Link from 'next/link';
import { InsightContent } from '@/components/InsightContent';
import { StructuredData, BreadcrumbStructuredData } from '@/components/StructuredData';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata for each insight article
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const insight = getInsightBySlug(slug);

  if (!insight) {
    return {
      title: 'Article Not Found',
      description: 'The article you are looking for could not be found.',
    };
  }

  return {
    title: insight.title,
    description: insight.excerpt,
    keywords: [
      ...insight.tags,
      'UK energy',
      'National Grid',
      'renewable energy',
      'carbon intensity',
      getCategoryLabel(insight.category),
    ],
    authors: [{ name: 'GridMix' }],
    openGraph: {
      title: insight.title,
      description: insight.excerpt,
      type: 'article',
      publishedTime: insight.date,
      modifiedTime: insight.updatedDate || insight.date,
      authors: ['GridMix'],
      section: getCategoryLabel(insight.category),
      tags: insight.tags,
      url: `https://gridmix.co.uk/insights/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: insight.title,
      description: insight.excerpt,
    },
    alternates: {
      canonical: `https://gridmix.co.uk/insights/${slug}`,
    },
  };
}

export default async function InsightDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const insight = getInsightBySlug(slug);

  if (!insight) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center glass p-12 rounded-2xl">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Article Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              The article you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link
              href="/insights"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Back to Insights
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <StructuredData
        type="article"
        data={{
          title: insight.title,
          excerpt: insight.excerpt,
          date: insight.date,
          updatedDate: insight.updatedDate,
          slug: insight.slug,
          tags: insight.tags,
          category: getCategoryLabel(insight.category),
        }}
      />
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', url: 'https://gridmix.co.uk' },
          { name: 'Insights', url: 'https://gridmix.co.uk/insights' },
          { name: insight.title, url: `https://gridmix.co.uk/insights/${insight.slug}` },
        ]}
      />
      <Header />
      <article className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-16 md:py-24">
        <InsightContent insight={insight} />
      </article>
    </div>
  );
}

// Generate static params for all insights
export async function generateStaticParams() {
  const allInsights = getAllInsights();
  return allInsights.map((insight) => ({
    slug: insight.slug,
  }));
}
