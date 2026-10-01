import type { AuditFields, ConcurrencyFields, Id, IsoDateString } from '@/types/common';
import type { DocumentLineBase, DocumentStatus, Money } from '@/types/erp';

/**
 * Neutral showcase entity used by the developer patterns and their mocks.
 * It is deliberately NOT a business entity; modules define their own types.
 */
export interface SampleRecord extends AuditFields, ConcurrencyFields {
  id: Id;
  code: string;
  name: string;
  status: DocumentStatus;
  category: 'alpha' | 'beta' | 'gamma';
  amount: Money;
  date: IsoDateString;
  notes?: string;
  lines: DocumentLineBase[];
}
