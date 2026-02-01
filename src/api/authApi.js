import apiClient from './apiClient';

export const authApi = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data; // "Logged in as CLIENT"
  },

  getMyProfile: async () => {
    const response = await apiClient.get('/me/profile');
    return response.data; // ClientProfileDto
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data; // "Logged out"
  },
};