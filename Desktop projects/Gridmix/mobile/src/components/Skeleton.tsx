import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { RADIUS, GRADIENTS } from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';

interface SkeletonProps {
  width: DimensionValue;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width, height, borderRadius = 8, style }: SkeletonProps) {
  const { colors, isDark } = useTheme();
  const translateX = useSharedValue(-1);

  // Calculate numeric width for animation (fallback to 200 for percentage widths)
  const numericWidth = useMemo(() => {
    if (typeof width === 'number') return width;
    return 200; // Default for percentage widths
  }, [width]);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      false
    );
  }, [translateX]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value * numericWidth * 2 }],
  }));

  const shimmerColors = isDark ? GRADIENTS.shimmer : GRADIENTS.shimmerLight;

  return (
    <View
      style={[
        styles.skeleton,
        { width, height, borderRadius, backgroundColor: colors.surfaceLight },
        style,
      ]}
    >
      <Animated.View style={[styles.shimmerContainer, shimmerStyle]}>
        <LinearGradient
          colors={shimmerColors as unknown as string[]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.shimmerGradient, { width: numericWidth }]}
        />
      </Animated.View>
    </View>
  );
}

interface SkeletonCardProps {
  style?: ViewStyle;
}

export function SkeletonCard({ style }: SkeletonCardProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface }, style]}>
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
  const { colors } = useTheme();
  return (
    <View style={styles.statsRow}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={[styles.statItem, { backgroundColor: colors.surface }]}>
          <Skeleton width={48} height={32} borderRadius={8} />
          <Skeleton width={56} height={10} style={styles.spacingTopSmall} />
        </View>
      ))}
    </View>
  );
}

export function SkeletonBars() {
  const { colors } = useTheme();
  return (
    <View style={[styles.barsCard, { backgroundColor: colors.surface }]}>
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
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
    paddingBottom: 32,
  },
  skeleton: {
    overflow: 'hidden',
  },
  shimmerContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  shimmerGradient: {
    height: '100%',
  },
  card: {
    borderRadius: RADIUS.lg,
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
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  barsCard: {
    borderRadius: RADIUS.lg,
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
