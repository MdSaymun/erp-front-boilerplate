import { EditOutlined } from '@ant-design/icons';
import { Card, Space, Tag } from 'antd';
import { useState } from 'react';
import { Link, useParams } from 'react-router';

import { PermissionButton } from '@/components/auth/PermissionButton';
import { Chatter } from '@/components/chatter/Chatter';
import { DocumentActionBar } from '@/components/documents/DocumentActionBar';
import { DocumentHeader } from '@/components/documents/DocumentHeader';
import { DocumentTotals } from '@/components/documents/DocumentTotals';
import { LineItemsTable } from '@/components/documents/LineItemsTable';
import { ErrorState } from '@/components/feedback/ErrorState';
import { PageLoading } from '@/components/feedback/PageLoading';
import { AuditInfo } from '@/components/records/AuditInfo';
import { PrintButton } from '@/components/records/PrintButton';
import { RecordPage } from '@/components/records/RecordPage';
import { RecordStageBar } from '@/components/records/RecordStageBar';
import { RecordTabs } from '@/components/records/RecordTabs';
import { RelatedRecordsTab } from '@/components/records/RelatedRecordsTab';
import { ROUTES } from '@/constants/routes';
import { isEditable, useWorkflowActions } from '@/features/core/workflow';
import { useLocaleSettings } from '@/hooks/useLocaleSettings';
import { useMutationFeedback } from '@/hooks/useMutationFeedback';
import type { DocumentLineBase } from '@/types/erp';
import { formatCurrency } from '@/utils/format/number';
import { formatDate } from '@/utils/format/date';

import {
  SAMPLE_RECORDS_PATH,
  SAMPLE_STAGES,
  SAMPLE_TRANSITIONS,
  sampleRecordHooks,
} from './sampleRecords';

/** Record pattern: header, stage bar, workflow actions, tabs, chatter, audit. */
export default function SampleRecordDetailPage() {
  const { id = '' } = useParams();
  const settings = useLocaleSettings();
  const record = sampleRecordHooks.useDetail(id);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const action = sampleRecordHooks.useAction(
    useMutationFeedback({ success: 'Status updated', errorTitle: 'Action failed' }),
  );

  const actions = useWorkflowActions({
    status: record.data?.status ?? 'draft',
    transitions: SAMPLE_TRANSITIONS,
    busyAction,
    onTransition: async (name) => {
      if (!record.data) return;
      setBusyAction(name);
      try {
        await action.mutateAsync({
          id: record.data.id,
          action: name,
          options: { rowVersion: record.data.rowVersion },
        });
      } finally {
        setBusyAction(null);
      }
    },
  });

  if (record.isPending) return <PageLoading label="Loading record" />;
  if (record.error || !record.data)
    return <ErrorState error={record.error} onRetry={() => void record.refetch()} />;

  const data = record.data;
  const money = (value: number) =>
    formatCurrency(value, { locale: settings.locale, currency: data.amount.currency });
  const editable = isEditable(data.status);

  const lineColumns = [
    { title: '#', dataIndex: 'lineNumber', key: 'lineNumber', width: 56 },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Qty', dataIndex: 'quantity', key: 'quantity', align: 'right' as const, width: 100 },
    {
      title: 'Unit price',
      key: 'unitPrice',
      align: 'right' as const,
      width: 140,
      render: (_: unknown, line: DocumentLineBase) => money(line.unitPrice ?? 0),
    },
    {
      title: 'Total',
      key: 'lineTotal',
      align: 'right' as const,
      width: 140,
      render: (_: unknown, line: DocumentLineBase) => money(line.lineTotal ?? 0),
    },
  ];

  return (
    <RecordPage
      title={data.code}
      status={<Tag color="magenta">DEV</Tag>}
      actions={
        <Space wrap>
          <PrintButton />
          <PermissionButton
            permission="dev.patterns.update"
            icon={<EditOutlined />}
            disabled={!editable}
            mode="disable"
          >
            <Link to={`${ROUTES.devPatterns}/records/${data.id}/edit`}>Edit</Link>
          </PermissionButton>
          <DocumentActionBar actions={actions} />
        </Space>
      }
      header={
        <DocumentHeader
          number={data.code}
          title={data.name}
          status={data.status}
          summary={[
            { key: 'category', label: 'Category', children: data.category },
            {
              key: 'date',
              label: 'Date',
              children: formatDate(data.date, { ...settings, timeZone: 'UTC' }),
            },
            { key: 'currency', label: 'Currency', children: data.amount.currency },
            { key: 'total', label: 'Total', children: money(data.amount.amount) },
          ]}
        />
      }
      stageBar={<RecordStageBar status={data.status} stages={SAMPLE_STAGES} />}
      sidePanel={
        <Chatter
          recordPath={`${SAMPLE_RECORDS_PATH}/${data.id}`}
          disabled={data.status === 'cancelled'}
        />
      }
    >
      <Card size="small">
        <RecordTabs
          items={[
            {
              key: 'lines',
              label: `Lines (${data.lines.length})`,
              children: (
                <>
                  <LineItemsTable lines={data.lines} columns={lineColumns} />
                  <div style={{ marginTop: 16 }}>
                    <DocumentTotals
                      totals={{
                        subtotal: data.amount.amount,
                        discountTotal: 0,
                        taxTotal: 0,
                        grandTotal: data.amount.amount,
                        currency: data.amount.currency,
                      }}
                    />
                  </div>
                </>
              ),
            },
            {
              key: 'related',
              label: 'Related',
              children: (
                <RelatedRecordsTab
                  groups={[
                    {
                      key: 'siblings',
                      title: 'Other sample records',
                      items: [
                        {
                          id: 'rec-1',
                          label: 'SMP/2026/000001',
                          path: `${ROUTES.devPatterns}/records/rec-1`,
                          status: 'pending',
                        },
                      ],
                    },
                  ]}
                />
              ),
            },
            {
              key: 'audit',
              label: 'Audit',
              children: (
                <AuditInfo
                  record={data}
                  resolveUser={(uid) => (uid === 'user-1' ? 'Jane Doe' : uid)}
                />
              ),
            },
          ]}
        />
      </Card>
    </RecordPage>
  );
}
