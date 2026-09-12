import { apiClient } from './client';
import { PresenceResponse } from '../types';

export const presenceApi = {
  async getActiveByEspace(espacePublicId: number): Promise<PresenceResponse[]> {
    const response = await apiClient.get<PresenceResponse[]>(`/presences/espace/${espacePublicId}`);
    return response.data;
  },

  /**
   * Historique complet (actives + terminées) d'un espace, réservé aux
   * modérateurs/administrateurs.
   */
  async getHistoriqueByEspace(espacePublicId: number): Promise<PresenceResponse[]> {
    const response = await apiClient.get<PresenceResponse[]>(`/presences/espace/${espacePublicId}/historique`);
    return response.data;
  },
};
