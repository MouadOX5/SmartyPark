import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle,
  LogOut,
} from 'lucide-react-native';
import { usePresence } from '../../src/context/PresenceContext';
import { affluenceApi } from '../../src/api/affluenceApi';
import { AffluenceDonut } from '../../src/components/AffluenceDonut';
import { AffluenceBadge } from '../../src/components/AffluenceBadge';
import { Button } from '../../src/components/ui/Button';
import { COLORS } from '../../src/constants/colors';
import { StatutAffluence } from '../../src/types';
import { formatTimerSeconds, formatDateTime } from '../../src/utils/formatters';

export default function PresenceScreen() {
  const router = useRouter();
  const { activePresence, isActive, durationSeconds, endPresence, isLoading } =
    usePresence();

  const [isTerminating, setIsTerminating] = useState(false);
  const [currentAffluence, setCurrentAffluence] =
    useState<StatutAffluence>('INCONNU');
  const [affluenceLoading, setAffluenceLoading] = useState(false);

  // Charger l'affluence actuelle de l'espace
  const loadAffluence = useCallback(async () => {
    if (!activePresence) return;
    try {
      setAffluenceLoading(true);
      const response = await affluenceApi.getStatutActuel(
        activePresence.espacePublicId
      );
      setCurrentAffluence(response.statutAffluence);
    } catch (e) {
      console.warn('Erreur récupération affluence:', e);
    } finally {
      setAffluenceLoading(false);
    }
  }, [activePresence]);

  useEffect(() => {
    loadAffluence();
  }, [loadAffluence]);

  const handleTerminer = () => {
    Alert.alert(
      'Terminer la séance',
      'Êtes-vous sûr de vouloir terminer votre séance ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Terminer',
          style: 'destructive',
          onPress: async () => {
            setIsTerminating(true);
            try {
              await endPresence();
              Alert.alert(
                'Séance terminée ✅',
                'Merci de votre visite ! Votre séance a bien été enregistrée.',
                [
                  {
                    text: 'OK',
                    onPress: () => router.replace('/(tabs)'),
                  },
                ]
              );
            } catch (error: any) {
              const msg = error?.response?.data?.message;
              Alert.alert(
                'Erreur',
                msg || 'Impossible de terminer la séance. Réessayez.'
              );
            } finally {
              setIsTerminating(false);
            }
          },
        },
      ]
    );
  };

  // Chargement initial
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Aucune séance active
  if (!isActive || !activePresence) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ma séance</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <CheckCircle size={64} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>Aucune séance active</Text>
          <Text style={styles.emptySub}>
            Rendez-vous sur la fiche d'un espace public pour commencer une
            séance.
          </Text>
          <Button
            title="Explorer les espaces"
            onPress={() => router.replace('/(tabs)')}
            size="md"
            fullWidth={false}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View style={styles.headerGreen}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtnWhite}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitleWhite}>Ma séance en cours</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Carte principale — Espace + Timer */}
        <View style={styles.mainCard}>
          {/* Titre espace */}
          <View style={styles.espaceRow}>
            <MapPin size={18} color={COLORS.primary} />
            <Text style={styles.espaceName} numberOfLines={2}>
              {activePresence.espacePublicNom}
            </Text>
          </View>

          {/* Timer */}
          <View style={styles.timerBlock}>
            <Clock size={20} color="#94A3B8" />
            <Text style={styles.timerLabel}>Durée de la séance</Text>
          </View>
          <Text style={styles.timerValue}>
            {formatTimerSeconds(durationSeconds)}
          </Text>

          {/* Heure d'arrivée */}
          <Text style={styles.arrivalText}>
            Arrivée : {formatDateTime(activePresence.heureArrivee)}
          </Text>

          {/* Badge statut présence */}
          <View style={styles.statusRow}>
            <View style={styles.activeDot} />
            <Text style={styles.statusText}>Séance ACTIVE</Text>
          </View>
        </View>

        {/* Donut + Affluence actuelle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Affluence de l'espace</Text>
          <View style={styles.affluenceBlock}>
            {affluenceLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <>
                <AffluenceDonut statut={currentAffluence} size={110} />
                <View style={styles.affluenceInfo}>
                  <AffluenceBadge statut={currentAffluence} size="md" />
                  <Text style={styles.affluenceDesc}>
                    {currentAffluence === 'DISPONIBLE'
                      ? 'Espace fluide, peu de monde'
                      : currentAffluence === 'PRESQUE_SATURE'
                      ? 'Espace occupé, reste peu de place'
                      : currentAffluence === 'SATURE'
                      ? 'Espace complet, très dense'
                      : 'Aucune déclaration récente'}
                  </Text>
                  <TouchableOpacity onPress={loadAffluence} activeOpacity={0.7}>
                    <Text style={styles.refreshText}>↻ Actualiser</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Actions</Text>

          {/* Déclarer l'affluence */}
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.85}
            onPress={() =>
              router.push({
                pathname: '/affluence/declarer',
                params: {
                  id: activePresence.espacePublicId.toString(),
                  nom: activePresence.espacePublicNom,
                },
              })
            }
          >
            <View style={[styles.actionIcon, { backgroundColor: '#DCFCE7' }]}>
              <Activity size={22} color={COLORS.primary} />
            </View>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Déclarer l'affluence</Text>
              <Text style={styles.actionSub}>
                Indiquer le niveau d'occupation actuel
              </Text>
            </View>
          </TouchableOpacity>

          {/* Signaler un problème */}
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.85}
            onPress={() =>
              router.push({
                pathname: '/signalements/creer',
                params: {
                  id: activePresence.espacePublicId.toString(),
                  nom: activePresence.espacePublicNom,
                },
              })
            }
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FEE2E2' }]}>
              <AlertTriangle size={22} color={COLORS.danger} />
            </View>
            <View style={styles.actionText}>
              <Text style={[styles.actionTitle, { color: COLORS.danger }]}>
                Signaler un problème
              </Text>
              <Text style={styles.actionSub}>
                Propreté, équipement, sécurité...
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Bouton Terminer */}
        <View style={styles.terminateSection}>
          <Button
            title={isTerminating ? 'Fin de séance...' : 'Terminer ma séance'}
            variant="danger"
            size="lg"
            loading={isTerminating}
            disabled={isTerminating}
            leftIcon={<LogOut size={18} color="#FFFFFF" />}
            onPress={handleTerminer}
          />
          <Text style={styles.terminateHint}>
            Votre présence sera enregistrée une fois la séance terminée.
          </Text>
        </View>

        <View style={{ height: 32 }} />
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
  // Header vert pour séance active
  headerGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.primary,
  },
  headerTitleWhite: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  backBtnWhite: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Header blanc (état vide)
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
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    flex: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // État vide
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  // Contenu scroll
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },
  // Carte principale
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.primarySoft,
  },
  espaceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 20,
  },
  espaceName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  timerBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  timerLabel: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  timerValue: {
    fontSize: 52,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
    marginBottom: 8,
  },
  arrivalText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 14,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
  },
  // Section affluence
  section: {
    backgroundColor: '#FFFFFF',
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
    marginBottom: 16,
  },
  affluenceBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  affluenceInfo: {
    flex: 1,
    gap: 8,
  },
  affluenceDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  refreshText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  // Actions
  actionsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  actionSub: {
    fontSize: 13,
    color: '#64748B',
  },
  // Terminer
  terminateSection: {
    gap: 12,
  },
  terminateHint: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
});
