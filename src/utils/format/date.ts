import dayjs, { type ConfigType } from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import type { LocaleSettings, TimeZoneId } from '@/types/common';

dayjs.extend(utc);
dayjs.extend(timezone);

type DateSettings = Pick<LocaleSettings, 'timeZone' | 'dateFormat' | 'dateTimeFormat'>;

/** Converts a backend UTC instant into the given time zone. */
export function toZoned(value: ConfigType, timeZone: TimeZoneId) {
  return dayjs.utc(value).tz(timeZone);
}

export function formatDate(value: ConfigType | null | undefined, settings: DateSettings): string {
  if (value === null || value === undefined || value === '') return '';
  const zoned = toZoned(value, settings.timeZone);
  return zoned.isValid() ? zoned.format(settings.dateFormat) : '';
}

export function formatDateTime(
  value: ConfigType | null | undefined,
  settings: DateSettings,
): string {
  if (value === null || value === undefined || value === '') return '';
  const zoned = toZoned(value, settings.timeZone);
  return zoned.isValid() ? zoned.format(settings.dateTimeFormat) : '';
}

export function formatTime(
  value: ConfigType | null | undefined,
  settings: Pick<LocaleSettings, 'timeZone'>,
  format = 'HH:mm',
): string {
  if (value === null || value === undefined || value === '') return '';
  const zoned = toZoned(value, settings.timeZone);
  return zoned.isValid() ? zoned.format(format) : '';
}

/** Serializes a local (zoned) date for the backend as an ISO-8601 UTC string. */
export function toUtcIso(value: ConfigType, timeZone: TimeZoneId): string {
  return dayjs.tz(value, timeZone).utc().toISOString();
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch {
    return false;
  }
}
