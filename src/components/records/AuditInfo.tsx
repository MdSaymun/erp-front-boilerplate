import { Descriptions } from 'antd';

import { useLocaleSettings } from '@/hooks/useLocaleSettings';
import type { AuditFields } from '@/types/common';
import { formatDateTime } from '@/utils/format/date';

interface AuditInfoProps {
  record: AuditFields;
  /** Resolve a user id to a display name (defaults to the id). */
  resolveUser?: (id: string) => string;
}

/** Created/updated stamps shown on every record. */
export function AuditInfo({ record, resolveUser = (id) => id }: AuditInfoProps) {
  const settings = useLocaleSettings();
  return (
    <Descriptions
      size="small"
      column={{ xs: 1, md: 2 }}
      items={[
        {
          key: 'createdAt',
          label: 'Created',
          children: formatDateTime(record.createdAt, settings),
        },
        {
          key: 'createdBy',
          label: 'Created by',
          children: record.createdBy ? resolveUser(record.createdBy) : '—',
        },
        {
          key: 'updatedAt',
          label: 'Last updated',
          children: record.updatedAt ? formatDateTime(record.updatedAt, settings) : '—',
        },
        {
          key: 'updatedBy',
          label: 'Updated by',
          children: record.updatedBy ? resolveUser(record.updatedBy) : '—',
        },
      ]}
    />
  );
}
