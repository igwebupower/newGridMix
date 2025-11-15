'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { InsightCard } from '@/components/InsightCard';
import { Insight } from '@/lib/types';

interface InsightsPageClientProps {
  featuredInsights: Insight[];
  allInsights: Insight[];
}

export function InsightsPageClient({ featuredInsights, allInsights }: InsightsPageClientProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4 px-2">
            UK Energy Insights & Analysis
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto px-4">
            Expert analysis and deep dives into the UK energy grid, renewable technology, and the transition to net zero.
            Explore how our electricity system works, understand carbon intensity trends, and discover where Britain&apos;s energy future is heading.
          </p>
        </motion.div>

        {/* Featured Section */}
        {featuredInsights.length > 0 && (
          <section className="mb-16">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-2xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 md:mb-8 flex items-center"
            >
              <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mr-2 md:mr-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Featured Articles
            </motion.h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredInsights.map((insight, index) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  delay={0.1 * index}
                />
              ))}
            </div>
          </section>
        )}

        {/* All Insights Section */}
        <section>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-2xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 md:mb-8 flex items-center"
          >
            <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mr-2 md:mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            All Articles
          </motion.h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {allInsights.map((insight, index) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                delay={0.05 * index}
              />
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 md:mt-16 text-center glass p-6 sm:p-8 md:p-12 rounded-2xl"
        >
          <h3 className="text-xl sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Want to dive deeper?
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto px-2">
            Check out our live dashboard to see real-time UK grid data, including generation mix,
            carbon intensity, interconnector flows, and solar production curves.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            View Live Dashboard
          </Link>
        </motion.div>

        {/* Footer */}
        <footer className="text-center py-12 mt-12 space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            GridMix Insights - Understanding the UK Energy Transition
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400 dark:text-gray-500">
            <a href="/support" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              💚 Support GridMix
            </a>
            <span>•</span>
            <a href="/privacy" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="/terms" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              Terms of Service
            </a>
            <span>•</span>
            <a href="/cookies" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              Cookie Policy
            </a>
            <span>•</span>
            <a href="mailto:hello@gridmix.co.uk" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
              hello@gridmix.co.uk
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
