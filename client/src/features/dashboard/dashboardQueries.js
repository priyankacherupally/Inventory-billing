import { useQuery, useMutation } from '@tanstack/react-query';
import { dashboardService } from './dashboardService.js';

export const dashboardKeys = {
  all: ['dashboard'],
  summary: () => [...dashboardKeys.all, 'summary'],
  stats: () => [...dashboardKeys.all, 'stats'],
  activity: () => [...dashboardKeys.all, 'activity'],
  quickLinks: () => [...dashboardKeys.all, 'quickLinks'],
};

export const useDashboardSummary = () =>
  useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: dashboardService.getSummary,
  });

export const useDashboardStats = () =>
  useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: dashboardService.getStats,
  });

export const useDashboardActivity = () =>
  useQuery({
    queryKey: dashboardKeys.activity(),
    queryFn: dashboardService.getActivity,
  });

export const useDashboardQuickLinks = () =>
  useQuery({
    queryKey: dashboardKeys.quickLinks(),
    queryFn: dashboardService.getQuickLinks,
  });

export const useRefreshDashboard = () =>
  useMutation({
    mutationFn: dashboardService.getSummary,
  });
