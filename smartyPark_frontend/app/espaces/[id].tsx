import React, { useState } from 'react';
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
  Platform,
  Share,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { ArrowLeft } from 'lucide-react-native';

import { useEspaceDetail } from '../../src/hooks/useEspaceDetail';
import { usePresence } from '../../src/context/PresenceContext';
import EspaceHero from '../../src/components/explorer/espace-detail/EspaceHero';
import EspaceInfoCard from '../../src/components/explorer/espace-detail/EspaceInfoCard';
import EspaceAffluenceSection from '../../src/components/explorer/espace-detail/EspaceAffluenceSection';
import EspaceActionBottomBar from '../../src/components/explorer/espace-detail/EspaceActionBottomBar';

export default function EspaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const espaceId = id ? Number(id) : null;
  const insets = useSafeAreaInsets();

  const { isActive, activePresence } = usePresence();
  
  const {
    espace,
    activeCount,
    isLoading,
    isRefreshing,
    imageError,
    onRefresh,
    handleImageError
  } = useEspaceDetail(espaceId);

  const [isStartingSession, setIsStartingSession] = useState(false);

  const handleItineraire = () => {
    if (!espace) return;
    const url = Platform.select({
      ios: `maps:0,0?q=${espace.latitude},${espace.longitude}`,
      android: `geo:0,0?q=${espace.latitude},${espace.longitude}(${espace.nom})`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${espace.latitude},${espace.longitude}`,
    });
    Linking.openURL(url as string);
  };

  const handleShare = async () => {
    if (!espace) return;
    try {
      await Share.share({
        message: `Découvre "${espace.nom}" sur SmartyPark ! Adresse : ${espace.adresse}`,
      });
    } catch (error) {
      console.error('Erreur lors du partage', error);
    }
  };

  const handleStartSession = () => {
    if (!espaceId) return;
    
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
    // Go to the preparation and declaration screen
    router.push({
      pathname: '/presence/',
      params: { espaceId: espaceId.toString() },
    });
    // Reset state after a small delay just in case we come back
    setTimeout(() => setIsStartingSession(false), 500);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#006c49" />
      </View>
    );
  }

  if (!espace || !espaceId) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <TouchableOpacity style={styles.errorBackBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#161d19" />
        </TouchableOpacity>
        <Text style={styles.errorText}>Espace public introuvable</Text>
        <TouchableOpacity style={styles.btnPrimaryError} onPress={() => router.back()}>
          <Text style={styles.btnPrimaryText}>Retour</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <EspaceHero
        imageUrl={espace.imageUrl}
        imageError={imageError}
        categorie={espace.categorie}
        onBack={() => router.back()}
        onShare={handleShare}
        onImageError={handleImageError}
      />

      <ScrollView
        style={styles.mainContent}
        contentContainerStyle={styles.mainContentScroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#006c49" />}
      >
        <EspaceInfoCard
          categorie={espace.categorie}
          nom={espace.nom}
          adresse={espace.adresse}
          estValide={espace.estValide}
          description={espace.description}
        />

        <EspaceAffluenceSection
          statutAffluenceActuel={espace.statutAffluenceActuel}
          activeCount={activeCount}
        />
      </ScrollView>

      <EspaceActionBottomBar
        insetsBottom={insets.bottom}
        onItineraire={handleItineraire}
        onStartSession={handleStartSession}
        isStartingSession={isStartingSession}
        isActive={isActive}
        isActiveForThisEspace={activePresence?.espacePublicId === espaceId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4fbf4', // background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4fbf4',
  },
  errorContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4fbf4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBackBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  errorText: {
    fontSize: 16,
    color: '#6c7a71',
    marginBottom: 20,
  },
  btnPrimaryError: {
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#006c49',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#f4fbf4', // surface
    marginTop: -24, // -mt-6
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 20,
  },
  mainContentScroll: {
    paddingBottom: 120, // space for bottom bar
  },
});
