import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  Pressable,
  ViewStyle,
  StyleSheet,
  StyleProp,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Animation style presets
export type AnimationStyle = 'spring' | 'bounce' | 'gentle';

const ANIMATION_CONFIGS: Record<AnimationStyle, { damping: number; stiffness: number }> = {
  spring: { damping: 15, stiffness: 400 },
  bounce: { damping: 8, stiffness: 300 },
  gentle: { damping: 20, stiffness: 200 },
};

interface HapticButtonProps extends TouchableOpacityProps {
  hapticType?: 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';
  scaleOnPress?: boolean;
  scaleAmount?: number;
  animationStyle?: AnimationStyle;
  highlightColor?: string;
}

export function HapticButton({
  hapticType = 'light',
  scaleOnPress = true,
  scaleAmount = 0.97,
  animationStyle = 'spring',
  highlightColor,
  onPress,
  style,
  children,
  ...props
}: HapticButtonProps) {
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);
  const config = ANIMATION_CONFIGS[animationStyle];

  const animatedStyle = useAnimatedStyle(() => {
    const baseStyle: ViewStyle = {
      transform: [{ scale: scale.value }],
    };

    if (highlightColor) {
      return {
        ...baseStyle,
        backgroundColor: interpolateColor(
          pressed.value,
          [0, 1],
          ['transparent', highlightColor + '20']
        ),
      };
    }

    return baseStyle;
  });

  const triggerHaptic = () => {
    switch (hapticType) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'selection':
        Haptics.selectionAsync();
        break;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
    }
  };

  const handlePressIn = () => {
    pressed.value = withSpring(1, config);
    if (scaleOnPress) {
      scale.value = withSpring(scaleAmount, config);
    }
  };

  const handlePressOut = () => {
    pressed.value = withSpring(0, config);
    if (scaleOnPress) {
      scale.value = withSpring(1, config);
    }
  };

  const handlePress = (e: Parameters<NonNullable<TouchableOpacityProps['onPress']>>[0]) => {
    triggerHaptic();
    onPress?.(e);
  };

  return (
    <AnimatedTouchable
      style={[animatedStyle, style]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      {...props}
    >
      {children}
    </AnimatedTouchable>
  );
}

interface HapticCardProps {
  hapticType?: 'light' | 'selection';
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  children?: React.ReactNode;
  animationStyle?: AnimationStyle;
  scaleAmount?: number;
}

export function HapticCard({
  hapticType = 'selection',
  onPress,
  style,
  children,
  animationStyle = 'gentle',
  scaleAmount = 0.98,
}: HapticCardProps) {
  const scale = useSharedValue(1);
  const config = ANIMATION_CONFIGS[animationStyle];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(scaleAmount, config);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, config);
  };

  const handlePress = () => {
    if (hapticType === 'selection') {
      Haptics.selectionAsync();
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  if (!onPress) {
    return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
  }

  return (
    <Pressable onPress={handlePress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>
    </Pressable>
  );
}

export const styles = StyleSheet.create({});
