import { Badge, Button, Drawer, List, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useLocaleSettings } from '@/hooks/useLocaleSettings';
import { useNotifications } from '@/hooks/useNotifications';
import type { NotificationSeverity } from '@/types/erp';
import { formatDateTime } from '@/utils/format/date';

interface NotificationsDrawerProps {
  open: boolean;
  onClose: () => void;
}

const BADGE: Record<
  NotificationSeverity,
  'default' | 'processing' | 'success' | 'warning' | 'error'
> = {
  info: 'processing',
  success: 'success',
  warning: 'warning',
  error: 'error',
};

export function NotificationsDrawer({ open, onClose }: NotificationsDrawerProps) {
  const { t } = useTranslation();
  const settings = useLocaleSettings();
  const notifications = useNotifications({ enabled: open });

  return (
    <Drawer
      title={t('notifications.title')}
      open={open}
      onClose={onClose}
      width={400}
      extra={
        <Button
          size="small"
          onClick={() => notifications.markAllRead.mutate()}
          disabled={notifications.unreadCount === 0}
        >
          {t('actions.markAllRead')}
        </Button>
      }
    >
      {notifications.error ? (
        <ErrorState
          error={notifications.error}
          variant="inline"
          onRetry={() => void notifications.refetch()}
        />
      ) : (
        <List
          loading={notifications.isPending}
          dataSource={notifications.items}
          locale={{ emptyText: <EmptyState title={t('notifications.empty')} /> }}
          renderItem={(item) => (
            <List.Item
              style={{ opacity: item.readAt ? 0.7 : 1 }}
              onClick={() => {
                if (!item.readAt) notifications.markRead.mutate(item.id);
              }}
            >
              <List.Item.Meta
                avatar={<Badge status={BADGE[item.severity]} />}
                title={
                  item.link ? (
                    <Link to={item.link} onClick={onClose}>
                      {item.title}
                    </Link>
                  ) : (
                    item.title
                  )
                }
                description={
                  <>
                    {item.body ? <div>{item.body}</div> : null}
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {formatDateTime(item.createdAt, settings)}
                    </Typography.Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Drawer>
  );
}
