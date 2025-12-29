import {
  getCarbonIntensityColor,
  getCarbonIntensityLabel,
  CARBON_THRESHOLDS,
  CARBON_INTENSITY_COLORS,
} from '@/constants/colors';

describe('Carbon Intensity Utils', () => {
  describe('getCarbonIntensityColor', () => {
    it('returns veryLow color for intensity below 50', () => {
      expect(getCarbonIntensityColor(0)).toBe(CARBON_INTENSITY_COLORS.veryLow);
      expect(getCarbonIntensityColor(25)).toBe(CARBON_INTENSITY_COLORS.veryLow);
      expect(getCarbonIntensityColor(49)).toBe(CARBON_INTENSITY_COLORS.veryLow);
    });

    it('returns low color for intensity 50-99', () => {
      expect(getCarbonIntensityColor(50)).toBe(CARBON_INTENSITY_COLORS.low);
      expect(getCarbonIntensityColor(75)).toBe(CARBON_INTENSITY_COLORS.low);
      expect(getCarbonIntensityColor(99)).toBe(CARBON_INTENSITY_COLORS.low);
    });

    it('returns moderate color for intensity 100-199', () => {
      expect(getCarbonIntensityColor(100)).toBe(CARBON_INTENSITY_COLORS.moderate);
      expect(getCarbonIntensityColor(150)).toBe(CARBON_INTENSITY_COLORS.moderate);
      expect(getCarbonIntensityColor(199)).toBe(CARBON_INTENSITY_COLORS.moderate);
    });

    it('returns high color for intensity 200-299', () => {
      expect(getCarbonIntensityColor(200)).toBe(CARBON_INTENSITY_COLORS.high);
      expect(getCarbonIntensityColor(250)).toBe(CARBON_INTENSITY_COLORS.high);
      expect(getCarbonIntensityColor(299)).toBe(CARBON_INTENSITY_COLORS.high);
    });

    it('returns veryHigh color for intensity 300+', () => {
      expect(getCarbonIntensityColor(300)).toBe(CARBON_INTENSITY_COLORS.veryHigh);
      expect(getCarbonIntensityColor(400)).toBe(CARBON_INTENSITY_COLORS.veryHigh);
      expect(getCarbonIntensityColor(1000)).toBe(CARBON_INTENSITY_COLORS.veryHigh);
    });

    it('handles edge cases', () => {
      expect(getCarbonIntensityColor(-10)).toBe(CARBON_INTENSITY_COLORS.veryLow);
      expect(getCarbonIntensityColor(0)).toBe(CARBON_INTENSITY_COLORS.veryLow);
    });
  });

  describe('getCarbonIntensityLabel', () => {
    it('returns correct labels for each threshold', () => {
      expect(getCarbonIntensityLabel(25)).toBe('Very Low');
      expect(getCarbonIntensityLabel(75)).toBe('Low');
      expect(getCarbonIntensityLabel(150)).toBe('Moderate');
      expect(getCarbonIntensityLabel(250)).toBe('High');
      expect(getCarbonIntensityLabel(350)).toBe('Very High');
    });

    it('handles boundary values correctly', () => {
      expect(getCarbonIntensityLabel(49.9)).toBe('Very Low');
      expect(getCarbonIntensityLabel(50)).toBe('Low');
      expect(getCarbonIntensityLabel(100)).toBe('Moderate');
      expect(getCarbonIntensityLabel(200)).toBe('High');
      expect(getCarbonIntensityLabel(300)).toBe('Very High');
    });
  });

  describe('CARBON_THRESHOLDS', () => {
    it('has correct threshold values', () => {
      expect(CARBON_THRESHOLDS.veryLow).toBe(50);
      expect(CARBON_THRESHOLDS.low).toBe(100);
      expect(CARBON_THRESHOLDS.moderate).toBe(200);
      expect(CARBON_THRESHOLDS.high).toBe(300);
    });

    it('thresholds are in ascending order', () => {
      expect(CARBON_THRESHOLDS.veryLow).toBeLessThan(CARBON_THRESHOLDS.low);
      expect(CARBON_THRESHOLDS.low).toBeLessThan(CARBON_THRESHOLDS.moderate);
      expect(CARBON_THRESHOLDS.moderate).toBeLessThan(CARBON_THRESHOLDS.high);
    });
  });
});
