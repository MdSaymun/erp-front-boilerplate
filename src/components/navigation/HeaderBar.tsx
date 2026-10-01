import {
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
  SearchOutlined,
  SunOutlined,
} from '@ant-design/icons';
import { Badge, Button, Flex, Input, Space, Typography } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CommandPalette } from '@/components/command-palette/CommandPalette';
import { NotificationsDrawer } from '@/components/notifications/NotificationsDrawer';
import { env } from '@/config/env';
import { useNotifications } from '@/hooks/useNotifications';
import { useShortcut } from '@/hooks/useShortcut';
import { useUiStore } from '@/stores/uiStore';
import { useResolvedThemeMode } from '@/theme/useResolvedThemeMode';

import { ContextSwitcher } from './ContextSwitcher';
import { UserMenu } from './UserMenu';

interface HeaderBarProps {
  isMobile: boolean;
  collapsed: boolean;
  onToggleNav: () => void;
}

/** Application header: nav toggle, brand, command palette, context, alerts, user. */
export function HeaderBar({ isMobile, collapsed, onToggleNav }: HeaderBarProps) {
  const { t } = useTranslation();
  const resolvedMode = useResolvedThemeMode();
  const setThemeMode = useUiStore((state) => state.setThemeMode);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifications = useNotifications();

  useShortcut({
    id: 'command-palette',
    keys: 'mod+k',
    scope: 'global',
    description: t('shortcuts.commandPalette'),
    allowInInput: true,
    handler: () => setPaletteOpen(true),
  });

  const toggleTheme = () => setThemeMode(resolvedMode === 'dark' ? 'light' : 'dark');

  return (
    <Flex align="center" justify="space-between" gap={12} style={{ height: '100%' }}>
      <Space size="small" align="center">
        <Button
          type="text"
          aria-label={collapsed || isMobile ? t('nav.openNavigation') : t('nav.collapseNavigation')}
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
          readOnly
          prefix={<SearchOutlined aria-hidden />}
          placeholder={t('nav.globalSearch')}
          aria-label="Global search"
          onClick={() => setPaletteOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') setPaletteOpen(true);
          }}
          style={{ maxWidth: 360, cursor: 'pointer' }}
        />
      )}

      <Space size="small" align="center">
        {isMobile ? null : <ContextSwitcher />}
        <Button
          type="text"
          aria-label={resolvedMode === 'dark' ? t('nav.switchToLight') : t('nav.switchToDark')}
          icon={resolvedMode === 'dark' ? <SunOutlined /> : <MoonOutlined />}
          onClick={toggleTheme}
        />
        <Badge count={notifications.unreadCount} size="small" overflowCount={99}>
          <Button
            type="text"
            aria-label={t('nav.notifications')}
            icon={<BellOutlined />}
            onClick={() => setNotificationsOpen(true)}
          />
        </Badge>
        <UserMenu />
      </Space>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <NotificationsDrawer open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </Flex>
  );
}
