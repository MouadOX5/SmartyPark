import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Timer, StopCircle, MapPin, CheckCircle } from 'lucide-react-native';

const COLORS = {
  primary: '#006c49',
  primaryContainer: '#10b981',
  onPrimaryContainer: '#00422b',
  surface: '#ffffff',
  slate100: '#f1f5f9',
  danger: '#ef4444',
  success: '#10b981',
  onSurfaceVariant: '#3c4a42',
  surfaceContainer: '#e8f0e9',
  surfaceContainerLowest: '#ffffff',
  errorContainer: '#ffdad6',
};

interface Props {
  isActive: boolean;
  isStarting: boolean;
  isTerminating: boolean;
  espaceNom: string | undefined;
  durationText: string;
  onStart: () => void;
  onTerminate: () => void;
}

export default function ActivePresenceCard({
  isActive,
  isStarting,
  isTerminating,
  espaceNom,
  durationText,
  onStart,
  onTerminate,
}: Props) {
  return (
    <View style={styles.card}>
      {isActive && (
        <View style={styles.bgPatternContainer} pointerEvents="none">
          {/* A simple simulation of the radial-gradient pattern from Stitch */}
          <View style={styles.bgPattern} />
        </View>
      )}

      <View style={styles.content}>
        {isActive ? (
          <>
            <View style={styles.timerIconBox}>
              <Timer size={32} color={COLORS.onPrimaryContainer} />
            </View>
            <Text style={styles.timerText}>{durationText}</Text>
            
            <View style={styles.activeBadgeRow}>
              <View style={styles.activeDot} />
              <Text style={styles.activeBadgeText}>
                Présence en cours au {espaceNom}
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.dangerOutlineButton}
              onPress={onTerminate}
              disabled={isTerminating}
            >
              {isTerminating ? (
                <ActivityIndicator size="small" color={COLORS.danger} />
              ) : (
                <>
                  <StopCircle size={20} color={COLORS.danger} />
                  <Text style={styles.dangerOutlineButtonText}>Terminer ma présence</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={[styles.timerIconBox, { backgroundColor: COLORS.slate100 }]}>
              <MapPin size={32} color={COLORS.onSurfaceVariant} />
            </View>
            <Text style={[styles.timerText, { fontSize: 24, marginBottom: 16 }]}>{espaceNom}</Text>
            
            <Text style={styles.preDeclareDesc}>
              Vous êtes sur le point de déclarer votre présence dans cet espace public.
            </Text>

            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={onStart}
              disabled={isStarting}
            >
              {isStarting ? (
                <ActivityIndicator size="small" color={COLORS.surface} />
              ) : (
                <>
                  <CheckCircle size={20} color={COLORS.surface} />
                  <Text style={styles.primaryButtonText}>Déclarer ma présence</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: COLORS.slate100,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  bgPatternContainer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.05,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgPattern: {
    // In React Native, radial gradients are tricky without react-native-svg or expo-linear-gradient.
    // For now, we omit the complex pattern or use a simple background color if needed.
    // The visual similarity to stitch's subtle pattern can be approximated or skipped if unsupported natively.
  },
  content: {
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
  },
  timerIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  timerText: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
    fontVariant: ['tabular-nums'],
  },
  activeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surfaceContainer,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 24,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
  },
  preDeclareDesc: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  dangerOutlineButton: {
    width: '100%',
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 2,
    borderColor: COLORS.danger,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dangerOutlineButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.danger,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.surface,
  },
});
