'use client';

import { motion } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  lastUpdated?: string;
}

export function Header({ lastUpdated }: HeaderProps) {
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
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg
                className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                GridMix
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                UK National Grid Live
              </p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {lastUpdated && (
              <div className="hidden sm:flex flex-col items-end">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Last updated
                </p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {lastUpdated}
                </p>
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
