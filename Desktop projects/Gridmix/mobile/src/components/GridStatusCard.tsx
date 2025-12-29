import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS } from '@/constants/colors';
import { HapticCard } from './HapticButton';

type GridStatus = 'normal' | 'tight' | 'critical';

interface GridStatusCardProps {
  demand: number;
  supply: number;
  lastUpdated: Date;
  onExplain?: () => void;
}

function getGridStatus(demand: number, supply: number): GridStatus {
  const margin = ((supply - demand) / supply) * 100;
  if (margin > 10) return 'normal';
  if (margin > 5) return 'tight';
  return 'critical';
}

function getStatusConfig(status: GridStatus) {
  switch (status) {
    case 'normal':
      return {
        color: COLORS.success,
        icon: 'checkmark-circle' as const,
        label: 'NORMAL',
        description: 'Grid operating normally',
      };
    case 'tight':
      return {
        color: '#F59E0B',
        icon: 'alert-circle' as const,
        label: 'TIGHT',
        description: 'Margins below normal',
      };
    case 'critical':
      return {
        color: COLORS.error,
        icon: 'warning' as const,
        label: 'CRITICAL',
        description: 'Grid under stress',
      };
  }
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Over an hour ago';
}

export function GridStatusCard({ demand, supply, lastUpdated, onExplain }: GridStatusCardProps) {
  const status = getGridStatus(demand, supply);
  const config = getStatusConfig(status);

  return (
    <Animated.View entering={FadeIn.duration(400)}>
      <HapticCard
        style={styles.container}
        onPress={onExplain}
        hapticType="selection"
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
            </View>
            <Text style={styles.title}>UK GRID</Text>
            {onExplain && (
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: config.color + '20' }]}>
            <Ionicons name={config.icon} size={16} color={config.color} />
            <Text style={[styles.statusLabel, { color: config.color }]}>{config.label}</Text>
          </View>
        </View>

        <Text style={styles.description}>{config.description}</Text>

        <View style={styles.timestampRow}>
          <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
          <Text style={styles.timestamp}>Updated {formatTimeAgo(lastUpdated)}</Text>
        </View>
      </HapticCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    ...SHADOWS.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  title: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    gap: 6,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: 15,
    marginBottom: 14,
    lineHeight: 20,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timestamp: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
});
