import { apiClient } from './client';
import { PropositionEspaceResponse } from '../types';

export const propositionApi = {
  async getEnAttente(): Promise<PropositionEspaceResponse[]> {
    const response = await apiClient.get<PropositionEspaceResponse[]>('/propositions/en-attente');
    return response.data;
  },

  /**
   * Historique complet des propositions (tous statuts), réservé
   * modérateur/administrateur.
   */
  async getHistorique(): Promise<PropositionEspaceResponse[]> {
    const response = await apiClient.get<PropositionEspaceResponse[]>('/propositions/historique');
    return response.data;
  },

  async valider(id: number): Promise<PropositionEspaceResponse> {
    const response = await apiClient.patch<PropositionEspaceResponse>(`/propositions/${id}/valider`);
    return response.data;
  },

  async refuser(id: number, motifRefus: string): Promise<PropositionEspaceResponse> {
    const response = await apiClient.patch<PropositionEspaceResponse>(
      `/propositions/${id}/refuser`,
      null,
      { params: { motifRefus } }
    );
    return response.data;
  },
};
