import { Steps } from 'antd';

import { DOCUMENT_STATUS_META } from '@/features/core/documentStatus';
import type { DocumentStatus } from '@/types/erp';

interface RecordStageBarProps {
  status: DocumentStatus;
  /** The happy-path statuses for this document type, in order. */
  stages: DocumentStatus[];
}

/** Horizontal progression of a document through its workflow. Text + icon, never colour alone. */
export function RecordStageBar({ status, stages }: RecordStageBarProps) {
  const meta = DOCUMENT_STATUS_META[status];
  const currentIndex = stages.indexOf(status);
  const items = stages.map((stage) => ({ key: stage, title: DOCUMENT_STATUS_META[stage].label }));

  if (meta.offPath) {
    items.push({ key: status, title: meta.label });
  }

  return (
    <Steps
      size="small"
      aria-label={`Status: ${meta.label}`}
      current={meta.offPath ? items.length - 1 : Math.max(currentIndex, 0)}
      status={meta.offPath ? 'error' : currentIndex === stages.length - 1 ? 'finish' : 'process'}
      items={items}
      className="erp-no-print"
    />
  );
}
