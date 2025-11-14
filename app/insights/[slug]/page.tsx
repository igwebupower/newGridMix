import { Header } from '@/components/Header';
import { getInsightBySlug, getAllInsights, formatDate, getCategoryLabel, getCategoryColor } from '@/lib/insights';
import Link from 'next/link';
import { InsightContent } from '@/components/InsightContent';

interface PageProps {
  params: Promise<{ slug: string }>;
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <Header />
      <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
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
