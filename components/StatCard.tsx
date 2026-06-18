'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export type StatStatus = 'good' | 'warn' | 'bad' | 'neutral';

interface Trend {
  direction: 'up' | 'down' | 'flat';
  label: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  badge?: string;
  icon?: ReactNode;
  status?: StatStatus;
  statusLabel?: string;
  trend?: Trend;
  delay?: number;
}

const STATUS_PILL_CLASSES: Record<StatStatus, string> = {
  good: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  warn: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  bad: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  neutral: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const STATUS_VALUE_CLASSES: Record<StatStatus, string> = {
  good: 'text-green-600 dark:text-green-400',
  warn: 'text-yellow-600 dark:text-yellow-400',
  bad: 'text-red-600 dark:text-red-400',
  neutral: 'text-gray-800 dark:text-gray-100',
};

function TrendIcon({ direction }: { direction: Trend['direction'] }) {
  if (direction === 'flat') {
    return <div className="w-3 h-0.5 bg-gray-400 dark:bg-gray-500" aria-hidden="true" />;
  }
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d={direction === 'up' ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'}
      />
    </svg>
  );
}

export function StatCard({
  title,
  value,
  unit,
  badge,
  icon,
  status = 'neutral',
  statusLabel,
  trend,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
      className="glass p-6 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
          {icon && <span className="w-4 h-4 [&>svg]:w-4 [&>svg]:h-4" aria-hidden="true">{icon}</span>}
          <p className="text-sm">{title}</p>
        </div>
        {statusLabel && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_PILL_CLASSES[status]}`}>
            {statusLabel}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <p className={`text-3xl font-bold ${STATUS_VALUE_CLASSES[status]}`}>{value}</p>
        {unit && <p className="text-sm text-gray-500 dark:text-gray-400">{unit}</p>}
        {badge && (
          <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
            {badge}
          </span>
        )}
      </div>

      <div className="mt-2 h-4 flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
        {trend && (
          <>
            <TrendIcon direction={trend.direction} />
            <span>{trend.label}</span>
          </>
        )}
      </div>
    </motion.div>
  );
}
