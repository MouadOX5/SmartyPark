import { apiClient } from './client';
import { PropositionEspaceRequest, PropositionEspaceResponse } from '../types';

export const propositionApi = {
  /**
   * Propose un nouvel espace public
   * POST /api/propositions
   */
  async creer(request: PropositionEspaceRequest): Promise<PropositionEspaceResponse> {
    const response = await apiClient.post<PropositionEspaceResponse>('/propositions', request);
    return response.data;
  },

  /**
   * Récupère toutes les propositions faites par l'utilisateur connecté
   * GET /api/propositions/mes-propositions
   */
  async getMesPropositions(): Promise<PropositionEspaceResponse[]> {
    const response = await apiClient.get<PropositionEspaceResponse[]>('/propositions/mes-propositions');
    return response.data;
  },

  /**
   * Récupère une proposition par son ID
   * GET /api/propositions/{id}
   */
  async getById(id: number): Promise<PropositionEspaceResponse> {
    const response = await apiClient.get<PropositionEspaceResponse>(`/propositions/${id}`);
    return response.data;
  },
};
