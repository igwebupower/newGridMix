'use client';

import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { Insight, formatDate, getCategoryLabel, getCategoryColor } from '@/lib/insights';

interface InsightContentProps {
  insight: Insight;
}

export function InsightContent({ insight }: InsightContentProps) {
  const categoryColor = getCategoryColor(insight.category);
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500 text-blue-100',
    green: 'bg-green-500 text-green-100',
    purple: 'bg-purple-500 text-purple-100',
    orange: 'bg-orange-500 text-orange-100',
    pink: 'bg-pink-500 text-pink-100',
  };

  return (
    <>
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <Link
          href="/insights"
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Insights
        </Link>
      </motion.div>

      {/* Article Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto mb-12"
      >
        {/* Category Badge */}
        <div className="flex items-center space-x-3 mb-6">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${colorClasses[categoryColor]}`}>
            {getCategoryLabel(insight.category)}
          </span>
          {insight.featured && (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
              Featured
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-8 leading-tight tracking-tight">
          {insight.title}
        </h1>

        {/* Excerpt */}
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed mb-8 font-light">
          {insight.excerpt}
        </p>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-500 pb-8 border-b border-gray-200 dark:border-gray-700">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {insight.author}
          </span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(insight.date)}
          </span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {insight.readTime} min read
          </span>
          {insight.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-gray-400 dark:text-gray-600">
              #{tag}
            </span>
          ))}
        </div>
      </motion.header>

      {/* Article Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="glass rounded-2xl overflow-hidden"
      >
        {/* Optimized reading column with max 65-75 characters per line */}
        <div className="max-w-2xl mx-auto px-6 sm:px-8 md:px-12 py-12 md:py-16">
          <div className="prose prose-lg dark:prose-invert max-w-none
            prose-headings:font-bold prose-headings:tracking-tight
            prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:leading-tight
            prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-4 prose-h3:text-gray-800 dark:prose-h3:text-gray-200
            prose-h4:text-xl prose-h4:mt-8 prose-h4:mb-3
            prose-p:text-[1.125rem] prose-p:leading-[1.75] prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:mb-8
            prose-p:first-of-type:text-[1.25rem] prose-p:first-of-type:leading-[1.7] prose-p:first-of-type:text-gray-800 dark:prose-p:first-of-type:text-gray-200
            prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-strong:font-semibold
            prose-em:text-gray-800 dark:prose-em:text-gray-200
            prose-ul:my-8 prose-ul:space-y-3
            prose-ol:my-8 prose-ol:space-y-3
            prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:leading-[1.75]
            prose-li:marker:text-gray-500 dark:prose-li:marker:text-gray-400
            prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:underline-offset-2
            prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-800 dark:prose-blockquote:text-gray-200 prose-blockquote:my-8
            prose-code:text-sm prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-blue-600 dark:prose-code:text-blue-400
            prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-pre:my-8
            prose-hr:border-gray-200 dark:prose-hr:border-gray-700 prose-hr:my-12
            prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {insight.content}
            </ReactMarkdown>
          </div>
        </div>
      </motion.div>

      {/* Footer CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-20 max-w-3xl mx-auto"
      >
        <div className="glass p-10 md:p-12 rounded-2xl text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            See the Data in Action
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
            Experience real-time UK grid monitoring on our live dashboard
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            View Live Dashboard
          </Link>
        </div>
      </motion.div>

      {/* Read More */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-700 max-w-3xl mx-auto"
      >
        <Link
          href="/insights"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium group"
        >
          <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to all insights
        </Link>
      </motion.div>
    </>
  );
}
