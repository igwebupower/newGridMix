'use client';

import { motion } from 'framer-motion';
import { Interconnector } from '@/lib/api';

interface InterconnectorFlowsProps {
  interconnectors: Interconnector[];
  totalImports: number;
  totalExports: number;
}

export function InterconnectorFlows({
  interconnectors,
  totalImports,
  totalExports,
}: InterconnectorFlowsProps) {
  const netFlow = totalImports - totalExports;
  const isImporting = netFlow > 0;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center glass p-4 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Imports</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {totalImports.toFixed(0)} MW
          </p>
        </div>
        <div className="text-center glass p-4 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Exports</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {totalExports.toFixed(0)} MW
          </p>
        </div>
        <div className="text-center glass p-4 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Net Flow</p>
          <p
            className={`text-2xl font-bold ${
              isImporting
                ? 'text-green-600 dark:text-green-400'
                : 'text-blue-600 dark:text-blue-400'
            }`}
          >
            {isImporting ? '+' : ''}{netFlow.toFixed(0)} MW
          </p>
        </div>
      </div>

      {/* Visual GB Center */}
      <div className="relative h-96 glass p-6 rounded-lg overflow-hidden">
        {/* GB in the center */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
              <span className="text-white font-bold text-xl">GB</span>
            </div>
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-blue-400"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </div>

        {/* Interconnector Flows */}
        {interconnectors.map((ic, index) => {
          const isImport = ic.flow > 0;
          const angle = (index / interconnectors.length) * 360;
          const radius = 140;

          // Calculate position on circle
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;

          return (
            <div key={ic.name}>
              {/* Country node */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="absolute top-1/2 left-1/2"
                style={{
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                }}
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center shadow-lg border-2 border-gray-300 dark:border-gray-600">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {ic.country}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        isImport ? 'text-green-600' : 'text-blue-600'
                      }`}
                    >
                      {Math.abs(ic.flow)}MW
                    </span>
                  </div>

                  {/* Animated flow line */}
                  <svg
                    className="absolute top-1/2 left-1/2 pointer-events-none"
                    style={{
                      width: Math.abs(x) * 2,
                      height: Math.abs(y) * 2,
                      transform: `translate(-50%, -50%) rotate(${
                        angle + 180
                      }deg)`,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id={`gradient-${ic.name}`}
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop
                          offset="0%"
                          stopColor={isImport ? '#10b981' : '#3b82f6'}
                          stopOpacity="0"
                        />
                        <stop
                          offset="50%"
                          stopColor={isImport ? '#10b981' : '#3b82f6'}
                          stopOpacity="0.8"
                        />
                        <stop
                          offset="100%"
                          stopColor={isImport ? '#10b981' : '#3b82f6'}
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>

                    {/* Flow particles */}
                    {[0, 1, 2].map((particleIndex) => (
                      <motion.circle
                        key={particleIndex}
                        r="4"
                        fill={isImport ? '#10b981' : '#3b82f6'}
                        initial={{
                          cx: isImport ? 0 : Math.abs(x) * 2,
                          cy: Math.abs(y),
                        }}
                        animate={{
                          cx: isImport ? Math.abs(x) * 2 : 0,
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: particleIndex * 0.6,
                          ease: "linear",
                        }}
                      />
                    ))}
                  </svg>

                  {/* Arrow indicator */}
                  <div
                    className="absolute top-1/2 left-1/2"
                    style={{
                      transform: `translate(calc(-50% + ${x / 2}px), calc(-50% + ${
                        y / 2
                      }px))`,
                    }}
                  >
                    <motion.div
                      animate={{
                        x: isImport ? [0, -5, 0] : [0, 5, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className={`${
                        isImport ? 'text-green-500' : 'text-blue-500'
                      }`}
                    >
                      {isImport ? '→' : '←'}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Detailed List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {interconnectors
          .sort((a, b) => Math.abs(b.flow) - Math.abs(a.flow))
          .map((ic, index) => {
            const isImport = ic.flow > 0;
            const utilization = (Math.abs(ic.flow) / ic.capacity) * 100;

            return (
              <motion.div
                key={ic.name}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="glass p-4 rounded-lg hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                      {ic.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {ic.country}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        isImport ? 'text-green-600' : 'text-blue-600'
                      }`}
                    >
                      {isImport ? '+' : ''}
                      {ic.flow.toFixed(0)} MW
                    </p>
                    <p className="text-xs text-gray-500">
                      {utilization.toFixed(0)}% capacity
                    </p>
                  </div>
                </div>

                {/* Utilization bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${utilization}%` }}
                    transition={{ duration: 1, delay: index * 0.05 }}
                    className={`h-full rounded-full ${
                      isImport
                        ? 'bg-gradient-to-r from-green-400 to-green-600'
                        : 'bg-gradient-to-r from-blue-400 to-blue-600'
                    }`}
                  />
                </div>

                {/* Direction label */}
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  {isImport ? '🡐 Importing from' : '🡒 Exporting to'} {ic.country}
                </p>
              </motion.div>
            );
          })}
      </div>
    </div>
  );
}
