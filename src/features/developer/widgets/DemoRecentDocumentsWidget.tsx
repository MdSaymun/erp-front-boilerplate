import { Table, type TableProps } from 'antd';

import { DocumentStatusTag } from '@/components/documents/DocumentStatusTag';
import type { DocumentStatus } from '@/types/erp';

interface DemoDocument {
  id: string;
  number: string;
  type: string;
  partner: string;
  status: DocumentStatus;
}

const DEMO_DOCUMENTS: DemoDocument[] = [
  {
    id: '1',
    number: 'PO/2026/000118',
    type: 'Purchase Order',
    partner: 'Northwind Supplies',
    status: 'confirmed',
  },
  {
    id: '2',
    number: 'SO/2026/000452',
    type: 'Sales Order',
    partner: 'Contoso Retail',
    status: 'in_progress',
  },
  {
    id: '3',
    number: 'TR/2026/000031',
    type: 'Stock Transfer',
    partner: 'Main → Outlet 2',
    status: 'draft',
  },
  {
    id: '4',
    number: 'ADJ/2026/000009',
    type: 'Inventory Adjustment',
    partner: 'Main Warehouse',
    status: 'done',
  },
];

const columns: TableProps<DemoDocument>['columns'] = [
  { title: 'Number', dataIndex: 'number', key: 'number' },
  { title: 'Type', dataIndex: 'type', key: 'type' },
  { title: 'Partner / Location', dataIndex: 'partner', key: 'partner' },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: DocumentStatus) => <DocumentStatusTag status={status} />,
  },
];

export default function DemoRecentDocumentsWidget() {
  return (
    <div className="erp-table-wrapper">
      <Table<DemoDocument>
        rowKey="id"
        size="small"
        columns={columns}
        dataSource={DEMO_DOCUMENTS}
        pagination={false}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
}
