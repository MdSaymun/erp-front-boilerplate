import { List, Typography } from 'antd';
import { Link } from 'react-router';

import { DocumentStatusTag } from '@/components/documents/DocumentStatusTag';
import { EmptyState } from '@/components/feedback/EmptyState';
import type { DocumentStatus } from '@/types/erp';

export interface RelatedRecordItem {
  id: string;
  label: string;
  path: string;
  description?: string;
  status?: DocumentStatus;
}

export interface RelatedRecordGroup {
  key: string;
  title: string;
  items: RelatedRecordItem[];
}

interface RelatedRecordsTabProps {
  groups: RelatedRecordGroup[];
}

/** Linked documents (e.g. deliveries and invoices of a sales order). Data is the module's concern. */
export function RelatedRecordsTab({ groups }: RelatedRecordsTabProps) {
  if (groups.every((g) => g.items.length === 0)) {
    return <EmptyState title="No related records" />;
  }
  return (
    <>
      {groups.map((group) => (
        <List
          key={group.key}
          size="small"
          header={<Typography.Text strong>{group.title}</Typography.Text>}
          dataSource={group.items}
          style={{ marginBottom: 16 }}
          renderItem={(item) => (
            <List.Item extra={item.status ? <DocumentStatusTag status={item.status} /> : null}>
              <List.Item.Meta
                title={<Link to={item.path}>{item.label}</Link>}
                description={item.description}
              />
            </List.Item>
          )}
        />
      ))}
    </>
  );
}
