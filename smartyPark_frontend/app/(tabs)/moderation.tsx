import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ClipboardList,
  ShieldAlert,
  MapPinned,
  Users,
  Activity,
  Menu as MenuIcon,
  Check,
} from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { COLORS } from '../../src/constants/colors';
import { PropositionsSection, SectionHandle } from '../../src/components/admin/PropositionsSection';
import { SignalementsSection } from '../../src/components/admin/SignalementsSection';
import { EspacesSection } from '../../src/components/admin/EspacesSection';
import { UtilisateursSection } from '../../src/components/admin/UtilisateursSection';
import { PresenceSection } from '../../src/components/admin/PresenceSection';

type Section = 'propositions' | 'signalements' | 'espaces' | 'utilisateurs' | 'presence';

export default function ModerationScreen() {
  const { user } = useAuth();
  const isAdministrateur = user?.role === 'ADMINISTRATEUR';

  const [section, setSection] = useState<Section>('propositions');
  const [menuVisible, setMenuVisible] = useState(false);
  const [propositionsCount, setPropositionsCount] = useState(0);
  const [signalementsCount, setSignalementsCount] = useState(0);

  const propositionsRef = useRef<SectionHandle>(null);
  const signalementsRef = useRef<SectionHandle>(null);
  const espacesRef = useRef<SectionHandle>(null);
  const utilisateursRef = useRef<SectionHandle>(null);
  const presenceRef = useRef<SectionHandle>(null);

  const menuItems: { key: Section; label: string; icon: React.ReactNode; badge?: number; adminOnly?: boolean }[] = [
    { key: 'propositions', label: 'Propositions', icon: <ClipboardList size={18} color="#475569" />, badge: propositionsCount },
    { key: 'signalements', label: 'Signalements', icon: <ShieldAlert size={18} color="#475569" />, badge: signalementsCount },
    { key: 'espaces', label: 'Espaces publics', icon: <MapPinned size={18} color="#475569" /> },
    { key: 'presence', label: 'Supervision présence', icon: <Activity size={18} color="#475569" /> },
    { key: 'utilisateurs', label: 'Utilisateurs', icon: <Users size={18} color="#475569" />, adminOnly: true },
  ];

  const visibleMenuItems = menuItems.filter((item) => !item.adminOnly || isAdministrateur);
  const currentItem = menuItems.find((item) => item.key === section)!;

  const handleSelectSection = (key: Section) => {
    setSection(key);
    setMenuVisible(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Administration</Text>
          <Text style={styles.headerSubtitle}>{currentItem.label}</Text>
        </View>
        <TouchableOpacity style={styles.menuBtn} onPress={() => setMenuVisible(true)} activeOpacity={0.8}>
          <MenuIcon size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        {section === 'propositions' && (
          <PropositionsSection ref={propositionsRef} onCountChange={setPropositionsCount} />
        )}
        {section === 'signalements' && (
          <SignalementsSection ref={signalementsRef} onCountChange={setSignalementsCount} />
        )}
        {section === 'espaces' && <EspacesSection ref={espacesRef} isAdministrateur={isAdministrateur} />}
        {section === 'utilisateurs' && isAdministrateur && <UtilisateursSection ref={utilisateursRef} />}
        {section === 'presence' && <PresenceSection ref={presenceRef} />}
      </View>

      {/* Menu déroulant en haut à droite */}
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuCard}>
            {visibleMenuItems.map((item) => {
              const isSelected = item.key === section;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.menuItem, isSelected && styles.menuItemSelected]}
                  onPress={() => handleSelectSection(item.key)}
                  activeOpacity={0.8}
                >
                  {item.icon}
                  <Text style={[styles.menuItemText, isSelected && styles.menuItemTextSelected]}>{item.label}</Text>
                  {!!item.badge && (
                    <View style={styles.menuBadge}>
                      <Text style={styles.menuBadgeText}>{item.badge}</Text>
                    </View>
                  )}
                  {isSelected && <Check size={16} color={COLORS.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  menuBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    alignItems: 'flex-end',
    paddingTop: 70,
    paddingRight: 16,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 8,
    width: 260,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  menuItemSelected: {
    backgroundColor: COLORS.primarySoft,
  },
  menuItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  menuItemTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  menuBadge: {
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  menuBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
