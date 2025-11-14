'use client';

import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { SolarIntradayData, getTodaysPeak } from '@/lib/api';

interface SolarIntradayChartProps {
  todayData: SolarIntradayData[];
  yesterdayData?: SolarIntradayData[];
}

export function SolarIntradayChart({ todayData, yesterdayData }: SolarIntradayChartProps) {
  // Format data for chart
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Combine today and yesterday data
  const chartData = todayData.map((item, index) => {
    const yesterdayItem = yesterdayData && yesterdayData[index];
    return {
      time: formatTime(item.datetime),
      fullTime: item.datetime,
      today: item.generation_mw,
      yesterday: yesterdayItem ? yesterdayItem.generation_mw : null,
    };
  });

  // Get today's peak
  const peak = getTodaysPeak(todayData);
  const currentTime = new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-3 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
            {payload[0].payload.time}
          </p>
          <p className="text-sm text-yellow-600 dark:text-yellow-400 font-semibold">
            Today: {payload[0].value.toFixed(0)} MW
          </p>
          {payload[1] && payload[1].value && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Yesterday: {payload[1].value.toFixed(0)} MW
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const maxValue = Math.max(
    ...todayData.map(d => d.generation_mw),
    ...(yesterdayData?.map(d => d.generation_mw) || [0])
  );

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass p-4 rounded-lg text-center"
        >
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {todayData.length > 0 ? todayData[todayData.length - 1].generation_mw.toFixed(0) : '0'} MW
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass p-4 rounded-lg text-center"
        >
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Today&apos;s Peak</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {peak.peak_mw.toFixed(0)} MW
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            at {peak.peak_time || '--:--'}
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass p-4 rounded-lg text-center"
        >
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Capacity</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {((peak.peak_mw / 16000) * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            of 16 GW installed
          </p>
        </motion.div>
      </div>

      {/* Chart */}
      <div className="relative">
        {/* Sunrise/Sunset indicators */}
        <div className="absolute top-0 left-0 right-0 flex justify-between px-12 -mt-2 z-10 pointer-events-none">
          <div className="flex items-center space-x-1 text-xs text-orange-500">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
            <span>Sunrise</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-purple-500">
            <span>Sunset</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="solarGradientToday" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8} />
                <stop offset="50%" stopColor="#fb923c" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="solarGradientYesterday" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9ca3af" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#9ca3af" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11 }}
              stroke="#666"
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11 }}
              stroke="#666"
              label={{
                value: 'Generation (MW)',
                angle: -90,
                position: 'insideLeft',
                style: { fontSize: 11 },
              }}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Current time marker */}
            <ReferenceLine
              x={currentTime}
              stroke="#0066ff"
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{
                value: 'Now',
                position: 'top',
                fill: '#0066ff',
                fontSize: 11,
              }}
            />

            {/* Yesterday's curve (background) */}
            {yesterdayData && yesterdayData.length > 0 && (
              <Area
                type="monotone"
                dataKey="yesterday"
                stroke="#9ca3af"
                strokeWidth={1}
                strokeDasharray="4 4"
                fill="url(#solarGradientYesterday)"
                animationDuration={800}
              />
            )}

            {/* Today's curve (foreground) */}
            <Area
              type="monotone"
              dataKey="today"
              stroke="#f59e0b"
              strokeWidth={3}
              fill="url(#solarGradientToday)"
              animationDuration={1200}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex justify-center items-center space-x-6 mt-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-0.5 bg-yellow-500" />
            <span className="text-gray-600 dark:text-gray-400">Today</span>
          </div>
          {yesterdayData && yesterdayData.length > 0 && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-0.5 bg-gray-400 border-dashed" style={{ borderTop: '1px dashed' }} />
              <span className="text-gray-600 dark:text-gray-400">Yesterday</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-0.5 bg-blue-500 border-dashed" style={{ borderTop: '2px dashed' }} />
            <span className="text-gray-600 dark:text-gray-400">Current Time</span>
          </div>
        </div>
      </div>

      {/* Attribution */}
      <p className="text-xs text-center text-gray-500 dark:text-gray-400">
        Accurate solar data from{' '}
        <a
          href="https://www.solar.sheffield.ac.uk/pvlive/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-yellow-600 hover:text-yellow-700 transition-colors"
        >
          Sheffield Solar PVLive
        </a>
      </p>
    </div>
  );
}
