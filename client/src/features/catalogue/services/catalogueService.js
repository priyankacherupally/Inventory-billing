import api from '../../../utils/api.js';
import { ENDPOINTS } from '../../../config/apiConfig.js';

const { catalogue } = ENDPOINTS;

export const catalogueService = {
  // Variants (L1)
  listVariants: async () => (await api.get(catalogue.VARIANTS)).data,
  createVariant: async (payload) =>
    (await api.post(catalogue.VARIANTS, payload)).data,
  // Only name/status are editable; parent ids in vars are for cache invalidation.
  updateVariant: async ({ id, name, status }) =>
    (await api.patch(catalogue.VARIANT(id), { name, status })).data,

  // Categories (L2)
  listCategories: async (variantId) =>
    (await api.get(catalogue.VARIANT_CATEGORIES(variantId))).data,
  createCategory: async (payload) =>
    (await api.post(catalogue.CATEGORIES, payload)).data,
  updateCategory: async ({ id, name, status }) =>
    (await api.patch(catalogue.CATEGORY(id), { name, status })).data,

  // Sub-categories (L3)
  listSubcategories: async (categoryId) =>
    (await api.get(catalogue.CATEGORY_SUBCATEGORIES(categoryId))).data,
  createSubcategory: async (payload) =>
    (await api.post(catalogue.SUBCATEGORIES, payload)).data,
  updateSubcategory: async ({ id, name, status }) =>
    (await api.patch(catalogue.SUBCATEGORY(id), { name, status })).data,

  // Designs (L4)
  listDesigns: async (subcategoryId) =>
    (await api.get(catalogue.SUBCATEGORY_DESIGNS(subcategoryId))).data,
  createDesign: async (payload) =>
    (await api.post(catalogue.DESIGNS, payload)).data,
  updateDesign: async ({ id, name, status }) =>
    (await api.patch(catalogue.DESIGN(id), { name, status })).data,
};