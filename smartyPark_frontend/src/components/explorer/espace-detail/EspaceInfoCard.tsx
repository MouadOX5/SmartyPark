import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MapPin, CheckCircle, Info } from 'lucide-react-native';
import { formatCategoryName } from '../../../utils/formatters';

interface EspaceInfoCardProps {
  categorie: string;
  nom: string;
  adresse: string;
  estValide: boolean;
  description: string;
}

export default function EspaceInfoCard({
  categorie,
  nom,
  adresse,
  estValide,
  description,
}: EspaceInfoCardProps) {
  return (
    <>
      {/* Title Section (Stitch Design) */}
      <View style={styles.titleSection}>
        <View style={styles.catBadge}>
          <Text style={styles.catBadgeText}>{formatCategoryName(categorie)}</Text>
        </View>
        <Text style={styles.title}>{nom}</Text>
        <View style={styles.addressRow}>
          <MapPin size={16} color="#6c7a71" />
          <Text style={styles.addressText}>{adresse}</Text>
        </View>
        {estValide && (
          <View style={styles.verifiedRow}>
            <CheckCircle size={16} color="#006c49" />
            <Text style={styles.verifiedText}>Validé par la communauté</Text>
          </View>
        )}
      </View>

      {/* Description Card (Fallback for non-existing Horaires/Equipements) */}
      <View style={styles.sectionContainer}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Info size={18} color="#161d19" />
            <Text style={styles.cardTitle}>Description & Informations</Text>
          </View>
          <Text style={styles.descText}>{description}</Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 24, // pt-lg
    paddingBottom: 16, // pb-md
  },
  catBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.15)', // primary-container/15
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 8,
  },
  catBadgeText: {
    color: '#006c49', // primary
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24, // headline-lg-mobile
    fontWeight: '700',
    color: '#161d19', // on-surface
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addressText: {
    fontSize: 14,
    color: '#3c4a42', // on-surface-variant
    flex: 1,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#006c49',
  },
  sectionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  card: {
    backgroundColor: '#ffffff', // surface-container-lowest
    borderRadius: 12, // rounded-xl
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9', // slate-100
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14, // label-lg
    fontWeight: '600',
    color: '#161d19',
  },
  descText: {
    fontSize: 14, // body-md
    color: '#3c4a42', // on-surface-variant
    lineHeight: 20,
  },
});
