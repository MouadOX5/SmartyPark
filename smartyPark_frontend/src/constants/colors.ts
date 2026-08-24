export const COLORS = {
  // Brand Green (from SmartyPark Maquettes)
  primary: '#006241',
  primaryDark: '#004D33',
  primaryLight: '#0D5C3A',
  primarySoft: '#E8F5E9',
  primaryHover: '#007A52',

  // UI Neutrals
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  borderDark: '#CBD5E1',

  // Affluence & Statuses
  disponible: '#10B981',      // Vert - Fluide / Faible
  presqueSature: '#F59E0B',   // Orange - Occupé / Modéré
  sature: '#EF4444',          // Rouge - Complet / Saturé
  inconnu: '#94A3B8',         // Gris - Inconnu

  // Tints for soft pills & badges
  disponibleLight: '#DCFCE7',
  presqueSatureLight: '#FEF3C7',
  satureLight: '#FEE2E2',
  inconnuLight: '#F1F5F9',

  // System
  white: '#FFFFFF',
  black: '#000000',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#EFF6FF',
};

export const AFFLUENCE_CONFIG = {
  DISPONIBLE: {
    label: 'Disponible',
    fullLabel: 'Espace fluide',
    color: COLORS.disponible,
    bgColor: COLORS.disponibleLight,
    description: 'Espace fluide, peu de monde',
  },
  PRESQUE_SATURE: {
    label: 'Occupé',
    fullLabel: 'Espace occupé',
    color: COLORS.presqueSature,
    bgColor: COLORS.presqueSatureLight,
    description: 'Espace occupé, reste peu de place',
  },
  SATURE: {
    label: 'Complet',
    fullLabel: 'Espace complet',
    color: COLORS.sature,
    bgColor: COLORS.satureLight,
    description: 'Espace complet, très dense',
  },
  INCONNU: {
    label: 'Inconnu',
    fullLabel: 'Affluence inconnue',
    color: COLORS.inconnu,
    bgColor: COLORS.inconnuLight,
    description: 'Aucune déclaration récente',
  },
};
