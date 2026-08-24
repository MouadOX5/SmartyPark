import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatutAffluence } from '../types';

interface AffluenceDonutProps {
  statut: StatutAffluence;
  size?: number;
  showLabel?: boolean;
}

const STATUT_CONFIG: Record<
  StatutAffluence,
  { color: string; bgColor: string; label: string; arc: number }
> = {
  DISPONIBLE: {
    color: '#10B981',
    bgColor: '#DCFCE7',
    label: 'Disponible',
    arc: 0.35, // ~35% arc visible pour représenter "peu de monde"
  },
  PRESQUE_SATURE: {
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    label: 'Occupé',
    arc: 0.65, // ~65%
  },
  SATURE: {
    color: '#EF4444',
    bgColor: '#FEE2E2',
    label: 'Complet',
    arc: 0.95, // ~95%
  },
  INCONNU: {
    color: '#94A3B8',
    bgColor: '#F1F5F9',
    label: 'Inconnu',
    arc: 0,
  },
};

/**
 * Donut qualitatif d'affluence — React Native pur (pas de lib externe).
 * Représentation visuelle circulaire basée sur le statut qualitatif du backend.
 * NE contient aucun pourcentage réel calculé côté backend.
 */
export const AffluenceDonut: React.FC<AffluenceDonutProps> = ({
  statut,
  size = 120,
  showLabel = true,
}) => {
  const conf = STATUT_CONFIG[statut] ?? STATUT_CONFIG.INCONNU;
  const thickness = size * 0.15;
  const innerSize = size - thickness * 2;

  // Représentation visuelle via des demi-cercles empilés
  // Approche React Native pure : superposition de vues avec bordures colorées
  const halfBorderWidth = thickness;

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      {/* Cercle de fond gris */}
      <View
        style={[
          styles.outerRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: thickness,
            borderColor: '#E2E8F0',
          },
        ]}
      />

      {/* Arc de couleur selon le statut — représentation qualitative */}
      {statut !== 'INCONNU' && (
        <View
          style={[
            styles.colorArc,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: thickness,
              borderTopColor: conf.color,
              borderRightColor: conf.arc >= 0.5 ? conf.color : 'transparent',
              borderBottomColor: conf.arc >= 0.75 ? conf.color : 'transparent',
              borderLeftColor: conf.arc >= 0.99 ? conf.color : 'transparent',
              transform: [{ rotate: '-45deg' }],
            },
          ]}
        />
      )}

      {/* Cercle intérieur avec contenu */}
      <View
        style={[
          styles.inner,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            backgroundColor: conf.bgColor,
          },
        ]}
      >
        {/* Indicateur central */}
        <View style={[styles.dot, { backgroundColor: conf.color }]} />
        {showLabel && (
          <Text
            style={[
              styles.label,
              { color: conf.color, fontSize: size * 0.115 },
            ]}
            numberOfLines={2}
            adjustsFontSizeToFit
          >
            {conf.label}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  colorArc: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    zIndex: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
});

export default AffluenceDonut;
