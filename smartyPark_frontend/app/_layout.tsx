import { Stack } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { AuthProvider } from '../src/context/AuthContext';
import { PresenceProvider } from '../src/context/PresenceContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../src/constants/colors';

function RootLayoutContent() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="espaces/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="affluence/declarer" options={{ presentation: 'modal' }} />
      <Stack.Screen name="signalements/creer" options={{ presentation: 'modal' }} />
      <Stack.Screen name="presence/index" options={{ presentation: 'card' }} />
      <Stack.Screen name="propositions/mes-propositions" options={{ presentation: 'card' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <PresenceProvider>
        <RootLayoutContent />
      </PresenceProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
