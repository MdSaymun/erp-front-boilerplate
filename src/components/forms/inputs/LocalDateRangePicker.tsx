import { DatePicker } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';

import { useLocaleSettings } from '@/hooks/useLocaleSettings';
import type { IsoDateString } from '@/types/common';

const ISO_DATE = 'YYYY-MM-DD';

export type DateRangeValue = [IsoDateString | null, IsoDateString | null];

interface LocalDateRangePickerProps {
  value?: DateRangeValue | null;
  onChange?: (value: DateRangeValue | null) => void;
  id?: string;
  disabled?: boolean;
  allowClear?: boolean;
  'aria-label'?: string;
}

/** Date-only range picker bound to ISO date strings. */
export function LocalDateRangePicker({ value, onChange, ...rest }: LocalDateRangePickerProps) {
  const settings = useLocaleSettings();
  const toDayjs = (v: IsoDateString | null | undefined): Dayjs | null =>
    v ? dayjs(v, ISO_DATE) : null;

  return (
    <DatePicker.RangePicker
      value={value ? [toDayjs(value[0]), toDayjs(value[1])] : null}
      onChange={(range) =>
        onChange?.(
          range ? [range[0]?.format(ISO_DATE) ?? null, range[1]?.format(ISO_DATE) ?? null] : null,
        )
      }
      format={settings.dateFormat}
      style={{ width: '100%' }}
      {...rest}
    />
  );
}
