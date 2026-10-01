import {
  AlertOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  TruckOutlined,
} from '@ant-design/icons';
import { Col, Row, Statistic, Tag } from 'antd';

const DEMO_KPIS = [
  { key: 'products', title: 'Total Products', value: 1284, icon: <InboxOutlined /> },
  { key: 'low-stock', title: 'Low Stock', value: 37, icon: <AlertOutlined /> },
  { key: 'purchases', title: 'Pending Purchases', value: 12, icon: <ShoppingCartOutlined /> },
  { key: 'deliveries', title: 'Pending Deliveries', value: 8, icon: <TruckOutlined /> },
] as const;

export default function DemoKpiWidget() {
  return (
    <>
      <Tag color="gold" style={{ marginBottom: 12 }}>
        Demo data
      </Tag>
      <Row gutter={[16, 16]}>
        {DEMO_KPIS.map((kpi) => (
          <Col key={kpi.key} xs={24} sm={12} xl={6}>
            <Statistic title={kpi.title} value={kpi.value} prefix={kpi.icon} />
          </Col>
        ))}
      </Row>
    </>
  );
}
