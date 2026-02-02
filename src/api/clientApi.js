// src/api/clientApi.js
import apiClient from './apiClient';

export const clientApi = {
  async getClients() {
    const response = await apiClient.get('/admin/clients');
    return response.data;
  },

  async getClientById(id) {
    const response = await apiClient.get(`/admin/clients/${id}`);
    return response.data; // ClientResponseDto
  },

  async getClientOrders(id) {
    const response = await apiClient.get(`/admin/clients/${id}/orders`);
    return response.data; // OrderResponseDto[]
  },

  async updateClient(id, payload) {
    const response = await apiClient.put(`/admin/clients/${id}`, payload);
    return response.data; // ClientResponseDto
  },
};