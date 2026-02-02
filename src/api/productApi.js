import apiClient from './apiClient';

export const productApi = {
  // Catalogue public (CLIENT & visiteurs)
  async getProducts({ page = 0, size = 10, filters = {} } = {}) {
    const params = new URLSearchParams();
    params.set('page', page);
    params.set('size', size);

    if (filters.name && filters.name.trim() !== '') {
      params.set('name', filters.name.trim());
    }

    const response = await apiClient.get(`/products?${params.toString()}`);
    return response.data; // Page<ProductResponseDto>
  },

  // Liste complète pour l’ADMIN (gestion)
  async getAdminProducts() {
    const response = await apiClient.get('/admin/products');
    return response.data; // ProductResponseDto[]
  },

  async getProductById(id) {
    const response = await apiClient.get(`/admin/products/${id}`);
    return response.data; // ProductResponseDto
  },

  async createProduct(payload) {
    // payload: { name, description, unitPrice, stockQuantity }
    const response = await apiClient.post('/admin/products', payload);
    return response.data; // ProductResponseDto
  },

  async updateProduct(id, payload) {
    const response = await apiClient.put(`/admin/products/${id}`, payload);
    return response.data; // ProductResponseDto
  },

  async deleteProduct(id) {
    await apiClient.delete(`/admin/products/${id}`); // 204 No Content
  },
};