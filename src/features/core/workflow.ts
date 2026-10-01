import { useMemo } from 'react';

import type { DocumentAction } from '@/components/documents/DocumentActionBar';
import type { DocumentStatus, WorkflowTransition } from '@/types/erp';
import type { PermissionKey } from '@/types/permission';

import { DOCUMENT_STATUS_META } from './documentStatus';

/** Transition metadata a module declares once per document type. */
export interface WorkflowActionSpec extends WorkflowTransition {
  label: string;
  permission?: PermissionKey;
  primary?: boolean;
  danger?: boolean;
  /** Ask before running (cancel, post, ...). */
  confirm?: { title: string; description?: string };
}

export function getAvailableTransitions<T extends WorkflowTransition>(
  status: DocumentStatus,
  transitions: T[],
): T[] {
  return transitions.filter((t) => t.from === status);
}

export function isEditable(status: DocumentStatus): boolean {
  return DOCUMENT_STATUS_META[status].editable;
}

interface UseWorkflowActionsArgs {
  status: DocumentStatus;
  transitions: WorkflowActionSpec[];
  onTransition: (action: string, to: DocumentStatus) => void | Promise<void>;
  busyAction?: string | null;
  disabled?: boolean;
}

/** Turns declared transitions into action-bar buttons for the current status. */
export function useWorkflowActions({
  status,
  transitions,
  onTransition,
  busyAction,
  disabled,
}: UseWorkflowActionsArgs): DocumentAction[] {
  return useMemo(
    () =>
      getAvailableTransitions(status, transitions).map<DocumentAction>((t) => ({
        key: t.action,
        label: t.label,
        primary: t.primary,
        danger: t.danger,
        permission: t.permission,
        confirm: t.confirm,
        disabled:
          disabled || (busyAction !== null && busyAction !== undefined && busyAction !== t.action),
        loading: busyAction === t.action,
        onClick: () => void onTransition(t.action, t.to),
      })),
    [status, transitions, onTransition, busyAction, disabled],
  );
}
