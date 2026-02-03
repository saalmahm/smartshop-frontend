// src/api/orderApi.js
import apiClient from './apiClient';

export const orderApi = {
  async createOrder(payload) {
    // payload: { clientId, promoCode?, items: [{ productId, quantity }] }
    const response = await apiClient.post('/admin/orders', payload);
    return response.data; // OrderResponseDto
  },

  // Liste des commandes ADMIN
  async getAdminOrders() {
    const response = await apiClient.get('/admin/orders');
    return response.data; // List<OrderResponseDto>
  },

  // Détail commande ADMIN
  async getOrderById(id) {
    const response = await apiClient.get(`/admin/orders/${id}`);
    return response.data; // OrderResponseDto
  },

  // Actions statut pour ADMIN
  async confirmOrder(id) {
    const response = await apiClient.patch(`/admin/orders/${id}/confirm`);
    return response.data; // OrderResponseDto
  },

  async cancelOrder(id) {
    const response = await apiClient.patch(`/admin/orders/${id}/cancel`);
    return response.data; // OrderResponseDto
  },

  async rejectOrder(id) {
    const response = await apiClient.patch(`/admin/orders/${id}/reject`);
    return response.data; // OrderResponseDto
  },

  // Liste des commandes du CLIENT connecté
  async getMyOrders() {
    const response = await apiClient.get('/me/orders');
    return response.data; // List<OrderResponseDto>
  },
};