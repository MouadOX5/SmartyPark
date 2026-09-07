import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { Users, Clock, MapPin, Inbox } from 'lucide-react-native';
import { espacePublicApi } from '../../api/espacePublicApi';
import { presenceApi } from '../../api/presenceApi';
import { COLORS } from '../../constants/colors';
import { formatDateTime } from '../../utils/formatters';
import { EspacePublicResponse, PresenceResponse } from '../../types';
import { adminStyles as s } from './adminStyles';
import type { SectionHandle } from './PropositionsSection';

export const PresenceSection = forwardRef<SectionHandle, {}>((_props, ref) => {
  const [espaces, setEspaces] = useState<EspacePublicResponse[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [presences, setPresences] = useState<PresenceResponse[]>([]);
  const [isLoadingEspaces, setIsLoadingEspaces] = useState(true);
  const [isLoadingPresences, setIsLoadingPresences] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadEspaces = useCallback(async () => {
    try {
      const data = await espacePublicApi.getAllTous();
      setEspaces(data);
      if (data.length > 0) {
        setSelectedId((prev) => prev ?? data[0].id);
      }
    } catch (e) {
      console.error('Erreur chargement espaces:', e);
    } finally {
      setIsLoadingEspaces(false);
    }
  }, []);

  const loadPresences = useCallback(async (espaceId: number) => {
    setIsLoadingPresences(true);
    try {
      const data = await presenceApi.getActiveByEspace(espaceId);
      setPresences(data);
    } catch (e) {
      console.error('Erreur chargement présences:', e);
    } finally {
      setIsLoadingPresences(false);
      setIsRefreshing(false);
    }
  }, []);

  useImperativeHandle(ref, () => ({
    refresh: () => {
      if (selectedId) loadPresences(selectedId);
    },
  }));

  useEffect(() => {
    loadEspaces();
  }, [loadEspaces]);

  useEffect(() => {
    if (selectedId) loadPresences(selectedId);
  }, [selectedId, loadPresences]);

  const onRefresh = () => {
    setIsRefreshing(true);
    if (selectedId) loadPresences(selectedId);
  };

  if (isLoadingEspaces) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={s.loader} />;
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Sélecteur d'espace */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={localStyles.chipsRow}
      >
        {espaces.map((espace) => {
          const isSelected = espace.id === selectedId;
          return (
            <TouchableOpacity
              key={espace.id}
              style={[localStyles.chip, isSelected && localStyles.chipSelected]}
              onPress={() => setSelectedId(espace.id)}
              activeOpacity={0.8}
            >
              <Text style={[localStyles.chipText, isSelected && localStyles.chipTextSelected]} numberOfLines={1}>
                {espace.nom}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Compteur */}
      <View style={localStyles.counterBanner}>
        <Users size={18} color={COLORS.primary} />
        <Text style={localStyles.counterText}>
          {isLoadingPresences ? 'Chargement...' : `${presences.length} présence${presences.length !== 1 ? 's' : ''} active${presences.length !== 1 ? 's' : ''}`}
        </Text>
      </View>

      {isLoadingPresences ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={s.loader} />
      ) : (
        <FlatList
          data={presences}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={COLORS.primary} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <View style={s.empty}>
              <Inbox size={56} color="#CBD5E1" />
              <Text style={s.emptyTitle}>Aucune présence active</Text>
              <Text style={s.emptySub}>Personne n'est actuellement présent dans cet espace.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={s.card}>
              <View style={s.cardBody}>
                <View style={s.infoRow}>
                  <Users size={14} color="#64748B" />
                  <Text style={s.infoText}>
                    {item.utilisateurPrenom || 'Utilisateur'} {item.utilisateurNom || ''}
                  </Text>
                </View>
                <View style={s.infoRow}>
                  <Clock size={14} color="#64748B" />
                  <Text style={s.infoText}>Arrivé le {formatDateTime(item.heureArrivee)}</Text>
                </View>
                {item.distanceDeclarationMetres !== undefined && (
                  <View style={s.infoRow}>
                    <MapPin size={14} color="#64748B" />
                    <Text style={s.infoText}>
                      Déclaré à {Math.round(item.distanceDeclarationMetres)} m de l'espace
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
});

const localStyles = {
  chipsRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
    maxWidth: 180,
  },
  chipSelected: { backgroundColor: COLORS.primary },
  chipText: { fontSize: 13, fontWeight: '600' as const, color: '#475569' },
  chipTextSelected: { color: '#FFFFFF' },
  counterBanner: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  counterText: { fontSize: 13, fontWeight: '700' as const, color: COLORS.primary },
};
