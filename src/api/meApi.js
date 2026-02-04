import apiClient from './apiClient';

export const meApi = {
  async getProfile() {
    const response = await apiClient.get('/me/profile');
    return response.data; // ClientProfileDto
  },
};