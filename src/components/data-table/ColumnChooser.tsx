import { SettingOutlined } from '@ant-design/icons';
import { Button, Checkbox, Popover, Space, Typography } from 'antd';

interface ColumnChooserProps {
  columns: Array<{ key: string; title: string; alwaysVisible?: boolean }>;
  hiddenColumns: string[];
  onChange: (hidden: string[]) => void;
}

/** Lets the user show/hide columns; preference is persisted per table. */
export function ColumnChooser({ columns, hiddenColumns, onChange }: ColumnChooserProps) {
  const content = (
    <Space direction="vertical" size={4} role="group" aria-label="Visible columns">
      {columns.map((column) => (
        <Checkbox
          key={column.key}
          disabled={column.alwaysVisible}
          checked={!hiddenColumns.includes(column.key)}
          onChange={(event) =>
            onChange(
              event.target.checked
                ? hiddenColumns.filter((key) => key !== column.key)
                : [...hiddenColumns, column.key],
            )
          }
        >
          {column.title}
        </Checkbox>
      ))}
      <Typography.Link onClick={() => onChange([])} style={{ fontSize: 12 }}>
        Show all
      </Typography.Link>
    </Space>
  );

  return (
    <Popover content={content} trigger="click" placement="bottomRight" title="Columns">
      <Button icon={<SettingOutlined />} aria-label="Choose columns" />
    </Popover>
  );
}
