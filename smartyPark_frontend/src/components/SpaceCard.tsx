import React, { useState } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import { MapPin } from 'lucide-react-native';
import { EspacePublicResponse } from '../types';
import { AffluenceBadge } from './AffluenceBadge';
import { CategoryIcon } from './CategoryIcon';
import { formatCategoryName } from '../utils/formatters';

const CATEGORY_BG: Record<string, string> = {
  FOOTBALL: '#E3F2FD',
  BASKETBALL: '#FFF3E0',
  STREET_WORKOUT: '#E8F5E9',
  ENFANTS: '#FCE4EC',
};

interface SpaceCardProps {
  espace: EspacePublicResponse;
  onPress: () => void;
  distance?: number;
}

export const SpaceCard: React.FC<SpaceCardProps> = ({ espace, onPress, distance }) => {
  const [imageError, setImageError] = useState(false);
  const catBg = CATEGORY_BG[espace.categorie] || '#E8F5E9';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Header: Real Image or Decorative Placeholder */}
      {espace.imageUrl && !imageError ? (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: espace.imageUrl }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
          {distance !== undefined && (
            <View style={styles.distanceBadge}>
              <MapPin size={14} color="#006c49" />
              <Text style={styles.distanceText}>
                {distance < 1000 ? `${Math.round(distance)} m` : `${(distance / 1000).toFixed(1)} km`}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={[styles.imagePlaceholder, { backgroundColor: catBg }]}>
          <CategoryIcon categorie={espace.categorie} size={44} />

          {distance !== undefined && (
            <View style={styles.distanceBadge}>
              <MapPin size={14} color="#006c49" />
              <Text style={styles.distanceText}>
                {distance < 1000 ? `${Math.round(distance)} m` : `${(distance / 1000).toFixed(1)} km`}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Body Section */}
      <View style={styles.body}>
        <View style={styles.headerInfo}>
          <View style={styles.titleContainer}>
            <Text style={styles.catLabel}>{formatCategoryName(espace.categorie)}</Text>
            <Text style={styles.name} numberOfLines={1}>{espace.nom}</Text>
            <Text style={styles.address} numberOfLines={1}>{espace.adresse}</Text>
          </View>
        </View>

        <View style={styles.footerRow}>
          <AffluenceBadge statut={espace.statutAffluenceActuel} size="sm" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff', // surface-container-lowest
    borderRadius: 12, // rounded-xl (0.75rem = 12px)
    marginBottom: 16, // gap-md
    borderWidth: 1,
    borderColor: '#f1f5f9', // slate-100
    overflow: 'hidden',
    shadowColor: '#0f172a', // ambient shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  imageContainer: {
    height: 140, // 48 tailwind units = 192px ideally, but 140px is good for RN
    width: '100%',
    position: 'relative',
    backgroundColor: '#f1f5f9',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    height: 140,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  largeEmoji: {
    fontSize: 48,
    opacity: 0.8,
  },
  distanceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    gap: 4,
  },
  distanceText: {
    fontSize: 12, // label-sm
    fontWeight: '500',
    color: '#161d19', // on-surface
  },
  body: {
    padding: 16, // p-md
    flexDirection: 'column',
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
  },
  catLabel: {
    fontSize: 12, // label-sm
    fontWeight: '500',
    color: '#006c49', // primary
    textTransform: 'uppercase',
    letterSpacing: 0.6, // tracking-wider
  },
  name: {
    fontSize: 20, // headline-md
    fontWeight: '600',
    color: '#161d19', // on-surface
    marginTop: 4,
  },
  address: {
    fontSize: 13,
    color: '#6c7a71', // outline
    marginTop: 4,
  },
  footerRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
