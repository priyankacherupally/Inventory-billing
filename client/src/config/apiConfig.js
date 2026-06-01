export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const ENDPOINTS = {
  auth: {
    LOGIN: '/auth/login',
  },
  dashboard: {
    SUMMARY: '/dashboard',
    STATS: '/dashboard/stats',
    ACTIVITY: '/dashboard/activity',
    QUICK_LINKS: '/dashboard/quick-links',
  },
};
