'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  delay?: number;
}

export function Card({ children, title, subtitle, className = '', delay = 0 }: CardProps) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay }}
      className={`glass p-6 hover:shadow-xl transition-shadow duration-300 ${className}`}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </motion.div>
  );
}
