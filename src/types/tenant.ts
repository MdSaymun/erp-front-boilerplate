import type { Id, IsoDateTimeString, LocaleTag, RecordStatus, TimeZoneId } from './common';

/** SaaS subscription state as reported by the backend. */
export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'suspended' | 'cancelled';

/**
 * A tenant is a SaaS customer account. It owns one or more companies.
 * The frontend never derives TenantId from user input; the backend resolves it
 * from the authenticated principal.
 */
export interface Tenant {
  id: Id;
  name: string;
  /** URL-safe identifier used for display and support purposes only. */
  slug: string;
  status: RecordStatus;
  subscriptionStatus?: SubscriptionStatus;
  defaultLocale?: LocaleTag;
  defaultTimeZone?: TimeZoneId;
  createdAt?: IsoDateTimeString;
}
