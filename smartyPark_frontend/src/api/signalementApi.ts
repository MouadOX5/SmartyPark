import { apiClient } from './client';
import { SignalementRequest, SignalementResponse } from '../types';
import { Platform } from 'react-native';

export interface PhotoFile {
  uri: string;
  name?: string;
  type?: string;
}

export const signalementApi = {
  /**
   * Crée un signalement avec photo facultative (multipart/form-data)
   * POST /api/signalements
   * 
   * Part 'signalement' : JSON (SignalementRequest) avec type 'application/json'
   * Part 'photo' : Fichier binaire Multipart (optionnel)
   */
  async creer(
    request: SignalementRequest,
    photo?: PhotoFile | null
  ): Promise<SignalementResponse> {
    const formData = new FormData();
    const jsonString = JSON.stringify(request);

    // Part JSON pour 'signalement'
    if (Platform.OS === 'web') {
      const jsonBlob = new Blob([jsonString], { type: 'application/json' });
      formData.append('signalement', jsonBlob);
    } else {
      try {
        // Support Blob si disponible dans le runtime React Native
        const jsonBlob = new Blob([jsonString], { type: 'application/json' });
        formData.append('signalement', jsonBlob as any);
      } catch {
        formData.append('signalement', {
          string: jsonString,
          type: 'application/json',
        } as any);
      }
    }

    // Part fichier pour 'photo' (si présente)
    if (photo && photo.uri) {
      const filename = photo.name || photo.uri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const fileType = match ? `image/${match[1]}` : (photo.type || 'image/jpeg');

      if (Platform.OS === 'web') {
        const response = await fetch(photo.uri);
        const blob = await response.blob();
        formData.append('photo', blob, filename);
      } else {
        formData.append('photo', {
          uri: photo.uri,
          name: filename,
          type: fileType,
        } as any);
      }
    }

    const response = await apiClient.post<SignalementResponse>('/signalements', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Récupère un signalement par son ID
   * GET /api/signalements/{id}
   */
  async getById(id: number): Promise<SignalementResponse> {
    const response = await apiClient.get<SignalementResponse>(`/signalements/${id}`);
    return response.data;
  },

  /**
   * Construit l'URL pour la photo d'un signalement
   */
  getPhotoUrl(signalementId: number): string {
    return `${apiClient.defaults.baseURL}/signalements/${signalementId}/photo`;
  },
};
