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
  TextInput,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { BarChart3 } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';

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
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9f9ff" />
      
      {/* Decorative background elements */}
      <View style={[styles.decorativeCircle, styles.circleTopLeft]} />
      <View style={[styles.decorativeCircle, styles.circleBottomRight]} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <BarChart3 size={36} color="#006c49" />
            </View>
            <Text style={styles.title}>SmartyPark</Text>
            <Text style={styles.subtitle}>Understand your space, instantly.</Text>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Welcome back</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, errors.email ? styles.inputError : null]}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#6c7a71"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!isLoading}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.input, errors.password ? styles.inputError : null]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#6c7a71"
                secureTextEntry
                editable={!isLoading}
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              <View style={styles.forgotPasswordContainer}>
                <TouchableOpacity disabled={isLoading}>
                  <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]} 
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Se connecter</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity activeOpacity={0.7} disabled={isLoading}>
                  <Text style={styles.registerLink}>S'inscrire</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Loading State Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#006c49" />
          <Text style={styles.loadingText}>Authenticating...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f9f9ff',
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
    minHeight: '100%',
  },
  decorativeCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  circleTopLeft: {
    top: '-10%',
    left: '-20%',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  circleBottomRight: {
    bottom: '-10%',
    right: '-20%',
    backgroundColor: 'rgba(226, 232, 248, 0.4)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    zIndex: 10,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#006c49',
    letterSpacing: -0.72,
  },
  subtitle: {
    fontSize: 14,
    color: '#3c4a42',
    marginTop: 8,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    borderColor: '#d3daea',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
    zIndex: 10,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#151c27',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3c4a42',
    marginBottom: 4,
  },
  input: {
    height: 48,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9ff',
    borderColor: '#bbcabf',
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 14,
    color: '#151c27',
  },
  inputError: {
    borderColor: '#ba1a1a',
  },
  errorText: {
    color: '#ba1a1a',
    fontSize: 12,
    marginTop: 4,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  forgotPasswordText: {
    fontSize: 12,
    color: '#006c49',
    fontWeight: '500',
  },
  button: {
    height: 48,
    backgroundColor: '#006c49',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(187, 202, 191, 0.3)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#3c4a42',
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#006c49',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(249, 249, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
    color: '#006c49',
  }
});
