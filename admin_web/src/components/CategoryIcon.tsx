import React from 'react';
import { Goal, Volleyball, Dumbbell, Baby, LucideIcon } from 'lucide-react';
import { CategorieEspace } from '../types';

const CATEGORY_ICON: Record<CategorieEspace, LucideIcon> = {
  FOOTBALL: Goal,
  BASKETBALL: Volleyball,
  STREET_WORKOUT: Dumbbell,
  ENFANTS: Baby,
};

const CATEGORY_COLOR: Record<CategorieEspace, string> = {
  FOOTBALL: '#16a34a',
  BASKETBALL: '#d97706',
  STREET_WORKOUT: '#7c3aed',
  ENFANTS: '#db2777',
};

interface Props {
  categorie: CategorieEspace | string;
  size?: number;
}

/** Icône professionnelle (lucide) représentant une catégorie d'espace, sur un fond rond coloré. */
export function CategoryIcon({ categorie, size = 24 }: Props) {
  const Icon = CATEGORY_ICON[categorie as CategorieEspace] || Goal;
  const color = CATEGORY_COLOR[categorie as CategorieEspace] || '#64748b';
  const wrapperSize = Math.round(size * 1.7);

  return (
    <div
      style={{
        width: wrapperSize,
        height: wrapperSize,
        borderRadius: wrapperSize / 2,
        background: color + '1A',
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon size={size} />
    </div>
  );
}
