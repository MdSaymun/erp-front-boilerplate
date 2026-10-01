import { SearchOutlined } from '@ant-design/icons';
import { Empty, Input, List, Modal, Typography } from 'antd';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router';

import { flattenNavigation, getVisibleNavigation } from '@/config/navigation';
import { isModuleEnabled } from '@/config/modules';
import { usePermission } from '@/hooks/usePermission';
import { useShortcut } from '@/hooks/useShortcut';
import {
  type Command,
  getCommands,
  registerCommands,
  searchCommands,
  subscribeCommands,
} from '@/services/commands/commandRegistry';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Ctrl/Cmd+K palette. Navigation commands are seeded from the navigation
 * config; modules register record actions and quick-create commands. Record
 * search (customers, products, documents) plugs in once a search endpoint exists.
 */
export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { hasPermission } = usePermission();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const registered = useSyncExternalStore(subscribeCommands, getCommands, getCommands);

  // Seed navigation commands once (external registry, so an effect is the right place).
  useEffect(() => {
    const navCommands: Command[] = flattenNavigation(getVisibleNavigation())
      .filter((item) => item.path)
      .map((item) => ({
        id: `nav:${item.key}`,
        title: item.label,
        group: 'Navigation',
        keywords: [item.path ?? '', item.module],
        module: item.module,
        permission: item.permission,
        run: () => navigate(item.path as string),
      }));
    return registerCommands(navCommands);
  }, [navigate]);

  const results = useMemo(() => {
    const visible = registered.filter(
      (c) =>
        (!c.module || isModuleEnabled(c.module)) && (!c.permission || hasPermission(c.permission)),
    );
    return searchCommands(visible, query).slice(0, 12);
  }, [registered, query, hasPermission]);

  const run = (command: Command | undefined) => {
    if (!command) return;
    onClose();
    setQuery('');
    command.run();
  };

  useShortcut({
    id: 'palette-close',
    keys: 'escape',
    scope: 'global',
    description: 'Close',
    enabled: open,
    allowInInput: true,
    handler: onClose,
  });

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      width={560}
      destroyOnHidden
      styles={{ body: { padding: 0 } }}
    >
      <Input
        autoFocus
        size="large"
        prefix={<SearchOutlined aria-hidden />}
        placeholder="Type a command or page name…"
        aria-label="Command palette"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(0);
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, results.length - 1));
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
          } else if (event.key === 'Enter') {
            run(results[activeIndex]);
          }
        }}
        variant="borderless"
        style={{ borderBottom: '1px solid var(--ant-color-border-secondary)', borderRadius: 0 }}
      />
      <List
        size="small"
        dataSource={results}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No matching commands. Record search arrives with the search backend."
            />
          ),
        }}
        style={{ maxHeight: 360, overflow: 'auto' }}
        renderItem={(command, index) => (
          <List.Item
            role="option"
            aria-selected={index === activeIndex}
            onMouseEnter={() => setActiveIndex(index)}
            onClick={() => run(command)}
            style={{
              cursor: 'pointer',
              background: index === activeIndex ? 'var(--ant-control-item-bg-hover)' : undefined,
              paddingInline: 16,
            }}
          >
            <List.Item.Meta
              avatar={command.icon}
              title={command.title}
              description={
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {command.group}
                </Typography.Text>
              }
            />
          </List.Item>
        )}
      />
    </Modal>
  );
}
