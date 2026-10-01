import { DatePicker, type DatePickerProps } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';

import { useLocaleSettings } from '@/hooks/useLocaleSettings';
import type { IsoDateString, IsoDateTimeString } from '@/types/common';
import { toUtcIso, toZoned } from '@/utils/format/date';

const ISO_DATE = 'YYYY-MM-DD';

type BaseProps = Omit<
  DatePickerProps,
  'value' | 'onChange' | 'format' | 'showTime' | 'mode' | 'picker'
> & { id?: string };

interface DateOnlyProps extends BaseProps {
  kind?: 'date';
  value?: IsoDateString | null;
  onChange?: (value: IsoDateString | null) => void;
}

interface DateTimeProps extends BaseProps {
  kind: 'datetime';
  value?: IsoDateTimeString | null;
  onChange?: (value: IsoDateTimeString | null) => void;
}

type LocalDatePickerProps = DateOnlyProps | DateTimeProps;

/**
 * Date picker bound to ISO strings. Date-only values never pass through a time
 * zone (no day shift); date-time values are UTC instants shown in the user's zone.
 */
export function LocalDatePicker(props: LocalDatePickerProps) {
  const settings = useLocaleSettings();
  const { value, onChange, kind = 'date', style, ...rest } = props;

  const parsed: Dayjs | null = value
    ? kind === 'datetime'
      ? toZoned(value, settings.timeZone)
      : dayjs(value, ISO_DATE)
    : null;

  const handleChange = (date: Dayjs | Dayjs[] | null) => {
    const next = Array.isArray(date) ? (date[0] ?? null) : date;
    if (!next) {
      onChange?.(null);
      return;
    }
    if (kind === 'datetime') {
      (onChange as DateTimeProps['onChange'])?.(
        toUtcIso(next.format('YYYY-MM-DDTHH:mm:ss'), settings.timeZone),
      );
    } else {
      (onChange as DateOnlyProps['onChange'])?.(next.format(ISO_DATE));
    }
  };

  return (
    <DatePicker
      value={parsed && parsed.isValid() ? parsed : null}
      onChange={handleChange}
      format={kind === 'datetime' ? settings.dateTimeFormat : settings.dateFormat}
      showTime={kind === 'datetime' ? { format: 'HH:mm' } : false}
      style={{ width: '100%', ...style }}
      {...rest}
    />
  );
}
