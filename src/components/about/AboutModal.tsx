import { Descriptions, Modal } from 'antd';
import { useTranslation } from 'react-i18next';

import { env } from '@/config/env';

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

export function AboutModal({ open, onClose }: AboutModalProps) {
  const { t } = useTranslation();
  return (
    <Modal
      title={t('about.title', { name: env.appName })}
      open={open}
      onCancel={onClose}
      footer={null}
    >
      <Descriptions
        column={1}
        size="small"
        items={[
          { key: 'version', label: 'Version', children: env.appVersion },
          { key: 'environment', label: 'Environment', children: env.environment },
          {
            key: 'api',
            label: 'API',
            children: env.mockApi ? 'Mock Service Worker' : env.apiBaseUrl,
          },
        ]}
      />
    </Modal>
  );
}
