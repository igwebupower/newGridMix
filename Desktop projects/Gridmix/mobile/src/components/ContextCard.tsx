import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

interface ContextCardProps {
  demand: number;
  demandChange: number;
  carbonIntensity: number;
  renewablePercent: number;
  windPercent: number;
  temperature?: number;
}

function generateInsight(props: ContextCardProps): { icon: keyof typeof Ionicons.glyphMap; message: string } {
  const { demandChange, carbonIntensity, renewablePercent, windPercent } = props;

  // High demand insight
  if (demandChange > 10) {
    return {
      icon: 'arrow-up-circle',
      message: `Demand is ${demandChange.toFixed(0)}% higher than usual. This often happens during cold weather or peak evening hours.`,
    };
  }

  // Low demand insight
  if (demandChange < -10) {
    return {
      icon: 'arrow-down-circle',
      message: `Demand is ${Math.abs(demandChange).toFixed(0)}% lower than usual. Typically seen during mild weather or off-peak times.`,
    };
  }

  // High wind insight
  if (windPercent > 40) {
    return {
      icon: 'cloudy',
      message: `Wind is providing ${windPercent.toFixed(0)}% of generation. Strong winds across the UK are keeping carbon intensity low.`,
    };
  }

  // Low renewables insight
  if (renewablePercent < 20) {
    return {
      icon: 'flame',
      message: `Renewables at just ${renewablePercent.toFixed(0)}%. Gas plants are meeting most demand due to low wind and solar output.`,
    };
  }

  // Very clean grid
  if (carbonIntensity < 100) {
    return {
      icon: 'leaf',
      message: `Very clean electricity right now at ${Math.round(carbonIntensity)} gCO2/kWh. Good time for high-energy tasks.`,
    };
  }

  // High carbon
  if (carbonIntensity > 300) {
    return {
      icon: 'alert-circle',
      message: `Carbon intensity is elevated at ${Math.round(carbonIntensity)} gCO2/kWh. Consider delaying non-essential energy use.`,
    };
  }

  // Default balanced insight
  return {
    icon: 'analytics',
    message: `Grid operating normally with ${renewablePercent.toFixed(0)}% renewables. Demand is typical for this time of day.`,
  };
}

export function ContextCard(props: ContextCardProps) {
  const insight = generateInsight(props);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={insight.icon} size={18} color={COLORS.primary} />
      </View>
      <Text style={styles.message}>{insight.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary + '15',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  iconContainer: {
    marginTop: 2,
  },
  message: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
});
