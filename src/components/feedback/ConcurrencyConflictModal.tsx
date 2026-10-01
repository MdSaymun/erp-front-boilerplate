import { Modal, Typography } from 'antd';

interface ConcurrencyConflictModalProps {
  open: boolean;
  onReload: () => void;
  onKeepEditing: () => void;
  message?: string;
}

/** Shown on HTTP 409: someone else changed the record since it was loaded. */
export function ConcurrencyConflictModal({
  open,
  onReload,
  onKeepEditing,
  message,
}: ConcurrencyConflictModalProps) {
  return (
    <Modal
      open={open}
      title="This record was changed by someone else"
      okText="Reload latest version"
      cancelText="Keep my changes"
      onOk={onReload}
      onCancel={onKeepEditing}
      closable={false}
      maskClosable={false}
    >
      <Typography.Paragraph>
        {message ??
          'The record was modified since you opened it. Reload to see the latest version, or keep editing and save again once you have reviewed the changes.'}
      </Typography.Paragraph>
    </Modal>
  );
}
