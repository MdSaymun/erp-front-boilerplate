import { DownloadOutlined } from '@ant-design/icons';
import { App, Button, Dropdown, type MenuProps } from 'antd';
import { useState } from 'react';

import { usePermission } from '@/hooks/usePermission';
import type { ExportFormat } from '@/types/api';
import type { PermissionKey } from '@/types/permission';
import { downloadBlob } from '@/utils/download';

interface ExportButtonProps {
  formats?: ExportFormat[];
  fileName?: string;
  permission?: PermissionKey;
  onExport: (format: ExportFormat) => Promise<Blob>;
}

const LABELS: Record<ExportFormat, string> = { csv: 'CSV', xlsx: 'Excel', pdf: 'PDF' };

/** Export menu; downloads the blob returned by the resource API. */
export function ExportButton({
  formats = ['csv', 'xlsx'],
  fileName = 'export',
  permission,
  onExport,
}: ExportButtonProps) {
  const { message } = App.useApp();
  const { hasPermission } = usePermission();
  const [loading, setLoading] = useState(false);

  if (permission && !hasPermission(permission)) return null;

  const run = async (format: ExportFormat) => {
    setLoading(true);
    try {
      const blob = await onExport(format);
      downloadBlob(blob, `${fileName}.${format}`);
    } catch {
      message.error('Export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const items: MenuProps['items'] = formats.map((format) => ({
    key: format,
    label: LABELS[format],
    onClick: () => void run(format),
  }));

  return (
    <Dropdown menu={{ items }} trigger={['click']}>
      <Button icon={<DownloadOutlined />} loading={loading} aria-label="Export">
        Export
      </Button>
    </Dropdown>
  );
}
