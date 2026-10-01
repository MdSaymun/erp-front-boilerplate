import type { ListQuery } from './api';
import type { Id, IsoDateTimeString } from './common';

/**
 * A saved list view: filters, sort and column layout a user wants to return to.
 * Stored client-side for now; the shape is ready for a `/views` resource with
 * `scope: 'shared'` later.
 */
export interface SavedView {
  id: Id;
  tableId: string;
  name: string;
  query: Partial<ListQuery>;
  hiddenColumns?: string[];
  isDefault?: boolean;
  scope: 'personal' | 'shared';
  createdAt: IsoDateTimeString;
}
