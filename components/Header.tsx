'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  lastUpdated?: string;
}

export function Header({ lastUpdated }: HeaderProps) {
  const pathname = usePathname();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 glass border-b border-gray-200/20 dark:border-gray-800/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/Assets/gridmixlogo.png"
                alt="GridMix Logo"
                className="h-10 sm:h-12 w-auto"
              />
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                href="/"
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  pathname === '/'
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/insights"
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  pathname?.startsWith('/insights')
                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Insights
              </Link>
              <Link
                href="/api/docs"
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  pathname?.startsWith('/api/docs')
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                API
              </Link>
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {lastUpdated && (
              <div className="hidden lg:flex flex-col items-end">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Last updated
                </p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {lastUpdated}
                </p>
              </div>
            )}

            {/* Subtle Sponsor Button */}
            <Link
              href="/support"
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all border border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-700"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span>Sponsor</span>
            </Link>

            <ThemeToggle />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
