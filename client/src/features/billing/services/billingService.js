import api from '../../../utils/api.js';
import { ENDPOINTS } from '../../../config/apiConfig.js';

const { bills, designsFlat } = ENDPOINTS;

export const billingService = {
  listActiveDesigns: async () =>
    (await api.get(designsFlat, { params: { status: 'active' } })).data,
  create: async (payload) => (await api.post(bills.CREATE, payload)).data,
  list: async (filters = {}) => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v != null && v !== ''),
    );
    return (await api.get(bills.LIST, { params })).data;
  },
  getPrintData: async (id) => (await api.get(bills.PRINT(id))).data,
};