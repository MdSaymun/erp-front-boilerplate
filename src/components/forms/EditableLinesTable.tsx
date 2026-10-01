import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Button, Space, Table, type TableColumnType, Typography } from 'antd';
import type { ReactNode } from 'react';
import {
  type ArrayPath,
  type Control,
  type FieldArray,
  type FieldArrayPath,
  type FieldErrors,
  type FieldValues,
  useFieldArray,
} from 'react-hook-form';

import { useUiStore } from '@/stores/uiStore';

export interface EditableLineColumn<TFieldValues extends FieldValues> {
  key: string;
  title: string;
  width?: number | string;
  align?: 'left' | 'right' | 'center';
  /** Render the cell for line `index`; use ControlledFormItem with `compact`. */
  render: (index: number, control: Control<TFieldValues>) => ReactNode;
}

interface EditableLinesTableProps<
  TFieldValues extends FieldValues,
  TName extends FieldArrayPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  columns: EditableLineColumn<TFieldValues>[];
  /** Factory for a new empty line. */
  createLine: () => FieldArray<TFieldValues, TName>;
  errors?: FieldErrors<TFieldValues>;
  addLabel?: string;
  disabled?: boolean;
  minLines?: number;
  /** Optional footer (totals). */
  footer?: ReactNode;
}

/**
 * Editable line-item grid for documents (orders, invoices, transfers).
 * React Hook Form owns the rows (`useFieldArray`); antd Table renders them.
 * Reordering is keyboard-accessible via Move up/down; drag-and-drop can be
 * layered on the same `move` later.
 */
export function EditableLinesTable<
  TFieldValues extends FieldValues,
  TName extends FieldArrayPath<TFieldValues>,
>({
  control,
  name,
  columns,
  createLine,
  errors,
  addLabel = 'Add line',
  disabled,
  minLines = 0,
  footer,
}: EditableLinesTableProps<TFieldValues, TName>) {
  const { fields, append, remove, move } = useFieldArray({ control, name });
  const density = useUiStore((state) => state.tableDensity);

  const arrayError = errors?.[name as ArrayPath<TFieldValues>] as
    { root?: { message?: string }; message?: string } | undefined;
  const rootMessage = arrayError?.root?.message ?? arrayError?.message;

  const tableColumns: TableColumnType<{ id: string }>[] = [
    {
      key: '__index',
      title: '#',
      width: 48,
      render: (_, __, index) => <Typography.Text type="secondary">{index + 1}</Typography.Text>,
    },
    ...columns.map<TableColumnType<{ id: string }>>((column) => ({
      key: column.key,
      title: column.title,
      width: column.width,
      align: column.align,
      render: (_, __, index) => column.render(index, control),
    })),
    {
      key: '__actions',
      title: <span className="sr-only">Actions</span>,
      width: 120,
      align: 'right',
      render: (_, __, index) => (
        <Space size={0}>
          <Button
            type="text"
            size="small"
            icon={<ArrowUpOutlined />}
            aria-label={`Move line ${index + 1} up`}
            disabled={disabled || index === 0}
            onClick={() => move(index, index - 1)}
          />
          <Button
            type="text"
            size="small"
            icon={<ArrowDownOutlined />}
            aria-label={`Move line ${index + 1} down`}
            disabled={disabled || index === fields.length - 1}
            onClick={() => move(index, index + 1)}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            aria-label={`Remove line ${index + 1}`}
            disabled={disabled || fields.length <= minLines}
            onClick={() => remove(index)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="erp-table-wrapper">
        <Table<{ id: string }>
          rowKey="id"
          size={density === 'compact' ? 'small' : 'middle'}
          columns={tableColumns}
          dataSource={fields as Array<{ id: string }>}
          pagination={false}
          scroll={{ x: 'max-content' }}
          locale={{ emptyText: 'No lines yet' }}
          footer={footer ? () => footer : undefined}
        />
      </div>
      {rootMessage ? (
        <Typography.Text type="danger" role="alert" style={{ display: 'block', marginTop: 4 }}>
          {rootMessage}
        </Typography.Text>
      ) : null}
      <Button
        type="dashed"
        icon={<PlusOutlined />}
        disabled={disabled}
        onClick={() => append(createLine())}
        style={{ marginTop: 8 }}
      >
        {addLabel}
      </Button>
    </div>
  );
}
