import api from '@/lib/api';

export const nutritionService = {
  logNutrition: (data: any) =>
    api.post('/nutrition', data).then((r) => r.data),
  getAll: () => api.get('/nutrition').then((r) => r.data),
  getToday: () => api.get('/nutrition/today').then((r) => r.data),
  getWeeklySummary: () =>
    api.get('/nutrition/summary/weekly').then((r) => r.data),
  getMacrosChart: () =>
    api.get('/nutrition/charts/macros').then((r) => r.data),
  searchFood: (query: string) =>
    api.get(`/nutrition/search/food?q=${encodeURIComponent(query)}`).then((r) => r.data),
  getFoodByBarcode: (barcode: string) =>
    api.get(`/nutrition/search/barcode/${barcode}`).then((r) => r.data),
};