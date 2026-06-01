import api from '../../../utils/api.js';
import { ENDPOINTS } from '../../../config/apiConfig.js';

const { purchases } = ENDPOINTS;

export const purchaseService = {
  create: async (payload) => (await api.post(purchases.CREATE, payload)).data,
  list: async (filters = {}) => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v != null && v !== ''),
    );
    return (await api.get(purchases.LIST, { params })).data;
  },
};