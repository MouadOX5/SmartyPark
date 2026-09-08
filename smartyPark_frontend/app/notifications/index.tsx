import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCheck, PartyPopper, XCircle, Wrench, ShieldCheck, BellOff } from 'lucide-react-native';
import { useNotifications } from '../../src/context/NotificationContext';
import { COLORS } from '../../src/constants/colors';
import { formatDateTime } from '../../src/utils/formatters';
import { NotificationResponse, TypeNotification } from '../../src/types';

const TYPE_CONFIG: Record<TypeNotification, { icon: React.ReactNode; color: string; bg: string }> = {
  PROPOSITION_VALIDEE: { icon: <PartyPopper size={20} color="#16A34A" />, color: '#16A34A', bg: '#DCFCE7' },
  PROPOSITION_REJETEE: { icon: <XCircle size={20} color="#DC2626" />, color: '#DC2626', bg: '#FEE2E2' },
  SIGNALEMENT_TRAITE: { icon: <Wrench size={20} color="#0284C7" />, color: '#0284C7', bg: '#E0F2FE' },
  SIGNALEMENT_REJETE: { icon: <ShieldCheck size={20} color="#D97706" />, color: '#D97706', bg: '#FEF3C7' },
};

function NotificationCard({ item, onPress }: { item: NotificationResponse; onPress: () => void }) {
  const config = TYPE_CONFIG[item.type];
  return (
    <TouchableOpacity
      style={[styles.card, !item.estLue && styles.cardUnread]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconWrapper, { backgroundColor: config.bg }]}>{config.icon}</View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.titre}</Text>
        <Text style={styles.cardMessage}>{item.message}</Text>
        <Text style={styles.cardDate}>{formatDateTime(item.dateCreation)}</Text>
      </View>
      {!item.estLue && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, unreadCount, isLoading, refresh, markAsRead, markAllAsRead } = useNotifications();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn} activeOpacity={0.7}>
            <CheckCheck size={20} color={COLORS.primary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={refresh}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <BellOff size={56} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>Aucune notification</Text>
              <Text style={styles.emptySub}>Tu seras notifié ici pour tes propositions et signalements.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <NotificationCard item={item} onPress={() => !item.estLue && markAsRead(item.id)} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
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
  markAllBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  list: { padding: 16, paddingBottom: 32 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardUnread: {
    backgroundColor: '#F0FDF9',
    borderWidth: 1,
    borderColor: COLORS.primarySoft,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 3 },
  cardMessage: { fontSize: 13, color: '#475569', lineHeight: 18, marginBottom: 4 },
  cardDate: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: 4,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  emptySub: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 21 },
});
