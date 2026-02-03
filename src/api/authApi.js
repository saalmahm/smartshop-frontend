// src/api/authApi.js
import apiClient from './apiClient';

export const authApi = {
  // Login générique (client ou admin selon tes règles backend)
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  // Session CLIENT
  getMyProfile: async () => {
    const response = await apiClient.get('/me/profile');
    return response.data; // ClientProfileDto
  },

  // Session ADMIN
  getAdminProfile: async () => {
    const response = await apiClient.get('/admin/me');
    return response.data; // AdminProfileDto
  },

  // Logout
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data; // "Logged out"
  },
};