import { LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Dropdown, type MenuProps, Space } from 'antd';

import { useCurrentContext } from '@/hooks/useCurrentContext';

/** Header user menu placeholder. Actions are wired once authentication exists. */
export function UserMenu() {
  const { user } = useCurrentContext();

  const items: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: 'Profile', disabled: true },
    { key: 'preferences', icon: <SettingOutlined />, label: 'Preferences', disabled: true },
    { type: 'divider' },
    { key: 'sign-out', icon: <LogoutOutlined />, label: 'Sign out', disabled: true },
  ];

  const name = user?.displayName ?? 'Guest';

  return (
    <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
      <Button type="text" aria-label={`User menu for ${name}`} aria-haspopup="menu">
        <Space size="small">
          <Avatar size="small" src={user?.avatarUrl} icon={<UserOutlined />} />
          <span>{name}</span>
        </Space>
      </Button>
    </Dropdown>
  );
}
