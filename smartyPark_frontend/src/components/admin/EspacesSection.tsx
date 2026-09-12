import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { MapPin, Check, Trash2, Plus, Camera, Navigation, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { espacePublicApi } from '../../api/espacePublicApi';
import { COLORS } from '../../constants/colors';
import { formatCategoryName } from '../../utils/formatters';
import { getCurrentLocation, Coordinates } from '../../utils/location';
import { CategorieEspace, EspacePublicResponse } from '../../types';
import { PhotoFile } from '../../types/media';
import { CategoryIcon } from '../CategoryIcon';
import { adminStyles as s } from './adminStyles';
import type { SectionHandle } from './PropositionsSection';

const CATEGORIES: { key: CategorieEspace; label: string }[] = [
  { key: 'STREET_WORKOUT', label: 'Street Workout' },
  { key: 'FOOTBALL', label: 'Football' },
  { key: 'BASKETBALL', label: 'Basketball' },
  { key: 'ENFANTS', label: 'Aires de jeux' },
];

interface Props {
  isAdministrateur: boolean;
}

export const EspacesSection = forwardRef<SectionHandle, Props>(({ isAdministrateur }, ref) => {
  const [espaces, setEspaces] = useState<EspacePublicResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await espacePublicApi.getAllTous();
      setEspaces(data);
    } catch (e) {
      console.error('Erreur chargement espaces:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useImperativeHandle(ref, () => ({ refresh: load }));

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setIsRefreshing(true);
    load();
  };

  const handleValider = async (item: EspacePublicResponse) => {
    try {
      const updated = await espacePublicApi.valider(item.id);
      setEspaces((prev) => prev.map((e) => (e.id === item.id ? updated : e)));
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message || "Impossible de valider l'espace.");
    }
  };

  const handleSupprimer = (item: EspacePublicResponse) => {
    Alert.alert('Supprimer cet espace ?', `"${item.nom}" sera définitivement supprimé.`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await espacePublicApi.supprimer(item.id);
            setEspaces((prev) => prev.filter((e) => e.id !== item.id));
          } catch (e: any) {
            Alert.alert('Erreur', e?.response?.data?.message || 'Impossible de supprimer cet espace.');
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={s.loader} />;
  }

  return (
    <>
      <FlatList
        data={espaces}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={COLORS.primary} colors={[COLORS.primary]} />
        }
        ListHeaderComponent={
          <TouchableOpacity style={localStyles.createBtn} onPress={() => setCreateVisible(true)} activeOpacity={0.85}>
            <Plus size={18} color="#FFFFFF" />
            <Text style={localStyles.createBtnText}>Créer un espace public</Text>
          </TouchableOpacity>
        }
        renderItem={({ item }) => (
          <View style={s.card}>
            {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={s.photo} resizeMode="cover" /> : null}
            <View style={s.cardHeader}>
              <CategoryIcon categorie={item.categorie} size={28} />
              <View style={s.cardHeaderInfo}>
                <Text style={s.cardName}>{item.nom}</Text>
                <Text style={s.cardCategory}>{formatCategoryName(item.categorie)}</Text>
              </View>
              <View
                style={[
                  localStyles.statusBadge,
                  { backgroundColor: item.estValide ? '#DCFCE7' : '#FEF3C7' },
                ]}
              >
                <Text style={[localStyles.statusText, { color: item.estValide ? '#16A34A' : '#D97706' }]}>
                  {item.estValide ? 'Publié' : 'Non publié'}
                </Text>
              </View>
            </View>

            <View style={s.cardBody}>
              <View style={s.infoRow}>
                <MapPin size={14} color="#64748B" />
                <Text style={s.infoText} numberOfLines={1}>{item.adresse}</Text>
              </View>
            </View>

            <View style={s.actionsRow}>
              {isAdministrateur && (
                <TouchableOpacity style={[s.actionBtn, s.refuseBtn]} onPress={() => handleSupprimer(item)} activeOpacity={0.8}>
                  <Trash2 size={16} color="#DC2626" />
                  <Text style={s.refuseBtnText}>Supprimer</Text>
                </TouchableOpacity>
              )}
              {!item.estValide && (
                <TouchableOpacity style={[s.actionBtn, s.validateBtn]} onPress={() => handleValider(item)} activeOpacity={0.8}>
                  <Check size={16} color="#FFFFFF" />
                  <Text style={s.validateBtnText}>Publier</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />

      <CreateEspaceModal
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
        onCreated={(created) => {
          setEspaces((prev) => [created, ...prev]);
          setCreateVisible(false);
        }}
      />
    </>
  );
});

function CreateEspaceModal({
  visible,
  onClose,
  onCreated,
}: {
  visible: boolean;
  onClose: () => void;
  onCreated: (espace: EspacePublicResponse) => void;
}) {
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [adresse, setAdresse] = useState('');
  const [categorie, setCategorie] = useState<CategorieEspace | null>(null);
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [photo, setPhoto] = useState<PhotoFile | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setNom('');
    setDescription('');
    setAdresse('');
    setCategorie(null);
    setCoords(null);
    setPhoto(null);
  };

  const handleGetGPS = async () => {
    setIsLocating(true);
    try {
      const loc = await getCurrentLocation();
      if (!loc) {
        Alert.alert('Localisation requise', "Veuillez autoriser l'accès à la position GPS.");
        return;
      }
      setCoords(loc);
    } finally {
      setIsLocating(false);
    }
  };

  const handlePickPhoto = async () => {
    Alert.alert('Ajouter une photo', 'Sélectionnez une option', [
      {
        text: 'Prendre une photo',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') return Alert.alert('Permission requise', "L'accès à l'appareil photo est nécessaire.");
          const result = await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: true, aspect: [4, 3] });
          if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];
            setPhoto({ uri: asset.uri, name: asset.fileName || 'photo.jpg', type: asset.mimeType || 'image/jpeg' });
          }
        },
      },
      {
        text: 'Choisir dans la galerie',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') return Alert.alert('Permission requise', "L'accès à la galerie est nécessaire.");
          const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsEditing: true, aspect: [4, 3] });
          if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];
            setPhoto({ uri: asset.uri, name: asset.fileName || 'photo.jpg', type: asset.mimeType || 'image/jpeg' });
          }
        },
      },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const handleSubmit = async () => {
    if (!nom.trim() || !categorie || !adresse.trim() || !coords) {
      Alert.alert('Champs manquants', 'Nom, catégorie, adresse et position GPS sont obligatoires.');
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await espacePublicApi.creer(
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
      // Un espace créé directement par un modérateur/admin est publié tout de suite
      const validated = await espacePublicApi.valider(created.id);
      onCreated(validated);
      reset();
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message || "Impossible de créer l'espace.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={s.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[s.modalCard, { maxHeight: '90%' }]}>
          <View style={localStyles.modalHeaderRow}>
            <Text style={s.modalTitle}>Créer un espace public</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={s.modalLabel}>Nom *</Text>
            <TextInput style={localStyles.input} placeholder="Ex : Terrain de foot Agdal" value={nom} onChangeText={setNom} />

            <Text style={[s.modalLabel, { marginTop: 12 }]}>Catégorie *</Text>
            <View style={localStyles.catRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[localStyles.catChip, categorie === cat.key && localStyles.catChipSelected, { flexDirection: 'row', alignItems: 'center', gap: 6 }]}
                  onPress={() => setCategorie(cat.key)}
                  activeOpacity={0.8}
                >
                  <CategoryIcon categorie={cat.key} size={16} />
                  <Text>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[s.modalLabel, { marginTop: 12 }]}>Adresse *</Text>
            <TextInput style={localStyles.input} placeholder="Ex : Avenue Ibn Sina, Rabat" value={adresse} onChangeText={setAdresse} />

            <Text style={[s.modalLabel, { marginTop: 12 }]}>Description</Text>
            <TextInput
              style={s.modalInput}
              placeholder="Description de l'espace..."
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
            />

            <Text style={[s.modalLabel, { marginTop: 12 }]}>Position GPS *</Text>
            <TouchableOpacity style={localStyles.gpsBtn} onPress={handleGetGPS} disabled={isLocating} activeOpacity={0.8}>
              <Navigation size={16} color={COLORS.primary} />
              <Text style={localStyles.gpsBtnText}>
                {isLocating ? 'Acquisition...' : coords ? `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}` : 'Récupérer la position GPS'}
              </Text>
            </TouchableOpacity>

            <Text style={[s.modalLabel, { marginTop: 12 }]}>Photo</Text>
            {photo ? (
              <View style={localStyles.photoPreviewContainer}>
                <Image source={{ uri: photo.uri }} style={localStyles.photoPreview} />
                <TouchableOpacity style={localStyles.deletePhotoBtn} onPress={() => setPhoto(null)} activeOpacity={0.8}>
                  <Trash2 size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={localStyles.uploadBox} onPress={handlePickPhoto} activeOpacity={0.8}>
                <Camera size={24} color={COLORS.primary} />
                <Text style={localStyles.uploadText}>Ajouter une photo</Text>
              </TouchableOpacity>
            )}

            <View style={s.modalActions}>
              <TouchableOpacity style={[s.modalBtn, s.modalBtnCancel]} onPress={() => { onClose(); reset(); }} activeOpacity={0.8}>
                <Text style={s.modalBtnCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modalBtn, s.modalBtnConfirm, isSubmitting && s.modalBtnDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                {isSubmitting ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={s.modalBtnConfirmText}>Créer et publier</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const localStyles = {
  createBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  createBtnText: { color: '#FFFFFF', fontWeight: '700' as const, fontSize: 14 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '700' as const },
  modalHeaderRow: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  catRow: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 8 },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  catChipSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primarySoft },
  gpsBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  gpsBtnText: { fontSize: 13, fontWeight: '700' as const, color: COLORS.primary },
  uploadBox: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed' as const,
    borderRadius: 12,
    paddingVertical: 22,
    gap: 6,
  },
  uploadText: { fontSize: 12, fontWeight: '600' as const, color: COLORS.primary },
  photoPreviewContainer: { position: 'relative' as const, borderRadius: 12, overflow: 'hidden' as const },
  photoPreview: { width: '100%' as const, height: 140, borderRadius: 12 },
  deletePhotoBtn: {
    position: 'absolute' as const,
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
};
