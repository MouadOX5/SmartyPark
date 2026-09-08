import { apiClient } from './client';
import { Role, UtilisateurResponse } from '../types';

/**
 * Gestion des utilisateurs — réservé aux ADMINISTRATEUR côté backend
 * (voir UtilisateurController.java, tous les endpoints sauf /me).
 */
export const utilisateurApi = {
  /**
   * Liste tous les utilisateurs
   * GET /api/utilisateurs
   */
  async getAll(): Promise<UtilisateurResponse[]> {
    const response = await apiClient.get<UtilisateurResponse[]>('/utilisateurs');
    return response.data;
  },

  /**
   * Filtre les utilisateurs par rôle
   * GET /api/utilisateurs/role/{role}
   */
  async getByRole(role: Role): Promise<UtilisateurResponse[]> {
    const response = await apiClient.get<UtilisateurResponse[]>(`/utilisateurs/role/${role}`);
    return response.data;
  },

  /**
   * Active ou désactive un compte utilisateur
   * PATCH /api/utilisateurs/{id}/toggle-actif
   */
  async toggleActif(id: number): Promise<UtilisateurResponse> {
    const response = await apiClient.patch<UtilisateurResponse>(`/utilisateurs/${id}/toggle-actif`);
    return response.data;
  },

  /**
   * Supprime un compte utilisateur
   * DELETE /api/utilisateurs/{id}
   */
  async supprimer(id: number): Promise<void> {
    await apiClient.delete(`/utilisateurs/${id}`);
  },
};
