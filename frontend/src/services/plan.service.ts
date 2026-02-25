import api from '@/lib/api';

export const planService = {
  getMyPlan: () => api.get('/plans/my-plan').then((r) => r.data),
  getTemplates: () => api.get('/plans/templates').then((r) => r.data),
  createTemplate: (data: any) =>
    api.post('/plans/templates', data).then((r) => r.data),
  updateTemplate: (id: string, data: any) =>
    api.patch(`/plans/templates/${id}`, data).then((r) => r.data),
  deleteTemplate: (id: string) =>
    api.delete(`/plans/templates/${id}`).then((r) => r.data),
  assignToClient: (planId: string, clientId: string) =>
    api.post(`/plans/templates/${planId}/assign`, { clientId }).then((r) => r.data),
  getAssignedPlans: () => api.get('/plans/assigned').then((r) => r.data),
};