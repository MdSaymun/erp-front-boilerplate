import { DeleteOutlined, SaveOutlined, StarOutlined } from '@ant-design/icons';
import { App, Button, Dropdown, type MenuProps, Space } from 'antd';

import type { SavedView } from '@/types/views';

interface SavedViewsMenuProps {
  views: SavedView[];
  onApply: (view: SavedView) => void;
  onSave: (name: string) => void;
  onDelete: (viewId: string) => void;
}

/** Personal saved views (filters + sort + columns) for a list. */
export function SavedViewsMenu({ views, onApply, onSave, onDelete }: SavedViewsMenuProps) {
  const { modal } = App.useApp();

  const promptSave = () => {
    let name = '';
    modal.confirm({
      title: 'Save current view',
      content: (
        <input
          aria-label="View name"
          className="ant-input"
          style={{ width: '100%', padding: '4px 8px' }}
          onChange={(event) => {
            name = event.target.value;
          }}
          placeholder="e.g. Open orders this month"
        />
      ),
      okText: 'Save',
      onOk: () => {
        if (name.trim()) onSave(name.trim());
      },
    });
  };

  const items: MenuProps['items'] = [
    { key: 'save', icon: <SaveOutlined />, label: 'Save current view…', onClick: promptSave },
    ...(views.length ? [{ type: 'divider' as const }] : []),
    ...views.map((view) => ({
      key: view.id,
      icon: <StarOutlined />,
      label: (
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <span onClick={() => onApply(view)}>{view.name}</span>
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            aria-label={`Delete view ${view.name}`}
            onClick={(event) => {
              event.stopPropagation();
              onDelete(view.id);
            }}
          />
        </Space>
      ),
      onClick: () => onApply(view),
    })),
  ];

  return (
    <Dropdown menu={{ items }} trigger={['click']}>
      <Button icon={<StarOutlined />} aria-label="Saved views">
        Views
      </Button>
    </Dropdown>
  );
}
