import { ColumnHeightOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Flex, Input, Space, Tooltip } from 'antd';
import { useEffect, useState } from 'react';

import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useUiStore } from '@/stores/uiStore';
import type { Filter } from '@/types/api';

import { FilterBar } from './FilterBar';
import type { FilterDefinition } from './types';

interface DataTableToolbarProps {
  search?: boolean | { placeholder?: string };
  searchValue?: string;
  onSearchChange: (value: string) => void;
  filters?: FilterDefinition[];
  activeFilters: Filter[];
  onFiltersChange: (filters: Filter[]) => void;
  onRefresh?: () => void;
  isFetching?: boolean;
  /** Right-hand slot: export, views, column chooser, primary action. */
  right?: React.ReactNode;
}

/** Search, filters, density, refresh and right-side tools for a list page. */
export function DataTableToolbar({
  search,
  searchValue = '',
  onSearchChange,
  filters,
  activeFilters,
  onFiltersChange,
  onRefresh,
  isFetching,
  right,
}: DataTableToolbarProps) {
  const [draft, setDraft] = useState(searchValue);
  const debounced = useDebouncedValue(draft, 300);
  const density = useUiStore((state) => state.tableDensity);
  const setDensity = useUiStore((state) => state.setTableDensity);

  // Push the debounced value upward (URL) only when it actually differs.
  useEffect(() => {
    if (debounced !== searchValue) onSearchChange(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- searchValue is the external mirror, not a trigger
  }, [debounced]);

  const placeholder = typeof search === 'object' ? search.placeholder : undefined;

  return (
    <Flex vertical gap={8} className="erp-no-print">
      <Flex justify="space-between" align="center" wrap gap={8}>
        <Space wrap>
          {search ? (
            <Input
              allowClear
              prefix={<SearchOutlined aria-hidden />}
              placeholder={placeholder ?? 'Search'}
              aria-label="Search"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              style={{ width: 260 }}
            />
          ) : null}
          {filters?.length ? (
            <FilterBar definitions={filters} filters={activeFilters} onChange={onFiltersChange} />
          ) : null}
        </Space>
        <Space wrap>
          {onRefresh ? (
            <Tooltip title="Refresh">
              <Button
                icon={<ReloadOutlined spin={isFetching} />}
                aria-label="Refresh"
                onClick={onRefresh}
              />
            </Tooltip>
          ) : null}
          <Tooltip title={density === 'compact' ? 'Comfortable rows' : 'Compact rows'}>
            <Button
              icon={<ColumnHeightOutlined />}
              aria-label="Toggle row density"
              aria-pressed={density === 'compact'}
              onClick={() => setDensity(density === 'compact' ? 'comfortable' : 'compact')}
            />
          </Tooltip>
          {right}
        </Space>
      </Flex>
    </Flex>
  );
}
