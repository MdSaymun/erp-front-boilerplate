import { Button, Space } from 'antd';
import type { ReactNode } from 'react';

export interface DocumentAction {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  primary?: boolean;
  danger?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

interface DocumentActionBarProps {
  actions: DocumentAction[];
}

/** Workflow actions (Confirm, Validate, Post, Cancel...) rendered consistently. */
export function DocumentActionBar({ actions }: DocumentActionBarProps) {
  return (
    <Space wrap role="toolbar" aria-label="Document actions">
      {actions.map((action) => (
        <Button
          key={action.key}
          type={action.primary ? 'primary' : 'default'}
          danger={action.danger}
          icon={action.icon}
          disabled={action.disabled}
          loading={action.loading}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      ))}
    </Space>
  );
}
