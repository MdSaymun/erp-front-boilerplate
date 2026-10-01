import type { AppNotification } from '@/types/erp';

import { http } from '../client';
import { createResourceApi } from '../resource';

export const NOTIFICATIONS_API = { base: '/notifications' } as const;

export const notificationsApi = {
  ...createResourceApi<AppNotification>(NOTIFICATIONS_API.base),
  markRead: (id: string) =>
    http.post<AppNotification>(`${NOTIFICATIONS_API.base}/${encodeURIComponent(id)}/actions/read`),
  markAllRead: () => http.post<void>(`${NOTIFICATIONS_API.base}/actions/read-all`),
};
