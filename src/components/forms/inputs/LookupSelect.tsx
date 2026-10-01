import { PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Button, Divider, Select, type SelectProps, Spin } from 'antd';
import { useMemo, useState } from 'react';

import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { usePermission } from '@/hooks/usePermission';
import type { ResourceApi } from '@/services/api/resource';
import { useCompanyStore } from '@/stores/companyStore';
import type { Id } from '@/types/common';
import type { PermissionKey } from '@/types/permission';

interface LookupSelectProps<T extends { id: Id }> extends Omit<
  SelectProps<Id>,
  'options' | 'value' | 'onChange' | 'onSearch'
> {
  /** Resource to search; the backend applies `search` server-side. */
  api: Pick<ResourceApi<T, unknown, unknown>, 'list' | 'get'>;
  /** Cache namespace, e.g. "products". */
  resourceName: string;
  value?: Id | null;
  onChange?: (id: Id | null, record: T | null) => void;
  getLabel: (record: T) => string;
  /** Optional "Create new…" affordance (opens a drawer in the module). */
  onCreateNew?: () => void;
  createPermission?: PermissionKey;
  pageSize?: number;
}

/**
 * Async lookup for master data (product, partner, warehouse...). Searches the
 * server as the user types, hydrates the selected record on edit forms.
 */
export function LookupSelect<T extends { id: Id }>({
  api,
  resourceName,
  value,
  onChange,
  getLabel,
  onCreateNew,
  createPermission,
  pageSize = 20,
  ...rest
}: LookupSelectProps<T>) {
  const companyId = useCompanyStore((state) => state.currentCompanyId);
  const { hasPermission } = usePermission();
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 250);

  const results = useQuery({
    queryKey: ['company', companyId ?? 'none', resourceName, 'lookup', debounced, pageSize],
    queryFn: ({ signal }) =>
      api.list({ page: 1, pageSize, search: debounced || undefined }, { signal }),
    staleTime: 60_000,
  });

  const selected = useQuery({
    queryKey: ['company', companyId ?? 'none', resourceName, 'detail', value ?? ''],
    queryFn: ({ signal }) => api.get(value as Id, { signal }),
    enabled: Boolean(value) && !results.data?.items.some((item) => item.id === value),
    staleTime: 60_000,
  });

  const options = useMemo(() => {
    const items = results.data?.items ?? [];
    const all =
      selected.data && !items.some((i) => i.id === selected.data?.id)
        ? [selected.data, ...items]
        : items;
    return all.map((item) => ({ value: item.id, label: getLabel(item), record: item }));
  }, [results.data, selected.data, getLabel]);

  const canCreate = onCreateNew && (!createPermission || hasPermission(createPermission));

  return (
    <Select<Id>
      showSearch
      allowClear
      filterOption={false}
      value={value ?? undefined}
      onSearch={setSearch}
      onChange={(id) => onChange?.(id ?? null, options.find((o) => o.value === id)?.record ?? null)}
      options={options}
      notFoundContent={results.isFetching ? <Spin size="small" /> : 'No matches'}
      loading={results.isFetching}
      popupRender={(menu) =>
        canCreate ? (
          <>
            {menu}
            <Divider style={{ margin: '4px 0' }} />
            <Button
              type="link"
              icon={<PlusOutlined />}
              onClick={onCreateNew}
              style={{ width: '100%' }}
            >
              Create new…
            </Button>
          </>
        ) : (
          menu
        )
      }
      style={{ width: '100%' }}
      {...rest}
    />
  );
}
