import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';

const COLORS = {
  danger: '#ef4444',
  errorContainer: '#ffdad6',
  onSurface: '#161d19',
  onSurfaceVariant: '#3c4a42',
};

interface Props {
  onPress: () => void;
}

export default function ProblemReportCard({ onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.iconBox}>
        <AlertTriangle size={24} color={COLORS.danger} />
      </View>
      <View style={styles.texts}>
        <Text style={styles.title}>Signaler un problème / matériel endommagé</Text>
        <Text style={styles.sub}>(Banc cassé, panier de basket abîmé, propreté, etc.)</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 218, 214, 0.2)', // error-container/20 roughly
    borderWidth: 1,
    borderColor: 'rgba(255, 218, 214, 0.5)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.errorContainer,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  texts: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  sub: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 4,
  },
});
