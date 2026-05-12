import apiClient from './apiClient';

export const exportApi = {
  exportPDF: (data) => apiClient.post('/exports/pdf', data),
  exportMarkdown: (data) =>
    apiClient.post('/exports/markdown', data, { responseType: 'blob' }),
  exportJSON: (data) => apiClient.post('/exports/json', data),
  exportZip: (data) => apiClient.post('/exports/zip', data),
  download: (id) => apiClient.get(`/exports/${id}/download`, { responseType: 'blob' }),
};
