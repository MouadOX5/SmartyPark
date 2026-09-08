import { Tabs, Redirect } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Map, List, PlusCircle, User, ShieldCheck } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { COLORS } from '../../src/constants/colors';

export default function TabsLayout() {
  const { isAuthenticated, user } = useAuth();
  const insets = useSafeAreaInsets();
  const isModerateur = user?.role === 'MODERATEUR' || user?.role === 'ADMINISTRATEUR';

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F1F5F9',
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          elevation: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explorer',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Map size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="proposer"
        options={{
          title: 'Proposer',
          // La proposition d'espace est une fonctionnalité MOBILE_USER uniquement
          // côté backend (@PreAuthorize("hasRole('MOBILE_USER')")) : on masque
          // l'onglet pour les modérateurs/admins plutôt que de leur montrer un
          // formulaire qui échouera en 403.
          href: isModerateur ? null : undefined,
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <PlusCircle size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="moderation"
        options={{
          title: 'Admin',
          // Visible uniquement pour les modérateurs/administrateurs
          href: isModerateur ? undefined : null,
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <ShieldCheck size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <User size={22} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    padding: 4,
    borderRadius: 8,
  },
  iconContainerActive: {
    backgroundColor: COLORS.primarySoft,
  },
});
