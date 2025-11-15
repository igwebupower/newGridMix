'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface HeroMetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  color?: string;
  level?: string;
  description?: string;
  trendData?: Array<{ value: number; time: string }>;
}

export function HeroMetricCard({
  title,
  value,
  unit,
  icon,
  color = 'blue',
  level,
  description,
  trendData,
}: HeroMetricCardProps) {
  const colorClasses = {
    blue: { bg: 'from-blue-500 to-blue-600', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
    green: { bg: 'from-green-500 to-green-600', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
    yellow: { bg: 'from-yellow-500 to-yellow-600', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800' },
    red: { bg: 'from-red-500 to-red-600', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800' },
    purple: { bg: 'from-purple-500 to-purple-600', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' },
    orange: { bg: 'from-orange-500 to-orange-600', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' },
  };

  const colors = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

  // Calculate simple trend visualization
  const maxValue = trendData ? Math.max(...trendData.map(d => d.value)) : 0;
  const minValue = trendData ? Math.min(...trendData.map(d => d.value)) : 0;
  const range = maxValue - minValue || 1;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`glass p-8 border-2 ${colors.border} hover:shadow-2xl transition-all duration-300 relative overflow-hidden`}
    >
      {/* Background decoration */}
      <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${colors.bg} opacity-5 rounded-full blur-3xl`} />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              {title}
            </p>
            {level && (
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${colors.text} bg-gradient-to-r ${colors.bg} bg-opacity-10`}>
                {level}
              </span>
            )}
          </div>
          {icon && (
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colors.bg} flex items-center justify-center shadow-lg`}
            >
              {icon}
            </div>
          )}
        </div>

        {/* Main Value */}
        <div className="flex items-baseline space-x-3 mb-4">
          <p className="text-6xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </p>
          {unit && (
            <p className="text-2xl font-medium text-gray-500 dark:text-gray-400">{unit}</p>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {description}
          </p>
        )}

        {/* Mini Trend Chart */}
        {trendData && trendData.length > 0 && (
          <div className="mt-6">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Last 24 hours</p>
            <div className="h-16 flex items-end space-x-1">
              {trendData.map((point, index) => {
                const height = ((point.value - minValue) / range) * 100;
                return (
                  <div
                    key={index}
                    className={`flex-1 bg-gradient-to-t ${colors.bg} rounded-t opacity-60 hover:opacity-100 transition-opacity`}
                    style={{ height: `${Math.max(height, 5)}%` }}
                    title={`${point.time}: ${point.value}`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
