import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { notificationsApi } from '@/services/api/endpoints/notifications';
import { useAuthStore } from '@/stores/authStore';
import { useCompanyStore } from '@/stores/companyStore';

const PAGE_SIZE = 50;

/** In-app notifications with polling until the real-time channel exists. */
export function useNotifications(options: { pollIntervalMs?: number; enabled?: boolean } = {}) {
  const companyId = useCompanyStore((state) => state.currentCompanyId);
  const status = useAuthStore((state) => state.status);
  const client = useQueryClient();
  const key = ['company', companyId ?? 'none', 'notifications'] as const;
  const enabled = options.enabled ?? status !== 'anonymous';

  const query = useQuery({
    queryKey: key,
    queryFn: ({ signal }) =>
      notificationsApi.list(
        { page: 1, pageSize: PAGE_SIZE, sort: [{ field: 'createdAt', direction: 'desc' }] },
        { signal },
      ),
    enabled,
    refetchInterval: options.pollIntervalMs ?? 30_000,
  });

  const invalidate = () => client.invalidateQueries({ queryKey: key });
  const markRead = useMutation({ mutationFn: notificationsApi.markRead, onSuccess: invalidate });
  const markAllRead = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: invalidate,
  });

  const items = query.data?.items ?? [];
  const unreadCount = items.filter((n) => !n.readAt).length;

  return {
    items,
    unreadCount,
    isPending: query.isPending,
    error: query.error,
    refetch: query.refetch,
    markRead,
    markAllRead,
  };
}
