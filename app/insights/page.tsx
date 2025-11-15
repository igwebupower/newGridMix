import { getAllInsights, getFeaturedInsights } from '@/lib/posts';
import { InsightsPageClient } from '@/components/InsightsPageClient';

export default function InsightsPage() {
  const featuredInsights = getFeaturedInsights();
  const allInsights = getAllInsights();

  return <InsightsPageClient featuredInsights={featuredInsights} allInsights={allInsights} />;
}
