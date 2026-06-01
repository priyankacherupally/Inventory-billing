import { Injectable } from '@nestjs/common';
import { DashboardSummaryDto } from './dto/dashboard-summary.dto';

@Injectable()
export class DashboardService {
  getSummary(): DashboardSummaryDto {
    return {
      title: 'Welcome',
      name: 'Priyanka',
    };
  }

  getStats() {
    return [
      {
        key: 'active',
        label: 'Active Sessions',
        value: 1284,
        suffix: 'live',
        accent: 'primary',
      },
      {
        key: 'velocity',
        label: 'Throughput',
        value: 97.4,
        suffix: '%',
        accent: 'success',
      },
      {
        key: 'growth',
        label: 'Weekly Growth',
        value: 12.6,
        suffix: '%',
        accent: 'warning',
      },
      {
        key: 'health',
        label: 'System Health',
        value: 99.98,
        suffix: '%',
        accent: 'info',
      },
    ];
  }

  getActivity() {
    return [
      {
        id: 1,
        type: 'success',
        message: 'New deployment shipped to production',
      },
      {
        id: 2,
        type: 'warn',
        message: 'Heavy load detected on api-gateway',
      },
      {
        id: 3,
        type: 'info',
        message: '12 new users joined this hour',
      },
      {
        id: 4,
        type: 'success',
        message: 'Nightly backups completed',
      },
    ];
  }

  getQuickLinks() {
    return [
      { key: 'reports', label: 'Open Reports', primary: true },
      { key: 'users', label: 'Manage Users', primary: false },
      { key: 'settings', label: 'Settings', primary: false },
    ];
  }
}
