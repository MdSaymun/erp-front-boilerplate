import { Table, type TableColumnType, type TableProps } from 'antd';
import { useMemo, useState } from 'react';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { selectTablePreferences, useTableStore } from '@/stores/tableStore';
import { useUiStore } from '@/stores/uiStore';
import type { Sort } from '@/types/api';
import type { SavedView } from '@/types/views';

import { BulkActionsBar } from './BulkActionsBar';
import { ColumnChooser } from './ColumnChooser';
import { DataTableToolbar } from './DataTableToolbar';
import { ExportButton } from './ExportButton';
import { SavedViewsMenu } from './SavedViewsMenu';
import type { DataTableProps } from './types';

const PAGE_SIZE_OPTIONS = ['10', '25', '50', '100', '200'];

type SorterResult<T> = NonNullable<Parameters<NonNullable<TableProps<T>['onChange']>>[2]>;

function sorterToSort<T>(sorter: SorterResult<T>, fieldByKey: Map<string, string>): Sort[] {
  const list = Array.isArray(sorter) ? sorter : [sorter];
  return list.flatMap((item) => {
    const key = item.columnKey !== undefined ? String(item.columnKey) : undefined;
    const field = key ? fieldByKey.get(key) : undefined;
    if (!field || !item.order) return [];
    return [{ field, direction: item.order === 'descend' ? 'desc' : 'asc' }];
  });
}

/**
 * Server-driven table for ERP list pages: URL-friendly query in, paged result out.
 * Handles sorting, paging, search, filters, selection, bulk actions, column
 * visibility, saved views, export, density, loading/empty/error states and
 * horizontal overflow. Data fetching stays in the caller (TanStack Query).
 */
