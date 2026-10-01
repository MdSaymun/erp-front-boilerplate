import type { AppNotification } from '@/types/erp';

export function createNotifications(): AppNotification[] {
  return [
    {
      id: 'ntf-1',
      severity: 'warning',
      title: 'Low stock: 37 products below reorder point',
      createdAt: '2026-09-30T06:00:00Z',
      link: '/inventory/replenishment',
    },
    {
      id: 'ntf-2',
      severity: 'info',
      title: 'Purchase order PO/2026/000118 confirmed',
      createdAt: '2026-09-29T14:20:00Z',
      link: '/purchasing/orders',
    },
    {
      id: 'ntf-3',
      severity: 'success',
      title: 'Monthly close completed for ABC Trading Ltd',
      createdAt: '2026-09-28T09:00:00Z',
      readAt: '2026-09-28T10:00:00Z',
    },
  ];
}
