import apiClient from './apiClient';

export const authApi = {
  /**
   * Appelle POST /auth/login avec { username, password }.
   * En cas de succès (200), response.data est une string :
   * "Logged in as ADMIN" ou "Logged in as CLIENT".
   */
  async login({ username, password }) {
    const response = await apiClient.post('/auth/login', {
      username,
      password,
    });
    return response.data; // string
  },
};