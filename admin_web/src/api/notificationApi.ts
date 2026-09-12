import { apiClient } from './client';
import { NotificationResponse } from '../types';

export const notificationApi = {
  async getAll(): Promise<NotificationResponse[]> {
    const response = await apiClient.get<NotificationResponse[]>('/notifications');
    return response.data;
  },

  async markAsRead(id: number): Promise<NotificationResponse> {
    const response = await apiClient.patch<NotificationResponse>(`/notifications/${id}/lire`);
    return response.data;
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.patch('/notifications/lire-tout');
  },
};
