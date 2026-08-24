import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Navigation, CheckCircle2 } from 'lucide-react-native';
import { affluenceApi } from '../../src/api/affluenceApi';
import { StatutAffluence } from '../../src/types';
import { COLORS } from '../../src/constants/colors';
import { Button } from '../../src/components/ui/Button';
import { getCurrentLocation } from '../../src/utils/location';

interface AffluenceOption {
  value: StatutAffluence;
  label: string;
  description: string;
  color: string;
  bgColor: string;
}

const OPTIONS: AffluenceOption[] = [
  {
    value: 'DISPONIBLE',
    label: 'Disponible',
    description: 'Espace fluide, beaucoup de place',
    color: '#10B981',
    bgColor: '#DCFCE7',
  },
  {
    value: 'PRESQUE_SATURE',
    label: 'Occupé',
    description: 'Il y a du monde, reste peu de place',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
  },
  {
    value: 'SATURE',
    label: 'Complet',
    description: 'Espace très dense, plus de place',
    color: '#EF4444',
    bgColor: '#FEE2E2',
  },
];

export default function DeclarerAffluenceScreen() {
  const router = useRouter();
  const { id, nom } = useLocalSearchParams<{ id: string; nom?: string }>();
  const espaceId = Number(id);

  const [selectedStatut, setSelectedStatut] = useState<StatutAffluence | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedStatut) {
      Alert.alert('Veuillez choisir', 'Sélectionnez un niveau d\'affluence.');
      return;
    }
    if (!espaceId || isNaN(espaceId)) {
      Alert.alert('Erreur', 'Espace public non identifié.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Récupération GPS automatique et transparente
      const loc = await getCurrentLocation();
      if (!loc) {
        Alert.alert(
          'Localisation requise',
          'Veuillez autoriser SmartyPark à accéder à votre position pour déclarer l\'affluence.'
        );
        setIsSubmitting(false);
        return;
      }

      // 2. Envoi au backend
      await affluenceApi.declarer(espaceId, {
        statutAffluence: selectedStatut,
        latitude: loc.latitude,
        longitude: loc.longitude,
      });

      Alert.alert(
        'Merci ! 🎉',
        'Votre déclaration a bien été enregistrée et aide la communauté.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      Alert.alert(
        'Erreur',
        msg || 'Impossible d\'envoyer la déclaration. Veuillez réessayer.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Déclarer l'affluence</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Encart infos espace */}
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Vous déclarez pour :</Text>
          <Text style={styles.infoEspaceName}>{nom || 'Cet espace'}</Text>
          
          <View style={styles.gpsRow}>
            <Navigation size={14} color={COLORS.primary} />
            <Text style={styles.gpsText}>
              Votre position GPS sera utilisée pour valider votre présence sur place.
            </Text>
          </View>
        </View>

        <Text style={styles.questionTitle}>Quel est le niveau de monde actuel ?</Text>

        {/* Options de choix */}
        <View style={styles.optionsContainer}>
          {OPTIONS.map((opt) => {
            const isSelected = selectedStatut === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.optionCard,
                  isSelected && {
                    borderColor: opt.color,
                    backgroundColor: opt.bgColor,
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => setSelectedStatut(opt.value)}
              >
                <View style={styles.optionContent}>
                  <Text
                    style={[
                      styles.optionLabel,
                      isSelected && { color: opt.color },
                    ]}
                  >
                    {opt.label}
                  </Text>
                  <Text style={styles.optionDesc}>{opt.description}</Text>
                </View>

                {/* Indicateur radio custom */}
                <View
                  style={[
                    styles.radioCircle,
                    isSelected && { borderColor: opt.color },
                  ]}
                >
                  {isSelected && (
                    <View
                      style={[styles.radioDot, { backgroundColor: opt.color }]}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bouton d'action */}
        <Button
          title={
            isSubmitting ? 'Vérification GPS & Envoi...' : 'Valider ma déclaration'
          }
          size="lg"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={!selectedStatut || isSubmitting}
          leftIcon={!isSubmitting ? <CheckCircle2 size={18} color="#FFFFFF" /> : undefined}
        />
      </ScrollView>
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
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
  },
  infoEspaceName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.primarySoft,
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  gpsText: {
    fontSize: 12,
    color: COLORS.primary,
    flex: 1,
    lineHeight: 16,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 13,
    color: '#64748B',
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    backgroundColor: '#FFFFFF',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
