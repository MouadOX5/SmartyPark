import { apiClient } from './client';
import { PropositionEspaceRequest, PropositionEspaceResponse } from '../types';
import { PhotoFile } from '../types/media';
import { Platform } from 'react-native';

export type { PhotoFile };

export const propositionApi = {
  /**
   * Propose un nouvel espace public, avec photo optionnelle (multipart/form-data)
   * POST /api/propositions
   *
   * Part 'proposition' : JSON (PropositionEspaceRequest)
   * Part 'image' : fichier binaire (optionnel) — si l'admin valide la
   * proposition, cette photo devient directement celle de l'espace public créé.
   */
  async creer(request: PropositionEspaceRequest, photo?: PhotoFile | null): Promise<PropositionEspaceResponse> {
    const formData = new FormData();
    const jsonString = JSON.stringify(request);

    if (Platform.OS === 'web') {
      const jsonBlob = new Blob([jsonString], { type: 'application/json' });
      formData.append('proposition', jsonBlob);
    } else {
      // Voir signalementApi.creer : sur React Native, `new Blob([...])` produit
      // un part mal formé une fois encodé en multipart. La forme fiable est
      // un objet { string, type, name }.
      formData.append('proposition', {
        string: jsonString,
        type: 'application/json',
        name: 'proposition.json',
      } as any);
    }

    if (photo && photo.uri) {
      const filename = photo.name || photo.uri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const fileType = match ? `image/${match[1]}` : (photo.type || 'image/jpeg');

      if (Platform.OS === 'web') {
        const response = await fetch(photo.uri);
        const blob = await response.blob();
        formData.append('image', blob, filename);
      } else {
        formData.append('image', {
          uri: photo.uri,
          name: filename,
          type: fileType,
        } as any);
      }
    }

    const response = await apiClient.post<PropositionEspaceResponse>('/propositions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
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

  // ==========================================
  // Modération (MODERATEUR / ADMINISTRATEUR)
  // ==========================================

  /**
   * Récupère toutes les propositions en attente de modération
   * GET /api/propositions/en-attente
   */
  async getEnAttente(): Promise<PropositionEspaceResponse[]> {
    const response = await apiClient.get<PropositionEspaceResponse[]>('/propositions/en-attente');
    return response.data;
  },

  /**
   * Valide une proposition (elle devient un espace public visible)
   * PATCH /api/propositions/{id}/valider
   */
  async valider(id: number): Promise<PropositionEspaceResponse> {
    const response = await apiClient.patch<PropositionEspaceResponse>(`/propositions/${id}/valider`);
    return response.data;
  },

  /**
   * Refuse une proposition avec un motif obligatoire
   * PATCH /api/propositions/{id}/refuser
   */
  async refuser(id: number, motifRefus: string): Promise<PropositionEspaceResponse> {
    const response = await apiClient.patch<PropositionEspaceResponse>(
      `/propositions/${id}/refuser`,
      null,
      { params: { motifRefus } }
    );
    return response.data;
  },
};
