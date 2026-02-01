import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080', // Backend SmartShop
  withCredentials: true,            // pour envoyer/recevoir le cookie JSESSIONID
});

export default apiClient;