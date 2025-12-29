import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { useAppStore } from '@/stores/appStore';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const gridmixLogo = require('../../assets/images/gridmix-logo.png');

interface OnboardingSlide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  description: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'flash',
    iconColor: COLORS.primary,
    title: 'Welcome to GridMix',
    description:
      'Track real-time carbon intensity and energy mix from the UK electricity grid, updated every 5 minutes.',
  },
  {
    id: '2',
    icon: 'sunny',
    iconColor: '#22C55E',
    title: 'Find the Greenest Times',
    description:
      'Our 48-hour forecast shows you when carbon intensity will be lowest, so you can plan your energy use.',
  },
  {
    id: '3',
    icon: 'notifications',
    iconColor: '#F59E0B',
    title: 'Get Notified',
    description:
      'Receive alerts when carbon intensity drops below your threshold. Perfect for EV charging and laundry.',
  },
  {
    id: '4',
    icon: 'leaf',
    iconColor: '#22C55E',
    title: 'Make an Impact',
    description:
      'Track your carbon-smart actions and see how much CO₂ you\'ve avoided. Every little helps!',
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { setFirstLaunchComplete } = useAppStore();

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setFirstLaunchComplete();
    onComplete();
  };

  const currentSlide = SLIDES[currentIndex];
  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      {/* Skip button */}
      {!isLastSlide && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Content */}
      <View style={styles.content}>
        {currentIndex === 0 ? (
          <Image
            source={gridmixLogo}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="GridMix logo"
          />
        ) : (
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: currentSlide.iconColor + '20' },
            ]}
          >
            <Ionicons
              name={currentSlide.icon}
              size={64}
              color={currentSlide.iconColor}
            />
          </View>
        )}

        <Text style={styles.title}>{currentSlide.title}</Text>
        <Text style={styles.description}>{currentSlide.description}</Text>
      </View>

      {/* Pagination dots */}
      <View style={styles.pagination}>
        {SLIDES.map((slide, index) => (
          <View
            key={slide.id}
            style={[
              styles.dot,
              index === currentIndex && styles.dotActive,
            ]}
          />
        ))}
      </View>

      {/* Action button */}
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>
          {isLastSlide ? 'Get Started' : 'Next'}
        </Text>
        <Ionicons
          name={isLastSlide ? 'checkmark' : 'arrow-forward'}
          size={20}
          color={COLORS.text}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 1,
  },
  skipText: {
    color: COLORS.textMuted,
    fontSize: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 40,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
});
