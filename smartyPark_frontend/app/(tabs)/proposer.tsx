import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MapPin, Navigation, Info, ListOrdered, Camera, Trash2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { propositionApi, PhotoFile } from '../../src/api/propositionApi';
import { CategorieEspace } from '../../src/types';
import { COLORS } from '../../src/constants/colors';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { getCurrentLocation, Coordinates } from '../../src/utils/location';

const CATEGORIES: { key: CategorieEspace; label: string; emoji: string }[] = [
  { key: 'STREET_WORKOUT', label: 'Street Workout', emoji: '💪' },
  { key: 'FOOTBALL', label: 'Football', emoji: '⚽' },
  { key: 'BASKETBALL', label: 'Basketball', emoji: '🏀' },
  { key: 'ENFANTS', label: 'Aires de jeux', emoji: '🎠' },
];

export default function ProposerScreen() {
  const router = useRouter();

  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [adresse, setAdresse] = useState('');
  const [categorie, setCategorie] = useState<CategorieEspace | null>(null);
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [photo, setPhoto] = useState<PhotoFile | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleGetGPS = async () => {
    setIsLocating(true);
    try {
      const loc = await getCurrentLocation();
      if (!loc) {
        Alert.alert(
          'Localisation requise',
          'Veuillez autoriser SmartyPark à accéder à votre position GPS.'
        );
        return;
      }
      setCoords(loc);
      setErrors((prev) => ({ ...prev, coords: '' }));
    } finally {
      setIsLocating(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!nom.trim()) newErrors.nom = 'Le nom est obligatoire';
    if (!categorie) newErrors.categorie = 'La catégorie est obligatoire';
    if (!adresse.trim()) newErrors.adresse = "L'adresse est obligatoire";
    if (!coords) newErrors.coords = 'La position GPS est obligatoire';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !categorie || !coords) return;

    setIsSubmitting(true);
    try {
      await propositionApi.creer(
        {
          nom: nom.trim(),
          description: description.trim(),
          categorie,
          adresse: adresse.trim(),
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
        photo
      );

      Alert.alert(
        'Proposition envoyée ! 🎉',
        'Votre proposition sera examinée par nos modérateurs.',
        [
          {
            text: 'Voir mes propositions',
            onPress: () => router.push('/propositions/mes-propositions'),
          },
          {
            text: 'OK',
            style: 'cancel',
            onPress: () => {
              setNom('');
              setDescription('');
              setAdresse('');
              setCategorie(null);
              setCoords(null);
              setPhoto(null);
            },
          },
        ]
      );
    } catch (error: any) {
      const message = error?.response?.data?.message;
      Alert.alert('Erreur', message || "Impossible d'envoyer la proposition.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Proposer un espace</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Message info */}
          <View style={styles.infoBanner}>
            <Info size={20} color="#0284C7" />
            <Text style={styles.infoText}>
              Veuillez vous trouver sur place pour proposer un espace public.
            </Text>
          </View>

          {/* Nom */}
          <Input
            label="Nom de l'espace *"
            value={nom}
            onChangeText={setNom}
            placeholder="Ex : Terrain de football El Menzah"
            error={errors.nom}
          />

          {/* Catégorie */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Catégorie *</Text>
            <View style={styles.catGrid}>
              {CATEGORIES.map((cat) => {
                const isSelected = categorie === cat.key;
                return (
                  <TouchableOpacity
                    key={cat.key}
                    style={[
                      styles.catCard,
                      isSelected && styles.catCardSelected,
                    ]}
                    onPress={() => {
                      setCategorie(cat.key);
                      setErrors((prev) => ({ ...prev, categorie: '' }));
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.catEmoji}>{cat.emoji}</Text>
                    <Text
                      style={[
                        styles.catLabel,
                        isSelected && styles.catLabelSelected,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {errors.categorie ? (
              <Text style={styles.errorText}>{errors.categorie}</Text>
            ) : null}
          </View>

          {/* Adresse */}
          <Input
            label="Adresse ou localisation approximative *"
            value={adresse}
            onChangeText={setAdresse}
            placeholder="Ex : Rue Ibn Khaldoun, Quartier Al Massira"
            error={errors.adresse}
            leftIcon={<MapPin size={18} color="#94A3B8" />}
          />

          {/* Description */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Description (optionnelle)</Text>
            <TextInput
              style={styles.textArea}
              value={description}
              onChangeText={setDescription}
              placeholder="Décrivez l'état de l'espace, le sol, l'éclairage..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={500}
            />
          </View>

          {/* Position GPS automatique (PAS DE CARTE) */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Position GPS (sur place) *</Text>
            <TouchableOpacity
              style={styles.gpsBtn}
              onPress={handleGetGPS}
              disabled={isLocating}
              activeOpacity={0.8}
            >
              <Navigation size={18} color={COLORS.primary} />
              <Text style={styles.gpsBtnText}>
                {isLocating ? 'Acquisition GPS en cours...' : 'Récupérer ma position GPS'}
              </Text>
            </TouchableOpacity>

            {/* Inputs grisés en lecture seule */}
            <View style={styles.coordsRow}>
              <View style={styles.coordBox}>
                <Text style={styles.coordLabel}>Latitude</Text>
                <TextInput
                  style={styles.coordInput}
                  value={coords ? coords.latitude.toFixed(6) : '–'}
                  editable={false}
                />
              </View>
              <View style={styles.coordBox}>
                <Text style={styles.coordLabel}>Longitude</Text>
                <TextInput
                  style={styles.coordInput}
                  value={coords ? coords.longitude.toFixed(6) : '–'}
                  editable={false}
                />
              </View>
            </View>
            {errors.coords ? (
              <Text style={styles.errorText}>{errors.coords}</Text>
            ) : null}
          </View>

          {/* Photo optionnelle */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Photo (optionnelle)</Text>
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
          </View>

          {/* Soumettre */}
          <Button
            title={isSubmitting ? 'Envoi en cours...' : 'Soumettre la proposition'}
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            size="lg"
          />

          {/* Lien mes propositions */}
          <TouchableOpacity
            style={styles.mesPropositionsBtn}
            onPress={() => router.push('/propositions/mes-propositions')}
            activeOpacity={0.7}
          >
            <ListOrdered size={16} color={COLORS.primary} />
            <Text style={styles.mesPropositionsText}>Consulter mes propositions</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
  },
  infoText: {
    fontSize: 13,
    color: '#0369A1',
    lineHeight: 18,
    flex: 1,
  },
  fieldWrapper: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  catCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySoft,
  },
  catEmoji: {
    fontSize: 24,
  },
  catLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  catLabelSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    fontSize: 14,
    color: '#0F172A',
    minHeight: 80,
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 10,
  },
  gpsBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  coordsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  coordBox: {
    flex: 1,
  },
  coordLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 4,
  },
  coordInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 4,
  },
  mesPropositionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 6,
  },
  mesPropositionsText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  uploadBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 28,
    gap: 8,
  },
  uploadText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  photoPreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  deletePhotoBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
