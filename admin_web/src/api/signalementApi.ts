import { apiClient } from './client';
import { SignalementResponse, StatutSignalement } from '../types';

export const signalementApi = {
  async getEnAttente(): Promise<SignalementResponse[]> {
    const response = await apiClient.get<SignalementResponse[]>('/signalements/en-attente');
    return response.data;
  },

  async traiter(id: number, nouveauStatut: StatutSignalement, commentaireModerateur: string): Promise<SignalementResponse> {
    const response = await apiClient.patch<SignalementResponse>(
      `/signalements/${id}/traiter`,
      null,
      { params: { nouveauStatut, commentaireModerateur } }
    );
    return response.data;
  },

  /**
   * Récupère la photo protégée d'un signalement et la convertit en URL
   * blob locale utilisable dans un <img src>. Le navigateur (contrairement
   * à <Image> React Native) sait consommer un blob: URL sans souci.
   */
  async getPhotoObjectUrl(id: number): Promise<string> {
    const response = await apiClient.get(`/signalements/${id}/photo`, {
      responseType: 'blob',
    });
    return URL.createObjectURL(response.data);
  },
};
