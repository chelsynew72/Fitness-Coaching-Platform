import api from '@/lib/api';

export const coachService = {
  getAllCoaches: () => api.get('/coaches').then((r) => r.data),
  getMyProfile: () => api.get('/coaches/profile').then((r) => r.data),
  getCoachById: (id: string) => api.get(`/coaches/${id}`).then((r) => r.data),
  createProfile: (data: any) =>
    api.post('/coaches/profile', data).then((r) => r.data),
  updateProfile: (data: any) =>
    api.patch('/coaches/profile', data).then((r) => r.data),
  getMyClients: () => api.get('/coaches/my-clients').then((r) => r.data),
};