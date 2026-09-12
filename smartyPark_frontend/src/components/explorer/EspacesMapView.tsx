import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, ChevronRight, X } from 'lucide-react-native';
import MapView, { Marker, Region } from '../PlatformMap';
import { EspacePublicResponse } from '../../types';
import { Coordinates } from '../../utils/location';
import { COLORS } from '../../constants/colors';
import { AffluenceBadge } from '../AffluenceBadge';
import { CategoryIcon } from '../CategoryIcon';
import { formatCategoryName } from '../../utils/formatters';

interface EspacesMapViewProps {
  espaces: EspacePublicResponse[];
  userLocation: Coordinates | null;
}

export function EspacesMapView({ espaces, userLocation }: EspacesMapViewProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<EspacePublicResponse | null>(null);

  // Calcule une région englobant à la fois la position de l'utilisateur et
  // tous les espaces à afficher, pour ne jamais rendre une carte "vide"
  // lorsque l'utilisateur se trouve loin des espaces (sinon un simple
  // centrage sur userLocation avec un delta fixe peut les laisser hors-champ).
  const region = useMemo<Region | undefined>(() => {
    const points: Coordinates[] = [
      ...espaces.map((e) => ({ latitude: e.latitude, longitude: e.longitude })),
      ...(userLocation ? [userLocation] : []),
    ];

    if (points.length === 0) return undefined;

    const latitudes = points.map((p) => p.latitude);
    const longitudes = points.map((p) => p.longitude);
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLon = Math.min(...longitudes);
    const maxLon = Math.max(...longitudes);

    const PADDING_FACTOR = 1.6;
    const MIN_DELTA = 0.05;

    const latitudeDelta = Math.max((maxLat - minLat) * PADDING_FACTOR, MIN_DELTA);
    const longitudeDelta = Math.max((maxLon - minLon) * PADDING_FACTOR, MIN_DELTA);

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLon + maxLon) / 2,
      latitudeDelta,
      longitudeDelta,
    };
  }, [userLocation, espaces]);

  return (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
        onPress={() => setSelected(null)}
      >
        {espaces.map((espace) => (
          <Marker
            key={espace.id}
            coordinate={{ latitude: espace.latitude, longitude: espace.longitude }}
            onPress={() => setSelected(espace)}
          />
        ))}
      </MapView>

      {/* Carte détail au tap sur un marqueur, façon Google Maps */}
      {selected && (
        <View style={styles.detailCard}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)} activeOpacity={0.8}>
            <X size={16} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.detailCardTouchable}
            activeOpacity={0.92}
            onPress={() => router.push(`/espaces/${selected.id}`)}
          >
            {selected.imageUrl ? (
              <Image source={{ uri: selected.imageUrl }} style={styles.detailImage} resizeMode="cover" />
            ) : (
              <View style={[styles.detailImage, styles.detailImagePlaceholder]}>
                <CategoryIcon categorie={selected.categorie} size={36} />
              </View>
            )}

            <View style={styles.detailInfo}>
              <Text style={styles.detailCategory}>{formatCategoryName(selected.categorie)}</Text>
              <Text style={styles.detailName} numberOfLines={1}>{selected.nom}</Text>
              <View style={styles.detailAddressRow}>
                <MapPin size={13} color="#64748B" />
                <Text style={styles.detailAddress} numberOfLines={1}>{selected.adresse}</Text>
              </View>
              <View style={styles.detailFooter}>
                <AffluenceBadge statut={selected.statutAffluenceActuel} size="sm" />
                <View style={styles.detailLink}>
                  <Text style={styles.detailLinkText}>Voir détails</Text>
                  <ChevronRight size={16} color={COLORS.primary} />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  detailCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  detailCardTouchable: {
    flexDirection: 'row',
  },
  closeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailImage: {
    width: 100,
    height: 100,
    backgroundColor: '#F1F5F9',
  },
  detailImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailEmoji: {
    fontSize: 34,
  },
  detailInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    gap: 3,
  },
  detailCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  detailName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  detailAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailAddress: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
  },
  detailFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  detailLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
