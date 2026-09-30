import {
  AlertOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  TruckOutlined,
} from '@ant-design/icons';
import { Alert, Card, Col, Row, Statistic, Table, type TableProps, Tag } from 'antd';

import { PageContainer } from '@/components/common/PageContainer';
import { DocumentStatusTag } from '@/components/documents/DocumentStatusTag';
import type { DocumentStatus } from '@/types/erp';

/** Static demo data. Nothing here is fetched; the dashboard is a layout shell. */
const DEMO_KPIS = [
  { key: 'products', title: 'Total Products', value: 1284, icon: <InboxOutlined /> },
  { key: 'low-stock', title: 'Low Stock', value: 37, icon: <AlertOutlined /> },
  { key: 'purchases', title: 'Pending Purchases', value: 12, icon: <ShoppingCartOutlined /> },
  { key: 'deliveries', title: 'Pending Deliveries', value: 8, icon: <TruckOutlined /> },
] as const;

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

export default function DashboardPage() {
  return (
    <PageContainer
      title="Dashboard"
      subtitle="Overview of your operations across modules."
      status={<Tag color="gold">Demo data</Tag>}
      hideBreadcrumb
    >
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Placeholder dashboard"
        description="All figures below are static demo values. Live KPIs are connected when the Inventory module is implemented."
      />

      <Row gutter={[16, 16]}>
        {DEMO_KPIS.map((kpi) => (
          <Col key={kpi.key} xs={24} sm={12} xl={6}>
            <Card>
              <Statistic title={kpi.title} value={kpi.value} prefix={kpi.icon} />
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        title="Recent documents"
        extra={<Tag color="gold">Demo data</Tag>}
        style={{ marginTop: 16 }}
      >
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
      </Card>
    </PageContainer>
  );
}
