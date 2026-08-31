import React from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { EspacePublicResponse } from '../../types';
import { SpaceCard } from '../SpaceCard';
import { EmptyState } from '../EmptyState';
import { COLORS } from '../../constants/colors';

interface EspacesListViewProps {
  espaces: EspacePublicResponse[];
  distances: Record<number, number>;
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  searchText: string;
}

export function EspacesListView({
  espaces,
  distances,
  loading,
  refreshing,
  onRefresh,
  searchText,
}: EspacesListViewProps) {
  const router = useRouter();

  return (
    <FlatList
      data={espaces}
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
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
          colors={[COLORS.primary]}
        />
      }
      ListEmptyComponent={
        !loading ? (
          <EmptyState
            title="Aucun espace trouvé"
            subtitle={
              searchText
                ? `Aucun résultat pour "${searchText}"`
                : 'Aucun espace disponible dans cette catégorie.'
            }
          />
        ) : (
          <View />
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
});
