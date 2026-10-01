import {
  InfoCircleOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Dropdown, type MenuProps, Space } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { AboutModal } from '@/components/about/AboutModal';
import { PreferencesDrawer } from '@/components/preferences/PreferencesDrawer';
import { ShortcutsHelpModal } from '@/components/shortcuts/ShortcutsHelpModal';
import { ROUTES } from '@/constants/routes';
import { useCurrentContext } from '@/hooks/useCurrentContext';
import { useShortcut } from '@/hooks/useShortcut';
import { authApi } from '@/services/api/endpoints/auth';
import { useAuthStore } from '@/stores/authStore';
import { useCompanyStore } from '@/stores/companyStore';
import { useTenantStore } from '@/stores/tenantStore';

/** Header user menu: preferences, help, about, sign out. */
export function UserMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, authStatus } = useCurrentContext();
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  useShortcut({
    id: 'help',
    keys: 'shift+?',
    scope: 'global',
    description: t('shortcuts.help'),
    handler: () => setHelpOpen(true),
  });

  const signOut = async () => {
    try {
      await authApi.logout();
    } finally {
      useAuthStore.getState().clearSession();
      useCompanyStore.getState().clear();
      useTenantStore.getState().clear();
      navigate(ROUTES.login);
    }
  };

  const items: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: t('nav.profile'), disabled: true },
    {
      key: 'preferences',
      icon: <SettingOutlined />,
      label: t('nav.preferences'),
      onClick: () => setPreferencesOpen(true),
    },
    {
      key: 'help',
      icon: <QuestionCircleOutlined />,
      label: t('nav.help'),
      onClick: () => setHelpOpen(true),
    },
    {
      key: 'about',
      icon: <InfoCircleOutlined />,
      label: t('nav.about'),
      onClick: () => setAboutOpen(true),
    },
    { type: 'divider' },
    {
      key: 'sign-out',
      icon: <LogoutOutlined />,
      label: t('actions.signOut'),
      disabled: authStatus !== 'authenticated',
      onClick: () => void signOut(),
    },
  ];

  const name = user?.displayName ?? t('nav.guest');

  return (
    <>
      <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
        <Button type="text" aria-label={t('nav.userMenu', { name })} aria-haspopup="menu">
          <Space size="small">
            <Avatar size="small" src={user?.avatarUrl} icon={<UserOutlined />} />
            <span>{name}</span>
          </Space>
        </Button>
      </Dropdown>
      <PreferencesDrawer open={preferencesOpen} onClose={() => setPreferencesOpen(false)} />
      <ShortcutsHelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </>
  );
}
