import { CARBON_THRESHOLDS } from '@/constants/colors';
import type { EnergyMix } from '@/types/energy';

/**
 * Calculate renewable percentage from energy mix
 */
export function calculateRenewablePercentage(energyMix: EnergyMix, total: number): number {
  if (total <= 0) return 0;

  const renewables = energyMix.wind + energyMix.solar + energyMix.hydro + energyMix.biomass;
  return (renewables / total) * 100;
}

/**
 * Calculate low carbon percentage (includes nuclear)
 */
export function calculateLowCarbonPercentage(energyMix: EnergyMix, total: number): number {
  if (total <= 0) return 0;

  const lowCarbon = energyMix.wind + energyMix.solar + energyMix.hydro +
                    energyMix.biomass + energyMix.nuclear;
  return (lowCarbon / total) * 100;
}

/**
 * Calculate fossil fuel percentage
 */
export function calculateFossilFuelPercentage(energyMix: EnergyMix, total: number): number {
  if (total <= 0) return 0;

  const fossil = energyMix.gas + energyMix.coal;
  return (fossil / total) * 100;
}

/**
 * Get carbon intensity index
 */
export function getCarbonIntensityIndex(intensity: number): 'very low' | 'low' | 'moderate' | 'high' | 'very high' {
  if (intensity < CARBON_THRESHOLDS.veryLow) return 'very low';
  if (intensity < CARBON_THRESHOLDS.low) return 'low';
  if (intensity < CARBON_THRESHOLDS.moderate) return 'moderate';
  if (intensity < CARBON_THRESHOLDS.high) return 'high';
  return 'very high';
}

/**
 * Get carbon intensity icon name
 */
export function getCarbonIntensityIcon(intensity: number): string {
  if (intensity < CARBON_THRESHOLDS.veryLow) return 'sunny';
  if (intensity < CARBON_THRESHOLDS.low) return 'partly-sunny';
  if (intensity < CARBON_THRESHOLDS.moderate) return 'cloudy';
  if (intensity < CARBON_THRESHOLDS.high) return 'rainy';
  return 'thunderstorm';
}

/**
 * Calculate potential CO2 savings
 */
export function calculateCO2Savings(
  currentIntensity: number,
  optimalIntensity: number,
  energyUsageKwh: number
): number {
  const difference = currentIntensity - optimalIntensity;
  return Math.max(0, (difference * energyUsageKwh) / 1000); // Returns kg CO2
}

/**
 * Convert CO2 to tree equivalents
 */
export function co2ToTrees(kgCO2: number): number {
  // Average tree absorbs ~21kg CO2 per year
  return kgCO2 / 21;
}

/**
 * Convert CO2 to driving miles equivalent
 */
export function co2ToDrivingMiles(kgCO2: number): number {
  // Average car emits ~0.21kg CO2 per km (0.34kg per mile)
  return kgCO2 / 0.34;
}

/**
 * Get energy usage tips based on current intensity
 */
export function getEnergyTips(intensity: number): string[] {
  if (intensity < CARBON_THRESHOLDS.veryLow) {
    return [
      'Great time to charge your EV!',
      'Run energy-intensive appliances now',
      'Perfect for running the washing machine',
    ];
  }

  if (intensity < CARBON_THRESHOLDS.low) {
    return [
      'Good time for moderate energy use',
      'Consider charging devices now',
    ];
  }

  if (intensity < CARBON_THRESHOLDS.moderate) {
    return [
      'Try to delay high-energy tasks if possible',
      'Use energy-saving modes where available',
    ];
  }

  return [
    'Avoid running dishwashers and washing machines',
    'Delay EV charging if you can',
    'Switch off unnecessary lights and devices',
  ];
}
