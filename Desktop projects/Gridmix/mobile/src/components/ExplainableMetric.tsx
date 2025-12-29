import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

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

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={() => setShowExplanation(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.value, { color }]}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
        <Text style={styles.label}>{label}</Text>
        {comparison && (
          <View style={styles.comparisonRow}>
            {getTrendIcon()}
            <Text style={styles.comparisonText}>{comparison.value}</Text>
          </View>
        )}
        <Ionicons
          name="information-circle-outline"
          size={14}
          color={COLORS.textMuted}
          style={styles.infoIcon}
        />
      </TouchableOpacity>

      <Modal
        visible={showExplanation}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExplanation(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowExplanation(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setShowExplanation(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
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

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowExplanation(false)}
            >
              <Text style={styles.closeButtonText}>Got it</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    position: 'relative',
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
  },
  unit: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  comparisonText: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
  infoIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  modalValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  modalValue: {
    fontSize: 36,
    fontWeight: '700',
  },
  modalUnit: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginLeft: 8,
  },
  modalExplanation: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  comparisonCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  comparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  comparisonLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  comparisonContext: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
