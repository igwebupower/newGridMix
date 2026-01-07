import React from 'react';
import { View, ViewStyle, StyleSheet, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated from 'react-native-reanimated';
import { SHADOWS, RADIUS, GRADIENTS } from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'highlighted';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  highlightColor?: string;
  style?: StyleProp<ViewStyle>;
  entering?: any;
  noPadding?: boolean;
}

export function Card({
  children,
  variant = 'default',
  highlightColor,
  style,
  entering,
  noPadding = false,
}: CardProps) {
  const { colors, isDark } = useTheme();

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          ...SHADOWS.large,
          backgroundColor: colors.surfaceElevated,
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        };
      case 'outlined':
        return {
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: 'transparent',
        };
      case 'highlighted':
        return {
          backgroundColor: (highlightColor || colors.primary) + '15',
          borderWidth: 1,
          borderColor: (highlightColor || colors.primary) + '30',
        };
      default:
        return {
          ...SHADOWS.small,
          backgroundColor: colors.surface,
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
        };
    }
  };

  const containerStyle = [
    styles.container,
    getVariantStyle(),
    noPadding && styles.noPadding,
    style,
  ];

  const gradientColors = isDark ? GRADIENTS.cardDark : GRADIENTS.cardLight;
  const showGradient = variant === 'default' || variant === 'elevated';

  // Use Animated.View if entering animation is provided
  if (entering) {
    return (
      <Animated.View entering={entering} style={containerStyle}>
        {showGradient && (
          <LinearGradient
            colors={gradientColors as unknown as string[]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        )}
        {children}
      </Animated.View>
    );
  }

  return (
    <View style={containerStyle}>
      {showGradient && (
        <LinearGradient
          colors={gradientColors as unknown as string[]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.lg,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    borderWidth: 1,
  },
  noPadding: {
    padding: 0,
  },
});

export default Card;
