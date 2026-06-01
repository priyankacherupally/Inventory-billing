import api from '../../../utils/api.js';
import { ENDPOINTS } from '../../../config/apiConfig.js';

export const usersService = {
  list: async () => {
    const { data } = await api.get(ENDPOINTS.users.LIST);
    return data;
  },
  create: async (payload) => {
    const { data } = await api.post(ENDPOINTS.users.CREATE, payload);
    return data;
  },
  update: async ({ id, ...payload }) => {
    const { data } = await api.patch(ENDPOINTS.users.UPDATE(id), payload);
    return data;
  },
  deactivate: async (id) => {
    const { data } = await api.delete(ENDPOINTS.users.DEACTIVATE(id));
    return data;
  },
};