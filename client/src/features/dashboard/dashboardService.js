import api from '../../utils/api.js';
import { ENDPOINTS } from '../../config/apiConfig.js';

export const dashboardService = {
  getSummary: async () => {
    const { data } = await api.get(ENDPOINTS.dashboard.SUMMARY);
    return data;
  },

  getStats: async () => {
    const { data } = await api.get(ENDPOINTS.dashboard.STATS);
    return data;
  },

  getActivity: async () => {
    const { data } = await api.get(ENDPOINTS.dashboard.ACTIVITY);
    return data;
  },

  getQuickLinks: async () => {
    const { data } = await api.get(ENDPOINTS.dashboard.QUICK_LINKS);
    return data;
  },
};
