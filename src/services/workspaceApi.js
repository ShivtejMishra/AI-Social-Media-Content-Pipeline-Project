import apiClient from './apiClient';

export const workspaceApi = {
  create: (data) => apiClient.post('/workspaces', data),
  getAll: () => apiClient.get('/workspaces'),
  getById: (id) => apiClient.get(`/workspaces/${id}`),
  update: (id, data) => apiClient.patch(`/workspaces/${id}`, data),
  delete: (id) => apiClient.delete(`/workspaces/${id}`),
  uploadLogo: (id, formData) =>
    apiClient.patch(`/workspaces/${id}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
