import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DataTable } from '@/components/data-table/DataTable';
import type { DataTableColumn } from '@/components/data-table/types';
import { renderWithProviders } from '@/test/utils';

interface Row {
  id: string;
  code: string;
  name: string;
  secret: string;
}

const columns: DataTableColumn<Row>[] = [
  { key: 'code', title: 'Code', dataIndex: 'code', sortField: 'code', alwaysVisible: true },
  { key: 'name', title: 'Name', dataIndex: 'name', sortField: 'name' },
  { key: 'secret', title: 'Secret', dataIndex: 'secret', defaultHidden: true },
];

const result = {
  items: [
    { id: '1', code: 'A', name: 'Alpha', secret: 's1' },
    { id: '2', code: 'B', name: 'Beta', secret: 's2' },
  ],
  page: 1,
  pageSize: 25,
  totalCount: 2,
  totalPages: 1,
};

describe('DataTable', () => {
  it('emits a sort query when a sortable header is clicked and hides default-hidden columns', async () => {
    const user = userEvent.setup();
    const onQueryChange = vi.fn();
    renderWithProviders(
      <DataTable<Row>
        tableId="t1"
        columns={columns}
        query={{ page: 1, pageSize: 25 }}
        onQueryChange={onQueryChange}
        result={result}
        savedViews={false}
      />,
    );

    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.queryByText('s1')).not.toBeInTheDocument();

    await user.click(screen.getByRole('columnheader', { name: /Name/ }));

    expect(onQueryChange).toHaveBeenLastCalledWith({
      page: 1,
      pageSize: 25,
      sort: [{ field: 'name', direction: 'asc' }],
    });
  });

  it('shows the bulk actions bar with the selected count and runs the action with the rows', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithProviders(
      <DataTable<Row>
        tableId="t2"
        columns={columns}
        query={{ page: 1, pageSize: 25 }}
        onQueryChange={vi.fn()}
        result={result}
        savedViews={false}
        bulkActions={[{ key: 'archive', label: 'Archive', onClick }]}
      />,
    );

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1] as HTMLElement);

    const toolbar = screen.getByRole('toolbar', { name: 'Bulk actions' });
    expect(within(toolbar).getByText('1 selected')).toBeInTheDocument();
    await user.click(within(toolbar).getByRole('button', { name: 'Archive' }));

    expect(onClick).toHaveBeenCalledWith([result.items[0]]);
  });

  it('renders an inline error with retry when loading fails without data', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    renderWithProviders(
      <DataTable<Row>
        tableId="t3"
        columns={columns}
        query={{ page: 1, pageSize: 25 }}
        onQueryChange={vi.fn()}
        error={new Error('x')}
        onRetry={onRetry}
        savedViews={false}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalled();
  });
});
