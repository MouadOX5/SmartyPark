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
  { key: 'tous', label: 'Tous', category: undefined },
  { key: 'FOOTBALL', label: 'Foot', category: 'FOOTBALL' as CategorieEspace },
  { key: 'BASKETBALL', label: 'Basket', category: 'BASKETBALL' as CategorieEspace },
  { key: 'STREET_WORKOUT', label: 'Street', category: 'STREET_WORKOUT' as CategorieEspace },
  { key: 'ENFANTS', label: 'Enfants', category: 'ENFANTS' as CategorieEspace },
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
    paddingHorizontal: 20, // margin-mobile
    paddingVertical: 4,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999, // full
    backgroundColor: '#ffffff', // surface-container-lowest
    borderWidth: 1,
    borderColor: '#e2e8f0', // slate-200
    shadowColor: '#0f172a', // ambient shadow tint
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  pillActive: {
    backgroundColor: '#006c49', // primary
    borderColor: '#006c49',
  },
  label: {
    fontSize: 12, // label-sm
    fontWeight: '500',
    color: '#3c4a42', // on-surface-variant
    letterSpacing: 0.24, // 0.02em * 12
  },
  labelActive: {
    color: '#ffffff', // on-primary
  },
});
