import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { AffluenceBadge } from '../AffluenceBadge';

interface BadgeProps {
  label: string;
  color?: string;
  bgColor?: string;
  dotColor?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  color = COLORS.primary,
  bgColor = COLORS.primarySoft,
  dotColor,
  size = 'md',
}) => {
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bgColor },
        size === 'sm' ? styles.sm : styles.md,
      ]}
    >
      {dotColor && (
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
      )}
      <Text
        style={[
          styles.text,
          { color },
          size === 'sm' ? styles.textSm : styles.textMd,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

export { AffluenceBadge };

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 20,
  },
  sm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  md: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  text: {
    fontWeight: '600',
  },
  textSm: {
    fontSize: 12,
  },
  textMd: {
    fontSize: 13,
  },
});
