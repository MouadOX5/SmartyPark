import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../constants/config';
import { storage } from '../utils/storage';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Intercepteur pour injecter automatiquement le token Bearer JWT
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await storage.getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token.trim()}`;
      }
    } catch (error) {
      console.warn('Erreur lors de la lecture du token pour la requête:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour intercepter les erreurs 401 (expiration de session)
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      console.warn('Session expirée ou non autorisée (401)');
      // Le composant d'auth ou le contexte réagira si nécessaire
    }
    return Promise.reject(error);
  }
);
