import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, SHADOWS, RADIUS } from '@/constants/colors';
import { HapticCard, HapticButton } from './HapticButton';
import { CountUp } from './AnimatedNumber';

interface ExplainableMetricProps {
  value: string | number;
  label: string;
  unit?: string;
  explanation: string;
  comparison?: {
    value: string;
    trend: 'up' | 'down' | 'stable';
    context: string;
  };
  color?: string;
}

export function ExplainableMetric({
  value,
  label,
  unit,
  explanation,
  comparison,
  color = COLORS.text,
}: ExplainableMetricProps) {
  const [showExplanation, setShowExplanation] = useState(false);

  const getTrendIcon = () => {
    if (!comparison) return null;
    switch (comparison.trend) {
      case 'up':
        return <Ionicons name="trending-up" size={12} color={COLORS.error} />;
      case 'down':
        return <Ionicons name="trending-down" size={12} color={COLORS.success} />;
      default:
        return <Ionicons name="remove" size={12} color={COLORS.textMuted} />;
    }
  };

  const numericValue = typeof value === 'number' ? value : parseFloat(String(value));
  const isNumeric = !isNaN(numericValue);

  const handlePress = () => {
    Haptics.selectionAsync();
    setShowExplanation(true);
  };

  return (
    <>
      <HapticCard
        style={styles.container}
        onPress={handlePress}
        hapticType="selection"
      >
        {isNumeric ? (
          <CountUp value={numericValue} style={{ ...styles.value, color }} />
        ) : (
          <Text style={[styles.value, { color }]}>{value}</Text>
        )}
        {unit && <Text style={styles.unit}>{unit}</Text>}
        <Text style={styles.label}>{label}</Text>
        {comparison && (
          <View style={styles.comparisonRow}>
            {getTrendIcon()}
            <Text style={styles.comparisonText}>{comparison.value}</Text>
          </View>
        )}
      </HapticCard>

      <Modal
        visible={showExplanation}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExplanation(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowExplanation(false)}>
          <Animated.View
            entering={FadeInDown.duration(300).springify()}
            style={styles.modalContent}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{label}</Text>
                <HapticButton onPress={() => setShowExplanation(false)} hapticType="light">
                  <Ionicons name="close-circle" size={28} color={COLORS.textMuted} />
                </HapticButton>
              </View>

              <View style={styles.modalValueRow}>
                <Text style={[styles.modalValue, { color }]}>{value}</Text>
                {unit && <Text style={styles.modalUnit}>{unit}</Text>}
              </View>

              <Text style={styles.modalExplanation}>{explanation}</Text>

              {comparison && (
                <View style={styles.comparisonCard}>
                  <View style={styles.comparisonHeader}>
                    {getTrendIcon()}
                    <Text style={styles.comparisonLabel}>{comparison.value} vs usual</Text>
                  </View>
                  <Text style={styles.comparisonContext}>{comparison.context}</Text>
                </View>
              )}

              <HapticButton
                style={styles.closeButton}
                onPress={() => setShowExplanation(false)}
                hapticType="light"
              >
                <Text style={styles.closeButtonText}>Got it</Text>
              </HapticButton>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 16,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  unit: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  comparisonText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    ...SHADOWS.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
  },
  modalValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  modalValue: {
    fontSize: 42,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  modalUnit: {
    color: COLORS.textSecondary,
    fontSize: 18,
    marginLeft: 8,
    fontWeight: '500',
  },
  modalExplanation: {
    color: COLORS.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  comparisonCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: 16,
    marginBottom: 20,
  },
  comparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  comparisonLabel: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
  comparisonContext: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '600',
  },
});
