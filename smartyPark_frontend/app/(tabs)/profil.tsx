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
import { useRouter } from 'expo-router';
import {
  User,
  Mail,
  Phone,
  Shield,
  LogOut,
  ChevronRight,
  FileText,
  Calendar,
  CheckCircle,
} from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { COLORS } from '../../src/constants/colors';
import { formatDateTime } from '../../src/utils/formatters';
import { usePresence } from '../../src/context/PresenceContext';
import { formatTimerSeconds } from '../../src/utils/formatters';

const ROLE_LABELS: Record<string, string> = {
  MOBILE_USER: 'Utilisateur Mobile',
  MODERATEUR: 'Modérateur',
  ADMINISTRATEUR: 'Administrateur',
};

const ROLE_COLORS: Record<string, string> = {
  MOBILE_USER: COLORS.primary,
  MODERATEUR: '#7C3AED',
  ADMINISTRATEUR: '#DC2626',
};

export default function ProfilScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isActive, durationSeconds, activePresence } = usePresence();

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingPlaceholder}>
          <Text style={styles.loadingText}>Chargement du profil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const initials = `${user.prenom[0] ?? ''}${user.nom[0] ?? ''}`.toUpperCase();
  const roleColor = ROLE_COLORS[user.role] || COLORS.primary;
  const roleLabel = ROLE_LABELS[user.role] || user.role;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon Profil</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Carte Utilisateur */}
        <View style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: roleColor + '22' }]}>
            <Text style={[styles.avatarText, { color: roleColor }]}>{initials}</Text>
          </View>
          <Text style={styles.userName}>{user.prenom} {user.nom}</Text>
          <View style={[styles.roleBadge, { backgroundColor: roleColor + '15', borderColor: roleColor + '33' }]}>
            <Shield size={12} color={roleColor} />
            <Text style={[styles.roleText, { color: roleColor }]}>{roleLabel}</Text>
          </View>
          {user.estActif === false && (
            <View style={styles.inactiveBadge}>
              <Text style={styles.inactiveText}>Compte désactivé</Text>
            </View>
          )}
        </View>

        {/* Séance active (si en cours) */}
        {isActive && activePresence && (
          <TouchableOpacity
            style={styles.activeSessionCard}
            onPress={() => router.push('/presence/')}
            activeOpacity={0.85}
          >
            <View style={styles.activeSessionHeader}>
              <View style={styles.activeDot} />
              <Text style={styles.activeSessionTitle}>Séance en cours</Text>
            </View>
            <Text style={styles.activeSessionEspace}>{activePresence.espacePublicNom}</Text>
            <Text style={styles.activeSessionTimer}>⏱ {formatTimerSeconds(durationSeconds)}</Text>
          </TouchableOpacity>
        )}

        {/* Informations du compte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations du compte</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrapper}>
              <Mail size={18} color={COLORS.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          </View>

          {user.telephone && (
            <View style={styles.infoRow}>
              <View style={styles.infoIconWrapper}>
                <Phone size={18} color={COLORS.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Téléphone</Text>
                <Text style={styles.infoValue}>{user.telephone}</Text>
              </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrapper}>
              <Calendar size={18} color={COLORS.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Membre depuis</Text>
              <Text style={styles.infoValue}>{formatDateTime(user.dateInscription)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrapper}>
              <CheckCircle size={18} color={user.estActif ? COLORS.disponible : COLORS.sature} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Statut du compte</Text>
              <Text style={[styles.infoValue, { color: user.estActif ? COLORS.disponible : COLORS.sature }]}>
                {user.estActif ? 'Actif' : 'Désactivé'}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        {user.role === 'MOBILE_USER' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mes activités</Text>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => router.push('/propositions/mes-propositions')}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#EDE9FE' }]}>
                <FileText size={20} color="#7C3AED" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Mes propositions</Text>
                <Text style={styles.actionSubtitle}>Espaces que j'ai proposés</Text>
              </View>
              <ChevronRight size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        )}

        {/* Déconnexion */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <LogOut size={20} color={COLORS.danger} />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>

        {/* Version */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>SmartyPark v1.0.0</Text>
          <Text style={styles.footerText}>Comprenez vos espaces, instantanément.</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 15,
    color: '#64748B',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 34,
    fontWeight: '800',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
    textAlign: 'center',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '700',
  },
  inactiveBadge: {
    marginTop: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  inactiveText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },
  activeSessionCard: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
  },
  activeSessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
  },
  activeSessionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  activeSessionEspace: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  activeSessionTimer: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    gap: 14,
  },
  infoIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 4,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FECDD3',
    backgroundColor: '#FFF1F2',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.danger,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#CBD5E1',
  },
});
