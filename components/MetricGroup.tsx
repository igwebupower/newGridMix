'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface MetricGroupProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  delay?: number;
  columns?: 1 | 2 | 3 | 4;
}

// Tailwind needs static class names, so the column count maps to a fixed
// set of breakpoint classes rather than being interpolated.
const GRID_COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

export function MetricGroup({ title, icon, children, delay = 0, columns = 4 }: MetricGroupProps) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay }}
      className="space-y-3"
    >
      {/* Group Header */}
      <div className="flex items-center space-x-2 px-2">
        {icon && (
          <div className="text-gray-400 dark:text-gray-500">
            {icon}
          </div>
        )}
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
          {title}
        </h3>
        <div className="flex-1 h-px bg-gradient-to-r from-gray-300 dark:from-gray-700 to-transparent" />
      </div>

      {/* Group Content */}
      <div className={`grid gap-4 ${GRID_COLS[columns]}`}>
        {children}
      </div>
    </motion.div>
  );
}
