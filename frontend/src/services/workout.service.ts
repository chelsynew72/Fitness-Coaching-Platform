import api from '@/lib/api';

export const workoutService = {
  logWorkout: (data: any) => api.post('/workout-logs', data).then((r) => r.data),
  getMyLogs: () => api.get('/workout-logs').then((r) => r.data),
  getStats: () => api.get('/workout-logs/stats').then((r) => r.data),
  getWeeklyLogs: () => api.get('/workout-logs/weekly').then((r) => r.data),
  getStreak: () => api.get('/workout-logs/streak').then((r) => r.data),
  getClientLogs: (clientId: string) =>
    api.get(`/workout-logs/client/${clientId}`).then((r) => r.data),
};