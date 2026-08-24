import { Platform } from 'react-native';

// URL par défaut de l'API Spring Boot
// Pour émulateur Android : http://10.0.2.2:8080
// Pour simulateur iOS ou Web : http://localhost:8080
// Pour appareil physique : Remplacer par l'adresse IP locale (ex: http://192.168.1.XX:8080)
const getDefaultBaseUrl = () => {
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
