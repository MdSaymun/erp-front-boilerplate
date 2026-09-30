import { Drawer, Layout, theme, Typography } from 'antd';
import { Suspense } from 'react';
import { Outlet } from 'react-router';

import { PageLoading } from '@/components/feedback/PageLoading';
import { HeaderBar } from '@/components/navigation/HeaderBar';
import { SideNav } from '@/components/navigation/SideNav';
import { env } from '@/config/env';
import { APP_SHELL } from '@/constants/app';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useUiStore } from '@/stores/uiStore';

const { Header, Sider, Content } = Layout;

/**
 * Application shell: header, collapsible sidebar (drawer on mobile), content.
 * Navigation content comes from config/navigation.tsx, never from here.
 */
export function DashboardLayout() {
  const { token } = theme.useToken();
  const isMobile = useIsMobile();
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const mobileNavOpen = useUiStore((state) => state.mobileNavOpen);
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);

  const handleToggleNav = () => {
    if (isMobile) {
      setMobileNavOpen(!mobileNavOpen);
    } else {
      toggleSidebar();
    }
  };

  const brand = (
    <div
      style={{
        height: APP_SHELL.headerHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: collapsed ? 0 : '0 16px',
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <Typography.Text strong style={{ fontSize: collapsed ? 18 : 15, whiteSpace: 'nowrap' }}>
        {collapsed ? env.appName.charAt(0) : env.appName}
      </Typography.Text>
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh' }} data-testid="app-shell">
      {isMobile ? null : (
        <Sider
          data-testid="app-sider"
          width={APP_SHELL.siderWidth}
          collapsedWidth={APP_SHELL.siderCollapsedWidth}
          collapsed={collapsed}
          collapsible
          trigger={null}
          theme="light"
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflow: 'auto',
            borderInlineEnd: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          {brand}
          <SideNav collapsed={collapsed} />
        </Sider>
      )}

      <Layout style={{ minWidth: 0 }}>
        <Header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            lineHeight: 'normal',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <HeaderBar isMobile={isMobile} collapsed={collapsed} onToggleNav={handleToggleNav} />
        </Header>

        <Content style={{ padding: isMobile ? 16 : 24, minWidth: 0 }}>
          <div id="main-content" style={{ minWidth: 0 }}>
            <Suspense fallback={<PageLoading label="Loading page" />}>
              <Outlet />
            </Suspense>
          </div>
        </Content>
      </Layout>

      {isMobile ? (
        <Drawer
          title={env.appName}
          placement="left"
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          width={280}
          styles={{ body: { padding: 0 } }}
        >
          <SideNav onNavigate={() => setMobileNavOpen(false)} />
        </Drawer>
      ) : null}
    </Layout>
  );
}
