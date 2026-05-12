import apiClient from './apiClient';

export const aiApi = {
  generateContent: (data) => apiClient.post('/ai/generate-content', data),
  regenerateContent: (data) => apiClient.post('/ai/regenerate-content', data),
  generateImage: (data) => apiClient.post('/ai/generate-image', data),
  generateThumbnail: (data) => apiClient.post('/ai/generate-thumbnail', data),
  getImages: (params) => apiClient.get('/ai/images', { params }),
  getImageById: (id) => apiClient.get(`/ai/images/${id}`),
  deleteImage: (id) => apiClient.delete(`/ai/images/${id}`),
};
