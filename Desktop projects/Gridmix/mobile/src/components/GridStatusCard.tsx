import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { SHADOWS, RADIUS } from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
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

// Status colors (hardcoded since this is called outside hook context)
const STATUS_COLORS = {
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
};

function getStatusConfig(status: GridStatus) {
  switch (status) {
    case 'normal':
      return {
        color: STATUS_COLORS.success,
        icon: 'checkmark-circle' as const,
        label: 'NORMAL',
        description: 'Grid operating normally',
      };
    case 'tight':
      return {
        color: STATUS_COLORS.warning,
        icon: 'alert-circle' as const,
        label: 'TIGHT',
        description: 'Margins below normal',
      };
    case 'critical':
      return {
        color: STATUS_COLORS.error,
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

// Animated pulsing dot component for live indicator
function PulsingDot({ color }: { color: string }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 800, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.in(Easing.ease) })
      ),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      false
    );
  }, [scale, opacity]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.liveIndicator, { backgroundColor: color + '30' }]}>
      <Animated.View style={[styles.liveDotOuter, { backgroundColor: color + '40' }, pulseStyle]} />
      <View style={[styles.liveDotInner, { backgroundColor: color }]} />
    </View>
  );
}

export function GridStatusCard({ demand, supply, lastUpdated, onExplain }: GridStatusCardProps) {
  const { colors } = useTheme();
  const status = getGridStatus(demand, supply);
  const config = getStatusConfig(status);

  return (
    <Animated.View entering={FadeIn.duration(400)}>
      <HapticCard
        style={[styles.container, { backgroundColor: colors.surface }]}
        onPress={onExplain}
        hapticType="selection"
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <PulsingDot color={colors.success} />
            <Text style={[styles.title, { color: colors.text }]}>UK GRID</Text>
            {onExplain && (
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: config.color + '20' }]}>
            <Ionicons name={config.icon} size={16} color={config.color} />
            <Text style={[styles.statusLabel, { color: config.color }]}>{config.label}</Text>
          </View>
        </View>

        <Text style={[styles.description, { color: colors.textSecondary }]}>{config.description}</Text>

        <View style={styles.timestampRow}>
          <Ionicons name="time-outline" size={12} color={colors.textMuted} />
          <Text style={[styles.timestamp, { color: colors.textMuted }]}>Updated {formatTimeAgo(lastUpdated)}</Text>
        </View>
      </HapticCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
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
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveDotOuter: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  liveDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
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
    fontSize: 12,
  },
});