export function DataTable<T extends object>({
  tableId,
  columns,
  query,
  onQueryChange,
  result,
  isLoading,
  isFetching,
  error,
  onRetry,
  rowKey = 'id' as keyof T & string,
  onRowClick,
  selection,
  bulkActions,
  search = true,
  filters,
  onExport,
  exportFormats,
  exportFileName,
  exportPermission,
  toolbarExtra,
  savedViews = true,
  virtual,
  scrollY,
  emptyTitle,
  emptyDescription,
  emptyAction,
  multiSort = false,
}: DataTableProps<T>) {
  const density = useUiStore((state) => state.tableDensity);
  const preferences = useTableStore(selectTablePreferences(tableId));
  const setHiddenColumns = useTableStore((state) => state.setHiddenColumns);
  const saveView = useTableStore((state) => state.saveView);
  const deleteView = useTableStore((state) => state.deleteView);
  const [internalSelection, setInternalSelection] = useState<{ keys: string[]; rows: T[] }>({
    keys: [],
    rows: [],
  });

  const selectedKeys = selection?.selectedKeys ?? internalSelection.keys;
  const selectedRows = selection
    ? (result?.items ?? []).filter((row) => selectedKeys.includes(String(row[rowKey])))
    : internalSelection.rows;

  const fieldByKey = useMemo(
    () => new Map(columns.filter((c) => c.sortField).map((c) => [c.key, c.sortField as string])),
    [columns],
  );

  const hiddenDefaults = useMemo(
    () => columns.filter((c) => c.defaultHidden).map((c) => c.key),
    [columns],
  );
  const hidden = preferences.hiddenColumns.length ? preferences.hiddenColumns : hiddenDefaults;

  const antdColumns = useMemo<TableColumnType<T>[]>(
    () =>
      columns
        .filter((column) => column.alwaysVisible || !hidden.includes(column.key))
        .map(({ sortField, defaultHidden: _dh, alwaysVisible: _av, ...column }, index) => {
          const active = sortField ? query.sort?.find((s) => s.field === sortField) : undefined;
          return {
            ...column,
            ellipsis: column.ellipsis ?? true,
            sorter: sortField ? (multiSort ? { multiple: columns.length - index } : true) : false,
            sortOrder: active ? (active.direction === 'desc' ? 'descend' : 'ascend') : null,
            sortDirections: ['ascend', 'descend'],
          };
        }),
    [columns, hidden, query.sort, multiSort],
  );

  const handleChange: TableProps<T>['onChange'] = (pagination, _filters, sorter, extra) => {
    if (extra.action === 'sort') {
      const sort = sorterToSort(sorter, fieldByKey);
      onQueryChange({ ...query, sort: sort.length ? sort : undefined, page: 1 });
    } else if (extra.action === 'paginate') {
      onQueryChange({
        ...query,
        page: pagination.current ?? 1,
        pageSize: pagination.pageSize ?? query.pageSize,
      });
    }
  };

  const applyView = (view: SavedView) => {
    onQueryChange({ ...query, ...view.query, page: 1 });
    if (view.hiddenColumns) setHiddenColumns(tableId, view.hiddenColumns);
  };

  const clearSelection = () => {
    setInternalSelection({ keys: [], rows: [] });
    selection?.onChange([], []);
  };

  const rowSelection: TableProps<T>['rowSelection'] | undefined =
    selection || bulkActions?.length
      ? {
          selectedRowKeys: selectedKeys,
          preserveSelectedRowKeys: true,
          onChange: (keys, rows) => {
            const stringKeys = keys.map(String);
            setInternalSelection({ keys: stringKeys, rows });
            selection?.onChange(stringKeys, rows);
          },
        }
      : undefined;

  const right = (
    <>
      {onExport ? (
        <ExportButton
          formats={exportFormats}
          fileName={exportFileName ?? tableId}
          permission={exportPermission}
          onExport={(format) => onExport(format, query)}
        />
      ) : null}
      {savedViews ? (
        <SavedViewsMenu
          views={preferences.savedViews}
          onApply={applyView}
          onSave={(name) =>
            saveView({
              id: `view-${Date.now()}`,
              tableId,
              name,
              query: {
                search: query.search,
                sort: query.sort,
                filters: query.filters,
                pageSize: query.pageSize,
              },
              hiddenColumns: hidden,
              scope: 'personal',
              createdAt: new Date().toISOString(),
            })
          }
          onDelete={(viewId) => deleteView(tableId, viewId)}
        />
      ) : null}
      <ColumnChooser
        columns={columns}
        hiddenColumns={hidden}
        onChange={(next) => setHiddenColumns(tableId, next)}
      />
      {toolbarExtra}
    </>
  );

  return (
    <div data-testid={`data-table-${tableId}`}>
      <DataTableToolbar
        search={search}
        searchValue={query.search ?? ''}
        onSearchChange={(value) => onQueryChange({ ...query, search: value || undefined, page: 1 })}
        filters={filters}
        activeFilters={query.filters ?? []}
        onFiltersChange={(next) =>
          onQueryChange({ ...query, filters: next.length ? next : undefined, page: 1 })
        }
        onRefresh={onRetry}
        isFetching={isFetching}
        right={right}
      />
      <div style={{ height: 8 }} />
      {bulkActions?.length ? (
        <BulkActionsBar
          selectedRows={selectedRows}
          actions={bulkActions}
          onClear={clearSelection}
        />
      ) : null}
      {error && !result ? (
        <ErrorState error={error} onRetry={onRetry} variant="inline" />
      ) : (
        <div className="erp-table-wrapper">
          <Table<T>
            rowKey={rowKey}
            columns={antdColumns}
            dataSource={result?.items ?? []}
            loading={isLoading}
            size={density === 'compact' ? 'small' : 'middle'}
            sticky
            virtual={virtual}
            scroll={{
              x: 'max-content',
              ...(scrollY !== undefined || virtual ? { y: scrollY ?? 480 } : {}),
            }}
            onChange={handleChange}
            rowSelection={rowSelection}
            onRow={
              onRowClick
                ? (row) => ({ onClick: () => onRowClick(row), style: { cursor: 'pointer' } })
                : undefined
            }
            pagination={{
              current: query.page,
              pageSize: query.pageSize,
              total: result?.totalCount ?? 0,
              showSizeChanger: true,
              pageSizeOptions: PAGE_SIZE_OPTIONS,
              showTotal: (total, range) => `${range[0]}–${range[1]} of ${total}`,
            }}
            locale={{
              emptyText: isLoading ? (
                ' '
              ) : (
                <EmptyState
                  title={emptyTitle}
                  description={emptyDescription}
                  action={emptyAction}
                />
              ),
            }}
          />
        </div>
      )}
      {error && result ? (
        <div style={{ marginTop: 8 }}>
          <ErrorState error={error} onRetry={onRetry} variant="inline" />
        </div>
      ) : null}
    </div>
  );
}
