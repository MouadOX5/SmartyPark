import { apiClient } from './client';
import { PresenceRequest, PresenceResponse } from '../types';

export const presenceApi = {
  /**
   * Démarre une présence / séance dans un espace public
   * POST /api/presences/demarrer
   */
  async demarrer(request: PresenceRequest): Promise<PresenceResponse> {
    const response = await apiClient.post<PresenceResponse>('/presences/demarrer', request);
    return response.data;
  },

  /**
   * Termine la présence / séance active de l'utilisateur
   * POST /api/presences/terminer
   */
  async terminer(): Promise<PresenceResponse> {
    const response = await apiClient.post<PresenceResponse>('/presences/terminer');
    return response.data;
  },

  /**
   * Récupère la présence active de l'utilisateur connecté
   * GET /api/presences/active
   */
  async getActive(): Promise<PresenceResponse> {
    const response = await apiClient.get<PresenceResponse>('/presences/active');
    return response.data;
  },

  /**
   * Vérifie si l'utilisateur a une présence active en cours
   * GET /api/presences/has-active
   */
  async hasActive(): Promise<boolean> {
    const response = await apiClient.get<boolean>('/presences/has-active');
    return response.data;
  },

  /**
   * Compte les utilisateurs actuellement actifs dans un espace
   * GET /api/presences/espace/{espacePublicId}/count
   */
  async getActiveCountInEspace(espacePublicId: number): Promise<number> {
    const response = await apiClient.get<number>(`/presences/espace/${espacePublicId}/count`);
    return response.data;
  },
};
