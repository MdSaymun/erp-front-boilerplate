import { Button, type ButtonProps, Popconfirm } from 'antd';
import type { ReactNode } from 'react';

interface ConfirmActionButtonProps extends Omit<ButtonProps, 'onClick' | 'title'> {
  /** Question shown in the confirmation, e.g. "Cancel this order?" */
  confirmTitle: ReactNode;
  confirmDescription?: ReactNode;
  okText?: string;
  onConfirm: () => void | Promise<void>;
}

/** Button that asks for confirmation before irreversible document actions. */
export function ConfirmActionButton({
  confirmTitle,
  confirmDescription,
  okText = 'Confirm',
  onConfirm,
  children,
  ...buttonProps
}: ConfirmActionButtonProps) {
  return (
    <Popconfirm
      title={confirmTitle}
      description={confirmDescription}
      okText={okText}
      cancelText="Keep"
      onConfirm={onConfirm}
      okButtonProps={{ danger: buttonProps.danger }}
    >
      <Button {...buttonProps}>{children}</Button>
    </Popconfirm>
  );
}
