import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { CategorieEspace } from '../types';
import { COLORS } from '../constants/colors';

interface CategoryFilterProps {
  selected: string;
  onSelect: (key: string, category?: CategorieEspace) => void;
}

const FILTERS = [
  { key: 'tous', label: '🏟️  Tous', category: undefined },
  { key: 'FOOTBALL', label: '⚽  Football', category: 'FOOTBALL' as CategorieEspace },
  { key: 'BASKETBALL', label: '🏀  Basketball', category: 'BASKETBALL' as CategorieEspace },
  { key: 'STREET_WORKOUT', label: '💪  Workout', category: 'STREET_WORKOUT' as CategorieEspace },
  { key: 'ENFANTS', label: '🎠  Enfants', category: 'ENFANTS' as CategorieEspace },
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ selected, onSelect }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {FILTERS.map((filter) => {
        const isActive = selected === filter.key;
        return (
          <TouchableOpacity
            key={filter.key}
            style={[styles.pill, isActive && styles.pillActive]}
            onPress={() => onSelect(filter.key, filter.category)}
            activeOpacity={0.75}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  labelActive: {
    color: '#FFFFFF',
  },
});
