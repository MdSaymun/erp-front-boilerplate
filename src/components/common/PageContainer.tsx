import { Flex } from 'antd';
import type { PropsWithChildren, ReactNode } from 'react';

import { AppBreadcrumb } from '@/components/navigation/AppBreadcrumb';

import { PageHeader } from './PageHeader';

interface PageContainerProps extends PropsWithChildren {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  status?: ReactNode;
  /** Hide the automatic breadcrumb (e.g. on the dashboard). */
  hideBreadcrumb?: boolean;
}

/**
 * Standard page frame: Breadcrumb -> Page header -> content.
 * List, detail and form pages all start from this so spacing stays consistent.
 */
export function PageContainer({
  title,
  subtitle,
  actions,
  status,
  hideBreadcrumb,
  children,
}: PageContainerProps) {
  return (
    <Flex vertical gap={16} style={{ minWidth: 0 }}>
      {hideBreadcrumb ? null : <AppBreadcrumb />}
      <PageHeader title={title} subtitle={subtitle} actions={actions} status={status} />
      <div style={{ minWidth: 0 }}>{children}</div>
    </Flex>
  );
}
