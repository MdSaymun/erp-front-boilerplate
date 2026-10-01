import { Timeline, Typography } from 'antd';

import { EmptyState } from '@/components/feedback/EmptyState';
import { useLocaleSettings } from '@/hooks/useLocaleSettings';
import type { Activity } from '@/types/erp';
import { formatDateTime } from '@/utils/format/date';

interface ActivityTimelineProps {
  activities: Activity[];
}

const COLORS: Record<Activity['kind'], string> = {
  created: 'green',
  updated: 'blue',
  status_changed: 'purple',
  commented: 'gray',
  attached: 'gray',
};

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const settings = useLocaleSettings();
  if (activities.length === 0) return <EmptyState title="No activity yet" />;

  return (
    <Timeline
      items={activities.map((activity) => ({
        key: activity.id,
        color: COLORS[activity.kind],
        children: (
          <>
            <Typography.Text>{activity.summary}</Typography.Text>
            <br />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {formatDateTime(activity.occurredAt, settings)}
            </Typography.Text>
          </>
        ),
      }))}
    />
  );
}
