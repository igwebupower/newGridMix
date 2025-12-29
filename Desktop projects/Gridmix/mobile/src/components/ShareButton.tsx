import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

interface ShareButtonProps {
  carbonIntensity: number;
  renewablePercent: number;
  totalDemand: number;
}

function getIntensityLabel(intensity: number): string {
  if (intensity < 100) return 'very low';
  if (intensity < 200) return 'low';
  if (intensity < 250) return 'moderate';
  if (intensity < 350) return 'high';
  return 'very high';
}

export function ShareButton({ carbonIntensity, renewablePercent, totalDemand }: ShareButtonProps) {
  const handleShare = async () => {
    const intensityLabel = getIntensityLabel(carbonIntensity);
    const demandGW = (totalDemand / 1000).toFixed(1);
    const timestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    const message = `UK Grid Right Now (${timestamp})

Carbon Intensity: ${Math.round(carbonIntensity)} gCO2/kWh (${intensityLabel})
Renewable Energy: ${renewablePercent.toFixed(0)}%
Total Demand: ${demandGW} GW

Track the UK electricity grid at gridmix.co.uk`;

    try {
      await Share.share({
        message,
        title: 'UK Grid Status',
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share grid status');
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleShare} activeOpacity={0.7}>
      <Ionicons name="share-outline" size={18} color={COLORS.text} />
      <Text style={styles.text}>Share</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  text: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
});
