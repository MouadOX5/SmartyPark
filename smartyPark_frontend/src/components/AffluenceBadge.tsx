import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from "../constants/colors";

/**
 * Badge qualitatif d'affluence — AUCUN pourcentage ni graphique.
 * Affiche uniquement un texte et une couleur selon StatutAffluence.
 */

interface AffluenceBadgeProps {
  statut: 'INCONNU' | 'DISPONIBLE' | 'PRESQUE_SATURE' | 'SATURE';
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

const CONFIG = {
  DISPONIBLE: {
    label: 'Disponible',
    color: COLORS.disponible,
    bgColor: COLORS.disponibleLight,
    dot: COLORS.disponible,
  },
  PRESQUE_SATURE: {
    label: 'Occupé',
    color: COLORS.presqueSature,
    bgColor: COLORS.presqueSatureLight,
    dot: COLORS.presqueSature,
  },
  SATURE: {
    label: 'Complet',
    color: COLORS.sature,
    bgColor: COLORS.satureLight,
    dot: COLORS.sature,
  },
  INCONNU: {
    label: 'Inconnu',
    color: COLORS.inconnu,
    bgColor: COLORS.inconnuLight,
    dot: COLORS.inconnu,
  },
} as const;

export const AffluenceBadge: React.FC<AffluenceBadgeProps> = ({
  statut,
  showLabel = true,
  size = 'sm',
}) => {
  const conf = CONFIG[statut] ?? CONFIG.INCONNU;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: conf.bgColor },
        size === 'sm' ? styles.sm : styles.md,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: conf.dot }]} />
      {showLabel && (
        <Text style={[styles.label, { color: conf.color }, size === 'sm' ? styles.labelSm : styles.labelMd]}>
          {conf.label}
        </Text>
      )}
    </View>
  );
};

/** Texte descriptif long selon le statut */
export function getAffluenceText(statut: string): string {
  switch (statut) {
    case 'DISPONIBLE':
      return 'Espace fluide, peu de monde';
    case 'PRESQUE_SATURE':
      return 'Espace occupé, reste peu de place';
    case 'SATURE':
      return 'Espace complet, très dense';
    default:
      return 'Aucune déclaration récente';
  }
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  sm: { paddingHorizontal: 8, paddingVertical: 3 },
  md: { paddingHorizontal: 12, paddingVertical: 6 },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  label: { fontWeight: '700' },
  labelSm: { fontSize: 12 },
  labelMd: { fontSize: 14 },
});
