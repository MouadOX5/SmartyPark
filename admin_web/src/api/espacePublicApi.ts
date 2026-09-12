import { apiClient } from './client';
import { EspacePublicRequest, EspacePublicResponse } from '../types';

export const espacePublicApi = {
  async getAllTous(): Promise<EspacePublicResponse[]> {
    const response = await apiClient.get<EspacePublicResponse[]>('/espaces-publics/tous');
    return response.data;
  },

  async creer(request: EspacePublicRequest, image?: File | null): Promise<EspacePublicResponse> {
    const formData = new FormData();
    formData.append('espace', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    if (image) {
      formData.append('image', image);
    }
    // Le client axios a un Content-Type par défaut ("application/json") pour
    // les autres appels : ici il faut le désactiver pour que le navigateur
    // fixe lui-même "multipart/form-data; boundary=..." sur le FormData.
    const response = await apiClient.post<EspacePublicResponse>('/espaces-publics', formData, {
      headers: { 'Content-Type': undefined } as any,
    });
    return response.data;
  },

  async update(id: number, request: EspacePublicRequest, image?: File | null): Promise<EspacePublicResponse> {
    const formData = new FormData();
    formData.append('espace', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    if (image) {
      formData.append('image', image);
    }
    const response = await apiClient.put<EspacePublicResponse>(`/espaces-publics/${id}`, formData, {
      headers: { 'Content-Type': undefined } as any,
    });
    return response.data;
  },

  async valider(id: number): Promise<EspacePublicResponse> {
    const response = await apiClient.patch<EspacePublicResponse>(`/espaces-publics/${id}/valider`);
    return response.data;
  },

  async supprimer(id: number): Promise<void> {
    await apiClient.delete(`/espaces-publics/${id}`);
  },
};
