import { MoreOutlined } from '@ant-design/icons';
import { Button, Dropdown, type MenuProps, Popconfirm, Space } from 'antd';
import type { ReactNode } from 'react';

import { usePermission } from '@/hooks/usePermission';
import type { PermissionKey } from '@/types/permission';

export interface DocumentAction {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  primary?: boolean;
  danger?: boolean;
  disabled?: boolean;
  loading?: boolean;
  /** Hidden (not just disabled) when the user lacks it. UX only. */
  permission?: PermissionKey;
  /** Ask for confirmation before running. */
  confirm?: { title: string; description?: string; okText?: string };
  /** Render inside the "More" dropdown instead of inline. */
  overflow?: boolean;
  hidden?: boolean;
}

interface DocumentActionBarProps {
  actions: DocumentAction[];
}

/** Workflow actions (Confirm, Validate, Post, Cancel...) rendered consistently. */
export function DocumentActionBar({ actions }: DocumentActionBarProps) {
  const { hasPermission } = usePermission();
  const visible = actions.filter(
    (a) => !a.hidden && (!a.permission || hasPermission(a.permission)),
  );
  const inline = visible.filter((a) => !a.overflow);
  const overflow = visible.filter((a) => a.overflow);

  const renderButton = (action: DocumentAction) => {
    const button = (
      <Button
        key={action.key}
        type={action.primary ? 'primary' : 'default'}
        danger={action.danger}
        icon={action.icon}
        disabled={action.disabled}
        loading={action.loading}
        onClick={action.confirm ? undefined : action.onClick}
      >
        {action.label}
      </Button>
    );
    if (!action.confirm) return button;
    return (
      <Popconfirm
        key={action.key}
        title={action.confirm.title}
        description={action.confirm.description}
        okText={action.confirm.okText ?? 'Confirm'}
        cancelText="Keep"
        okButtonProps={{ danger: action.danger }}
        onConfirm={action.onClick}
        disabled={action.disabled}
      >
        {button}
      </Popconfirm>
    );
  };

  const menuItems: MenuProps['items'] = overflow.map((action) => ({
    key: action.key,
    label: action.label,
    icon: action.icon,
    danger: action.danger,
    disabled: action.disabled,
    onClick: action.onClick,
  }));

  return (
    <Space wrap role="toolbar" aria-label="Document actions" className="erp-no-print">
      {inline.map(renderButton)}
      {overflow.length ? (
        <Dropdown menu={{ items: menuItems }} trigger={['click']}>
          <Button icon={<MoreOutlined />} aria-label="More actions" />
        </Dropdown>
      ) : null}
    </Space>
  );
}
