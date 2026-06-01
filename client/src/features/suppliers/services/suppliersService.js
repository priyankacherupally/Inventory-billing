import api from '../../../utils/api.js';
import { ENDPOINTS } from '../../../config/apiConfig.js';

const { suppliers } = ENDPOINTS;

export const suppliersService = {
  list: async () => (await api.get(suppliers.LIST)).data,
  create: async (payload) => (await api.post(suppliers.CREATE, payload)).data,
  update: async ({ id, ...payload }) =>
    (await api.patch(suppliers.UPDATE(id), payload)).data,
  addPurchaseVariant: async ({ id, ...payload }) =>
    (await api.post(suppliers.ADD_PV(id), payload)).data,
  updatePurchaseVariant: async ({ id, pvId, specificPrice, status, reason }) =>
    (await api.patch(suppliers.UPDATE_PV(id, pvId), { specificPrice, status, reason }))
      .data,
  auditLog: async (id) => (await api.get(suppliers.AUDIT_LOG(id))).data,
};