'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
  delay?: number;
}

export function StatCard({
  title,
  value,
  unit,
  icon,
  trend,
  color = 'blue',
  delay = 0,
}: StatCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
      className="glass p-6 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        {icon && (
          <div
            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${
              colorClasses[color as keyof typeof colorClasses] || colorClasses.blue
            } flex items-center justify-center`}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline space-x-2">
        <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          {value}
        </p>
        {unit && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{unit}</p>
        )}
      </div>

      {trend && (
        <div className="mt-2 flex items-center space-x-1">
          {trend === 'up' ? (
            <svg
              className="w-4 h-4 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          ) : trend === 'down' ? (
            <svg
              className="w-4 h-4 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          ) : (
            <div className="w-4 h-0.5 bg-gray-400" />
          )}
        </div>
      )}
    </motion.div>
  );
}
