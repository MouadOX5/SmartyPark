import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle } from 'lucide-react-native';

import { usePresence } from '../../src/context/PresenceContext';
import { espacePublicApi } from '../../src/api/espacePublicApi';
import { affluenceApi } from '../../src/api/affluenceApi';
import { getCurrentLocation, calculateDistance, Coordinates } from '../../src/utils/location';
import { StatutAffluence, EspacePublicResponse } from '../../src/types';
import { formatTimerSeconds } from '../../src/utils/formatters';

import GpsStatusBanner from '../../src/components/presence/GpsStatusBanner';
import ActivePresenceCard from '../../src/components/presence/ActivePresenceCard';
import AffluenceSelector from '../../src/components/presence/AffluenceSelector';
import ProblemReportCard from '../../src/components/presence/ProblemReportCard';
import PresenceToast from '../../src/components/presence/PresenceToast';

const COLORS = {
  background: '#f4fbf4',
  surface: '#ffffff',
  primary: '#006c49',
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
  
  // --- Toast ---
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

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
    if (!location) {
      Alert.alert('Localisation requise', 'Veuillez attendre la récupération de votre position GPS.');
      return;
    }
    setIsStarting(true);
    try {
      await startPresence({
        espacePublicId: paramEspaceId,
        latitude: location.latitude,
        longitude: location.longitude,
      });
      showToast('Présence démarrée avec succès !');
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
    if (!selectedAffluence) return;
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
      showToast('Déclaration enregistrée ! Merci pour votre contribution.');
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
        <GpsStatusBanner
          isActive={isActive}
          isLocating={isLocating}
          locationError={locationError}
          distance={distance}
        />

        <ActivePresenceCard
          isActive={isActive}
          isStarting={isStarting}
          isTerminating={isTerminating}
          espaceNom={isActive ? activePresence?.espacePublicNom : espace?.nom}
          durationText={formatTimerSeconds(durationSeconds)}
          onStart={handleStartSession}
          onTerminate={handleTerminer}
        />

        {isActive && (
          <View style={styles.collabZone}>
            <AffluenceSelector
              selectedAffluence={selectedAffluence}
              isSubmitting={isSubmittingAffluence}
              onSelect={setSelectedAffluence}
              onSubmit={handleValiderAffluence}
            />

            <View style={{ marginTop: 16 }}>
              <ProblemReportCard
                onPress={() => router.push({
                  pathname: '/signalements/creer',
                  params: {
                    id: activePresence?.espacePublicId.toString() || '',
                    nom: activePresence?.espacePublicNom || '',
                  },
                })}
              />
            </View>
          </View>
        )}
      </ScrollView>

      <PresenceToast
        visible={toastVisible}
        message={toastMessage}
        onHide={() => setToastVisible(false)}
      />
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
    backgroundColor: COLORS.surface, // Stitch design header is bg-surface
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  content: { padding: 20, gap: 24, paddingBottom: 100 }, // Added extra padding for the toast/bottom
  
  collabZone: { gap: 16, marginTop: 8 },
  
  primaryButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 999, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  primaryButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.surface },
});
