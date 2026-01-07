import { TextStyle } from 'react-native';

// Font weight constants
export const FONT_WEIGHTS = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
};

// Font size scale
export const FONT_SIZES = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

// Line height multipliers
export const LINE_HEIGHTS = {
  tight: 1.15,
  normal: 1.4,
  relaxed: 1.6,
} as const;

// Letter spacing values
export const LETTER_SPACING = {
  tighter: -0.8,
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1.0,
  widest: 1.5,
} as const;

// Pre-defined typography styles
export const TYPOGRAPHY: Record<string, TextStyle> = {
  // Display - Large hero text
  display: {
    fontSize: FONT_SIZES['5xl'],
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: LETTER_SPACING.tighter,
    lineHeight: FONT_SIZES['5xl'] * LINE_HEIGHTS.tight,
  },

  // Headings
  h1: {
    fontSize: FONT_SIZES['4xl'],
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: LETTER_SPACING.tight,
    lineHeight: FONT_SIZES['4xl'] * LINE_HEIGHTS.tight,
  },
  h2: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: LETTER_SPACING.tight,
    lineHeight: FONT_SIZES['3xl'] * LINE_HEIGHTS.tight,
  },
  h3: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: FONT_SIZES['2xl'] * LINE_HEIGHTS.normal,
  },
  h4: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: FONT_SIZES.xl * LINE_HEIGHTS.normal,
  },

  // Body text
  bodyLarge: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: FONT_SIZES.lg * LINE_HEIGHTS.relaxed,
  },
  body: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: FONT_SIZES.base * LINE_HEIGHTS.relaxed,
  },
  bodySmall: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: FONT_SIZES.sm * LINE_HEIGHTS.normal,
  },

  // Labels and captions
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    textTransform: 'uppercase',
    letterSpacing: LETTER_SPACING.wider,
  },
  labelSmall: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    textTransform: 'uppercase',
    letterSpacing: LETTER_SPACING.widest,
  },
  caption: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
    letterSpacing: LETTER_SPACING.wide,
  },

  // Metrics and numbers - use tabular figures for alignment
  metricLarge: {
    fontSize: FONT_SIZES['5xl'],
    fontWeight: FONT_WEIGHTS.bold,
    fontVariant: ['tabular-nums'],
    letterSpacing: LETTER_SPACING.tight,
  },
  metric: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: FONT_WEIGHTS.bold,
    fontVariant: ['tabular-nums'],
    letterSpacing: LETTER_SPACING.tight,
  },
  metricSmall: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    fontVariant: ['tabular-nums'],
  },
  metricUnit: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.medium,
    fontVariant: ['tabular-nums'],
  },

  // Button text
  button: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    letterSpacing: LETTER_SPACING.wide,
  },
  buttonSmall: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    letterSpacing: LETTER_SPACING.wide,
  },
};
