import type { DocumentStatus } from '@/types/erp';

export interface DocumentStatusMeta {
  label: string;
  /** Ant Design preset colour; status text is always shown alongside it. */
  color: 'default' | 'processing' | 'success' | 'warning' | 'error' | 'blue' | 'purple';
  /** Whether the document can still be edited in this state. */
  editable: boolean;
}

/** Single source of truth for how workflow states look across all modules. */
export const DOCUMENT_STATUS_META: Record<DocumentStatus, DocumentStatusMeta> = {
  draft: { label: 'Draft', color: 'default', editable: true },
  pending: { label: 'Pending approval', color: 'warning', editable: false },
  confirmed: { label: 'Confirmed', color: 'processing', editable: false },
  in_progress: { label: 'In progress', color: 'blue', editable: false },
  done: { label: 'Done', color: 'success', editable: false },
  posted: { label: 'Posted', color: 'purple', editable: false },
  cancelled: { label: 'Cancelled', color: 'error', editable: false },
};
