import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';

interface SkeletonProps {
  width: DimensionValue;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width, height, borderRadius = 8, style }: SkeletonProps) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1200 }),
      -1,
      false
    );
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.6, 0.3]),
  }));

  return (
    <View style={[styles.skeleton, { width, height, borderRadius }, style]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: COLORS.surfaceLight },
          animatedStyle,
        ]}
      />
    </View>
  );
}

interface SkeletonCardProps {
  style?: ViewStyle;
}

export function SkeletonCard({ style }: SkeletonCardProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardHeader}>
        <Skeleton width={100} height={14} />
        <Skeleton width={80} height={28} borderRadius={14} />
      </View>
      <Skeleton width="60%" height={12} style={styles.spacingTop} />
      <View style={styles.cardFooter}>
        <Skeleton width={80} height={10} />
      </View>
    </View>
  );
}

export function SkeletonStats() {
  return (
    <View style={styles.statsRow}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.statItem}>
          <Skeleton width={48} height={32} borderRadius={8} />
          <Skeleton width={56} height={10} style={styles.spacingTopSmall} />
        </View>
      ))}
    </View>
  );
}

export function SkeletonBars() {
  return (
    <View style={styles.barsCard}>
      <Skeleton width={120} height={16} style={styles.spacingBottom} />
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={styles.barRow}>
          <Skeleton width={60} height={12} />
          <View style={styles.barTrack}>
            <Skeleton width={`${Math.random() * 60 + 20}%`} height={8} borderRadius={4} />
          </View>
          <Skeleton width={32} height={12} />
        </View>
      ))}
    </View>
  );
}

export function DashboardSkeleton() {
  return (
    <View style={styles.container}>
      <SkeletonCard />
      <SkeletonStats />
      <SkeletonCard style={styles.spacingTop} />
      <SkeletonBars />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingBottom: 32,
  },
  skeleton: {
    backgroundColor: COLORS.surfaceLight,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardFooter: {
    marginTop: 16,
  },
  spacingTop: {
    marginTop: 12,
  },
  spacingTopSmall: {
    marginTop: 6,
  },
  spacingBottom: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginVertical: 8,
  },
  statItem: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  barsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  barTrack: {
    flex: 1,
    marginHorizontal: 12,
  },
});
