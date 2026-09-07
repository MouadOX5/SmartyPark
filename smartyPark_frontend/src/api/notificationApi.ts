import { apiClient } from './client';
import { NotificationResponse } from '../types';

export const notificationApi = {
  /**
   * Récupère toutes les notifications de l'utilisateur connecté
   * GET /api/notifications
   */
  async getAll(): Promise<NotificationResponse[]> {
    const response = await apiClient.get<NotificationResponse[]>('/notifications');
    return response.data;
  },

  /**
   * Compte les notifications non lues
   * GET /api/notifications/non-lues/count
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>('/notifications/non-lues/count');
    return response.data.count;
  },

  /**
   * Marque une notification comme lue
   * PATCH /api/notifications/{id}/lire
   */
  async markAsRead(id: number): Promise<NotificationResponse> {
    const response = await apiClient.patch<NotificationResponse>(`/notifications/${id}/lire`);
    return response.data;
  },

  /**
   * Marque toutes les notifications comme lues
   * PATCH /api/notifications/lire-tout
   */
  async markAllAsRead(): Promise<void> {
    await apiClient.patch('/notifications/lire-tout');
  },
};
