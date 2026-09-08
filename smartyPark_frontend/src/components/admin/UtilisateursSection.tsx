import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Switch, Alert } from 'react-native';
import { Mail, Phone, Calendar, Inbox } from 'lucide-react-native';
import { utilisateurApi } from '../../api/utilisateurApi';
import { COLORS } from '../../constants/colors';
import { formatDateTime } from '../../utils/formatters';
import { Role, UtilisateurResponse } from '../../types';
import { adminStyles as s } from './adminStyles';
import type { SectionHandle } from './PropositionsSection';

const ROLE_LABELS: Record<Role, string> = {
  MOBILE_USER: 'Utilisateur',
  MODERATEUR: 'Modérateur',
  ADMINISTRATEUR: 'Administrateur',
};

const ROLE_COLORS: Record<Role, string> = {
  MOBILE_USER: '#0284C7',
  MODERATEUR: '#7C3AED',
  ADMINISTRATEUR: '#DC2626',
};

export const UtilisateursSection = forwardRef<SectionHandle, {}>((_props, ref) => {
  const [utilisateurs, setUtilisateurs] = useState<UtilisateurResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await utilisateurApi.getAll();
      setUtilisateurs(data);
    } catch (e) {
      console.error('Erreur chargement utilisateurs:', e);
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

  const handleToggle = async (item: UtilisateurResponse) => {
    setTogglingId(item.id);
    try {
      const updated = await utilisateurApi.toggleActif(item.id);
      setUtilisateurs((prev) => prev.map((u) => (u.id === item.id ? updated : u)));
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message || 'Impossible de modifier ce compte.');
    } finally {
      setTogglingId(null);
    }
  };

  if (isLoading) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={s.loader} />;
  }

  return (
    <FlatList
      data={utilisateurs}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={s.list}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={COLORS.primary} colors={[COLORS.primary]} />
      }
      ListEmptyComponent={
        <View style={s.empty}>
          <Inbox size={56} color="#CBD5E1" />
          <Text style={s.emptyTitle}>Aucun utilisateur</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={s.card}>
          <View style={s.cardHeader}>
            <View
              style={[
                localStyles.avatar,
                { backgroundColor: ROLE_COLORS[item.role] + '1A' },
              ]}
            >
              <Text style={[localStyles.avatarText, { color: ROLE_COLORS[item.role] }]}>
                {item.prenom?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
            <View style={s.cardHeaderInfo}>
              <Text style={s.cardName}>{item.prenom} {item.nom}</Text>
              <Text style={[localStyles.roleLabel, { color: ROLE_COLORS[item.role] }]}>{ROLE_LABELS[item.role]}</Text>
            </View>
            <View style={localStyles.switchWrapper}>
              {togglingId === item.id ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Switch
                  value={item.estActif}
                  onValueChange={() => handleToggle(item)}
                  trackColor={{ false: '#E2E8F0', true: COLORS.primarySoft }}
                  thumbColor={item.estActif ? COLORS.primary : '#94A3B8'}
                />
              )}
            </View>
          </View>

          <View style={s.cardBody}>
            <View style={s.infoRow}>
              <Mail size={14} color="#64748B" />
              <Text style={s.infoText} numberOfLines={1}>{item.email}</Text>
            </View>
            {!!item.telephone && (
              <View style={s.infoRow}>
                <Phone size={14} color="#64748B" />
                <Text style={s.infoText}>{item.telephone}</Text>
              </View>
            )}
            <View style={s.infoRow}>
              <Calendar size={14} color="#64748B" />
              <Text style={s.infoText}>Inscrit le {formatDateTime(item.dateInscription)}</Text>
            </View>
            <Text style={[localStyles.statusText, { color: item.estActif ? '#16A34A' : '#DC2626' }]}>
              {item.estActif ? 'Compte actif' : 'Compte désactivé'}
            </Text>
          </View>
        </View>
      )}
    />
  );
});

const localStyles = {
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  avatarText: { fontSize: 18, fontWeight: '700' as const },
  roleLabel: { fontSize: 12, fontWeight: '700' as const, marginTop: 2 },
  switchWrapper: { minWidth: 44, alignItems: 'flex-end' as const },
  statusText: { fontSize: 12, fontWeight: '700' as const, marginTop: 4 },
};
