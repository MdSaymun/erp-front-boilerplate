import { Modal, Table, Tag } from 'antd';
import { useTranslation } from 'react-i18next';

import { useRegisteredShortcuts } from '@/hooks/useShortcut';
import { formatShortcut } from '@/services/shortcuts/shortcutRegistry';

interface ShortcutsHelpModalProps {
  open: boolean;
  onClose: () => void;
}

export function ShortcutsHelpModal({ open, onClose }: ShortcutsHelpModalProps) {
  const { t } = useTranslation();
  const shortcuts = useRegisteredShortcuts();

  return (
    <Modal title={t('shortcuts.title')} open={open} onCancel={onClose} footer={null}>
      <Table
        size="small"
        rowKey="id"
        pagination={false}
        dataSource={shortcuts}
        columns={[
          {
            title: 'Keys',
            dataIndex: 'keys',
            key: 'keys',
            width: 140,
            render: (keys: string) => <Tag>{formatShortcut(keys)}</Tag>,
          },
          { title: 'Action', dataIndex: 'description', key: 'description' },
          { title: 'Scope', dataIndex: 'scope', key: 'scope', width: 100 },
        ]}
      />
    </Modal>
  );
}
