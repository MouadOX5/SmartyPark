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
import { Search, X, Clock } from 'lucide-react-native';
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
    }
  }, []);

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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Bonjour{user ? `, ${user.prenom}` : ''} 👋
          </Text>
          <Text style={styles.headerTitle}>Explorer les espaces</Text>
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

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un espace sportif..."
            placeholderTextColor="#94A3B8"
            value={searchText}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={clearSearch} activeOpacity={0.7}>
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filtres Catégories */}
      <CategoryFilter selected={selectedCategory} onSelect={handleCategorySelect} />

      {/* Compteur & Tri */}
      {!isLoading && (
        <View style={styles.countRow}>
          <Text style={styles.countText}>
            {sortedFiltered.length} espace{sortedFiltered.length > 1 ? 's' : ''} trouvé{sortedFiltered.length > 1 ? 's' : ''}
          </Text>
          {Object.keys(distances).length > 0 && (
            <Text style={styles.distanceInfo}>📍 Trié par distance</Text>
          )}
        </View>
      )}

      {/* Liste verticale scrollable */}
      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  greeting: {
    fontSize: 13,
    color: '#64748B',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySoft,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    gap: 6,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  activeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    fontVariant: ['tabular-nums'],
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    paddingVertical: 0,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  countText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  distanceInfo: {
    fontSize: 12,
    color: '#94A3B8',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
