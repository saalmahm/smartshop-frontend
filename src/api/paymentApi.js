import apiClient from './apiClient';

export const paymentApi = {
  async createPayment(payload) {
    // payload: { orderId, amount, type, paymentDate?, dueDate?, reference?, bank? }
    const response = await apiClient.post('/admin/payments', payload);
    return response.data; // PaymentResponseDto
  },
};