import { Table, type TableProps } from 'antd';

import { useUiStore } from '@/stores/uiStore';

interface LineItemsTableProps<TLine extends { id: string }> extends Omit<
  TableProps<TLine>,
  'rowKey'
> {
  lines: TLine[];
}

/**
 * Table wrapper for document lines. Handles horizontal overflow, row keys and the
 * user's density preference so every module's line table behaves the same.
 */
export function LineItemsTable<TLine extends { id: string }>({
  lines,
  columns,
  ...rest
}: LineItemsTableProps<TLine>) {
  const density = useUiStore((state) => state.tableDensity);

  return (
    <div className="erp-table-wrapper">
      <Table<TLine>
        rowKey="id"
        dataSource={lines}
        columns={columns}
        size={density === 'compact' ? 'small' : 'middle'}
        pagination={false}
        scroll={{ x: 'max-content' }}
        {...rest}
      />
    </div>
  );
}
