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
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Timer,
  CheckCircle,
  StopCircle,
  User,
  Users,
  UserPlus,
  AlertTriangle,
  MapPin,
  Loader2,
  Navigation
} from 'lucide-react-native';
import { usePresence } from '../../src/context/PresenceContext';
import { espacePublicApi } from '../../src/api/espacePublicApi';
import { affluenceApi } from '../../src/api/affluenceApi';
import { getCurrentLocation, calculateDistance, Coordinates } from '../../src/utils/location';
import { StatutAffluence, EspacePublicResponse } from '../../src/types';
import { formatTimerSeconds } from '../../src/utils/formatters';

const COLORS = {
  background: '#f4fbf4',
  surface: '#ffffff',
  primary: '#006c49',
  primaryContainer: '#10b981',
  onPrimaryContainer: '#00422b',
  danger: '#ef4444',
  errorContainer: '#ffdad6',
  warning: '#f59e0b',
  warningContainer: '#fef3c7',
  success: '#10b981',
  successContainer: '#dcfce7',
  onSurface: '#161d19',
  onSurfaceVariant: '#3c4a42',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
};

export default function PresenceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const paramEspaceId = params.espaceId ? Number(params.espaceId) : null;

  const {
    activePresence,
    isActive,
    durationSeconds,
    startPresence,
    endPresence,
    isLoading: isPresenceLoading,
  } = usePresence();

  // --- States for Pre-Declaration ---
  const [espace, setEspace] = useState<EspacePublicResponse | null>(null);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  // --- States for Active Session ---
  const [isTerminating, setIsTerminating] = useState(false);
  const [selectedAffluence, setSelectedAffluence] = useState<StatutAffluence | null>(null);
  const [isSubmittingAffluence, setIsSubmittingAffluence] = useState(false);

  // Pulse animation for GPS
  const [pulseAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  // Load espace info if not active but we have an ID
  useEffect(() => {
    if (!isActive && paramEspaceId) {
      loadEspaceAndLocation(paramEspaceId);
    }
  }, [isActive, paramEspaceId]);

  const loadEspaceAndLocation = async (id: number) => {
    try {
      const data = await espacePublicApi.getById(id);
      setEspace(data);
      checkLocation(data);
    } catch (e) {
      console.error('Erreur chargement espace:', e);
      Alert.alert('Erreur', 'Impossible de charger les informations de l\'espace.');
    }
  };

  const checkLocation = async (espaceData: EspacePublicResponse) => {
    setIsLocating(true);
    setLocationError(null);
    try {
      const loc = await getCurrentLocation();
      if (loc) {
        setLocation(loc);
        const dist = calculateDistance(
          loc.latitude,
          loc.longitude,
          espaceData.latitude,
          espaceData.longitude
        );
        setDistance(Math.round(dist));
      } else {
        setLocationError('Permission GPS refusée');
      }
    } catch (e) {
      setLocationError('Erreur GPS');
    } finally {
      setIsLocating(false);
    }
  };

  const handleStartSession = async () => {
    if (!paramEspaceId) return;
    setIsStarting(true);
    try {
      await startPresence(paramEspaceId);
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Erreur lors de la déclaration.';
      Alert.alert('Erreur', msg);
    } finally {
      setIsStarting(false);
    }
  };

  const handleTerminer = () => {
    Alert.alert(
      'Terminer la présence',
      'Êtes-vous sûr de vouloir terminer votre présence ici ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Terminer',
          style: 'destructive',
          onPress: async () => {
            setIsTerminating(true);
            try {
              await endPresence();
              Alert.alert('Terminé', 'Votre présence a été clôturée avec succès.', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (error: any) {
              Alert.alert('Erreur', 'Impossible de terminer la présence.');
            } finally {
              setIsTerminating(false);
            }
          },
        },
      ]
    );
  };

  const handleValiderAffluence = async () => {
    if (!selectedAffluence) {
      Alert.alert('Info', 'Veuillez sélectionner un niveau d\'affluence.');
      return;
    }
    if (!activePresence) return;

    setIsSubmittingAffluence(true);
    try {
      const loc = location || (await getCurrentLocation());
      if (!loc) {
        Alert.alert('Localisation requise', 'Impossible d\'obtenir votre position pour valider l\'affluence.');
        return;
      }
      await affluenceApi.declarer(activePresence.espacePublicId, {
        statutAffluence: selectedAffluence,
        latitude: loc.latitude,
        longitude: loc.longitude,
      });
      Alert.alert('Merci !', 'Votre déclaration d\'affluence a bien été enregistrée.');
      setSelectedAffluence(null);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible d\'enregistrer l\'affluence.');
    } finally {
      setIsSubmittingAffluence(false);
    }
  };

  if (isPresenceLoading && !isActive && !espace) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Si on n'est ni actif ni en cours de pré-déclaration
  if (!isActive && !espace) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <ArrowLeft size={24} color={COLORS.onSurfaceVariant} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SmartyPark</Text>
          <View style={styles.iconBtn} />
        </View>
        <View style={styles.emptyContainer}>
          <CheckCircle size={64} color={COLORS.slate200} />
          <Text style={styles.emptyTitle}>Aucune présence active</Text>
          <TouchableOpacity 
            style={[styles.primaryButton, { alignSelf: 'center', paddingHorizontal: 32 }]}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.primaryButtonText}>Explorer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft size={24} color={COLORS.onSurfaceVariant} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SmartyPark</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Top Banner : GPS Verification */}
        {isActive ? (
          <View style={[styles.gpsBanner, { backgroundColor: COLORS.successContainer, borderColor: 'rgba(16, 185, 129, 0.2)' }]}>
            <View style={[styles.gpsIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
              <Animated.View style={[styles.gpsPulse, { backgroundColor: 'rgba(16, 185, 129, 0.3)', transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] }) }], opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]} />
              <CheckCircle size={20} color={COLORS.success} />
            </View>
            <View style={styles.gpsTexts}>
              <Text style={[styles.gpsTitle, { color: COLORS.success }]}>Vérification GPS... Position validée</Text>
              <Text style={styles.gpsSub}>Vous êtes bien sur place.</Text>
            </View>
          </View>
        ) : (
          <View style={[styles.gpsBanner, { backgroundColor: COLORS.slate100, borderColor: COLORS.slate200 }]}>
            <View style={[styles.gpsIconBox, { backgroundColor: COLORS.surface }]}>
              {isLocating ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : locationError ? (
                <AlertTriangle size={20} color={COLORS.warning} />
              ) : (
                <Navigation size={20} color={COLORS.primary} />
              )}
            </View>
            <View style={styles.gpsTexts}>
              <Text style={[styles.gpsTitle, { color: COLORS.onSurface }]}>
                {isLocating ? 'Localisation en cours...' : locationError ? 'Position introuvable' : 'Position récupérée'}
              </Text>
              <Text style={styles.gpsSub}>
                {isLocating 
                  ? 'Veuillez patienter...' 
                  : locationError 
                    ? 'Activez le GPS pour une meilleure expérience.'
                    : `Distance avec l'espace : ${distance} m`}
              </Text>
            </View>
          </View>
        )}

        {/* Central Card */}
        <View style={styles.centralCard}>
          {isActive ? (
            <>
              <View style={styles.timerIconBox}>
                <Timer size={32} color={COLORS.onPrimaryContainer} />
              </View>
              <Text style={styles.timerText}>{formatTimerSeconds(durationSeconds)}</Text>
              
              <View style={styles.activeBadgeRow}>
                <View style={styles.activeDot} />
                <Text style={styles.activeBadgeText}>
                  Présence en cours au {activePresence?.espacePublicNom}
                </Text>
              </View>

              <TouchableOpacity 
                style={styles.dangerOutlineButton}
                onPress={handleTerminer}
                disabled={isTerminating}
              >
                {isTerminating ? (
                  <ActivityIndicator size="small" color={COLORS.danger} />
                ) : (
                  <>
                    <StopCircle size={20} color={COLORS.danger} />
                    <Text style={styles.dangerOutlineButtonText}>Terminer ma présence</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={[styles.timerIconBox, { backgroundColor: COLORS.slate100 }]}>
                <MapPin size={32} color={COLORS.onSurfaceVariant} />
              </View>
              <Text style={[styles.timerText, { fontSize: 24, marginBottom: 16 }]}>{espace?.nom}</Text>
              
              <Text style={styles.preDeclareDesc}>
                Vous êtes sur le point de déclarer votre présence dans cet espace public.
              </Text>

              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={handleStartSession}
                disabled={isStarting}
              >
                {isStarting ? (
                  <ActivityIndicator size="small" color={COLORS.surface} />
                ) : (
                  <>
                    <CheckCircle size={20} color={COLORS.surface} />
                    <Text style={styles.primaryButtonText}>Déclarer ma présence</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Collaborative Zone (only if active) */}
        {isActive && (
          <View style={styles.collabZone}>
            <View style={styles.collabSection}>
              <Text style={styles.collabTitle}>Niveau d'affluence actuel</Text>
              <View style={styles.affluenceGrid}>
                {/* Faible */}
                <TouchableOpacity 
                  style={[styles.affluenceBtn, { backgroundColor: selectedAffluence === 'DISPONIBLE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)', borderColor: selectedAffluence === 'DISPONIBLE' ? COLORS.success : 'rgba(16, 185, 129, 0.2)' }]}
                  onPress={() => setSelectedAffluence('DISPONIBLE')}
                >
                  <View style={[styles.affluenceIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                    <User size={24} color={COLORS.success} />
                  </View>
                  <Text style={styles.affluenceBtnText}>Faible</Text>
                </TouchableOpacity>

                {/* Modéré */}
                <TouchableOpacity 
                  style={[styles.affluenceBtn, { backgroundColor: selectedAffluence === 'PRESQUE_SATURE' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)', borderColor: selectedAffluence === 'PRESQUE_SATURE' ? COLORS.warning : 'rgba(245, 158, 11, 0.2)' }]}
                  onPress={() => setSelectedAffluence('PRESQUE_SATURE')}
                >
                  <View style={[styles.affluenceIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                    <Users size={24} color={COLORS.warning} />
                  </View>
                  <Text style={styles.affluenceBtnText}>Modéré</Text>
                </TouchableOpacity>

                {/* Saturé */}
                <TouchableOpacity 
                  style={[styles.affluenceBtn, { backgroundColor: selectedAffluence === 'SATURE' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 218, 214, 0.3)', borderColor: selectedAffluence === 'SATURE' ? COLORS.danger : COLORS.errorContainer }]}
                  onPress={() => setSelectedAffluence('SATURE')}
                >
                  <View style={[styles.affluenceIconBox, { backgroundColor: COLORS.errorContainer }]}>
                    <UserPlus size={24} color={COLORS.danger} />
                  </View>
                  <Text style={styles.affluenceBtnText}>Saturé</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={handleValiderAffluence}
                disabled={isSubmittingAffluence || !selectedAffluence}
              >
                {isSubmittingAffluence ? (
                  <ActivityIndicator size="small" color={COLORS.surface} />
                ) : (
                  <Text style={styles.primaryButtonText}>Valider l'affluence</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Signalement */}
            <TouchableOpacity 
              style={styles.signalementBtn}
              onPress={() => router.push({
                pathname: '/signalements/creer',
                params: {
                  id: activePresence.espacePublicId.toString(),
                  nom: activePresence.espacePublicNom,
                },
              })}
            >
              <View style={styles.signalementIconBox}>
                <AlertTriangle size={24} color={COLORS.danger} />
              </View>
              <View style={styles.signalementTexts}>
                <Text style={styles.signalementTitle}>Signaler un problème / matériel endommagé</Text>
                <Text style={styles.signalementSub}>(Banc cassé, équipement abîmé, etc.)</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.onSurface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 64,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate100,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  content: { padding: 20, gap: 24, paddingBottom: 40 },
  
  gpsBanner: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  gpsIconBox: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  gpsPulse: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 20 },
  gpsTexts: { flex: 1 },
  gpsTitle: { fontSize: 14, fontWeight: '600' },
  gpsSub: { fontSize: 12, color: COLORS.onSurfaceVariant, marginTop: 4 },

  centralCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.slate100,
    borderRadius: 12, padding: 24,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  timerIconBox: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  timerText: { fontSize: 36, fontWeight: '700', color: COLORS.primary, marginBottom: 8, fontVariant: ['tabular-nums'] },
  activeBadgeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#e8f0e9', paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 999, marginBottom: 24,
  },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success },
  activeBadgeText: { fontSize: 12, fontWeight: '500', color: COLORS.onSurfaceVariant },
  
  preDeclareDesc: {
    fontSize: 14, color: COLORS.onSurfaceVariant,
    textAlign: 'center', marginBottom: 24, paddingHorizontal: 16,
  },

  dangerOutlineButton: {
    width: '100%',
    borderWidth: 2, borderColor: COLORS.danger,
    borderRadius: 999, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  dangerOutlineButtonText: { fontSize: 14, fontWeight: '600', color: COLORS.danger },
  
  primaryButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 999, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  primaryButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.surface },

  collabZone: { gap: 16, marginTop: 8 },
  collabSection: { gap: 16 },
  collabTitle: { fontSize: 18, fontWeight: '600', color: COLORS.onSurface },
  
  affluenceGrid: { flexDirection: 'row', gap: 12 },
  affluenceBtn: {
    flex: 1, borderWidth: 1, borderRadius: 12, padding: 12,
    alignItems: 'center', gap: 8,
  },
  affluenceIconBox: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  affluenceBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.onSurface },
  
  signalementBtn: {
    backgroundColor: 'rgba(255, 218, 214, 0.2)',
    borderWidth: 1, borderColor: 'rgba(255, 218, 214, 0.5)',
    borderRadius: 12, padding: 16,
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    marginTop: 16,
  },
  signalementIconBox: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: COLORS.errorContainer,
    alignItems: 'center', justifyContent: 'center',
  },
  signalementTexts: { flex: 1 },
  signalementTitle: { fontSize: 14, fontWeight: '700', color: COLORS.onSurface },
  signalementSub: { fontSize: 12, color: COLORS.onSurfaceVariant, marginTop: 4 },
});
