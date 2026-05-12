import apiClient from './apiClient';

export const authApi = {
  signup: (data) => apiClient.post('/auth/signup', data),
  login: (data) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  refreshToken: () => apiClient.post('/auth/refresh-token'),
  getMe: () => apiClient.get('/auth/me'),
};
