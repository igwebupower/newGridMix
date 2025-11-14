'use client';

import { motion } from 'framer-motion';
import { GenerationMix, getFuelColor, formatFuelName } from '@/lib/api';

interface SourceBreakdownProps {
  data: GenerationMix[];
}

export function SourceBreakdown({ data }: SourceBreakdownProps) {
  // Sort by percentage
  const sortedData = [...data]
    .filter(item => item.perc > 0)
    .sort((a, b) => b.perc - a.perc);

  return (
    <div className="space-y-4">
      {sortedData.map((source, index) => (
        <motion.div
          key={source.fuel}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: index * 0.05 }}
          className="space-y-2"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getFuelColor(source.fuel) }}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {formatFuelName(source.fuel)}
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {source.perc.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${source.perc}%` }}
              transition={{ duration: 1, delay: index * 0.05 }}
              className="h-full rounded-full"
              style={{ backgroundColor: getFuelColor(source.fuel) }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
