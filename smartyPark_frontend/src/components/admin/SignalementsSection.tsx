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
} from 'react-native';
import { ShieldAlert, Clock, Check, X, Sparkles, Wrench, HelpCircle, User as UserIcon, Inbox } from 'lucide-react-native';
import { signalementApi } from '../../api/signalementApi';
import { COLORS } from '../../constants/colors';
import { formatDateTime } from '../../utils/formatters';
import { SignalementResponse, StatutSignalement, TypeSignalement } from '../../types';
import { adminStyles as s } from './adminStyles';
import type { SectionHandle } from './PropositionsSection';

const SIGNALEMENT_TYPE_CONFIG: Record<TypeSignalement, { label: string; icon: React.ReactNode; color: string }> = {
  PROPRETE: { label: 'Propreté', icon: <Sparkles size={16} color="#0D9488" />, color: '#0D9488' },
  EQUIPEMENT: { label: 'Équipement', icon: <Wrench size={16} color="#D97706" />, color: '#D97706' },
  SECURITE: { label: 'Sécurité', icon: <ShieldAlert size={16} color="#DC2626" />, color: '#DC2626' },
  AUTRE: { label: 'Autre', icon: <HelpCircle size={16} color="#6366F1" />, color: '#6366F1' },
};

/**
 * Affiche la photo d'un signalement en la récupérant via axios (Bearer token
 * injecté automatiquement) plutôt qu'en passant par le prop `headers` de
 * <Image>, qui n'est pas transmis de façon fiable sous Expo Go.
 */
function SignalementPhoto({ signalementId }: { signalementId: number }) {
  const [dataUri, setDataUri] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    signalementApi
      .getPhotoDataUri(signalementId)
      .then((uri) => { if (!cancelled) setDataUri(uri); })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [signalementId]);

  if (failed) {
    return (
      <View style={[s.photo, s.photoPlaceholder]}>
        <Text style={s.photoPlaceholderText}>Photo indisponible</Text>
      </View>
    );
  }
  if (!dataUri) {
    return (
      <View style={[s.photo, s.photoPlaceholder]}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  }
  return <Image source={{ uri: dataUri }} style={s.photo} resizeMode="cover" />;
}

interface Props {
  onCountChange?: (count: number) => void;
}

export const SignalementsSection = forwardRef<SectionHandle, Props>(({ onCountChange }, ref) => {
  const [signalements, setSignalements] = useState<SignalementResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [traiterCible, setTraiterCible] = useState<{ signalement: SignalementResponse; nouveauStatut: StatutSignalement } | null>(null);
  const [commentaire, setCommentaire] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await signalementApi.getEnAttente();
      setSignalements(data);
      onCountChange?.(data.length);
    } catch (e) {
      console.error('Erreur chargement signalements:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({ refresh: load }));

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setIsRefreshing(true);
    load();
  };

  const submitTraiter = async () => {
    if (!traiterCible || !commentaire.trim()) return;
    setIsSubmitting(true);
    try {
      await signalementApi.traiter(traiterCible.signalement.id, traiterCible.nouveauStatut, commentaire.trim());
      setSignalements((prev) => {
        const next = prev.filter((sig) => sig.id !== traiterCible.signalement.id);
        onCountChange?.(next.length);
        return next;
      });
      setTraiterCible(null);
      setCommentaire('');
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message || 'Impossible de traiter le signalement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={s.loader} />;
  }

  return (
    <>
      <FlatList
        data={signalements}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={COLORS.primary} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          <View style={s.empty}>
            <Inbox size={56} color="#CBD5E1" />
            <Text style={s.emptyTitle}>Aucun signalement en attente</Text>
            <Text style={s.emptySub}>Tout est à jour, bon travail !</Text>
          </View>
        }
        renderItem={({ item }) => {
          const typeConfig = SIGNALEMENT_TYPE_CONFIG[item.type];
          return (
            <View style={s.card}>
              <View style={s.cardHeader}>
                <View style={[s.typeIconWrapper, { backgroundColor: typeConfig.color + '1A' }]}>{typeConfig.icon}</View>
                <View style={s.cardHeaderInfo}>
                  <Text style={s.cardName}>{typeConfig.label}</Text>
                  <Text style={s.cardCategory}>{item.espacePublicNom}</Text>
                </View>
              </View>

              <View style={s.cardBody}>
                <Text style={s.description}>{item.description}</Text>
                {item.photoDisponible && <SignalementPhoto signalementId={item.id} />}
                <View style={s.infoRow}>
                  <UserIcon size={14} color="#64748B" />
                  <Text style={s.infoText}>Signalé par {item.signaleParkPrenom} {item.signaleParkNom}</Text>
                </View>
                <View style={s.infoRow}>
                  <Clock size={14} color="#64748B" />
                  <Text style={s.infoText}>{formatDateTime(item.dateCreation)}</Text>
                </View>
              </View>

              <View style={s.actionsRow}>
                <TouchableOpacity
                  style={[s.actionBtn, s.refuseBtn]}
                  onPress={() => setTraiterCible({ signalement: item, nouveauStatut: 'REJETE' })}
                  activeOpacity={0.8}
                >
                  <X size={16} color="#DC2626" />
                  <Text style={s.refuseBtnText}>Rejeter</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.actionBtn, s.validateBtn]}
                  onPress={() => setTraiterCible({ signalement: item, nouveauStatut: 'TRAITE' })}
                  activeOpacity={0.8}
                >
                  <Check size={16} color="#FFFFFF" />
                  <Text style={s.validateBtnText}>Marquer traité</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      <Modal visible={!!traiterCible} transparent animationType="fade" onRequestClose={() => setTraiterCible(null)}>
        <KeyboardAvoidingView style={s.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>
              {traiterCible?.nouveauStatut === 'TRAITE' ? 'Marquer comme traité' : 'Rejeter le signalement'}
            </Text>
            <Text style={s.modalLabel}>Commentaire modérateur *</Text>
            <TextInput
              style={s.modalInput}
              placeholder="Expliquez l'action prise ou la raison du rejet..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              value={commentaire}
              onChangeText={setCommentaire}
            />
            <View style={s.modalActions}>
              <TouchableOpacity
                style={[s.modalBtn, s.modalBtnCancel]}
                onPress={() => { setTraiterCible(null); setCommentaire(''); }}
                activeOpacity={0.8}
              >
                <Text style={s.modalBtnCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modalBtn, s.modalBtnConfirm, (!commentaire.trim() || isSubmitting) && s.modalBtnDisabled]}
                onPress={submitTraiter}
                disabled={!commentaire.trim() || isSubmitting}
                activeOpacity={0.8}
              >
                {isSubmitting ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={s.modalBtnConfirmText}>Confirmer</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
});
