import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Trash2,
  Camera,
  ImageIcon,
  Sparkles,
  Wrench,
  ShieldAlert,
  HelpCircle,
  X,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { signalementApi, PhotoFile } from '../../src/api/signalementApi';
import { TypeSignalement } from '../../src/types';
import { COLORS } from '../../src/constants/colors';
import { Button } from '../../src/components/ui/Button';

interface TypeOption {
  type: TypeSignalement;
  label: string;
  icon: React.ReactNode;
}

const TYPE_OPTIONS: TypeOption[] = [
  {
    type: 'PROPRETE',
    label: 'Propreté',
    icon: <Sparkles size={18} color="#0D9488" />,
  },
  {
    type: 'EQUIPEMENT',
    label: 'Équipement',
    icon: <Wrench size={18} color="#D97706" />,
  },
  {
    type: 'SECURITE',
    label: 'Sécurité',
    icon: <ShieldAlert size={18} color="#DC2626" />,
  },
  {
    type: 'AUTRE',
    label: 'Autre',
    icon: <HelpCircle size={18} color="#6366F1" />,
  },
];

export default function CreerSignalementScreen() {
  const router = useRouter();
  const { id, nom } = useLocalSearchParams<{ id: string; nom?: string }>();
  const espaceId = Number(id);

  const [type, setType] = useState<TypeSignalement>('PROPRETE');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<PhotoFile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickPhoto = async () => {
    Alert.alert('Ajouter une photo', 'Sélectionnez une option', [
      {
        text: 'Prendre une photo',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission requise', "L'accès à l'appareil photo est nécessaire.");
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            quality: 0.7,
            allowsEditing: true,
            aspect: [4, 3],
          });
          if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];
            setPhoto({
              uri: asset.uri,
              name: asset.fileName || 'photo.jpg',
              type: asset.mimeType || 'image/jpeg',
            });
          }
        },
      },
      {
        text: 'Choisir dans la galerie',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission requise', "L'accès à la galerie est nécessaire.");
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            quality: 0.7,
            allowsEditing: true,
            aspect: [4, 3],
          });
          if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];
            setPhoto({
              uri: asset.uri,
              name: asset.fileName || 'photo.jpg',
              type: asset.mimeType || 'image/jpeg',
            });
          }
        },
      },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const handleEnvoyer = async () => {
    if (!description.trim()) {
      Alert.alert('Description requise', 'Veuillez décrire le problème rencontré.');
      return;
    }

    if (!espaceId || isNaN(espaceId)) {
      Alert.alert('Erreur', "Espace public non identifié.");
      return;
    }

    setIsSubmitting(true);
    try {
      await signalementApi.creer(
        {
          type,
          description: description.trim(),
          espacePublicId: espaceId,
        },
        photo
      );

      Alert.alert(
        'Signalement transmis !',
        'Merci de veiller sur la qualité et la sécurité de nos espaces publics.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      const message = error?.response?.data?.message;
      Alert.alert('Erreur', message || "Impossible d'envoyer le signalement. Réessayez.");
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
          <ArrowLeft size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Créer un signalement</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Badge Espace concerné */}
          <View style={styles.espaceBadge}>
            <Text style={styles.espaceBadgeLabel}>Espace concerné :</Text>
            <Text style={styles.espaceBadgeNom} numberOfLines={1}>
              {nom || 'Espace Public'}
            </Text>
          </View>

          {/* Type de signalement (4 puces) */}
          <Text style={styles.label}>Type d'incident *</Text>
          <View style={styles.typeRow}>
            {TYPE_OPTIONS.map((opt) => {
              const isSelected = type === opt.type;
              return (
                <TouchableOpacity
                  key={opt.type}
                  style={[
                    styles.typeChip,
                    isSelected && styles.typeChipSelected,
                  ]}
                  onPress={() => setType(opt.type)}
                  activeOpacity={0.75}
                >
                  {opt.icon}
                  <Text
                    style={[
                      styles.typeChipText,
                      isSelected && styles.typeChipTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Description */}
          <View style={styles.labelRow}>
            <Text style={styles.label}>Description du problème *</Text>
            <Text style={styles.counter}>{description.length}/1000</Text>
          </View>
          <TextInput
            style={styles.textArea}
            placeholder="Décrivez précisément l'incident ou le problème constaté..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={5}
            maxLength={1000}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />

          {/* Photo optionnelle */}
          <Text style={styles.label}>Photo (optionnelle)</Text>
          {photo ? (
            <View style={styles.photoPreviewContainer}>
              <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
              <TouchableOpacity
                style={styles.deletePhotoBtn}
                onPress={() => setPhoto(null)}
                activeOpacity={0.8}
              >
                <Trash2 size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadBox}
              onPress={handlePickPhoto}
              activeOpacity={0.7}
            >
              <Camera size={28} color={COLORS.primary} />
              <Text style={styles.uploadText}>Prendre ou sélectionner une photo</Text>
            </TouchableOpacity>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title={isSubmitting ? 'Envoi en cours...' : 'Envoyer le signalement'}
              onPress={handleEnvoyer}
              loading={isSubmitting}
              disabled={isSubmitting || !description.trim()}
              size="lg"
            />
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => router.back()}
              disabled={isSubmitting}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  espaceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
    gap: 8,
  },
  espaceBadgeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#15803D',
  },
  espaceBadgeNom: {
    fontSize: 14,
    fontWeight: '800',
    color: '#166534',
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  counter: {
    fontSize: 12,
    color: '#94A3B8',
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  typeChipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySoft,
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  typeChipTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    fontSize: 15,
    color: '#0F172A',
    minHeight: 120,
    marginBottom: 20,
  },
  uploadBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 28,
  },
  uploadText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  photoPreviewContainer: {
    position: 'relative',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 28,
  },
  photoPreview: {
    width: '100%',
    height: 180,
    borderRadius: 14,
  },
  deletePhotoBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(220, 38, 38, 0.85)',
    padding: 8,
    borderRadius: 20,
  },
  actions: {
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
});
