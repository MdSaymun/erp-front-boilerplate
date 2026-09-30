import { Flex, Layout } from 'antd';
import { Suspense } from 'react';
import { Outlet } from 'react-router';

import { PageLoading } from '@/components/feedback/PageLoading';

/** Minimal layout for full-page error states outside the application shell. */
export function ErrorLayout() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Content>
        <Flex align="center" justify="center" style={{ minHeight: '100vh', padding: 16 }}>
          <div id="main-content">
            <Suspense fallback={<PageLoading label="Loading" />}>
              <Outlet />
            </Suspense>
          </div>
        </Flex>
      </Layout.Content>
    </Layout>
  );
}
