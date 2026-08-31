import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { User, Users, UserPlus } from 'lucide-react-native';
import { StatutAffluence } from '../../types';

const COLORS = {
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  errorContainer: '#ffdad6',
  onSurface: '#161d19',
  primary: '#006c49',
  onPrimary: '#ffffff',
};

interface Props {
  selectedAffluence: StatutAffluence | null;
  isSubmitting: boolean;
  onSelect: (statut: StatutAffluence) => void;
  onSubmit: () => void;
}

export default function AffluenceSelector({
  selectedAffluence,
  isSubmitting,
  onSelect,
  onSubmit,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Niveau d'affluence actuel</Text>
      <View style={styles.grid}>
        {/* Faible (DISPONIBLE) */}
        <TouchableOpacity
          style={[
            styles.btn,
            {
              backgroundColor: selectedAffluence === 'DISPONIBLE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
              borderColor: selectedAffluence === 'DISPONIBLE' ? COLORS.success : 'rgba(16, 185, 129, 0.2)',
            },
          ]}
          onPress={() => onSelect('DISPONIBLE')}
        >
          <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
            <User size={24} color={COLORS.success} />
          </View>
          <Text style={styles.btnText}>Faible</Text>
        </TouchableOpacity>

        {/* Modéré (PRESQUE_SATURE) */}
        <TouchableOpacity
          style={[
            styles.btn,
            {
              backgroundColor: selectedAffluence === 'PRESQUE_SATURE' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)',
              borderColor: selectedAffluence === 'PRESQUE_SATURE' ? COLORS.warning : 'rgba(245, 158, 11, 0.2)',
            },
          ]}
          onPress={() => onSelect('PRESQUE_SATURE')}
        >
          <View style={[styles.iconBox, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
            <Users size={24} color={COLORS.warning} />
          </View>
          <Text style={styles.btnText}>Modéré</Text>
        </TouchableOpacity>

        {/* Saturé (SATURE) */}
        <TouchableOpacity
          style={[
            styles.btn,
            {
              backgroundColor: selectedAffluence === 'SATURE' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 218, 214, 0.3)',
              borderColor: selectedAffluence === 'SATURE' ? COLORS.danger : COLORS.errorContainer,
            },
          ]}
          onPress={() => onSelect('SATURE')}
        >
          <View style={[styles.iconBox, { backgroundColor: COLORS.errorContainer }]}>
            <UserPlus size={24} color={COLORS.danger} />
          </View>
          <Text style={styles.btnText}>Saturé</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={onSubmit}
        disabled={isSubmitting || !selectedAffluence}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color={COLORS.onPrimary} />
        ) : (
          <Text style={styles.primaryButtonText}>Valider l'affluence</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 8,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.onPrimary,
  },
});
