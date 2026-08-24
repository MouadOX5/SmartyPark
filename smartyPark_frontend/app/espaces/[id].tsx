import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import {
  ArrowLeft,
  MapPin,
  Users,
  Navigation,
  Play,
  Activity,
  AlertTriangle,
} from 'lucide-react-native';
import { espacePublicApi } from '../../src/api/espacePublicApi';
import { presenceApi } from '../../src/api/presenceApi';
import { EspacePublicResponse } from '../../src/types';
import { COLORS } from '../../src/constants/colors';
import { AffluenceBadge, getAffluenceText } from '../../src/components/AffluenceBadge';
import { AffluenceDonut } from '../../src/components/AffluenceDonut';
import { Button } from '../../src/components/ui/Button';
import { formatCategoryName } from '../../src/utils/formatters';
import { usePresence } from '../../src/context/PresenceContext';

const CATEGORY_EMOJIS: Record<string, string> = {
  FOOTBALL: '⚽',
  BASKETBALL: '🏀',
  STREET_WORKOUT: '💪',
  ENFANTS: '🎠',
};

export default function EspaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const espaceId = Number(id);

  const { isActive, startPresence, activePresence } = usePresence();

  const [espace, setEspace] = useState<EspacePublicResponse | null>(null);
  const [activeCount, setActiveCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [espaceData, count] = await Promise.all([
        espacePublicApi.getById(espaceId),
        presenceApi.getActiveCountInEspace(espaceId),
      ]);
      setEspace(espaceData);
      setActiveCount(count);
    } catch (e) {
      console.error('Erreur chargement espace:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [espaceId]);

  const handleItineraire = () => {
    if (!espace) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${espace.latitude},${espace.longitude}`;
    Linking.openURL(url);
  };

  const handleStartSession = async () => {
    if (isActive) {
      if (activePresence?.espacePublicId === espaceId) {
        router.push('/presence/');
        return;
      }
      Alert.alert(
        'Session déjà en cours',
        `Vous avez déjà une session active à "${activePresence?.espacePublicNom}". Terminez-la avant d'en démarrer une nouvelle.`,
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Voir ma session', onPress: () => router.push('/presence/') },
        ]
      );
      return;
    }

    setIsStartingSession(true);
    try {
      await startPresence(espaceId);
      router.push('/presence/');
    } catch (error: any) {
      const message = error?.response?.data?.message;
      Alert.alert('Erreur', message || 'Impossible de démarrer la séance.');
    } finally {
      setIsStartingSession(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!espace) {
    return (
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Espace public introuvable</Text>
          <Button title="Retour" onPress={() => router.back()} fullWidth={false} size="sm" />
        </View>
      </SafeAreaView>
    );
  }

  const emoji = CATEGORY_EMOJIS[espace.categorie] || '🏟️';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtnCircle}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {espace.nom}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Bannière d'en-tête */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>{emoji}</Text>
          <View style={styles.heroInfo}>
            <Text style={styles.heroCategory}>{formatCategoryName(espace.categorie)}</Text>
            <Text style={styles.heroName}>{espace.nom}</Text>
          </View>
        </View>

        {/* Section Affluence Qualitative avec Donut */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Affluence actuelle</Text>
          <View style={styles.affluenceDonutRow}>
            <AffluenceDonut statut={espace.statutAffluenceActuel} size={90} />
            <View style={styles.affluenceDonutInfo}>
              <AffluenceBadge statut={espace.statutAffluenceActuel} size="md" />
              <Text style={styles.affluenceDonutText}>
                {getAffluenceText(espace.statutAffluenceActuel)}
              </Text>
            </View>
          </View>
          <View style={styles.usersCountRow}>
            <Users size={16} color={COLORS.primary} />
            <Text style={styles.usersCountText}>
              <Text style={styles.boldText}>{activeCount}</Text> personne{activeCount > 1 ? 's' : ''} actuellement présente{activeCount > 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {/* Section Informations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Localisation & Description</Text>
          <View style={styles.infoRow}>
            <MapPin size={16} color={COLORS.primary} />
            <Text style={styles.infoText}>{espace.adresse}</Text>
          </View>
          {espace.description ? (
            <Text style={styles.descriptionText}>{espace.description}</Text>
          ) : null}
        </View>

        {/* Actions principales */}
        <View style={styles.actionsContainer}>
          {/* 1. Itinéraire */}
          <Button
            title="Itinéraire (Google Maps)"
            variant="outline"
            size="md"
            leftIcon={<Navigation size={18} color={COLORS.primary} />}
            onPress={handleItineraire}
          />

          {/* 2. Déclarer l'affluence */}
          <Button
            title="Déclarer l'affluence"
            variant="secondary"
            size="md"
            leftIcon={<Activity size={18} color={COLORS.primary} />}
            onPress={() =>
              router.push({
                pathname: '/affluence/declarer',
                params: { id: espace.id.toString(), nom: espace.nom },
              })
            }
          />

          {/* 3. Déclarer ma présence -> Commencer ma séance */}
          <Button
            title={
              isActive && activePresence?.espacePublicId === espaceId
                ? '▶  Voir ma session en cours'
                : '▶  Commencer ma séance'
            }
            variant="primary"
            size="lg"
            loading={isStartingSession}
            disabled={isStartingSession}
            onPress={handleStartSession}
          />

          {/* 4. Signaler un problème */}
          <Button
            title="Signaler un problème"
            variant="dangerOutline"
            size="md"
            leftIcon={<AlertTriangle size={18} color={COLORS.danger} />}
            onPress={() =>
              router.push({
                pathname: '/signalements/creer',
                params: { id: espace.id.toString(), nom: espace.nom },
              })
            }
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#64748B',
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
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  backBtn: {
    padding: 8,
  },
  backBtnCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.primarySoft,
    gap: 16,
  },
  heroEmoji: {
    fontSize: 48,
  },
  heroInfo: {
    flex: 1,
  },
  heroCategory: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  affluenceDonutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  affluenceDonutInfo: {
    flex: 1,
    gap: 8,
  },
  affluenceDonutText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  usersCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
  },
  usersCountText: {
    fontSize: 13,
    color: '#475569',
  },
  boldText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
  },
  descriptionText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
    marginTop: 6,
  },
  actionsContainer: {
    padding: 16,
    gap: 12,
  },
});
