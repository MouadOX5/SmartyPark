import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { CheckCircle, Navigation, AlertTriangle } from 'lucide-react-native';

const COLORS = {
  success: '#10b981',
  successContainer: '#dcfce7',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
  primary: '#006c49',
  warning: '#f59e0b',
  onSurface: '#161d19',
  onSurfaceVariant: '#3c4a42',
  surface: '#ffffff',
};

interface Props {
  isActive: boolean;
  isLocating: boolean;
  locationError: string | null;
  distance: number | null;
}

export default function GpsStatusBanner({ isActive, isLocating, locationError, distance }: Props) {
  const [pulseAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(0);
    }
  }, [isActive, pulseAnim]);

  if (isActive) {
    return (
      <View style={[styles.banner, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' }]}>
        <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
          <Animated.View
            style={[
              styles.pulse,
              {
                backgroundColor: 'rgba(16, 185, 129, 0.3)',
                transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] }) }],
                opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
              },
            ]}
          />
          <CheckCircle size={20} color={COLORS.success} />
        </View>
        <View style={styles.texts}>
          <Text style={[styles.title, { color: COLORS.success }]}>Vérification GPS... Position validée</Text>
          <Text style={styles.sub}>Vous êtes bien sur place.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.banner, { backgroundColor: COLORS.slate100, borderColor: COLORS.slate200 }]}>
      <View style={[styles.iconBox, { backgroundColor: COLORS.surface }]}>
        {isLocating ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : locationError ? (
          <AlertTriangle size={20} color={COLORS.warning} />
        ) : (
          <Navigation size={20} color={COLORS.primary} />
        )}
      </View>
      <View style={styles.texts}>
        <Text style={[styles.title, { color: COLORS.onSurface }]}>
          {isLocating ? 'Localisation en cours...' : locationError ? 'Position introuvable' : 'Position récupérée'}
        </Text>
        <Text style={styles.sub}>
          {isLocating
            ? 'Veuillez patienter...'
            : locationError
            ? 'Activez le GPS pour une meilleure expérience.'
            : `Distance avec l'espace : ${distance} m`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pulse: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  texts: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  sub: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 4,
  },
});
