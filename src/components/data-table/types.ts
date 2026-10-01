import type { TableColumnType } from 'antd';
import type { ReactNode } from 'react';

import type { ExportFormat, Filter, ListQuery, PagedResult } from '@/types/api';
import type { PermissionKey } from '@/types/permission';

export interface DataTableColumn<T> extends Omit<
  TableColumnType<T>,
  'key' | 'title' | 'sorter' | 'sortOrder'
> {
  /** Stable key, also used for column visibility persistence. */
  key: string;
  title: string;
  /** Backend sort field. Omit for non-sortable columns. */
  sortField?: string;
  /** Hidden by default; the user can enable it in the column chooser. */
  defaultHidden?: boolean;
  /** Cannot be hidden (e.g. the primary identifier). */
  alwaysVisible?: boolean;
}

export type FilterDefinition =
  | { field: string; label: string; type: 'text' }
  | {
      field: string;
      label: string;
      type: 'select';
      options: Array<{ label: string; value: string }>;
      multiple?: boolean;
    }
  | { field: string; label: string; type: 'date-range' }
  | { field: string; label: string; type: 'number-range' };

export interface BulkAction<T> {
  key: string;
  label: string;
  icon?: ReactNode;
  danger?: boolean;
  permission?: PermissionKey;
  /** Called with the selected rows; return a promise to show a loading state. */
  onClick: (rows: T[]) => void | Promise<void>;
}

export interface DataTableSelection<T> {
  selectedKeys: string[];
  onChange: (keys: string[], rows: T[]) => void;
}

export interface DataTableProps<T> {
  /** Unique id used for persisted column preferences and saved views. */
  tableId: string;
  columns: DataTableColumn<T>[];
  query: ListQuery;
  onQueryChange: (next: ListQuery) => void;
  result?: PagedResult<T>;
  isLoading?: boolean;
  /** Background refetch indicator (keepPreviousData). */
  isFetching?: boolean;
  error?: unknown;
  onRetry?: () => void;
  rowKey?: keyof T & string;
  onRowClick?: (row: T) => void;
  selection?: DataTableSelection<T>;
  bulkActions?: BulkAction<T>[];
  /** Toolbar configuration. */
  search?: boolean | { placeholder?: string };
  filters?: FilterDefinition[];
  /** Export handler; receives the current query. */
  onExport?: (format: ExportFormat, query: ListQuery) => Promise<Blob>;
  exportFormats?: ExportFormat[];
  exportFileName?: string;
  exportPermission?: PermissionKey;
  /** Extra toolbar content (usually the primary "New" button). */
  toolbarExtra?: ReactNode;
  savedViews?: boolean;
  /** Enable antd virtual scrolling for large pages (requires fixed column widths). */
  virtual?: boolean;
  scrollY?: number | string;
  emptyTitle?: string;
  emptyDescription?: ReactNode;
  emptyAction?: ReactNode;
  /** Enable multi-column sort (click adds a column). Default single sort. */
  multiSort?: boolean;
}

export type FiltersChangeHandler = (filters: Filter[]) => void;
