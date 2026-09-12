import React from 'react';
import { Goal, CircleDot, Dumbbell, Baby, LucideIcon } from 'lucide-react-native';
import { CategorieEspace } from '../types';

const CATEGORY_ICON: Record<CategorieEspace, LucideIcon> = {
  FOOTBALL: Goal,
  BASKETBALL: CircleDot,
  STREET_WORKOUT: Dumbbell,
  ENFANTS: Baby,
};

const CATEGORY_ICON_COLOR: Record<CategorieEspace, string> = {
  FOOTBALL: '#16A34A',
  BASKETBALL: '#D97706',
  STREET_WORKOUT: '#7C3AED',
  ENFANTS: '#DB2777',
};

interface CategoryIconProps {
  categorie: CategorieEspace | string;
  size?: number;
  color?: string;
}

/**
 * Icône professionnelle (lucide) représentant une catégorie d'espace,
 * remplace les emojis (⚽🏀💪🎠) utilisés auparavant.
 */
export function CategoryIcon({ categorie, size = 24, color }: CategoryIconProps) {
  const Icon = CATEGORY_ICON[categorie as CategorieEspace] || Goal;
  const resolvedColor = color || CATEGORY_ICON_COLOR[categorie as CategorieEspace] || '#64748B';
  return <Icon size={size} color={resolvedColor} />;
}

export { CATEGORY_ICON_COLOR };
