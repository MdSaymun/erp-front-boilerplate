import type { DocumentStatus } from '@/types/erp';

export interface DocumentStatusMeta {
  label: string;
  /** Ant Design preset colour; status text is always shown alongside it. */
  color: 'default' | 'processing' | 'success' | 'warning' | 'error' | 'blue' | 'purple';
  /** Whether the document can still be edited in this state. */
  editable: boolean;
  /** Position in the happy-path progression (stage bar). Terminal/off-path states share the end. */
  order: number;
  /** Not part of the forward progression (shown as an error step instead). */
  offPath?: boolean;
}

/** Single source of truth for how workflow states look across all modules. */
export const DOCUMENT_STATUS_META: Record<DocumentStatus, DocumentStatusMeta> = {
  draft: { label: 'Draft', color: 'default', editable: true, order: 0 },
  pending: { label: 'Pending approval', color: 'warning', editable: false, order: 1 },
  confirmed: { label: 'Confirmed', color: 'processing', editable: false, order: 2 },
  in_progress: { label: 'In progress', color: 'blue', editable: false, order: 3 },
  done: { label: 'Done', color: 'success', editable: false, order: 4 },
  posted: { label: 'Posted', color: 'purple', editable: false, order: 5 },
  cancelled: { label: 'Cancelled', color: 'error', editable: false, order: 5, offPath: true },
};
