'use client';

import { Header } from '@/components/Header';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function NotFound() {
  const [gridData, setGridData] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Fetch current grid data to show on 404 page
    fetch('/api/v1/current')
      .then((res) => res.json())
      .then((data) => setGridData(data))
      .catch(() => null);
  }, []);

  const quickLinks = [
    {
      href: '/',
      title: 'Dashboard',
      description: 'View live UK grid data',
      icon: '⚡',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      href: '/insights',
      title: 'Energy Insights',
      description: 'Learn about UK energy trends',
      icon: '📊',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      href: '/api/docs',
      title: 'API Docs',
      description: 'Free REST API documentation',
      icon: '💻',
      gradient: 'from-green-500 to-green-600',
    },
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
          {/* Animated 404 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="text-center mb-12"
          >
            {/* Large 404 with grid-inspired design */}
            <div className="relative mb-8">
              <motion.h1
                className="text-[180px] sm:text-[240px] font-bold bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent leading-none"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{
                  backgroundSize: '200% 200%',
                }}
              >
                404
              </motion.h1>

              {/* Animated lightning bolt */}
              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <svg
                  className="w-24 h-24 sm:w-32 sm:h-32 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
                </svg>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Page Not Found
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
                Oops! This page seems to have gone off the grid.
                Like a power outage, but for web pages.
              </p>
            </motion.div>
          </motion.div>

          {/* Live Grid Stats Card */}
          {gridData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass p-6 rounded-2xl mb-12 max-w-2xl w-full border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  While you&apos;re here, check out the current UK grid status
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {Math.round(gridData.demand.total_mw / 1000)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    GW Demand
                  </div>
                </div>

                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {gridData.carbon_intensity.actual}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    gCO₂/kWh
                  </div>
                </div>

                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {gridData.frequency.hz.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Hz
                  </div>
                </div>

                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 capitalize">
                    {gridData.carbon_intensity.level}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Carbon Level
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Quick Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="w-full max-w-4xl"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 text-center">
              Try these popular pages instead
            </h3>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {quickLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <Link
                    href={link.href}
                    className="group block glass p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`text-4xl flex-shrink-0 p-3 bg-gradient-to-br ${link.gradient} rounded-lg shadow-lg`}>
                        <span className="block transform group-hover:scale-110 transition-transform">
                          {link.icon}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {link.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {link.description}
                        </p>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transform group-hover:translate-x-1 transition-all"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Additional Help */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="glass p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center"
            >
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Still can&apos;t find what you&apos;re looking for?
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/"
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Go to Dashboard
                </Link>
                <a
                  href="mailto:hello@gridmix.co.uk"
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg font-medium transition-all inline-flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Contact Support
                </a>
              </div>
            </motion.div>
          </motion.div>

          {/* Fun Error Messages */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-gray-500 dark:text-gray-500 italic">
              &quot;This page has less power than a wind turbine on a calm day.&quot;
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
