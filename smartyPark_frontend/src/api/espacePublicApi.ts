import { apiClient } from './client';
import { CategorieEspace, EspacePublicResponse } from '../types';

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
};
