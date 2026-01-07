import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { RADIUS } from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import { HapticButton } from './HapticButton';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      <Animated.View
        entering={FadeInUp.delay(100).duration(400)}
        style={[styles.iconContainer, { backgroundColor: colors.surfaceLight }]}
      >
        <Ionicons name={icon} size={48} color={colors.textMuted} />
      </Animated.View>

      <Animated.Text
        entering={FadeInUp.delay(200).duration(400)}
        style={[styles.title, { color: colors.text }]}
      >
        {title}
      </Animated.Text>

      <Animated.Text
        entering={FadeInUp.delay(300).duration(400)}
        style={[styles.description, { color: colors.textSecondary }]}
      >
        {description}
      </Animated.Text>

      {actionLabel && onAction && (
        <Animated.View entering={FadeInUp.delay(400).duration(400)}>
          <HapticButton
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={onAction}
            hapticType="light"
            animationStyle="bounce"
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>{actionLabel}</Text>
          </HapticButton>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  button: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EmptyState;
