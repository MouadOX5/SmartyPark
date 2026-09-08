import { Platform } from 'react-native';
import Constants from 'expo-constants';

// URL par défaut de l'API Spring Boot
// Pour émulateur Android : http://10.0.2.2:8080
// Pour simulateur iOS ou Web : http://localhost:8080
// Pour appareil physique (Expo Go en LAN) : on déduit l'IP du PC depuis l'hôte
// utilisé par le bundler Metro (ex: 192.168.11.111:8081 -> 192.168.11.111:8080)
const getDefaultBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:8080/api';
  }

  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).expoGoConfig?.debuggerHost;

  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:8080/api`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080/api';
  }
  return 'http://localhost:8080/api';
};

export const API_BASE_URL = getDefaultBaseUrl();

export const APP_CONFIG = {
  appName: 'SmartyPark',
  tagline: 'Comprenez vos espaces, instantanément.',
  gpsDistanceMaxMetres: 500,
  maxDescriptionLength: 1000,
};
