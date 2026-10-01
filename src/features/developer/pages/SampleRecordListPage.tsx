import { PlusOutlined } from '@ant-design/icons';
import { App, Tag } from 'antd';
import { useMemo } from 'react';
import { useNavigate } from 'react-router';

import { PermissionButton } from '@/components/auth/PermissionButton';
import { PageContainer } from '@/components/common/PageContainer';
import { DataTable } from '@/components/data-table/DataTable';
import type { BulkAction, DataTableColumn } from '@/components/data-table/types';
import { DocumentStatusTag } from '@/components/documents/DocumentStatusTag';
import { ROUTES } from '@/constants/routes';
import { useListQueryState } from '@/hooks/useListQueryState';
import { useLocaleSettings } from '@/hooks/useLocaleSettings';
import { useMutationFeedback } from '@/hooks/useMutationFeedback';
import type { SampleRecord } from '@/features/developer/types/sampleRecord';
import { formatCurrency } from '@/utils/format/number';
import { formatDate } from '@/utils/format/date';

import { SAMPLE_FILTERS, sampleRecordHooks, sampleRecordsApi } from './sampleRecords';

const DEFAULTS = { sort: [{ field: 'code', direction: 'asc' as const }] };

/** List pattern: everything a module list page needs, on the showcase entity. */
export default function SampleRecordListPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const settings = useLocaleSettings();
  const { query, setQuery } = useListQueryState(DEFAULTS);
  const list = sampleRecordHooks.useList(query);
  const remove = sampleRecordHooks.useDelete(useMutationFeedback({ errorTitle: 'Delete failed' }));

  const columns = useMemo<DataTableColumn<SampleRecord>[]>(
    () => [
      {
        key: 'code',
        title: 'Code',
        dataIndex: 'code',
        sortField: 'code',
        alwaysVisible: true,
        width: 160,
      },
      { key: 'name', title: 'Name', dataIndex: 'name', sortField: 'name' },
      {
        key: 'status',
        title: 'Status',
        dataIndex: 'status',
        sortField: 'status',
        width: 150,
        render: (status: SampleRecord['status']) => <DocumentStatusTag status={status} />,
      },
      {
        key: 'category',
        title: 'Category',
        dataIndex: 'category',
        sortField: 'category',
        width: 120,
        defaultHidden: true,
      },
      {
        key: 'date',
        title: 'Date',
        dataIndex: 'date',
        sortField: 'date',
        width: 130,
        render: (date: string) => formatDate(date, { ...settings, timeZone: 'UTC' }),
      },
      {
        key: 'amount',
        title: 'Amount',
        sortField: 'amount.amount',
        align: 'right',
        width: 150,
        render: (_, row) =>
          formatCurrency(row.amount.amount, {
            locale: settings.locale,
            currency: row.amount.currency,
          }),
      },
      { key: 'notes', title: 'Notes', dataIndex: 'notes', defaultHidden: true },
    ],
    [settings],
  );

  const bulkActions: BulkAction<SampleRecord>[] = [
    {
      key: 'delete',
      label: 'Delete',
      danger: true,
      permission: 'dev.patterns.delete',
      onClick: async (rows) => {
        await Promise.all(rows.map((row) => remove.mutateAsync({ id: row.id })));
        message.success(`${rows.length} record(s) deleted`);
      },
    },
  ];

  return (
    <PageContainer
      title="Sample records"
      subtitle="List pattern"
      status={<Tag color="magenta">DEV</Tag>}
    >
      <DataTable<SampleRecord>
        tableId="dev-sample-records"
        columns={columns}
        query={query}
        onQueryChange={setQuery}
        result={list.data}
        isLoading={list.isPending}
        isFetching={list.isFetching}
        error={list.error}
        onRetry={() => void list.refetch()}
        onRowClick={(row) => navigate(`${ROUTES.devPatterns}/records/${row.id}`)}
        filters={SAMPLE_FILTERS}
        bulkActions={bulkActions}
        onExport={(format, q) => sampleRecordsApi.export(q, format)}
        exportFormats={['csv']}
        exportFileName="sample-records"
        exportPermission="dev.patterns.export"
        search={{ placeholder: 'Search code, name, notes' }}
        emptyTitle="No sample records"
        emptyDescription="Create one to see the form pattern."
        toolbarExtra={
          <PermissionButton
            permission="dev.patterns.create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate(`${ROUTES.devPatterns}/records/new`)}
          >
            New record
          </PermissionButton>
        }
      />
    </PageContainer>
  );
}
