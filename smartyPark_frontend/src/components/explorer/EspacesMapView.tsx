import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Marker, Callout, Region } from '../PlatformMap';
import { EspacePublicResponse } from '../../types';
import { Coordinates } from '../../utils/location';

interface EspacesMapViewProps {
  espaces: EspacePublicResponse[];
  userLocation: Coordinates | null;
}

export function EspacesMapView({ espaces, userLocation }: EspacesMapViewProps) {
  const router = useRouter();

  const region = useMemo<Region | undefined>(() => {
    if (userLocation) {
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
    if (espaces.length > 0) {
      return {
        latitude: espaces[0].latitude,
        longitude: espaces[0].longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
    return undefined;
  }, [userLocation, espaces]);

  return (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
      >
        {espaces.map((espace) => (
          <Marker
            key={espace.id}
            coordinate={{ latitude: espace.latitude, longitude: espace.longitude }}
            onCalloutPress={() => router.push(`/espaces/${espace.id}`)}
          >
            <Callout tooltip>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{espace.nom}</Text>
                <Text style={styles.calloutSub}>Cliquez pour voir les détails</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
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
  calloutContainer: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 150,
  },
  calloutTitle: {
    fontWeight: '700',
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 4,
  },
  calloutSub: {
    fontSize: 12,
    color: '#64748B',
  },
});
