import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'smartypark_jwt_token';
const USER_KEY = 'smartypark_user_data';

// Mémoire locale de secours pour le Web
const memoryStore: Record<string, string> = {};

export const storage = {
  async saveToken(token: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(TOKEN_KEY, token);
        } else {
          memoryStore[TOKEN_KEY] = token;
        }
      } else {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      }
    } catch (e) {
      console.warn('Erreur lors de la sauvegarde du token:', e);
    }
  },

  async getToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(TOKEN_KEY);
        }
        return memoryStore[TOKEN_KEY] || null;
      }
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (e) {
      console.warn('Erreur lors de la récupération du token:', e);
      return null;
    }
  },

  async removeToken(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(TOKEN_KEY);
        }
        delete memoryStore[TOKEN_KEY];
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
    } catch (e) {
      console.warn('Erreur lors de la suppression du token:', e);
    }
  },

  async saveUserData(userData: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(USER_KEY, userData);
        } else {
          memoryStore[USER_KEY] = userData;
        }
      } else {
        await SecureStore.setItemAsync(USER_KEY, userData);
      }
    } catch (e) {
      console.warn('Erreur lors de la sauvegarde des données utilisateur:', e);
    }
  },

  async getUserData(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(USER_KEY);
        }
        return memoryStore[USER_KEY] || null;
      }
      return await SecureStore.getItemAsync(USER_KEY);
    } catch (e) {
      console.warn('Erreur lors de la récupération des données utilisateur:', e);
      return null;
    }
  },

  async clearAll(): Promise<void> {
    await this.removeToken();
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(USER_KEY);
        }
        delete memoryStore[USER_KEY];
      } else {
        await SecureStore.deleteItemAsync(USER_KEY);
      }
    } catch (e) {
      console.warn('Erreur lors de la réinitialisation du stockage:', e);
    }
  }
};
