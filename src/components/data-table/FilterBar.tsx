import { DatePicker, Input, InputNumber, Select, Space } from 'antd';
import dayjs from 'dayjs';

import type { Filter } from '@/types/api';

import type { FilterDefinition } from './types';

interface FilterBarProps {
  definitions: FilterDefinition[];
  filters: Filter[];
  onChange: (filters: Filter[]) => void;
}

function replace(filters: Filter[], field: string, next: Filter | null): Filter[] {
  const rest = filters.filter((f) => f.field !== field);
  return next ? [...rest, next] : rest;
}

/** Renders filter controls from definitions and serializes them to `Filter[]`. */
export function FilterBar({ definitions, filters, onChange }: FilterBarProps) {
  const current = (field: string) => filters.find((f) => f.field === field);

  return (
    <Space wrap role="group" aria-label="Filters">
      {definitions.map((def) => {
        const active = current(def.field);
        switch (def.type) {
          case 'text':
            return (
              <Input
                key={def.field}
                allowClear
                placeholder={def.label}
                aria-label={def.label}
                value={typeof active?.value === 'string' ? active.value : ''}
                onChange={(event) =>
                  onChange(
                    replace(
                      filters,
                      def.field,
                      event.target.value
                        ? { field: def.field, operator: 'contains', value: event.target.value }
                        : null,
                    ),
                  )
                }
                style={{ width: 180 }}
              />
            );
          case 'select':
            return (
              <Select
                key={def.field}
                allowClear
                mode={def.multiple ? 'multiple' : undefined}
                placeholder={def.label}
                aria-label={def.label}
                options={def.options}
                value={
                  active
                    ? Array.isArray(active.value)
                      ? active.value.map(String)
                      : String(active.value)
                    : undefined
                }
                onChange={(value: string | string[] | undefined) => {
                  const empty = value === undefined || (Array.isArray(value) && value.length === 0);
                  onChange(
                    replace(
                      filters,
                      def.field,
                      empty
                        ? null
                        : Array.isArray(value)
                          ? { field: def.field, operator: 'in', value }
                          : { field: def.field, operator: 'eq', value },
                    ),
                  );
                }}
                style={{ minWidth: 160 }}
              />
            );
          case 'date-range': {
            const [from, to] = Array.isArray(active?.value) ? active.value : [];
            return (
              <DatePicker.RangePicker
                key={def.field}
                aria-label={def.label}
                placeholder={[`${def.label} from`, `${def.label} to`]}
                value={from && to ? [dayjs(String(from)), dayjs(String(to))] : null}
                onChange={(range) =>
                  onChange(
                    replace(
                      filters,
                      def.field,
                      range?.[0] && range[1]
                        ? {
                            field: def.field,
                            operator: 'between',
                            value: [range[0].format('YYYY-MM-DD'), range[1].format('YYYY-MM-DD')],
                          }
                        : null,
                    ),
                  )
                }
              />
            );
          }
          case 'number-range': {
            const [from, to] = Array.isArray(active?.value) ? active.value : [];
            const update = (nextFrom: number | null, nextTo: number | null) =>
              onChange(
                replace(
                  filters,
                  def.field,
                  nextFrom === null && nextTo === null
                    ? null
                    : {
                        field: def.field,
                        operator: 'between',
                        value: [
                          nextFrom ?? Number.MIN_SAFE_INTEGER,
                          nextTo ?? Number.MAX_SAFE_INTEGER,
                        ],
                      },
                ),
              );
            return (
              <Space.Compact key={def.field}>
                <InputNumber
                  aria-label={`${def.label} from`}
                  placeholder={`${def.label} min`}
                  value={from !== undefined ? Number(from) : null}
                  onChange={(value) => update(value, to !== undefined ? Number(to) : null)}
                  style={{ width: 120 }}
                />
                <InputNumber
                  aria-label={`${def.label} to`}
                  placeholder="max"
                  value={to !== undefined ? Number(to) : null}
                  onChange={(value) => update(from !== undefined ? Number(from) : null, value)}
                  style={{ width: 120 }}
                />
              </Space.Compact>
            );
          }
          default:
            return null;
        }
      })}
    </Space>
  );
}
