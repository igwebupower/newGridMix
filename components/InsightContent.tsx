'use client';

import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { Insight, formatDate, getCategoryLabel, getCategoryColor } from '@/lib/insights';
import { MarkdownImage } from './BlogImage';

interface InsightContentProps {
  insight: Insight;
}

export function InsightContent({ insight }: InsightContentProps) {
  const categoryColor = getCategoryColor(insight.category);
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-600 text-white',
    green: 'bg-green-600 text-white',
    purple: 'bg-purple-600 text-white',
    orange: 'bg-orange-600 text-white',
    pink: 'bg-pink-600 text-white',
  };

  return (
    <div className="magazine-layout">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <Link
          href="/insights"
          className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
        >
          <svg className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to all articles
        </Link>
      </motion.div>

      {/* Article Header - Editorial Style */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-16"
      >
        {/* Category & Meta Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold uppercase tracking-wider px-4 py-2 rounded ${colorClasses[categoryColor]}`}>
              {getCategoryLabel(insight.category)}
            </span>
            {insight.featured && (
              <span className="text-xs font-bold uppercase tracking-wider px-4 py-2 rounded bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                Featured
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-500">
            {formatDate(insight.date)} · {insight.readTime} min read
          </div>
        </div>

        {/* Title - Large and Bold */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-10 leading-[1.1] tracking-tight">
          {insight.title}
        </h1>

        {/* Deck/Subtitle */}
        <p className="text-2xl md:text-3xl text-gray-700 dark:text-gray-300 leading-[1.4] mb-10 font-serif">
          {insight.excerpt}
        </p>

        {/* Divider */}
        <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mb-10"></div>

        {/* Byline */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">{insight.author}</div>
            <div className="text-sm text-gray-500 dark:text-gray-500">
              {insight.tags.slice(0, 3).join(' · ')}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Article Content - Magazine Style */}
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-20"
      >
        <div className="magazine-content prose prose-lg dark:prose-invert max-w-none
          prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white prose-headings:tracking-tight

          prose-h1:text-3xl prose-h1:md:text-4xl prose-h1:mb-6 prose-h1:mt-12 prose-h1:leading-tight

          prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mb-6 prose-h2:mt-12 prose-h2:pb-3 prose-h2:border-b prose-h2:border-gray-200 dark:prose-h2:border-gray-800 prose-h2:leading-tight

          prose-h3:text-xl prose-h3:md:text-2xl prose-h3:mb-4 prose-h3:mt-8 prose-h3:leading-snug prose-h3:text-gray-800 dark:prose-h3:text-gray-200

          prose-h4:text-lg prose-h4:md:text-xl prose-h4:mb-3 prose-h4:mt-6 prose-h4:font-semibold

          prose-p:text-base prose-p:md:text-lg prose-p:leading-relaxed prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:mb-6 prose-p:mt-0

          first:prose-p:text-lg first:prose-p:md:text-xl first:prose-p:leading-relaxed first:prose-p:font-normal first:prose-p:text-gray-800 dark:first:prose-p:text-gray-200

          prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-bold
          prose-em:italic prose-em:text-gray-800 dark:prose-em:text-gray-200

          prose-ul:my-6 prose-ul:space-y-2 prose-ul:text-base prose-ul:md:text-lg
          prose-ol:my-6 prose-ol:space-y-2 prose-ol:text-base prose-ol:md:text-lg
          prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:leading-relaxed prose-li:pl-2
          prose-li:marker:text-blue-600 dark:prose-li:marker:text-blue-400 prose-li:marker:font-bold

          prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:font-semibold prose-a:no-underline prose-a:border-b-2 prose-a:border-blue-200 dark:prose-a:border-blue-900 hover:prose-a:border-blue-600 dark:hover:prose-a:border-blue-400 prose-a:transition-colors

          prose-blockquote:border-l-4 prose-blockquote:border-blue-600 prose-blockquote:pl-6 prose-blockquote:py-3 prose-blockquote:pr-6 prose-blockquote:my-8 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-950/30 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-base prose-blockquote:md:text-lg prose-blockquote:leading-relaxed prose-blockquote:text-gray-800 dark:prose-blockquote:text-gray-200

          prose-code:text-sm prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-code:font-mono prose-code:font-medium prose-code:before:content-[''] prose-code:after:content-['']

          prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-pre:my-8 prose-pre:p-6 prose-pre:rounded-xl prose-pre:border prose-pre:border-gray-800

          prose-hr:border-gray-300 dark:prose-hr:border-gray-700 prose-hr:my-12 prose-hr:border-t-2

          prose-img:rounded-2xl prose-img:shadow-2xl prose-img:my-8 prose-img:w-full

          prose-table:my-8 prose-table:border-collapse prose-table:w-full prose-table:text-sm prose-table:md:text-base
          prose-th:bg-gray-100 dark:prose-th:bg-gray-800 prose-th:p-3 prose-th:text-left prose-th:font-bold prose-th:text-gray-900 dark:prose-th:text-gray-100 prose-th:border prose-th:border-gray-300 dark:prose-th:border-gray-700
          prose-td:p-3 prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-700 prose-td:text-gray-700 dark:prose-td:text-gray-300">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              img: MarkdownImage,
            }}
          >
            {insight.content}
          </ReactMarkdown>
        </div>
      </motion.article>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent my-20"></div>

      {/* Footer CTA - Magazine Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mb-20"
      >
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 p-12 md:p-16 text-center border border-gray-200 dark:border-gray-800">
          <div className="relative z-10">
            <div className="inline-block px-4 py-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-full text-sm font-semibold text-gray-600 dark:text-gray-400 mb-6">
              Explore Live Data
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              See It in Real-Time
            </h3>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Experience the UK grid data we&apos;ve been discussing—live, updated every 30 seconds, on our interactive dashboard.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform"
            >
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Launch Dashboard
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Navigation Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="flex items-center justify-between pt-12 border-t-2 border-gray-200 dark:border-gray-800"
      >
        <Link
          href="/insights"
          className="inline-flex items-center text-base font-semibold text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
        >
          <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          All Articles
        </Link>
        <div className="text-sm text-gray-500 dark:text-gray-500">
          {insight.tags.map((tag, index) => (
            <span key={tag}>
              #{tag}
              {index < insight.tags.length - 1 && ' · '}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
