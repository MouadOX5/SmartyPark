import { apiClient } from './client';
import { LoginRequest, RegisterRequest, UtilisateurResponse } from '../types';

export const authApi = {
  /**
   * Inscription d'un nouvel utilisateur
   * POST /api/auth/register
   */
  async register(data: RegisterRequest): Promise<UtilisateurResponse> {
    const response = await apiClient.post<UtilisateurResponse>('/auth/register', data);
    return response.data;
  },

  /**
   * Connexion utilisateur
   * POST /api/auth/login
   * Retourne la chaîne JWT
   */
  async login(data: LoginRequest): Promise<string> {
    const response = await apiClient.post<string>('/auth/login', data, {
      responseType: 'text',
    });
    return response.data;
  },

  /**
   * Profil de l'utilisateur connecté
   * GET /api/auth/me
   */
  async getMe(): Promise<UtilisateurResponse> {
    const response = await apiClient.get<UtilisateurResponse>('/auth/me');
    return response.data;
  },

  /**
   * Profil via l'endpoint utilisateurs
   * GET /api/utilisateurs/me
   */
  async getProfile(): Promise<UtilisateurResponse> {
    const response = await apiClient.get<UtilisateurResponse>('/utilisateurs/me');
    return response.data;
  },
};
