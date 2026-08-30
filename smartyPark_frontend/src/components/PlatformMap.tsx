import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export default function MapView(props: any) {
  return (
    <View style={[props.style, styles.container]}>
      <Text style={styles.text}>La carte interactive n'est pas disponible sur la version Web.</Text>
    </View>
  );
}

export function Marker(props: any) {
  return null;
}

export function Callout(props: any) {
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  text: {
    color: '#64748B',
    fontSize: 14,
    padding: 20,
    textAlign: 'center',
  },
});
