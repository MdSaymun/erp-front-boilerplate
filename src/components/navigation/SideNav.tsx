import { Menu, type MenuProps } from 'antd';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { getVisibleNavigation, type NavItem, resolveActiveNavigation } from '@/config/navigation';
import { usePermission } from '@/hooks/usePermission';

type MenuItem = NonNullable<MenuProps['items']>[number];

interface SideNavProps {
  collapsed?: boolean;
  /** Called after navigation (used to close the mobile drawer). */
  onNavigate?: () => void;
}

function toMenuItems(items: NavItem[]): MenuItem[] {
  return items.map((item) => ({
    key: item.key,
    icon: item.icon,
    label: item.label,
    children: item.children ? toMenuItems(item.children) : undefined,
  }));
}

function findPath(items: NavItem[], key: string): string | undefined {
  for (const item of items) {
    if (item.key === key && item.path) return item.path;
    const child = item.children ? findPath(item.children, key) : undefined;
    if (child) return child;
  }
  return undefined;
}

/** Sidebar menu rendered from the central navigation configuration. */
export function SideNav({ collapsed = false, onNavigate }: SideNavProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { hasPermission } = usePermission();

  const navigation = useMemo(() => getVisibleNavigation(undefined, hasPermission), [hasPermission]);
  const menuItems = useMemo(() => toMenuItems(navigation), [navigation]);
  const active = useMemo(
    () => resolveActiveNavigation(pathname, navigation),
    [pathname, navigation],
  );

  const [openKeys, setOpenKeys] = useState<string[]>(active.openKeys);
  const [lastActiveOpenKeys, setLastActiveOpenKeys] = useState(active.openKeys);

  // When the route changes, expand the active section (state adjusted during render,
  // per React guidance, instead of in an effect).
  if (lastActiveOpenKeys !== active.openKeys) {
    setLastActiveOpenKeys(active.openKeys);
    const missing = active.openKeys.filter((key) => !openKeys.includes(key));
    if (missing.length > 0) {
      setOpenKeys([...openKeys, ...missing]);
    }
  }

  const handleClick: MenuProps['onClick'] = ({ key }) => {
    const path = findPath(navigation, key);
    if (path) {
      navigate(path);
      onNavigate?.();
    }
  };

  return (
    <nav aria-label="Main navigation">
      <Menu
        mode="inline"
        items={menuItems}
        selectedKeys={active.selectedKeys}
        openKeys={collapsed ? undefined : openKeys}
        onOpenChange={setOpenKeys}
        onClick={handleClick}
        inlineCollapsed={collapsed}
        style={{ borderInlineEnd: 0 }}
      />
    </nav>
  );
}
