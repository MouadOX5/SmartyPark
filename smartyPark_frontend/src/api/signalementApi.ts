import { apiClient } from './client';
import { SignalementRequest, SignalementResponse, StatutSignalement, TypeSignalement } from '../types';
import { Platform } from 'react-native';
import { arrayBufferToBase64 } from '../utils/base64';
import { PhotoFile } from '../types/media';

export type { PhotoFile };

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
      // Sur React Native, `new Blob([...])` ne lève pas d'exception mais produit
      // un part mal formé une fois encodé en multipart (le backend Spring reçoit
      // alors "Required part 'signalement' is not present"). La forme fiable et
      // documentée pour React Native + axios est un objet { string, type, name }.
      formData.append('signalement', {
        string: jsonString,
        type: 'application/json',
        name: 'signalement.json',
      } as any);
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
   * (utile pour référence, mais préférer getPhotoDataUri côté mobile : voir plus bas)
   */
  getPhotoUrl(signalementId: number): string {
    return `${apiClient.defaults.baseURL}/signalements/${signalementId}/photo`;
  },

  /**
   * Récupère la photo d'un signalement en data URI (base64), via axios
   * (donc avec le Bearer token injecté automatiquement par l'intercepteur).
   * À utiliser à la place de getPhotoUrl() dans un <Image source={{uri}}>,
   * car le composant natif <Image> ne transmet pas fiablement les headers
   * custom sous Expo Go.
   */
  async getPhotoDataUri(signalementId: number): Promise<string> {
    const response = await apiClient.get(`/signalements/${signalementId}/photo`, {
      responseType: 'arraybuffer',
    });
    const contentType = response.headers['content-type'] || 'image/jpeg';
    const base64 = arrayBufferToBase64(response.data as ArrayBuffer);
    return `data:${contentType};base64,${base64}`;
  },

  // ==========================================
  // Modération (MODERATEUR / ADMINISTRATEUR)
  // ==========================================

  /**
   * Récupère tous les signalements en attente de traitement
   * GET /api/signalements/en-attente
   */
  async getEnAttente(): Promise<SignalementResponse[]> {
    const response = await apiClient.get<SignalementResponse[]>('/signalements/en-attente');
    return response.data;
  },

  /**
   * Filtre les signalements par type
   * GET /api/signalements/type/{type}
   */
  async getByType(type: TypeSignalement): Promise<SignalementResponse[]> {
    const response = await apiClient.get<SignalementResponse[]>(`/signalements/type/${type}`);
    return response.data;
  },

  /**
   * Traite un signalement : change son statut et ajoute un commentaire modérateur
   * PATCH /api/signalements/{id}/traiter
   */
  async traiter(
    id: number,
    nouveauStatut: StatutSignalement,
    commentaireModerateur: string
  ): Promise<SignalementResponse> {
    const response = await apiClient.patch<SignalementResponse>(
      `/signalements/${id}/traiter`,
      null,
      { params: { nouveauStatut, commentaireModerateur } }
    );
    return response.data;
  },
};
