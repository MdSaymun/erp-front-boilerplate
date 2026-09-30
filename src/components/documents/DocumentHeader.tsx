import { Descriptions, type DescriptionsProps, Flex, Space, Typography } from 'antd';
import type { ReactNode } from 'react';

import type { DocumentStatus } from '@/types/erp';

import { DocumentStatusTag } from './DocumentStatusTag';

interface DocumentHeaderProps {
  /** Business number, e.g. "SO/2026/000123". */
  number: string;
  title?: string;
  status: DocumentStatus;
  /** Key facts: partner, dates, currency, reference. */
  summary?: DescriptionsProps['items'];
  actions?: ReactNode;
}

/** Header block shared by every business document (order, invoice, transfer, ...). */
export function DocumentHeader({ number, title, status, summary, actions }: DocumentHeaderProps) {
  return (
    <Flex vertical gap={12}>
      <Flex justify="space-between" align="flex-start" wrap gap={12}>
        <Space align="center">
          <Typography.Title level={3} style={{ margin: 0 }}>
            {number}
          </Typography.Title>
          <DocumentStatusTag status={status} />
        </Space>
        {actions}
      </Flex>
      {title ? <Typography.Text type="secondary">{title}</Typography.Text> : null}
      {summary && summary.length > 0 ? (
        <Descriptions size="small" column={{ xs: 1, sm: 2, lg: 4 }} items={summary} />
      ) : null}
    </Flex>
  );
}
