import { Tag } from 'antd';

import { DOCUMENT_STATUS_META } from '@/features/core/documentStatus';
import type { DocumentStatus } from '@/types/erp';

interface DocumentStatusTagProps {
  status: DocumentStatus;
}

/** Status display with text, so meaning never depends on colour alone. */
export function DocumentStatusTag({ status }: DocumentStatusTagProps) {
  const meta = DOCUMENT_STATUS_META[status];
  return (
    <Tag color={meta.color} data-status={status}>
      {meta.label}
    </Tag>
  );
}
