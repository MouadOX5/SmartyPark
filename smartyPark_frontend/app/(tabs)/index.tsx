import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, X, Map as MapIcon, List as ListIcon, Leaf } from 'lucide-react-native';
import { COLORS } from '../../src/constants/colors';
import { CategoryFilter } from '../../src/components/CategoryFilter';
import { useAuth } from '../../src/context/AuthContext';
import { usePresence } from '../../src/context/PresenceContext';
import { formatTimerSeconds } from '../../src/utils/formatters';
import { useLocation } from '../../src/hooks/useLocation';
import { useEspaces } from '../../src/hooks/useEspaces';
import { EspacesListView } from '../../src/components/explorer/EspacesListView';
import { EspacesMapView } from '../../src/components/explorer/EspacesMapView';

export default function ExplorerScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { isActive, durationSeconds } = usePresence();

  const [viewMode, setViewMode] = useState<'liste' | 'carte'>('liste');

  const { coords: userLocation } = useLocation();
  const {
    espaces,
    loading,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    distances,
    refresh,
  } = useEspaces(userLocation);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4fbf4" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarContainer}>
            {user ? (
              <Text style={styles.avatarText}>{user.prenom.charAt(0).toUpperCase()}</Text>
            ) : (
              <Leaf size={16} color="#006c49" />
            )}
          </View>
          <Text style={styles.headerTitle}>SmartyPark</Text>
        </View>
        {isActive && (
          <TouchableOpacity
            style={styles.activeBadge}
            onPress={() => router.push('/presence/')}
            activeOpacity={0.8}
          >
            <View style={styles.activeDot} />
            <Text style={styles.activeText}>{formatTimerSeconds(durationSeconds)}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Controls Section */}
      <View style={styles.controlsSection}>
        {/* Search & Toggle Row */}
        <View style={styles.searchToggleRow}>
          <View style={styles.searchBar}>
            <Search size={20} color="#6c7a71" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un espace..."
              placeholderTextColor="#6c7a71"
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7} style={styles.clearBtn}>
                <X size={18} color="#6c7a71" />
              </TouchableOpacity>
            )}
          </View>

          {/* View Toggle */}
          <View style={styles.viewToggleContainer}>
            <TouchableOpacity 
              style={[styles.viewToggleBtn, viewMode === 'liste' && styles.viewToggleBtnActive]}
              onPress={() => setViewMode('liste')}
              activeOpacity={0.8}
            >
              <ListIcon size={18} color={viewMode === 'liste' ? '#161d19' : '#6c7a71'} />
              <Text style={[styles.viewToggleText, viewMode === 'liste' && styles.viewToggleTextActive]}>Liste</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.viewToggleBtn, viewMode === 'carte' && styles.viewToggleBtnActive]}
              onPress={() => setViewMode('carte')}
              activeOpacity={0.8}
            >
              <MapIcon size={18} color={viewMode === 'carte' ? '#161d19' : '#6c7a71'} />
              <Text style={[styles.viewToggleText, viewMode === 'carte' && styles.viewToggleTextActive]}>Carte</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filtres Catégories */}
        <CategoryFilter selected={selectedCategory} onSelect={(key) => setSelectedCategory(key)} />
      </View>

      {/* Contenu : Carte ou Liste */}
      {loading && espaces.length === 0 ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      ) : viewMode === 'carte' ? (
        <EspacesMapView espaces={espaces} userLocation={userLocation} />
      ) : (
        <EspacesListView
          espaces={espaces}
          distances={distances}
          loading={loading}
          refreshing={loading}
          onRefresh={refresh}
          searchText={search}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f4fbf4', // background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, // margin-mobile
    height: 64, // 16 tailwind units
    backgroundColor: '#f4fbf4', // surface
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9', // slate-100
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // gap-3
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dde4dd', // surface-variant
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#006c49',
  },
  headerTitle: {
    fontSize: 18, // headline-sm
    fontWeight: '700',
    color: '#006c49', // primary
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef6ee', // surface-container-low
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#006c49',
    gap: 6,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444', // danger (often used for active recording)
  },
  activeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#006c49',
    fontVariant: ['tabular-nums'],
  },
  controlsSection: {
    backgroundColor: '#f4fbf4',
    paddingTop: 8,
    paddingBottom: 8,
    gap: 16, // gap-md
  },
  searchToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 8, // gap-sm
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff', // surface-container-lowest
    borderRadius: 8, // rounded-lg
    paddingLeft: 12,
    paddingRight: 16,
    height: 44, // py-3 equivalent
    borderWidth: 1,
    borderColor: '#e2e8f0', // slate-200
  },
  searchInput: {
    flex: 1,
    fontSize: 14, // body-md
    color: '#161d19', // on-surface
    paddingVertical: 0,
    marginLeft: 8,
  },
  clearBtn: {
    padding: 4,
  },
  viewToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#e8f0e9', // surface-container
    borderRadius: 8, // rounded-lg
    padding: 4, // p-1
    borderWidth: 1,
    borderColor: '#f1f5f9', // slate-100
  },
  viewToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6, // py-1.5
    paddingHorizontal: 12, // px-3
    borderRadius: 4, // rounded
    gap: 4,
  },
  viewToggleBtnActive: {
    backgroundColor: '#ffffff', // surface-container-lowest
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  viewToggleText: {
    fontSize: 12, // label-sm
    fontWeight: '500',
    color: '#6c7a71', // on-surface-variant
  },
  viewToggleTextActive: {
    color: '#161d19', // on-surface
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
