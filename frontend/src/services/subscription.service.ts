import api from '@/lib/api';

export const subscriptionService = {
  subscribe: (coachId: string) =>
    api.post('/subscriptions', { coachId }).then((r) => r.data),
  getMySubscription: () =>
    api.get('/subscriptions/my-subscription').then((r) => r.data),
  getMyHistory: () =>
    api.get('/subscriptions/my-history').then((r) => r.data),
  cancel: (coachId: string) =>
    api.patch(`/subscriptions/cancel/${coachId}`).then((r) => r.data),
  getCoachSubscriptions: () =>
    api.get('/subscriptions/my-clients').then((r) => r.data),
  getRevenue: () =>
    api.get('/subscriptions/revenue').then((r) => r.data),
};