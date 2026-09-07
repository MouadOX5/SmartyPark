import { apiClient } from './client';
import { CategorieEspace, EspacePublicRequest, EspacePublicResponse } from '../types';
import { PhotoFile } from '../types/media';
import { Platform } from 'react-native';

async function buildEspaceFormData(request: EspacePublicRequest, photo?: PhotoFile | null): Promise<FormData> {
  const formData = new FormData();
  const jsonString = JSON.stringify(request);

  if (Platform.OS === 'web') {
    const jsonBlob = new Blob([jsonString], { type: 'application/json' });
    formData.append('espace', jsonBlob);
  } else {
    // Voir signalementApi.creer : forme fiable pour un part JSON sur React Native.
    formData.append('espace', {
      string: jsonString,
      type: 'application/json',
      name: 'espace.json',
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
      formData.append('image', { uri: photo.uri, name: filename, type: fileType } as any);
    }
  }

  return formData;
}

export const espacePublicApi = {
  /**
   * Récupère tous les espaces publics validés
   * GET /api/espaces-publics
   */
  async getAllValidated(): Promise<EspacePublicResponse[]> {
    const response = await apiClient.get<EspacePublicResponse[]>('/espaces-publics');
    return response.data;
  },

  /**
   * Récupère un espace public par son ID
   * GET /api/espaces-publics/{id}
   */
  async getById(id: number): Promise<EspacePublicResponse> {
    const response = await apiClient.get<EspacePublicResponse>(`/espaces-publics/${id}`);
    return response.data;
  },

  /**
   * Filtre les espaces publics par catégorie
   * GET /api/espaces-publics/categorie/{categorie}
   */
  async getByCategorie(categorie: CategorieEspace): Promise<EspacePublicResponse[]> {
    const response = await apiClient.get<EspacePublicResponse[]>(`/espaces-publics/categorie/${categorie}`);
    return response.data;
  },

  /**
   * Recherche des espaces publics par nom
   * GET /api/espaces-publics/recherche?nom={nom}
   */
  async searchByNom(nom: string): Promise<EspacePublicResponse[]> {
    const response = await apiClient.get<EspacePublicResponse[]>('/espaces-publics/recherche', {
      params: { nom },
    });
    return response.data;
  },

  // ==========================================
  // Administration (MODERATEUR / ADMINISTRATEUR)
  // ==========================================

  /**
   * Récupère tous les espaces publics, validés ou non
   * GET /api/espaces-publics/tous
   */
  async getAllTous(): Promise<EspacePublicResponse[]> {
    const response = await apiClient.get<EspacePublicResponse[]>('/espaces-publics/tous');
    return response.data;
  },

  /**
   * Crée un espace public directement (photo optionnelle)
   * POST /api/espaces-publics
   */
  async creer(request: EspacePublicRequest, photo?: PhotoFile | null): Promise<EspacePublicResponse> {
    const formData = await buildEspaceFormData(request, photo);
    const response = await apiClient.post<EspacePublicResponse>('/espaces-publics', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Valide un espace public (le rend visible publiquement)
   * PATCH /api/espaces-publics/{id}/valider
   */
  async valider(id: number): Promise<EspacePublicResponse> {
    const response = await apiClient.patch<EspacePublicResponse>(`/espaces-publics/${id}/valider`);
    return response.data;
  },

  /**
   * Supprime un espace public (ADMINISTRATEUR uniquement)
   * DELETE /api/espaces-publics/{id}
   */
  async supprimer(id: number): Promise<void> {
    await apiClient.delete(`/espaces-publics/${id}`);
  },
};
