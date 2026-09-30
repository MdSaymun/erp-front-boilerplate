import { Card, Flex, Layout, Typography } from 'antd';
import { Suspense } from 'react';
import { Outlet } from 'react-router';

import { PageLoading } from '@/components/feedback/PageLoading';
import { env } from '@/config/env';

/** Centered layout for sign-in, password reset and similar public pages. */
export function AuthLayout() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Content>
        <Flex vertical align="center" justify="center" style={{ minHeight: '100vh', padding: 16 }}>
          <Typography.Title level={2} style={{ marginBottom: 24 }}>
            {env.appName}
          </Typography.Title>
          <Card style={{ width: '100%', maxWidth: 420 }}>
            <div id="main-content">
              <Suspense fallback={<PageLoading label="Loading" minHeight={160} />}>
                <Outlet />
              </Suspense>
            </div>
          </Card>
        </Flex>
      </Layout.Content>
    </Layout>
  );
}
