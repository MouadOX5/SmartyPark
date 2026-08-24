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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { User, Mail, Lock, Phone, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { COLORS } from '../../src/constants/colors';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuth();

  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!nom.trim()) newErrors.nom = 'Le nom est obligatoire';
    if (!prenom.trim()) newErrors.prenom = 'Le prénom est obligatoire';
    if (!email.trim()) {
      newErrors.email = "L'email est obligatoire";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Format d'email invalide";
    }
    if (!password.trim()) {
      newErrors.password = 'Le mot de passe est obligatoire';
    } else if (password.length < 6) {
      newErrors.password = 'Au moins 6 caractères requis';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    try {
      await register({
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: email.trim(),
        password,
        telephone: telephone.trim() || undefined,
      });
      router.replace('/(tabs)');
    } catch (error: any) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message;
      if (status === 409) {
        Alert.alert('Email déjà utilisé', "Un compte avec cet email existe déjà.");
      } else if (status === 400) {
        Alert.alert('Données invalides', message || 'Vérifiez vos informations.');
      } else {
        Alert.alert('Erreur', 'Serveur inaccessible. Vérifiez votre connexion.');
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <ArrowLeft size={22} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.logoText}>SmartyPark</Text>
          </View>
          <View style={styles.backBtn} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>👤</Text>
            </View>
            <Text style={styles.title}>Créer un compte</Text>
            <Text style={styles.subtitle}>
              Rejoignez la communauté SmartyPark et accédez à vos espaces favoris.
            </Text>
          </View>

          {/* Formulaire */}
          <View style={styles.form}>
            <View style={styles.row}>
              <View style={styles.halfField}>
                <Input
                  label="Nom"
                  value={nom}
                  onChangeText={setNom}
                  placeholder="Dupont"
                  autoCapitalize="words"
                  error={errors.nom}
                  leftIcon={<User size={18} color="#94A3B8" />}
                />
              </View>
              <View style={styles.halfField}>
                <Input
                  label="Prénom"
                  value={prenom}
                  onChangeText={setPrenom}
                  placeholder="Jean"
                  autoCapitalize="words"
                  error={errors.prenom}
                  leftIcon={<User size={18} color="#94A3B8" />}
                />
              </View>
            </View>

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="jean.dupont@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={errors.email}
              leftIcon={<Mail size={18} color="#94A3B8" />}
            />

            <Input
              label="Téléphone (facultatif)"
              value={telephone}
              onChangeText={setTelephone}
              placeholder="+212 6 00 00 00 00"
              keyboardType="phone-pad"
              error={errors.telephone}
              leftIcon={<Phone size={18} color="#94A3B8" />}
            />

            <Input
              label="Mot de passe"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••  (min. 6 caractères)"
              isPassword
              error={errors.password}
              leftIcon={<Lock size={18} color="#94A3B8" />}
            />

            <Input
              label="Confirmer le mot de passe"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              isPassword
              error={errors.confirmPassword}
              leftIcon={<Lock size={18} color="#94A3B8" />}
            />

            <View style={styles.legalNote}>
              <Text style={styles.legalText}>
                En créant un compte, vous acceptez nos{' '}
                <Text style={styles.legalLink}>Conditions d'utilisation</Text>
                {' '}et notre{' '}
                <Text style={styles.legalLink}>Politique de confidentialité</Text>.
              </Text>
            </View>

            <Button
              title={isLoading ? 'Création...' : "Créer mon compte"}
              onPress={handleRegister}
              loading={isLoading}
              disabled={isLoading}
              size="lg"
            />

            {/* Lien connexion */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Déjà un compte ? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.loginLink}>Se connecter</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoEmoji: {
    fontSize: 36,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 21,
  },
  form: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  legalNote: {
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
  },
  legalText: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
    textAlign: 'center',
  },
  legalLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 15,
    color: '#64748B',
  },
  loginLink: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
});
