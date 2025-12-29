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

// App theme colors
export const COLORS = {
  // Primary
  primary: '#06B6D4',
  primaryDark: '#0891B2',

  // Background
  background: '#0f172a',
  backgroundLight: '#1e293b',
  surface: '#1e293b',
  surfaceLight: '#334155',

  // Text
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',

  // Status
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Borders
  border: '#334155',
  borderLight: '#475569',
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
