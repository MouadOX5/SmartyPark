import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { usePresence } from '../context/PresenceContext';
import { espacePublicApi } from '../api/espacePublicApi';
import { affluenceApi } from '../api/affluenceApi';
import { getCurrentLocation, calculateDistance, Coordinates } from '../utils/location';
import { StatutAffluence, EspacePublicResponse } from '../types';

export function usePresenceManager(paramEspaceId: number | null) {
  const router = useRouter();
  const presenceContext = usePresence();
  const { activePresence, isActive, startPresence, endPresence } = presenceContext;

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

  const hideToast = () => setToastVisible(false);

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

  useEffect(() => {
    if (!isActive && paramEspaceId) {
      loadEspaceAndLocation(paramEspaceId);
    }
  }, [isActive, paramEspaceId]);

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
                { text: 'OK', onPress: () => router.back() },
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

  const handleReportProblem = () => {
    router.push({
      pathname: '/signalements/creer',
      params: {
        id: activePresence?.espacePublicId.toString() || '',
        nom: activePresence?.espacePublicNom || '',
      },
    });
  };

  return {
    ...presenceContext,
    espace,
    distance,
    isLocating,
    locationError,
    isStarting,
    isTerminating,
    selectedAffluence,
    setSelectedAffluence,
    isSubmittingAffluence,
    toastVisible,
    toastMessage,
    hideToast,
    handleStartSession,
    handleTerminer,
    handleValiderAffluence,
    handleReportProblem,
    navigateBack: () => router.back(),
    navigateExplore: () => router.replace('/(tabs)'),
  };
}
