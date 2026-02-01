import apiClient from './apiClient';

export const clientApi = {
  async getClients() {
    const response = await apiClient.get('/admin/clients');
    return response.data;
  },
};