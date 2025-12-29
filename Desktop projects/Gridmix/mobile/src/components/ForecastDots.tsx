import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getCarbonIntensityColor } from '@/constants/colors';

interface ForecastPeriod {
  timestamp: string;
  forecast: number;
}

interface ForecastDotsProps {
  forecast: ForecastPeriod[];
  onPress?: () => void;
}

function getHourLabel(timestamp: string, index: number): string {
  if (index === 0) return 'Now';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function findBestTime(forecast: ForecastPeriod[]): string | null {
  if (!forecast || forecast.length === 0) return null;

  const next12Hours = forecast.slice(0, 24); // 30-min intervals = 12 hours
  const best = next12Hours.reduce((min, curr) =>
    curr.forecast < min.forecast ? curr : min
  );

  const bestDate = new Date(best.timestamp);
  return bestDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ForecastDots({ forecast, onPress }: ForecastDotsProps) {
  // Take every 2nd item to show hourly (data is 30-min intervals)
  const hourlyForecast = forecast
    .filter((_, index) => index % 2 === 0)
    .slice(0, 8);

  const bestTime = findBestTime(forecast);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Carbon Forecast</Text>
        <View style={styles.headerRight}>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
        </View>
      </View>

      <View style={styles.dotsContainer}>
        {hourlyForecast.map((period, index) => {
          const color = getCarbonIntensityColor(period.forecast);
          return (
            <View key={index} style={styles.dotColumn}>
              <View style={[styles.dot, { backgroundColor: color }]} />
              <Text style={styles.dotLabel}>
                {getHourLabel(period.timestamp, index)}
              </Text>
            </View>
          );
        })}
      </View>

      {bestTime && (
        <View style={styles.bestTimeRow}>
          <Ionicons name="time-outline" size={14} color={COLORS.success} />
          <Text style={styles.bestTimeText}>
            Cleanest time: <Text style={styles.bestTimeValue}>{bestTime}</Text>
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dotColumn: {
    alignItems: 'center',
    flex: 1,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginBottom: 6,
  },
  dotLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    textAlign: 'center',
  },
  bestTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  bestTimeText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  bestTimeValue: {
    color: COLORS.success,
    fontWeight: '600',
  },
});
