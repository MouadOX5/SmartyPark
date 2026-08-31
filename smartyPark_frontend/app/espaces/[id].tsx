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
  ImageBackground,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import {
  ArrowLeft,
  MapPin,
  Users,
  Navigation,
  Activity,
  Share as ShareIcon,
  CheckCircle,
  Info,
} from 'lucide-react-native';
import { espacePublicApi } from '../../src/api/espacePublicApi';
import { presenceApi } from '../../src/api/presenceApi';
import { EspacePublicResponse } from '../../src/types';
import { AffluenceBadge, getAffluenceText } from '../../src/components/AffluenceBadge';
import { AffluenceDonut } from '../../src/components/AffluenceDonut';
import { formatCategoryName } from '../../src/utils/formatters';
import { usePresence } from '../../src/context/PresenceContext';

const CATEGORY_EMOJIS: Record<string, string> = {
  FOOTBALL: '⚽',
  BASKETBALL: '🏀',
  STREET_WORKOUT: '💪',
  ENFANTS: '🎠',
};

const CATEGORY_BG: Record<string, string> = {
  FOOTBALL: '#E3F2FD',
  BASKETBALL: '#FFF3E0',
  STREET_WORKOUT: '#E8F5E9',
  ENFANTS: '#FCE4EC',
};

export default function EspaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const espaceId = Number(id);
  const insets = useSafeAreaInsets();

  const { isActive, startPresence, activePresence } = usePresence();

  const [espace, setEspace] = useState<EspacePublicResponse | null>(null);
  const [activeCount, setActiveCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [imageError, setImageError] = useState(false);

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

    // Go to the preparation and declaration screen
    router.push({
      pathname: '/presence/',
      params: { espaceId: espaceId.toString() },
    });
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#006c49" />
      </View>
    );
  }

  if (!espace) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <TouchableOpacity style={styles.errorBackBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#161d19" />
        </TouchableOpacity>
        <Text style={styles.errorText}>Espace public introuvable</Text>
        <TouchableOpacity style={styles.btnPrimary} onPress={() => router.back()}>
          <Text style={styles.btnPrimaryText}>Retour</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const emoji = CATEGORY_EMOJIS[espace.categorie] || '🏟️';
  const catBg = CATEGORY_BG[espace.categorie] || '#E8F5E9';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Hero Section */}
      <View style={styles.heroContainer}>
        {espace.imageUrl && !imageError ? (
          <ImageBackground
            source={{ uri: espace.imageUrl }}
            style={styles.heroImage}
            onError={() => setImageError(true)}
          >
            <View style={styles.gradientOverlay} />
          </ImageBackground>
        ) : (
          <View style={[styles.heroImage, { backgroundColor: catBg }]}>
            <Text style={styles.heroEmoji}>{emoji}</Text>
            <View style={styles.gradientOverlay} />
          </View>
        )}

        <SafeAreaView edges={['top']} style={styles.headerOverlay}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={handleShare} activeOpacity={0.8}>
            <ShareIcon size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.mainContent}
        contentContainerStyle={styles.mainContentScroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#006c49" />}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <View style={styles.catBadge}>
            <Text style={styles.catBadgeText}>{formatCategoryName(espace.categorie)}</Text>
          </View>
          <Text style={styles.title}>{espace.nom}</Text>
          <View style={styles.addressRow}>
            <MapPin size={16} color="#6c7a71" />
            <Text style={styles.addressText}>{espace.adresse}</Text>
          </View>
          {espace.estValide && (
            <View style={styles.verifiedRow}>
              <CheckCircle size={16} color="#006c49" />
              <Text style={styles.verifiedText}>Validé par la communauté</Text>
            </View>
          )}
        </View>

        {/* Description Card */}
        <View style={styles.sectionContainer}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Info size={18} color="#161d19" />
              <Text style={styles.cardTitle}>Description & Informations</Text>
            </View>
            <Text style={styles.descText}>{espace.description}</Text>
          </View>
        </View>

        {/* Affluence Real-time */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Affluence en temps réel</Text>
          <View style={[styles.card, styles.affluenceCard]}>
            <View style={styles.affluenceRow}>
              <View style={styles.donutWrapper}>
                <AffluenceDonut statut={espace.statutAffluenceActuel} size={110} />
              </View>
              <View style={styles.affluenceInfo}>
                <AffluenceBadge statut={espace.statutAffluenceActuel} size="md" />
                <Text style={styles.affluenceDescText}>
                  {getAffluenceText(espace.statutAffluenceActuel)}
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

      </ScrollView>

      {/* Fixed Action Zone */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.bottomBarInner}>
          <TouchableOpacity style={styles.btnOutline} onPress={handleItineraire} activeOpacity={0.8}>
            <Navigation size={20} color="#1e293b" />
            <Text style={styles.btnOutlineText}>Y aller (Maps)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnPrimary} onPress={handleStartSession} disabled={isStartingSession} activeOpacity={0.8}>
            {isStartingSession ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Activity size={20} color="#FFFFFF" />
                <Text style={styles.btnPrimaryText}>
                  {isActive && activePresence?.espacePublicId === espaceId
                    ? 'Session en cours'
                    : 'Déclarer ma présence'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
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
  heroContainer: {
    width: '100%',
    height: 320, // Approx 45vh for average mobile, min-h-[300px]
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroEmoji: {
    fontSize: 80,
    opacity: 0.8,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30, 41, 59, 0.4)', // slate-800/40 gradient logic
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    zIndex: 10,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)', // backdrop-blur-md fallback
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#f4fbf4', // surface
    marginTop: -24, // -mt-6
    borderTopLeftRadius: 24, // rounded-t-xl -> in RN rounded-t-3xl is better for -mt-6
    borderTopRightRadius: 24,
    zIndex: 20,
  },
  mainContentScroll: {
    paddingBottom: 120, // space for bottom bar
  },
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
  sectionTitle: {
    fontSize: 20, // headline-md
    fontWeight: '600',
    color: '#161d19', // on-surface
    marginBottom: 16,
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
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingHorizontal: 20,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 50,
  },
  bottomBarInner: {
    flexDirection: 'row',
    gap: 16,
    maxWidth: 768,
    alignSelf: 'center',
    width: '100%',
  },
  btnOutline: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0', // slate-200
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnOutlineText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b', // slate-800
  },
  btnPrimary: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#006c49', // primary
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});
