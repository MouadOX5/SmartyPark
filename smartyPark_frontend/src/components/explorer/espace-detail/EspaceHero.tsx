import React from 'react';
import { View, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Share as ShareIcon } from 'lucide-react-native';
import { CategoryIcon } from '../../CategoryIcon';

interface EspaceHeroProps {
  imageUrl?: string | null;
  imageError: boolean;
  categorie: string;
  onBack: () => void;
  onShare: () => void;
  onImageError: () => void;
}

const CATEGORY_BG: Record<string, string> = {
  FOOTBALL: '#E3F2FD',
  BASKETBALL: '#FFF3E0',
  STREET_WORKOUT: '#E8F5E9',
  ENFANTS: '#FCE4EC',
};

export default function EspaceHero({
  imageUrl,
  imageError,
  categorie,
  onBack,
  onShare,
  onImageError,
}: EspaceHeroProps) {
  const catBg = CATEGORY_BG[categorie] || '#E8F5E9';

  return (
    <View style={styles.heroContainer}>
      {imageUrl && !imageError ? (
        <ImageBackground
          source={{ uri: imageUrl }}
          style={styles.heroImage}
          onError={onImageError}
        >
          <View style={styles.gradientOverlay} />
        </ImageBackground>
      ) : (
        <View style={[styles.heroImage, { backgroundColor: catBg }]}>
          <CategoryIcon categorie={categorie} size={64} color="#FFFFFF" />
          <View style={styles.gradientOverlay} />
        </View>
      )}

      <SafeAreaView edges={['top']} style={styles.headerOverlay}>
        <TouchableOpacity style={styles.headerBtn} onPress={onBack} activeOpacity={0.8}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerBtn} onPress={onShare} activeOpacity={0.8}>
          <ShareIcon size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: 'rgba(30, 41, 59, 0.4)', // slate-800/40
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
});
