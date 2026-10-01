import { Button, type ButtonProps, Tooltip } from 'antd';

import { usePermission } from '@/hooks/usePermission';
import type { PermissionKey } from '@/types/permission';

interface PermissionButtonProps extends ButtonProps {
  permission: PermissionKey;
  /** 'hide' removes the button; 'disable' keeps it visible with an explanatory tooltip. */
  mode?: 'hide' | 'disable';
}

/** Button gated by a permission key. Backend remains the authority. */
export function PermissionButton({
  permission,
  mode = 'disable',
  disabled,
  ...props
}: PermissionButtonProps) {
  const { hasPermission } = usePermission();
  const allowed = hasPermission(permission);

  if (!allowed && mode === 'hide') return null;
  if (!allowed) {
    return (
      <Tooltip title="You do not have permission for this action">
        <span style={{ display: 'inline-block' }}>
          <Button {...props} disabled aria-disabled="true" />
        </span>
      </Tooltip>
    );
  }
  return <Button {...props} disabled={disabled} />;
}
