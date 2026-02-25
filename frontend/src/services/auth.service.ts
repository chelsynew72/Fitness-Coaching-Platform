import api from '@/lib/api';

export const authService = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => api.post('/auth/register', data).then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data).then((r) => r.data),

  logout: () => api.post('/auth/logout').then((r) => r.data),

  getMe: () => api.get('/auth/me').then((r) => r.data),
};