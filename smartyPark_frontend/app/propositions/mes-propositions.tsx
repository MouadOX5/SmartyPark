import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Clock, Package } from 'lucide-react-native';
import { propositionApi } from '../../src/api/propositionApi';
import { PropositionEspaceResponse } from '../../src/types';
import { COLORS } from '../../src/constants/colors';
import { formatDateTime, formatCategoryName, formatPropositionStatus } from '../../src/utils/formatters';

const CATEGORY_EMOJIS: Record<string, string> = {
  FOOTBALL: '⚽',
  BASKETBALL: '🏀',
  STREET_WORKOUT: '💪',
  ENFANTS: '🎠',
};

function PropositionCard({ proposition }: { proposition: PropositionEspaceResponse }) {
  const status = formatPropositionStatus(proposition.statut);
  const emoji = CATEGORY_EMOJIS[proposition.categorie] || '🏟️';

  return (
    <View style={styles.card}>
      {proposition.imageUrl ? (
        <Image source={{ uri: proposition.imageUrl }} style={styles.cardImage} resizeMode="cover" />
      ) : null}
      <View style={styles.cardHeader}>
        <Text style={styles.cardEmoji}>{emoji}</Text>
        <View style={styles.cardHeaderInfo}>
          <Text style={styles.cardName}>{proposition.nom}</Text>
          <Text style={styles.cardCategory}>{formatCategoryName(proposition.categorie)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <MapPin size={14} color="#64748B" />
          <Text style={styles.infoText} numberOfLines={1}>{proposition.adresse}</Text>
        </View>
        <View style={styles.infoRow}>
          <Clock size={14} color="#64748B" />
          <Text style={styles.infoText}>Proposé le {formatDateTime(proposition.dateProposition)}</Text>
        </View>
        {proposition.motifRefus && (
          <View style={styles.rejectedNote}>
            <Text style={styles.rejectedLabel}>Motif de refus :</Text>
            <Text style={styles.rejectedText}>{proposition.motifRefus}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function MesPropositionsScreen() {
  const router = useRouter();
  const [propositions, setPropositions] = useState<PropositionEspaceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = async () => {
    try {
      const data = await propositionApi.getMesPropositions();
      setPropositions(data);
    } catch (e) {
      console.error('Erreur chargement propositions:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    load();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes propositions</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={propositions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <PropositionCard proposition={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Package size={56} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>Aucune proposition</Text>
              <Text style={styles.emptySub}>
                Vous n'avez pas encore proposé d'espace public. Utilisez l'onglet "Proposer" pour commencer.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  loader: {
    flex: 1,
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  cardEmoji: {
    fontSize: 32,
  },
  cardImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#F1F5F9',
  },
  cardHeaderInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  cardCategory: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardBody: {
    padding: 14,
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#64748B',
    flex: 1,
  },
  rejectedNote: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#FFF1F2',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  rejectedLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 2,
  },
  rejectedText: {
    fontSize: 13,
    color: '#7F1D1D',
    lineHeight: 18,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptySub: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 21,
  },
});
