import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getCarbonIntensityColor, getCarbonIntensityLabel } from '@/constants/colors';

interface CarbonIntensityCardProps {
  intensity: number;
  trend?: 'up' | 'down' | 'stable';
}

export function CarbonIntensityCard({ intensity, trend }: CarbonIntensityCardProps) {
  const color = getCarbonIntensityColor(intensity);
  const label = getCarbonIntensityLabel(intensity);

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <Ionicons name="trending-up" size={20} color={COLORS.error} />;
      case 'down':
        return <Ionicons name="trending-down" size={20} color={COLORS.success} />;
      default:
        return <Ionicons name="remove" size={20} color={COLORS.textMuted} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Carbon Intensity</Text>
        {trend && getTrendIcon()}
      </View>

      <View style={styles.valueContainer}>
        <Text style={[styles.value, { color }]}>{Math.round(intensity)}</Text>
        <Text style={styles.unit}>gCO₂/kWh</Text>
      </View>

      <View style={[styles.badge, { backgroundColor: color + '20' }]}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={[styles.label, { color }]}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  value: {
    fontSize: 48,
    fontWeight: '700',
  },
  unit: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginLeft: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
});
