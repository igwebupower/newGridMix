'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { HistoricalData, formatTimestamp } from '@/lib/api';

interface IntensityChartProps {
  data: HistoricalData[];
  type?: 'line' | 'area';
}

export function IntensityChart({ data, type = 'area' }: IntensityChartProps) {
  const chartData = data.map(item => ({
    time: formatTimestamp(item.from),
    intensity: item.intensity.actual || item.intensity.forecast,
    forecast: item.intensity.forecast,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-3 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
            {payload[0].payload.time}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {payload[0].value} gCO₂/kWh
          </p>
        </div>
      );
    }
    return null;
  };

  const Chart = type === 'area' ? AreaChart : LineChart;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <Chart data={chartData}>
        <defs>
          <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0066ff" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#0066ff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 12 }}
          stroke="#666"
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          stroke="#666"
          label={{
            value: 'gCO₂/kWh',
            angle: -90,
            position: 'insideLeft',
            style: { fontSize: 12 },
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        {type === 'area' ? (
          <Area
            type="monotone"
            dataKey="intensity"
            stroke="#0066ff"
            strokeWidth={2}
            fill="url(#colorIntensity)"
            animationDuration={800}
          />
        ) : (
          <Line
            type="monotone"
            dataKey="intensity"
            stroke="#0066ff"
            strokeWidth={2}
            dot={false}
            animationDuration={800}
          />
        )}
      </Chart>
    </ResponsiveContainer>
  );
}
