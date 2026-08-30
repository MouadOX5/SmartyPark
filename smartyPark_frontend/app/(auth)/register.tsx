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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { User, Mail, Lock, Phone, Eye, EyeOff, ArrowRight, Leaf } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuth();

  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4FBF4" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
              <View style={styles.logoCircle}>
                <Leaf size={32} color="#00422b" />
              </View>
              <Text style={styles.title}>SmartyPark</Text>
              <Text style={styles.subtitle}>Créer un compte pour rejoindre la communauté.</Text>
            </View>

            {/* Registration Card */}
            <View style={styles.card}>
              {/* Decorative blob */}
              <View style={styles.decorativeBlob} />

              <View style={styles.formContainer}>
                {/* Name Fields (2 Columns) */}
                <View style={styles.row}>
                  <View style={styles.halfField}>
                    <Text style={styles.label}>Prénom</Text>
                    <View style={[
                      styles.inputWrapper, 
                      (focusedField === 'prenom' && !errors.prenom) ? styles.inputFocused : null,
                      errors.prenom ? styles.inputError : null
                    ]}>
                      <View style={styles.iconContainer}>
                        <User size={20} color={focusedField === 'prenom' ? '#006c49' : '#6c7a71'} />
                      </View>
                      <TextInput
                        style={styles.input}
                        value={prenom}
                        onChangeText={setPrenom}
                        placeholder="Ex: Jean"
                        placeholderTextColor="#bbcabf"
                        editable={!isLoading}
                        onFocus={() => setFocusedField('prenom')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </View>
                    {errors.prenom && <Text style={styles.errorText}>{errors.prenom}</Text>}
                  </View>
                  <View style={styles.halfField}>
                    <Text style={styles.label}>Nom</Text>
                    <View style={[
                      styles.inputWrapper, 
                      (focusedField === 'nom' && !errors.nom) ? styles.inputFocused : null,
                      errors.nom ? styles.inputError : null
                    ]}>
                      <View style={styles.iconContainer}>
                        <User size={20} color={focusedField === 'nom' ? '#006c49' : '#6c7a71'} />
                      </View>
                      <TextInput
                        style={styles.input}
                        value={nom}
                        onChangeText={setNom}
                        placeholder="Ex: Dupont"
                        placeholderTextColor="#bbcabf"
                        editable={!isLoading}
                        onFocus={() => setFocusedField('nom')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </View>
                    {errors.nom && <Text style={styles.errorText}>{errors.nom}</Text>}
                  </View>
                </View>

                {/* Email Field */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Email</Text>
                  <View style={[
                    styles.inputWrapper, 
                    (focusedField === 'email' && !errors.email) ? styles.inputFocused : null,
                    errors.email ? styles.inputError : null
                  ]}>
                    <View style={styles.iconContainer}>
                      <Mail size={20} color={focusedField === 'email' ? '#006c49' : '#6c7a71'} />
                    </View>
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="exemple@email.com"
                      placeholderTextColor="#bbcabf"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      editable={!isLoading}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                  {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </View>

                {/* Phone Field */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Téléphone</Text>
                  <View style={[
                    styles.inputWrapper, 
                    (focusedField === 'telephone' && !errors.telephone) ? styles.inputFocused : null,
                    errors.telephone ? styles.inputError : null
                  ]}>
                    <View style={styles.iconContainer}>
                      <Phone size={20} color={focusedField === 'telephone' ? '#006c49' : '#6c7a71'} />
                    </View>
                    <TextInput
                      style={styles.input}
                      value={telephone}
                      onChangeText={setTelephone}
                      placeholder="+33 6 12 34 56 78"
                      placeholderTextColor="#bbcabf"
                      keyboardType="phone-pad"
                      editable={!isLoading}
                      onFocus={() => setFocusedField('telephone')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                  {errors.telephone && <Text style={styles.errorText}>{errors.telephone}</Text>}
                </View>

                {/* Password Field */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Mot de passe</Text>
                  <View style={[
                    styles.inputWrapper, 
                    (focusedField === 'password' && !errors.password) ? styles.inputFocused : null,
                    errors.password ? styles.inputError : null
                  ]}>
                    <View style={styles.iconContainer}>
                      <Lock size={20} color={focusedField === 'password' ? '#006c49' : '#6c7a71'} />
                    </View>
                    <TextInput
                      style={styles.input}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="••••••••"
                      placeholderTextColor="#bbcabf"
                      secureTextEntry={!showPassword}
                      editable={!isLoading}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                    />
                    <TouchableOpacity 
                      style={styles.iconRightContainer}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color={focusedField === 'password' ? '#006c49' : '#6c7a71'} />
                      ) : (
                        <Eye size={20} color={focusedField === 'password' ? '#006c49' : '#6c7a71'} />
                      )}
                    </TouchableOpacity>
                  </View>
                  {!errors.password && <Text style={styles.helperText}>Au moins 6 caractères</Text>}
                  {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                </View>

                {/* Confirm Password Field */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Confirmer le mot de passe</Text>
                  <View style={[
                    styles.inputWrapper, 
                    (focusedField === 'confirmPassword' && !errors.confirmPassword) ? styles.inputFocused : null,
                    errors.confirmPassword ? styles.inputError : null
                  ]}>
                    <View style={styles.iconContainer}>
                      <Lock size={20} color={focusedField === 'confirmPassword' ? '#006c49' : '#6c7a71'} />
                    </View>
                    <TextInput
                      style={styles.input}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="••••••••"
                      placeholderTextColor="#bbcabf"
                      secureTextEntry={!showConfirmPassword}
                      editable={!isLoading}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                    />
                    <TouchableOpacity 
                      style={styles.iconRightContainer}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} color={focusedField === 'confirmPassword' ? '#006c49' : '#6c7a71'} />
                      ) : (
                        <Eye size={20} color={focusedField === 'confirmPassword' ? '#006c49' : '#6c7a71'} />
                      )}
                    </TouchableOpacity>
                  </View>
                  {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                </View>

                {/* Actions */}
                <View style={styles.actionsContainer}>
                  <TouchableOpacity 
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleRegister}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <>
                        <Text style={styles.buttonText}>S'inscrire</Text>
                        <ArrowRight size={18} color="#ffffff" style={styles.buttonIcon} />
                      </>
                    )}
                  </TouchableOpacity>
                  
                  <View style={styles.loginLinkContainer}>
                    <Link href="/(auth)/login" asChild>
                      <TouchableOpacity activeOpacity={0.7} disabled={isLoading}>
                        <Text style={styles.loginLink}>Déjà un compte ? Se connecter</Text>
                      </TouchableOpacity>
                    </Link>
                  </View>
                </View>

              </View>
            </View>

            {/* Footer */}
            <Text style={styles.footerText}>
              En vous inscrivant, vous acceptez nos{' '}
              <Text style={styles.footerLink}>Conditions d'utilisation</Text> et notre{' '}
              <Text style={styles.footerLink}>Politique de confidentialité</Text>.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Loading State Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#006c49" />
          <Text style={styles.loadingText}>Création du compte...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F4FBF4', // bg-gradient-to-b fallback
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
    minHeight: '100%',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: 448, // max-w-md
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10b981', // primary-container
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#006c49', // primary
    letterSpacing: -0.72,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#565e74', // secondary
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#ffffff', // surface-container-lowest
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9', // slate-100
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  decorativeBlob: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#10b981', // primary-container
    opacity: 0.2,
  },
  formContainer: {
    zIndex: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 16, // gap-md
    marginBottom: 16,
  },
  halfField: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3c4a42', // on-surface-variant
    textTransform: 'uppercase',
    letterSpacing: 0.6, // tracking-wider
    marginBottom: 4, 
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e2e8f0', // slate-200
    borderRadius: 8,
  },
  inputFocused: {
    borderColor: '#006c49', // primary
  },
  inputError: {
    borderColor: '#ba1a1a', // error
  },
  iconContainer: {
    paddingLeft: 12,
    paddingRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconRightContainer: {
    paddingLeft: 8,
    paddingRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 48, // py-3
    paddingVertical: 12,
    paddingRight: 16,
    fontSize: 14, // body-md
    color: '#161d19', // on-background
  },
  helperText: {
    fontSize: 13,
    color: '#565e74', // secondary
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#ba1a1a',
    marginTop: 4,
  },
  actionsContainer: {
    marginTop: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#006c49', // primary
    height: 48,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff', // on-primary
    fontSize: 14,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  loginLinkContainer: {
    alignItems: 'center',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#006c49', // primary
  },
  footerText: {
    marginTop: 24,
    fontSize: 13,
    color: '#6c7a71', // outline
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 18,
  },
  footerLink: {
    textDecorationLine: 'underline',
    color: '#6c7a71',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(244, 251, 244, 0.8)', // background/80
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
