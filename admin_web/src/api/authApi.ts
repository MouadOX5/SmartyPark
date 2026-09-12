import { apiClient } from './client';
import { LoginRequest, UtilisateurResponse } from '../types';

export const authApi = {
  async login(request: LoginRequest): Promise<string> {
    const response = await apiClient.post<string>('/auth/login', request, {
      responseType: 'text',
    });
    return response.data;
  },

  async getMe(): Promise<UtilisateurResponse> {
    const response = await apiClient.get<UtilisateurResponse>('/auth/me');
    return response.data;
  },
};
