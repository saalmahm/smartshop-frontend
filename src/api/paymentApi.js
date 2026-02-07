import apiClient from './apiClient';

export const paymentApi = {
  async createPayment(payload) {
    const response = await apiClient.post('/admin/payments', payload);
    return response.data; // PaymentResponseDto
  },

  async encashPayment(paymentId) {
    const response = await apiClient.patch(
      `/admin/payments/${paymentId}/encash`
    );
    return response.data; // PaymentResponseDto mis à jour
  },
  async getOrderPayments(orderId) {
    const response = await apiClient.get(`/admin/orders/${orderId}/payments`);
    return response.data; // Retourne la liste des paiements d'une commande
  },
};