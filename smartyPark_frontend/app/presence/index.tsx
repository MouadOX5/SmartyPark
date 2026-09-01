import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CheckCircle } from 'lucide-react-native';

import { usePresenceManager } from '../../src/hooks/usePresenceManager';
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
  const params = useLocalSearchParams();
  const paramEspaceId = params.espaceId ? Number(params.espaceId) : null;

  const {
    activePresence,
    isActive,
    durationSeconds,
    isLoading, // from context
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
    navigateBack,
    navigateExplore,
  } = usePresenceManager(paramEspaceId);

  if (isLoading && !isActive && !espace) {
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
          <TouchableOpacity onPress={navigateBack} style={styles.iconBtn}>
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
            onPress={navigateExplore}
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
        <TouchableOpacity onPress={navigateBack} style={styles.iconBtn}>
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
              <ProblemReportCard onPress={handleReportProblem} />
            </View>
          </View>
        )}
      </ScrollView>

      <PresenceToast
        visible={toastVisible}
        message={toastMessage}
        onHide={hideToast}
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
    backgroundColor: COLORS.surface,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  content: { padding: 20, gap: 24, paddingBottom: 100 },
  
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
