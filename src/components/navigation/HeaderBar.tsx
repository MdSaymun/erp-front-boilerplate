import {
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
  SearchOutlined,
  SunOutlined,
} from '@ant-design/icons';
import { Badge, Button, Flex, Input, Space, Typography } from 'antd';

import { env } from '@/config/env';
import { useUiStore } from '@/stores/uiStore';
import { useResolvedThemeMode } from '@/theme/useResolvedThemeMode';

import { ContextSwitcher } from './ContextSwitcher';
import { UserMenu } from './UserMenu';

interface HeaderBarProps {
  isMobile: boolean;
  collapsed: boolean;
  onToggleNav: () => void;
}

/** Application header: nav toggle, brand, global search, context, alerts, user. */
export function HeaderBar({ isMobile, collapsed, onToggleNav }: HeaderBarProps) {
  const resolvedMode = useResolvedThemeMode();
  const setThemeMode = useUiStore((state) => state.setThemeMode);

  const toggleTheme = () => setThemeMode(resolvedMode === 'dark' ? 'light' : 'dark');

  return (
    <Flex align="center" justify="space-between" gap={12} style={{ height: '100%' }}>
      <Space size="small" align="center">
        <Button
          type="text"
          aria-label={collapsed || isMobile ? 'Open navigation' : 'Collapse navigation'}
          aria-expanded={!collapsed}
          icon={collapsed || isMobile ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggleNav}
        />
        <Typography.Text strong style={{ fontSize: 16, whiteSpace: 'nowrap' }}>
          {env.appName}
        </Typography.Text>
      </Space>

      {isMobile ? null : (
        <Input
          allowClear
          prefix={<SearchOutlined aria-hidden />}
          placeholder="Search records (coming soon)"
          aria-label="Global search"
          style={{ maxWidth: 360 }}
        />
      )}

      <Space size="small" align="center">
        {isMobile ? null : <ContextSwitcher />}
        <Button
          type="text"
          aria-label={resolvedMode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          icon={resolvedMode === 'dark' ? <SunOutlined /> : <MoonOutlined />}
          onClick={toggleTheme}
        />
        <Badge count={0} showZero={false}>
          <Button type="text" aria-label="Notifications" icon={<BellOutlined />} />
        </Badge>
        <UserMenu />
      </Space>
    </Flex>
  );
}
