/**
 * Adaptateur MapLibre exposant la même API que celle utilisée précédemment
 * avec react-native-maps (MapView/Marker + initialRegion), pour ne pas avoir
 * à retoucher EspacesMapView.tsx.
 *
 * Pourquoi MapLibre plutôt que Google Maps : MapLibre est open source et ne
 * nécessite ni clé API, ni compte Google Cloud, ni facturation activée — les
 * tuiles viennent d'OpenFreeMap (https://openfreemap.org), un fournisseur
 * gratuit et illimité basé sur les données OpenStreetMap.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import * as MapLibreRN from '@maplibre/maplibre-react-native';

const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

function regionToZoom(region: Region): number {
  const zoom = Math.log2(360 / Math.max(region.longitudeDelta, 0.0001));
  return Math.min(20, Math.max(1, zoom));
}

interface MapViewProps {
  style?: any;
  initialRegion?: Region;
  showsUserLocation?: boolean;
  onPress?: () => void;
  children?: React.ReactNode;
}

export default function MapView({ style, initialRegion, showsUserLocation, onPress, children }: MapViewProps) {
  return (
    <MapLibreRN.MapView
      style={style}
      mapStyle={STYLE_URL}
      onPress={onPress}
      logoEnabled={false}
      compassEnabled={false}
      attributionEnabled
      attributionPosition={{ bottom: 4, right: 4 }}
    >
      <MapLibreRN.Camera
        defaultSettings={
          initialRegion
            ? {
                centerCoordinate: [initialRegion.longitude, initialRegion.latitude],
                zoomLevel: regionToZoom(initialRegion),
              }
            : undefined
        }
      />
      {showsUserLocation && <MapLibreRN.UserLocation visible androidRenderMode="gps" />}
      {children}
    </MapLibreRN.MapView>
  );
}

interface MarkerProps {
  coordinate: { latitude: number; longitude: number };
  onPress?: () => void;
  children?: React.ReactNode;
}

export function Marker({ coordinate, onPress, children }: MarkerProps) {
  const id = `marker-${coordinate.latitude.toFixed(6)}-${coordinate.longitude.toFixed(6)}`;
  return (
    <MapLibreRN.PointAnnotation id={id} coordinate={[coordinate.longitude, coordinate.latitude]} onSelected={onPress}>
      <View>{children || <View style={styles.defaultPin} />}</View>
    </MapLibreRN.PointAnnotation>
  );
}

export function Callout(_props: any) {
  return null;
}

const styles = StyleSheet.create({
  defaultPin: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#006241',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
});
