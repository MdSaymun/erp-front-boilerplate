import { Alert, Card, Col, Row, Tag } from 'antd';
import { Link } from 'react-router';

import { PageContainer } from '@/components/common/PageContainer';
import { ROUTES } from '@/constants/routes';

const PATTERNS = [
  {
    path: 'list',
    title: 'List page',
    description:
      'Server-side table, URL-synced query, filters, selection, bulk actions, export, saved views.',
  },
  {
    path: 'records/new',
    title: 'Form page',
    description:
      'Create/edit with Zod validation, line-item grid, lookups, money/date inputs, unsaved-changes guard, 409 handling.',
  },
  {
    path: 'list?sort=code:asc',
    title: 'Record page',
    description: 'Open any row: header, stage bar, workflow actions, tabs, chatter, audit, print.',
  },
  {
    path: 'inputs',
    title: 'Form inputs',
    description: 'Money, quantity + UOM, percent, date, date range, address, lookup.',
  },
  {
    path: 'import',
    title: 'Import wizard',
    description: 'CSV upload → column mapping → preview → result.',
  },
  {
    path: 'widgets',
    title: 'Dashboard widgets',
    description: 'Widget registry and responsive grid.',
  },
  {
    path: 'report',
    title: 'Report viewer',
    description: 'Parameter form and PDF preview placeholder.',
  },
];

/** Developer-only showcase of the shared ERP UI patterns. Not shipped to production. */
export default function PatternsIndexPage() {
  return (
    <PageContainer
      title="UI patterns"
      subtitle="Reference implementations every module builds on."
      status={<Tag color="magenta">DEV</Tag>}
    >
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Developer showcase"
        description="Backed by Mock Service Worker. The sample record is a neutral fixture, not business data."
      />
      <Row gutter={[16, 16]}>
        {PATTERNS.map((pattern) => (
          <Col key={pattern.path} xs={24} md={12} xl={8}>
            <Link to={`${ROUTES.devPatterns}/${pattern.path}`}>
              <Card hoverable title={pattern.title} size="small" style={{ height: '100%' }}>
                {pattern.description}
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </PageContainer>
  );
}
