export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const ENDPOINTS = {
  auth: {
    LOGIN: '/auth/login',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
  },
  users: {
    LIST: '/users',
    CREATE: '/users',
    UPDATE: (id) => `/users/${id}`,
    DEACTIVATE: (id) => `/users/${id}`,
  },
  catalogue: {
    VARIANTS: '/variants',
    VARIANT: (id) => `/variants/${id}`,
    VARIANT_CATEGORIES: (id) => `/variants/${id}/categories`,
    CATEGORIES: '/categories',
    CATEGORY: (id) => `/categories/${id}`,
    CATEGORY_SUBCATEGORIES: (id) => `/categories/${id}/subcategories`,
    SUBCATEGORIES: '/subcategories',
    SUBCATEGORY: (id) => `/subcategories/${id}`,
    SUBCATEGORY_DESIGNS: (id) => `/subcategories/${id}/designs`,
    DESIGNS: '/designs',
    DESIGN: (id) => `/designs/${id}`,
    DESIGN_STOCK: (id) => `/designs/${id}/stock`,
  },
  suppliers: {
    LIST: '/suppliers',
    CREATE: '/suppliers',
    DETAIL: (id) => `/suppliers/${id}`,
    UPDATE: (id) => `/suppliers/${id}`,
    ADD_PV: (id) => `/suppliers/${id}/purchase-variants`,
    UPDATE_PV: (id, pvId) => `/suppliers/${id}/purchase-variants/${pvId}`,
    AUDIT_LOG: (id) => `/suppliers/${id}/audit-log`,
  },
  bills: {
    LIST: '/bills',
    CREATE: '/bills',
    DETAIL: (id) => `/bills/${id}`,
    PRINT: (id) => `/bills/${id}/print`,
  },
  designsFlat: '/designs',
  purchases: {
    LIST: '/purchases',
    CREATE: '/purchases',
    DETAIL: (id) => `/purchases/${id}`,
  },
  dashboard: {
    SUMMARY: '/dashboard',
    STATS: '/dashboard/stats',
    ACTIVITY: '/dashboard/activity',
    QUICK_LINKS: '/dashboard/quick-links',
  },
};

export const ROLES = {
  ADMIN: 'admin',
  BILLING_EXECUTIVE: 'billing_executive',
};