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
import { MapPin, Clock, Check, X, User as UserIcon, Inbox } from 'lucide-react-native';
import { propositionApi } from '../../api/propositionApi';
import { COLORS } from '../../constants/colors';
import { formatDateTime, formatCategoryName } from '../../utils/formatters';
import { CategoryIcon } from '../CategoryIcon';
import { PropositionEspaceResponse } from '../../types';
import { adminStyles as s } from './adminStyles';

export interface SectionHandle {
  refresh: () => void;
}

interface Props {
  onCountChange?: (count: number) => void;
}

export const PropositionsSection = forwardRef<SectionHandle, Props>(({ onCountChange }, ref) => {
  const [propositions, setPropositions] = useState<PropositionEspaceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refusCible, setRefusCible] = useState<PropositionEspaceResponse | null>(null);
  const [motifRefus, setMotifRefus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await propositionApi.getEnAttente();
      setPropositions(data);
      onCountChange?.(data.length);
    } catch (e) {
      console.error('Erreur chargement propositions:', e);
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

  const handleValider = (item: PropositionEspaceResponse) => {
    Alert.alert(
      'Valider cette proposition ?',
      `"${item.nom}" deviendra un espace public visible par tous les utilisateurs.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Valider',
          onPress: async () => {
            try {
              await propositionApi.valider(item.id);
              setPropositions((prev) => {
                const next = prev.filter((p) => p.id !== item.id);
                onCountChange?.(next.length);
                return next;
              });
            } catch (e: any) {
              Alert.alert('Erreur', e?.response?.data?.message || 'Impossible de valider la proposition.');
            }
          },
        },
      ]
    );
  };

  const submitRefus = async () => {
    if (!refusCible || !motifRefus.trim()) return;
    setIsSubmitting(true);
    try {
      await propositionApi.refuser(refusCible.id, motifRefus.trim());
      setPropositions((prev) => {
        const next = prev.filter((p) => p.id !== refusCible.id);
        onCountChange?.(next.length);
        return next;
      });
      setRefusCible(null);
      setMotifRefus('');
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message || 'Impossible de refuser la proposition.');
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
        data={propositions}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={COLORS.primary} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          <View style={s.empty}>
            <Inbox size={56} color="#CBD5E1" />
            <Text style={s.emptyTitle}>Aucune proposition en attente</Text>
            <Text style={s.emptySub}>Tout est à jour, bon travail !</Text>
          </View>
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
            </View>

            <View style={s.cardBody}>
              <View style={s.infoRow}>
                <MapPin size={14} color="#64748B" />
                <Text style={s.infoText} numberOfLines={1}>{item.adresse}</Text>
              </View>
              <View style={s.infoRow}>
                <UserIcon size={14} color="#64748B" />
                <Text style={s.infoText}>Proposé par {item.proposeParkPrenom} {item.proposeParkNom}</Text>
              </View>
              <View style={s.infoRow}>
                <Clock size={14} color="#64748B" />
                <Text style={s.infoText}>{formatDateTime(item.dateProposition)}</Text>
              </View>
              {!!item.description && <Text style={s.description} numberOfLines={3}>{item.description}</Text>}
            </View>

            <View style={s.actionsRow}>
              <TouchableOpacity style={[s.actionBtn, s.refuseBtn]} onPress={() => setRefusCible(item)} activeOpacity={0.8}>
                <X size={16} color="#DC2626" />
                <Text style={s.refuseBtnText}>Refuser</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.actionBtn, s.validateBtn]} onPress={() => handleValider(item)} activeOpacity={0.8}>
                <Check size={16} color="#FFFFFF" />
                <Text style={s.validateBtnText}>Valider</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={!!refusCible} transparent animationType="fade" onRequestClose={() => setRefusCible(null)}>
        <KeyboardAvoidingView style={s.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Refuser "{refusCible?.nom}"</Text>
            <Text style={s.modalLabel}>Motif du refus *</Text>
            <TextInput
              style={s.modalInput}
              placeholder="Expliquez pourquoi cette proposition est refusée..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              value={motifRefus}
              onChangeText={setMotifRefus}
            />
            <View style={s.modalActions}>
              <TouchableOpacity
                style={[s.modalBtn, s.modalBtnCancel]}
                onPress={() => { setRefusCible(null); setMotifRefus(''); }}
                activeOpacity={0.8}
              >
                <Text style={s.modalBtnCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modalBtn, s.modalBtnConfirm, (!motifRefus.trim() || isSubmitting) && s.modalBtnDisabled]}
                onPress={submitRefus}
                disabled={!motifRefus.trim() || isSubmitting}
                activeOpacity={0.8}
              >
                {isSubmitting ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={s.modalBtnConfirmText}>Confirmer le refus</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
});
