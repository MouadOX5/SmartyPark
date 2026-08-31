import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { CheckCircle } from 'lucide-react-native';

const COLORS = {
  inverseSurface: '#2b322d',
  inverseOnSurface: '#ebf3eb',
  inversePrimary: '#4edea3',
};

interface Props {
  visible: boolean;
  message?: string;
  onHide: () => void;
}

export default function PresenceToast({ visible, message = 'Déclaration enregistrée ! Merci pour votre contribution.', onHide }: Props) {
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 100,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start(() => onHide());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible, translateY, opacity, onHide]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
      pointerEvents="none"
    >
      <View style={styles.toast}>
        <CheckCircle size={20} color={COLORS.inversePrimary} />
        <Text style={styles.text}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 96, // roughly 24 + safe area + tab bar
    left: 20,
    right: 20,
    zIndex: 50,
    alignItems: 'center',
  },
  toast: {
    backgroundColor: COLORS.inverseSurface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    maxWidth: 400,
    width: '100%',
  },
  text: {
    color: COLORS.inverseOnSurface,
    fontSize: 14,
    flex: 1,
  },
});
