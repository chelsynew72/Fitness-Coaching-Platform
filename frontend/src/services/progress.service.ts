import api from '@/lib/api';

export const progressService = {
  logProgress: (data: any) => api.post('/progress', data).then((r) => r.data),
  getMyProgress: () => api.get('/progress').then((r) => r.data),
  getSummary: () => api.get('/progress/summary').then((r) => r.data),
  getWeightChart: () => api.get('/progress/charts/weight').then((r) => r.data),
  getMoodChart: () => api.get('/progress/charts/mood').then((r) => r.data),
  getClientProgress: (clientId: string) =>
    api.get(`/progress/client/${clientId}`).then((r) => r.data),
  getClientSummary: (clientId: string) =>
    api.get(`/progress/client/${clientId}/summary`).then((r) => r.data),
};