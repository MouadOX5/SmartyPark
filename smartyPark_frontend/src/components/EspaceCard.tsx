import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { MapPin, Users, ChevronRight } from 'lucide-react-native';
import { EspacePublicResponse } from '../types';
import { COLORS, AFFLUENCE_CONFIG } from '../constants/colors';
import { formatCategoryName } from '../utils/formatters';
import { AffluenceBadge } from './ui/Badge';

interface EspaceCardProps {
  espace: EspacePublicResponse;
  onPress: () => void;
  distance?: number; // en mètres, calculé côté frontend
}

const CATEGORY_EMOJIS: Record<string, string> = {
  FOOTBALL: '⚽',
  BASKETBALL: '🏀',
  STREET_WORKOUT: '💪',
  ENFANTS: '🎠',
};

const CATEGORY_COLORS: Record<string, string> = {
  FOOTBALL: '#E3F2FD',
  BASKETBALL: '#FFF3E0',
  STREET_WORKOUT: '#E8F5E9',
  ENFANTS: '#FCE4EC',
};

export const EspaceCard: React.FC<EspaceCardProps> = ({ espace, onPress, distance }) => {
  const config = AFFLUENCE_CONFIG[espace.statutAffluenceActuel] || AFFLUENCE_CONFIG.INCONNU;
  const emoji = CATEGORY_EMOJIS[espace.categorie] || '🏟️';
  const categoryBg = CATEGORY_COLORS[espace.categorie] || '#E8F5E9';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.92}
    >
      {/* Header Catégorie */}
      <View style={[styles.categoryHeader, { backgroundColor: categoryBg }]}>
        <Text style={styles.categoryEmoji}>{emoji}</Text>
        <View style={styles.headerRight}>
          <Text style={styles.categoryLabel}>{formatCategoryName(espace.categorie)}</Text>
          <AffluenceBadge statut={espace.statutAffluenceActuel} />
        </View>
      </View>

      {/* Contenu principal */}
      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{espace.nom}</Text>
          <ChevronRight size={18} color="#94A3B8" />
        </View>

        <View style={styles.addressRow}>
          <MapPin size={14} color="#64748B" />
          <Text style={styles.address} numberOfLines={1}>{espace.adresse}</Text>
        </View>

        {/* Footer : distance + affluence couleur dot */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <View style={[styles.afflDot, { backgroundColor: config.color }]} />
            <Text style={[styles.afflLabel, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
          {distance !== undefined && (
            <Text style={styles.distance}>
              {distance < 1000 ? `${Math.round(distance)} m` : `${(distance / 1000).toFixed(1)} km`}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  categoryEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  headerRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    padding: 16,
    paddingTop: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  address: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 5,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  afflDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  afflLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  distance: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
