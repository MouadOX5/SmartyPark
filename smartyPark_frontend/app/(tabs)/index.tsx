import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, X, Map as MapIcon, List as ListIcon, User, Leaf } from 'lucide-react-native';
import MapView, { Marker, Callout, Region } from '../../src/components/PlatformMap';
import { espacePublicApi } from '../../src/api/espacePublicApi';
import { EspacePublicResponse, CategorieEspace } from '../../src/types';
import { COLORS } from '../../src/constants/colors';
import { SpaceCard } from '../../src/components/SpaceCard';
import { CategoryFilter } from '../../src/components/CategoryFilter';
import { EmptyState } from '../../src/components/EmptyState';
import { getCurrentLocation, calculateDistance } from '../../src/utils/location';
import { useAuth } from '../../src/context/AuthContext';
import { usePresence } from '../../src/context/PresenceContext';
import { formatTimerSeconds } from '../../src/utils/formatters';

export default function ExplorerScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { isActive, durationSeconds } = usePresence();

  const [espaces, setEspaces] = useState<EspacePublicResponse[]>([]);
  const [filtered, setFiltered] = useState<EspacePublicResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('tous');
  const [distances, setDistances] = useState<Record<number, number>>({});
  const [viewMode, setViewMode] = useState<'liste' | 'carte'>('liste');
  const [region, setRegion] = useState<Region | undefined>(undefined);

  const loadEspaces = async () => {
    try {
      const data = await espacePublicApi.getAllValidated();
      setEspaces(data);
      setFiltered(data);
      computeDistances(data);
    } catch (e) {
      console.error('Erreur chargement espaces:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const computeDistances = useCallback(async (data: EspacePublicResponse[]) => {
    const loc = await getCurrentLocation();
    if (loc) {
      const map: Record<number, number> = {};
      data.forEach((e) => {
        map[e.id] = calculateDistance(loc.latitude, loc.longitude, e.latitude, e.longitude);
      });
      setDistances(map);
      if (!region) {
        setRegion({
          latitude: loc.latitude,
          longitude: loc.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    } else if (!region && data.length > 0) {
       setRegion({
          latitude: data[0].latitude,
          longitude: data[0].longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
       })
    }
  }, [region]);

  useEffect(() => {
    loadEspaces();
  }, []);

  const handleSearch = (text: string) => {
    setSearchText(text);
    applyFilters(text, selectedCategory);
  };

  const handleCategorySelect = (key: string, category?: CategorieEspace) => {
    setSelectedCategory(key);
    applyFilters(searchText, key);
  };

  const applyFilters = (text: string, cat: string) => {
    let result = [...espaces];
    if (cat !== 'tous') {
      result = result.filter((e) => e.categorie === cat);
    }
    if (text.trim()) {
      result = result.filter(
        (e) =>
          e.nom.toLowerCase().includes(text.trim().toLowerCase()) ||
          e.adresse.toLowerCase().includes(text.trim().toLowerCase())
      );
    }
    setFiltered(result);
  };

  const clearSearch = () => {
    setSearchText('');
    applyFilters('', selectedCategory);
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    loadEspaces();
  };

  const sortedFiltered = filtered.sort((a, b) => {
    const da = distances[a.id] ?? Infinity;
    const db = distances[b.id] ?? Infinity;
    return da - db;
  });

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

      {/* Controls Section (Sticky behavior in RN via scroll view headers or just fixed) */}
      <View style={styles.controlsSection}>
        {/* Search & Toggle Row */}
        <View style={styles.searchToggleRow}>
          <View style={styles.searchBar}>
            <Search size={20} color="#6c7a71" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un espace..."
              placeholderTextColor="#6c7a71"
              value={searchText}
              onChangeText={handleSearch}
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={clearSearch} activeOpacity={0.7} style={styles.clearBtn}>
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
        <CategoryFilter selected={selectedCategory} onSelect={handleCategorySelect} />
      </View>

      {/* Contenu : Carte ou Liste */}
      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      ) : viewMode === 'carte' ? (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={region}
            showsUserLocation={true}
          >
            {sortedFiltered.map((espace) => (
              <Marker
                key={espace.id}
                coordinate={{ latitude: espace.latitude, longitude: espace.longitude }}
                onCalloutPress={() => router.push(`/espaces/${espace.id}`)}
              >
                <Callout tooltip>
                  <View style={styles.calloutContainer}>
                    <Text style={styles.calloutTitle}>{espace.nom}</Text>
                    <Text style={styles.calloutSub}>Cliquez pour voir les détails</Text>
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>
        </View>
      ) : (
        <FlatList
          data={sortedFiltered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <SpaceCard
              espace={item}
              onPress={() => router.push(`/espaces/${item.id}`)}
              distance={distances[item.id]}
            />
          )}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.listColumnWrapper}
          numColumns={1}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="Aucun espace trouvé"
              subtitle={
                searchText
                  ? `Aucun résultat pour "${searchText}"`
                  : 'Aucun espace disponible dans cette catégorie.'
              }
            />
          }
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
  listContent: {
    paddingHorizontal: 20, // margin-mobile
    paddingTop: 8,
    paddingBottom: 24,
  },
  listColumnWrapper: {
    // Used if numColumns > 1, but we use 1 for mobile currently. 
    // Kept here for future tablet support.
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  calloutContainer: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 150,
  },
  calloutTitle: {
    fontWeight: '700',
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 4,
  },
  calloutSub: {
    fontSize: 12,
    color: '#64748B',
  },
});
