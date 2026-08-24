import { apiClient } from './client';
import { AffluenceResponse, DeclarationAffluenceRequest } from '../types';

export const affluenceApi = {
  /**
   * Déclare l'affluence dans un espace public
   * POST /api/espaces-publics/{espaceId}/affluence
   */
  async declarer(espaceId: number, request: DeclarationAffluenceRequest): Promise<void> {
    await apiClient.post(`/espaces-publics/${espaceId}/affluence`, request);
  },

  /**
   * Récupère le statut d'affluence actuel calculé d'un espace public
   * GET /api/espaces-publics/{espaceId}/affluence
   */
  async getStatutActuel(espaceId: number): Promise<AffluenceResponse> {
    const response = await apiClient.get<AffluenceResponse>(`/espaces-publics/${espaceId}/affluence`);
    return response.data;
  },
};
