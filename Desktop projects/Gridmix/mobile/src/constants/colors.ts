// Interconnector flow colors
export const INTERCONNECTOR_COLORS = {
  import: '#3B82F6',      // Blue - electricity coming in
  export: '#10B981',      // Green - electricity going out
  importLight: '#3B82F620',
  exportLight: '#10B98120',
} as const;

// Energy source colors (matching web app)
export const ENERGY_COLORS = {
  wind: '#06B6D4',      // Cyan
  solar: '#F59E0B',     // Amber
  nuclear: '#6366F1',   // Indigo
  gas: '#64748B',       // Slate
  coal: '#374151',      // Gray
  hydro: '#0EA5E9',     // Sky
  biomass: '#22C55E',   // Green
  imports: '#8B5CF6',   // Violet
  other: '#94A3B8',     // Slate light
} as const;

// Carbon intensity colors
export const CARBON_INTENSITY_COLORS = {
  veryLow: '#22C55E',   // Green - < 50g
  low: '#84CC16',       // Lime - 50-100g
  moderate: '#F59E0B',  // Amber - 100-200g
  high: '#F97316',      // Orange - 200-300g
  veryHigh: '#EF4444',  // Red - > 300g
} as const;

// Dark theme colors
export const DARK_COLORS = {
  // Primary
  primary: '#06B6D4',
  primaryDark: '#0891B2',
  primaryLight: '#22D3EE',

  // Background
  background: '#0f172a',
  backgroundLight: '#1e293b',
  surface: '#1e293b',
  surfaceLight: '#334155',
  surfaceElevated: '#273549',

  // Text
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#8B99AD',  // Improved contrast (5.2:1 ratio)

  // Status
  success: '#22C55E',
  successLight: '#22C55E20',
  warning: '#F59E0B',
  warningLight: '#F59E0B20',
  error: '#EF4444',
  errorLight: '#EF444420',
  info: '#3B82F6',
  infoLight: '#3B82F620',

  // Borders
  border: '#334155',
  borderLight: '#475569',
} as const;

// Light theme colors
export const LIGHT_COLORS = {
  // Primary
  primary: '#0891B2',
  primaryDark: '#0E7490',
  primaryLight: '#06B6D4',

  // Background
  background: '#F8FAFC',
  backgroundLight: '#F1F5F9',
  surface: '#FFFFFF',
  surfaceLight: '#F1F5F9',
  surfaceElevated: '#FFFFFF',

  // Text
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',  // Improved contrast for light theme

  // Status
  success: '#16A34A',
  successLight: '#16A34A20',
  warning: '#D97706',
  warningLight: '#D9770620',
  error: '#DC2626',
  errorLight: '#DC262620',
  info: '#2563EB',
  infoLight: '#2563EB20',

  // Borders
  border: '#E2E8F0',
  borderLight: '#CBD5E1',
} as const;

// Default export for backward compatibility
export const COLORS = DARK_COLORS;

// Modern shadow styles for iOS
export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 4,
  }),
  colored: (color: string, intensity: 'light' | 'medium' | 'strong' = 'medium') => ({
    shadowColor: color,
    shadowOffset: {
      width: 0,
      height: intensity === 'light' ? 4 : intensity === 'medium' ? 8 : 12,
    },
    shadowOpacity: intensity === 'light' ? 0.15 : intensity === 'medium' ? 0.25 : 0.35,
    shadowRadius: intensity === 'light' ? 8 : intensity === 'medium' ? 16 : 24,
    elevation: intensity === 'light' ? 3 : intensity === 'medium' ? 6 : 9,
  }),
};

// Gradient presets for cards and overlays
export const GRADIENTS = {
  // Card overlay gradients (subtle depth)
  cardDark: ['rgba(255,255,255,0.03)', 'transparent'] as const,
  cardLight: ['rgba(0,0,0,0.01)', 'transparent'] as const,
  // Highlight gradients
  primary: ['rgba(6,182,212,0.15)', 'rgba(6,182,212,0)'] as const,
  success: ['rgba(34,197,94,0.15)', 'rgba(34,197,94,0)'] as const,
  warning: ['rgba(245,158,11,0.15)', 'rgba(245,158,11,0)'] as const,
  error: ['rgba(239,68,68,0.15)', 'rgba(239,68,68,0)'] as const,
  // Shimmer effect
  shimmer: ['transparent', 'rgba(255,255,255,0.08)', 'transparent'] as const,
  shimmerLight: ['transparent', 'rgba(0,0,0,0.04)', 'transparent'] as const,
} as const;

// Icon size scale
export const ICON_SIZES = {
  xs: 14,
  sm: 18,
  md: 22,
  lg: 28,
  xl: 36,
  xxl: 48,
} as const;

// Modern border radius
export const RADIUS = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999,
} as const;

// Spacing scale
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Carbon intensity thresholds (gCO2/kWh)
export const CARBON_THRESHOLDS = {
  veryLow: 50,
  low: 100,
  moderate: 200,
  high: 300,
} as const;

export function getCarbonIntensityColor(intensity: number): string {
  if (intensity < CARBON_THRESHOLDS.veryLow) return CARBON_INTENSITY_COLORS.veryLow;
  if (intensity < CARBON_THRESHOLDS.low) return CARBON_INTENSITY_COLORS.low;
  if (intensity < CARBON_THRESHOLDS.moderate) return CARBON_INTENSITY_COLORS.moderate;
  if (intensity < CARBON_THRESHOLDS.high) return CARBON_INTENSITY_COLORS.high;
  return CARBON_INTENSITY_COLORS.veryHigh;
}

export function getCarbonIntensityLabel(intensity: number): string {
  if (intensity < CARBON_THRESHOLDS.veryLow) return 'Very Low';
  if (intensity < CARBON_THRESHOLDS.low) return 'Low';
  if (intensity < CARBON_THRESHOLDS.moderate) return 'Moderate';
  if (intensity < CARBON_THRESHOLDS.high) return 'High';
  return 'Very High';
}
