import { http, HttpResponse } from 'msw/http';

import type { AppNotification } from '@/types/erp';

import { createNotifications } from '../data/notifications';
import { api } from '../utils/api';
import { applyListQuery, listQueryFromUrl } from '../utils/applyListQuery';
import { problem } from '../utils/problem';

let notifications: AppNotification[] = createNotifications();

export function resetNotifications(): void {
  notifications = createNotifications();
}

export const notificationHandlers = [
  http.get(api('/notifications'), ({ request }) =>
    HttpResponse.json(applyListQuery(notifications, listQueryFromUrl(request.url), ['title'])),
  ),

  http.post(api('/notifications/:id/actions/read'), ({ params }) => {
    const item = notifications.find((n) => n.id === params.id);
    if (!item) return problem(404, 'Notification not found.');
    item.readAt = new Date().toISOString();
    return HttpResponse.json(item);
  }),

  http.post(api('/notifications/actions/read-all'), () => {
    const now = new Date().toISOString();
    notifications = notifications.map((n) => ({ ...n, readAt: n.readAt ?? now }));
    return new HttpResponse(null, { status: 204 });
  }),
];
