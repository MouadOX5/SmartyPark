import { apiClient } from './client';
import { JournalResponse } from '../types';

export const journalApi = {
  async getAll(): Promise<JournalResponse[]> {
    const response = await apiClient.get<JournalResponse[]>('/journaux');
    return response.data;
  },
};
