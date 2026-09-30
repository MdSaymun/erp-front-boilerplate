import { Flex, Space, Typography } from 'antd';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  /** Primary and secondary actions, rendered right-aligned. */
  actions?: ReactNode;
  /** Optional status tag or badge shown next to the title. */
  status?: ReactNode;
}

export function PageHeader({ title, subtitle, actions, status }: PageHeaderProps) {
  return (
    <Flex justify="space-between" align="flex-start" wrap gap={12} component="header">
      <div>
        <Space align="center" size="small">
          <Typography.Title level={3} style={{ margin: 0 }}>
            {title}
          </Typography.Title>
          {status}
        </Space>
        {subtitle ? (
          <Typography.Paragraph type="secondary" style={{ margin: '4px 0 0' }}>
            {subtitle}
          </Typography.Paragraph>
        ) : null}
      </div>
      {actions ? <Space wrap>{actions}</Space> : null}
    </Flex>
  );
}
