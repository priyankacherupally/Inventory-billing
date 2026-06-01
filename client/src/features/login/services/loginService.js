import api from '../../../utils/api.js';
import { ENDPOINTS } from '../../../config/apiConfig.js';

export const loginService = {
  login: async (credentials) => {
    const { data } = await api.post(ENDPOINTS.auth.LOGIN, credentials);
    return data;
  },
};
