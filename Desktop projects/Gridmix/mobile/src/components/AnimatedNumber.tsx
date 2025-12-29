import React, { useEffect, useRef } from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';

interface AnimatedNumberProps {
  value: number;
  style?: TextStyle;
  decimalPlaces?: number;
  prefix?: string;
  suffix?: string;
}

// Simple animated number display
export function AnimatedNumber({
  value,
  style,
  decimalPlaces = 0,
  prefix = '',
  suffix = '',
}: AnimatedNumberProps) {
  return (
    <Text style={[styles.default, style]}>
      {prefix}{value.toFixed(decimalPlaces)}{suffix}
    </Text>
  );
}

// Animated count-up effect
interface CountUpProps {
  value: number;
  style?: TextStyle;
  decimalPlaces?: number;
  prefix?: string;
  suffix?: string;
}

export function CountUp({
  value,
  style,
  decimalPlaces = 0,
  prefix = '',
  suffix = '',
}: CountUpProps) {
  const [displayValue, setDisplayValue] = React.useState(value);
  const previousValueRef = useRef(value);

  useEffect(() => {
    const startValue = previousValueRef.current;
    const diff = value - startValue;
    const steps = 20;
    const stepDuration = 400 / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(startValue + diff * eased);

      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
        previousValueRef.current = value;
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value]);

  const formatted = displayValue.toFixed(decimalPlaces);

  return (
    <Text style={[styles.default, style]}>
      {prefix}{formatted}{suffix}
    </Text>
  );
}

const styles = StyleSheet.create({
  default: {
    fontVariant: ['tabular-nums'],
  },
});
