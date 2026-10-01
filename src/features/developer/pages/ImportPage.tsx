import { Card, Tag } from 'antd';
import { useNavigate } from 'react-router';

import { PageContainer } from '@/components/common/PageContainer';
import { ImportWizard } from '@/components/import-export/ImportWizard';
import { ROUTES } from '@/constants/routes';
import type { ImportTarget } from '@/types/importExport';

import { sampleRecordsApi } from './sampleRecords';

const TARGET: ImportTarget = {
  key: 'sample-records',
  title: 'Sample records',
  fields: [
    { key: 'code', label: 'Code', required: true, example: 'SMP/2026/000001' },
    { key: 'name', label: 'Name', required: true },
    { key: 'category', label: 'Category', example: 'alpha' },
    { key: 'date', label: 'Date', example: '2026-10-01' },
  ],
};

export default function ImportPage() {
  const navigate = useNavigate();
  return (
    <PageContainer
      title="Import sample records"
      subtitle="Import wizard pattern"
      status={<Tag color="magenta">DEV</Tag>}
    >
      <Card size="small">
        <ImportWizard
          target={TARGET}
          onImport={(file, mapping) => sampleRecordsApi.import(file, mapping)}
          onDone={() => navigate(`${ROUTES.devPatterns}/list`)}
        />
      </Card>
    </PageContainer>
  );
}
