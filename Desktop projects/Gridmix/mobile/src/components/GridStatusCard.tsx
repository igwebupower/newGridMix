import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

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
    <TouchableOpacity
      style={styles.container}
      onPress={onExplain}
      activeOpacity={onExplain ? 0.7 : 1}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>UK GRID</Text>
          {onExplain && (
            <Ionicons name="information-circle-outline" size={18} color={COLORS.textMuted} />
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
    </TouchableOpacity>
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
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 12,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timestamp: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
});
