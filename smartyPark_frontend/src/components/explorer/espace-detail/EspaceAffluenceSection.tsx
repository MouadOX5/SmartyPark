import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Users } from 'lucide-react-native';
import { StatutAffluence } from '../../../types';
import { AffluenceBadge, getAffluenceText } from '../../AffluenceBadge';
import { AffluenceDonut } from '../../AffluenceDonut';

interface EspaceAffluenceSectionProps {
  statutAffluenceActuel: StatutAffluence;
  activeCount: number;
}

export default function EspaceAffluenceSection({
  statutAffluenceActuel,
  activeCount,
}: EspaceAffluenceSectionProps) {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Affluence en temps réel</Text>
      <View style={[styles.card, styles.affluenceCard]}>
        <View style={styles.affluenceRow}>
          <View style={styles.donutWrapper}>
            <AffluenceDonut statut={statutAffluenceActuel} size={110} />
          </View>
          <View style={styles.affluenceInfo}>
            <AffluenceBadge statut={statutAffluenceActuel} size="md" />
            <Text style={styles.affluenceDescText}>
              {getAffluenceText(statutAffluenceActuel)}
            </Text>

            <View style={styles.activeUsersBadge}>
              <Users size={16} color="#006c49" />
              <Text style={styles.activeUsersText}>
                <Text style={{ fontWeight: '700' }}>{activeCount}</Text> personne{activeCount > 1 ? 's' : ''} présente{activeCount > 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20, // headline-md
    fontWeight: '600',
    color: '#161d19', // on-surface
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff', // surface-container-lowest
    borderRadius: 12, // rounded-xl
    borderWidth: 1,
    borderColor: '#f1f5f9', // slate-100
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  affluenceCard: {
    padding: 24, // p-lg
  },
  affluenceRow: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 24,
  },
  donutWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  affluenceInfo: {
    width: '100%',
    alignItems: 'center',
  },
  affluenceDescText: {
    fontSize: 14,
    color: '#3c4a42',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  activeUsersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef6ee', // surface-container-low
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  activeUsersText: {
    fontSize: 12,
    color: '#006c49',
  },
});
