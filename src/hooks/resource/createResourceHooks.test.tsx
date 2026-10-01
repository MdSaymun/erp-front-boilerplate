import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { createResourceHooks } from '@/hooks/resource/createResourceHooks';
import { resourceKeys } from '@/hooks/resource/resourceKeys';
import type { SampleRecord } from '@/features/developer/types/sampleRecord';
import { createResourceApi } from '@/services/api/resource';
import { useCompanyStore } from '@/stores/companyStore';
import { mockCompanies } from '@/test/mocks/session';
import { renderWithProviders } from '@/test/utils';

const api = createResourceApi<SampleRecord>('/dev/sample-records');
const hooks = createResourceHooks('sample-records', api);

function Probe() {
  const list = hooks.useList({ page: 1, pageSize: 5, sort: [{ field: 'code', direction: 'asc' }] });
  const create = hooks.useCreate();
  if (list.isPending) return <span>loading</span>;
  if (list.error) return <span>error</span>;
  return (
    <div>
      <span data-testid="total">{list.data.totalCount}</span>
      <span data-testid="first">{list.data.items[0]?.name}</span>
      <button
        onClick={() => create.mutate({ code: 'NEW', name: 'Created via hook', lines: [] } as never)}
      >
        create
      </button>
    </div>
  );
}

describe('createResourceHooks', () => {
  beforeEach(() => {
    useCompanyStore.getState().setAvailableCompanies(mockCompanies, 'company-1');
  });

  it('scopes query keys to the current company', () => {
    expect(resourceKeys('products', 'company-1').list({ page: 1, pageSize: 25 })).toEqual([
      'company',
      'company-1',
      'products',
      'list',
      '',
    ]);
    expect(resourceKeys('products', null).detail('p1')).toEqual([
      'company',
      'none',
      'products',
      'detail',
      'p1',
    ]);
  });

  it('lists through the mock API and invalidates the list after a create', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Probe />);

    expect(await screen.findByTestId('total')).toHaveTextContent('57');
    await user.click(screen.getByRole('button', { name: 'create' }));

    await waitFor(() => expect(screen.getByTestId('total')).toHaveTextContent('58'));
  });
});
