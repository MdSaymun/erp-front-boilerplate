/**
 * Shared ERP concepts.
 *
 * These interfaces are consumed by every business module (Inventory, Sales,
 * Purchasing, Accounting, CRM, POS, ...). Modules must extend them rather than
 * define their own copies. Nothing here is implemented yet; this file fixes the
 * vocabulary so modules do not diverge.
 */
import type {
  AuditFields,
  CurrencyCode,
  Id,
  IsoDateString,
  IsoDateTimeString,
  RecordStatus,
} from './common';

// ---------------------------------------------------------------------------
// Parties, contacts, addresses
// ---------------------------------------------------------------------------

export type PartyType = 'customer' | 'vendor' | 'employee' | 'company' | 'other';

/** A party is any legal or natural person the business deals with. */
export interface Party extends AuditFields {
  id: Id;
  type: PartyType[];
  name: string;
  code?: string;
  status: RecordStatus;
  taxId?: string;
  defaultCurrency?: CurrencyCode;
  addresses?: Address[];
  contacts?: Contact[];
}

export interface Contact {
  id: Id;
  partyId?: Id;
  name: string;
  jobTitle?: string;
  email?: string;
  phone?: string;
  isPrimary?: boolean;
}

export type AddressType = 'billing' | 'shipping' | 'registered' | 'other';

export interface Address {
  id?: Id;
  type?: AddressType;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  /** ISO-3166-1 alpha-2 country code. */
  countryCode: string;
}

// ---------------------------------------------------------------------------
// Currency, tax, units
// ---------------------------------------------------------------------------

export interface Currency {
  code: CurrencyCode;
  name: string;
  symbol: string;
  decimals: number;
}

/** A monetary amount always travels with its currency. */
export interface Money {
  amount: number;
  currency: CurrencyCode;
}

export type TaxType = 'vat' | 'sales' | 'withholding' | 'excise' | 'other';

export interface Tax {
  id: Id;
  name: string;
  code: string;
  type: TaxType;
  /** Percentage, e.g. 15 for 15 %. */
  rate: number;
  isInclusive?: boolean;
  status: RecordStatus;
}

export interface UnitOfMeasure {
  id: Id;
  name: string;
  symbol: string;
  category: string;
  /** Conversion factor relative to the category's reference unit. */
  ratio: number;
}

/** Minimal product reference shared by Sales, Purchasing, Inventory and POS lines. */
export interface ProductRef {
  id: Id;
  sku: string;
  name: string;
  uomId?: Id;
}

// ---------------------------------------------------------------------------
// Documents and workflow
// ---------------------------------------------------------------------------

/** Business document kinds the ERP will support. Extend, do not fork. */
export type DocumentType =
  | 'quotation'
  | 'sales_order'
  | 'delivery'
  | 'rfq'
  | 'purchase_order'
  | 'receipt'
  | 'stock_transfer'
  | 'inventory_adjustment'
  | 'invoice'
  | 'payment'
  | 'journal_entry'
  | 'expense'
  | 'manufacturing_order';

/**
 * Generic workflow states shared across document types. Individual modules map
 * their specific states onto these for consistent UI treatment.
 */
export type DocumentStatus =
  'draft' | 'pending' | 'confirmed' | 'in_progress' | 'done' | 'posted' | 'cancelled';

export interface WorkflowTransition {
  from: DocumentStatus;
  to: DocumentStatus;
  action: string;
}

/** Sequence-generated business number, e.g. "SO/2026/000123". */
export interface DocumentNumber {
  prefix: string;
  sequence: number;
  formatted: string;
}

/** Common header every business document shares. */
export interface DocumentHeaderBase extends AuditFields {
  id: Id;
  companyId: Id;
  type: DocumentType;
  number: DocumentNumber;
  status: DocumentStatus;
  documentDate: IsoDateString;
  currency: CurrencyCode;
  partyId?: Id;
  reference?: string;
  notes?: string;
}

/** Common line shape used by line-item tables. */
export interface DocumentLineBase {
  id: Id;
  lineNumber: number;
  product?: ProductRef;
  description: string;
  quantity: number;
  uomId?: Id;
  unitPrice?: number;
  discountPercent?: number;
  taxIds?: Id[];
  lineTotal?: number;
}

export interface DocumentTotals {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  currency: CurrencyCode;
}

export interface FiscalPeriod {
  id: Id;
  companyId: Id;
  name: string;
  startDate: IsoDateString;
  endDate: IsoDateString;
  isClosed: boolean;
}

// ---------------------------------------------------------------------------
// Collaboration and audit
// ---------------------------------------------------------------------------

export interface Attachment {
  id: Id;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: IsoDateTimeString;
  uploadedBy?: Id;
  url?: string;
}

export interface Comment {
  id: Id;
  authorId: Id;
  body: string;
  createdAt: IsoDateTimeString;
}

export type ActivityKind = 'created' | 'updated' | 'status_changed' | 'commented' | 'attached';

export interface Activity {
  id: Id;
  kind: ActivityKind;
  actorId?: Id;
  occurredAt: IsoDateTimeString;
  summary: string;
  details?: Record<string, unknown>;
}

export interface AuditEntry {
  id: Id;
  entityType: string;
  entityId: Id;
  action: string;
  actorId?: Id;
  occurredAt: IsoDateTimeString;
  changes?: Record<string, { from: unknown; to: unknown }>;
}

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error';

export interface AppNotification {
  id: Id;
  severity: NotificationSeverity;
  title: string;
  body?: string;
  createdAt: IsoDateTimeString;
  readAt?: IsoDateTimeString;
  link?: string;
}
