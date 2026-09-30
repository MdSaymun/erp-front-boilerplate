import type { CurrencyCode, Id, LocaleTag, RecordStatus, TimeZoneId } from './common';
import type { Address } from './erp';

/**
 * A company is a legal/business entity inside a tenant (e.g. "ABC Electronics Ltd").
 * Accounting, inventory valuation, and documents are always company-scoped.
 */
export interface Company {
  id: Id;
  tenantId: Id;
  name: string;
  legalName?: string;
  code: string;
  status: RecordStatus;
  baseCurrency: CurrencyCode;
  timeZone: TimeZoneId;
  locale: LocaleTag;
  taxId?: string;
  address?: Address;
  logoUrl?: string;
}

/** Organizational unit under a company (branch, division, department). */
export interface Branch {
  id: Id;
  companyId: Id;
  name: string;
  code: string;
  status: RecordStatus;
  address?: Address;
}

/** Lightweight shape for switchers and pickers. */
export interface CompanySummary {
  id: Id;
  name: string;
  code: string;
  baseCurrency: CurrencyCode;
}
