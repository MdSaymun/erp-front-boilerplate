/** Opaque identifier as issued by the backend (GUID/string). */
export type Id = string;

/** ISO-8601 date-time string, always UTC from the backend (e.g. "2026-09-30T12:00:00Z"). */
export type IsoDateTimeString = string;

/** ISO-8601 calendar date without time (e.g. "2026-09-30"). */
export type IsoDateString = string;

/** ISO-4217 currency code (e.g. "USD", "EUR", "BDT"). Never hard-code a default in features. */
export type CurrencyCode = string;

/** IANA time zone identifier (e.g. "Asia/Dhaka", "Europe/Berlin"). */
export type TimeZoneId = string;

/** BCP-47 locale tag (e.g. "en-US", "bn-BD"). */
export type LocaleTag = string;

/** Fields the backend stamps on every persisted record. */
export interface AuditFields {
  createdAt: IsoDateTimeString;
  createdBy?: Id;
  updatedAt?: IsoDateTimeString;
  updatedBy?: Id;
}

/** Soft-delete / activation state used across master data. */
export type RecordStatus = 'active' | 'inactive' | 'archived';

/** Locale/formatting settings resolved from tenant and company configuration. */
export interface LocaleSettings {
  locale: LocaleTag;
  timeZone: TimeZoneId;
  currency: CurrencyCode;
  /** dayjs format token for dates, e.g. "DD/MM/YYYY". */
  dateFormat: string;
  /** dayjs format token for date-times. */
  dateTimeFormat: string;
  /** Number of decimals used for monetary amounts. */
  currencyDecimals: number;
  /** Number of decimals used for quantities (UOM-dependent in the future). */
  quantityDecimals: number;
}

/** Simple key/value option used by Select-style controls. */
export interface SelectOption<TValue extends string | number = string> {
  label: string;
  value: TValue;
  disabled?: boolean;
}

export type Nullable<T> = T | null;
