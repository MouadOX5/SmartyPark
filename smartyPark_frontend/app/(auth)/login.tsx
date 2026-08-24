import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { Mail, Lock } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { COLORS } from '../../src/constants/colors';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email.trim()) {
      newErrors.email = "L'email est obligatoire";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    if (!password.trim()) {
      newErrors.password = 'Le mot de passe est obligatoire';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    try {
      await login({ email: email.trim(), password });
      router.replace('/(tabs)');
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        Alert.alert('Connexion refusée', 'Email ou mot de passe incorrect.');
      } else if (status === 400) {
        Alert.alert('Données invalides', 'Vérifiez vos informations.');
      } else {
        Alert.alert('Erreur de connexion', 'Serveur inaccessible. Vérifiez votre connexion.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo & Titre */}
          <View style={styles.hero}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoEmoji}>🏟️</Text>
              </View>
            </View>
            <Text style={styles.appName}>SmartyPark</Text>
            <Text style={styles.tagline}>
              Comprenez vos espaces, instantanément.
            </Text>
          </View>

          {/* Formulaire */}
          <View style={styles.form}>
            <Text style={styles.formTitle}>Connexion</Text>
            <Text style={styles.formSubtitle}>
              Bienvenue ! Entrez vos identifiants pour continuer.
            </Text>

            <View style={styles.formFields}>
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="votre@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={errors.email}
                leftIcon={<Mail size={18} color="#94A3B8" />}
              />
              <Input
                label="Mot de passe"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                isPassword
                error={errors.password}
                leftIcon={<Lock size={18} color="#94A3B8" />}
              />
            </View>

            <Button
              title={isLoading ? 'Connexion...' : 'Se connecter'}
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              size="lg"
            />

            {/* Séparateur */}
            <View style={styles.separator}>
              <View style={styles.line} />
              <Text style={styles.separatorText}>ou</Text>
              <View style={styles.line} />
            </View>

            {/* Lien inscription */}
            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Pas encore de compte ? </Text>
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.registerLink}>S'inscrire</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 32,
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 44,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -1,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  form: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  formSubtitle: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 28,
    lineHeight: 22,
  },
  formFields: {
    marginBottom: 8,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  separatorText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 15,
    color: '#64748B',
  },
  registerLink: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
});
