'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Insight, formatDate, getCategoryLabel, getCategoryColor } from '@/lib/posts';

interface InsightCardProps {
  insight: Insight;
  delay?: number;
}

export function InsightCard({ insight, delay = 0 }: InsightCardProps) {
  const categoryColor = getCategoryColor(insight.category);

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500 text-blue-100',
    green: 'bg-green-500 text-green-100',
    purple: 'bg-purple-500 text-purple-100',
    orange: 'bg-orange-500 text-orange-100',
    pink: 'bg-pink-500 text-pink-100',
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="group"
    >
      <Link href={`/insights/${insight.slug}`}>
        <div className="glass p-6 rounded-xl hover:shadow-lg transition-all duration-300 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${colorClasses[categoryColor]}`}>
              {getCategoryLabel(insight.category)}
            </span>
            {insight.featured && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                Featured
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
            {insight.title}
          </h2>

          {/* Excerpt */}
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 flex-grow line-clamp-3">
            {insight.excerpt}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(insight.date)}
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {insight.readTime} min read
              </span>
            </div>
            <span className="text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
              Read more →
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {insight.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
