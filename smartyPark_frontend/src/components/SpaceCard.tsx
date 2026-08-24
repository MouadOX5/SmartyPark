import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { MapPin, ChevronRight } from 'lucide-react-native';
import { EspacePublicResponse } from '../types';
import { COLORS } from '../constants/colors';
import { AffluenceBadge } from './AffluenceBadge';
import { formatCategoryName } from '../utils/formatters';

const CATEGORY_EMOJIS: Record<string, string> = {
  FOOTBALL: '⚽',
  BASKETBALL: '🏀',
  STREET_WORKOUT: '💪',
  ENFANTS: '🎠',
};

const CATEGORY_BG: Record<string, string> = {
  FOOTBALL: '#E3F2FD',
  BASKETBALL: '#FFF3E0',
  STREET_WORKOUT: '#E8F5E9',
  ENFANTS: '#FCE4EC',
};

interface SpaceCardProps {
  espace: EspacePublicResponse;
  onPress: () => void;
  distance?: number; // mètres
}

export const SpaceCard: React.FC<SpaceCardProps> = ({ espace, onPress, distance }) => {
  const emoji = CATEGORY_EMOJIS[espace.categorie] || '🏟️';
  const catBg = CATEGORY_BG[espace.categorie] || '#E8F5E9';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* En-tête catégorie */}
      <View style={[styles.header, { backgroundColor: catBg }]}>
        <Text style={styles.emoji}>{emoji}</Text>
        <View style={styles.headerInfo}>
          <Text style={styles.catLabel}>{formatCategoryName(espace.categorie)}</Text>
          <AffluenceBadge statut={espace.statutAffluenceActuel} size="sm" />
        </View>
      </View>

      {/* Corps */}
      <View style={styles.body}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{espace.nom}</Text>
          <ChevronRight size={18} color="#94A3B8" />
        </View>
        <View style={styles.addressRow}>
          <MapPin size={13} color="#64748B" />
          <Text style={styles.address} numberOfLines={1}>{espace.adresse}</Text>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 12,
  },
  emoji: { fontSize: 26 },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  catLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  body: { padding: 14, paddingTop: 10 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 6,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  address: {
    fontSize: 13,
    color: '#64748B',
    flex: 1,
  },
  distance: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
