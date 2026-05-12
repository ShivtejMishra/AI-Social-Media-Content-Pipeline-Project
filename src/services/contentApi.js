import apiClient from './apiClient';

export const contentApi = {
  getAll: (params) => apiClient.get('/content', { params }),
  getById: (id) => apiClient.get(`/content/${id}`),
  update: (id, data) => apiClient.patch(`/content/${id}`, data),
  delete: (id) => apiClient.delete(`/content/${id}`),
  duplicate: (id) => apiClient.post(`/content/${id}/duplicate`),
  approve: (id) => apiClient.post(`/content/${id}/approve`),
};

export const scheduleApi = {
  create: (data) => apiClient.post('/schedules', data),
  getAll: (params) => apiClient.get('/schedules', { params }),
  getById: (id) => apiClient.get(`/schedules/${id}`),
  update: (id, data) => apiClient.patch(`/schedules/${id}`, data),
  delete: (id) => apiClient.delete(`/schedules/${id}`),
};

export const analyticsApi = {
  getOverview: () => apiClient.get('/analytics/overview'),
  getWorkspaceAnalytics: (id) => apiClient.get(`/analytics/workspace/${id}`),
  getUsage: () => apiClient.get('/analytics/usage'),
};
