import { apiClient } from './client';
import { UtilisateurResponse } from '../types';

export const utilisateurApi = {
  async getAll(): Promise<UtilisateurResponse[]> {
    const response = await apiClient.get<UtilisateurResponse[]>('/utilisateurs');
    return response.data;
  },

  async toggleActif(id: number): Promise<UtilisateurResponse> {
    const response = await apiClient.patch<UtilisateurResponse>(`/utilisateurs/${id}/toggle-actif`);
    return response.data;
  },
};
