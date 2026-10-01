import { Button, Space, Typography } from 'antd';
import { useState } from 'react';

import { usePermission } from '@/hooks/usePermission';

import type { BulkAction } from './types';

interface BulkActionsBarProps<T> {
  selectedRows: T[];
  actions: BulkAction<T>[];
  onClear: () => void;
}

/** Appears when rows are selected; renders permission-filtered bulk actions. */
export function BulkActionsBar<T>({ selectedRows, actions, onClear }: BulkActionsBarProps<T>) {
  const { hasPermission } = usePermission();
  const [busy, setBusy] = useState<string | null>(null);

  if (selectedRows.length === 0) return null;

  const visible = actions.filter(
    (action) => !action.permission || hasPermission(action.permission),
  );

  return (
    <Space wrap role="toolbar" aria-label="Bulk actions" style={{ marginBottom: 8 }}>
      <Typography.Text strong aria-live="polite">
        {selectedRows.length} selected
      </Typography.Text>
      {visible.map((action) => (
        <Button
          key={action.key}
          size="small"
          icon={action.icon}
          danger={action.danger}
          loading={busy === action.key}
          onClick={async () => {
            setBusy(action.key);
            try {
              await action.onClick(selectedRows);
            } finally {
              setBusy(null);
            }
          }}
        >
          {action.label}
        </Button>
      ))}
      <Button size="small" type="link" onClick={onClear}>
        Clear selection
      </Button>
    </Space>
  );
}
