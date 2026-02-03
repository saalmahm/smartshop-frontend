import apiClient from './apiClient';

export const orderApi = {
  async createOrder(payload) {
    // payload: { clientId, promoCode?, items: [{ productId, quantity }] }
    const response = await apiClient.post('/admin/orders', payload);
    return response.data; // OrderResponseDto
  },

  async getAdminOrders() {
    const response = await apiClient.get('/admin/orders');
    return response.data; // List<OrderResponseDto>
  },

  async getOrderById(id) {
    const response = await apiClient.get(`/admin/orders/${id}`);
    return response.data; // OrderResponseDto
  },
};