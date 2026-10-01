import type { ZodType } from 'zod';

import type { ExportFormat } from './api';
import type { ModuleKey } from '@/config/modules';
import type { PermissionKey } from './permission';

/** A server-rendered report a module exposes (PDF/Excel), with typed parameters. */
export interface ReportDefinition<TParams = Record<string, unknown>> {
  key: string;
  title: string;
  module: ModuleKey;
  description?: string;
  permission?: PermissionKey;
  parametersSchema: ZodType<TParams>;
  formats: ExportFormat[];
  /** Backend path that renders the report, e.g. `/inventory/reports/stock-valuation`. */
  path: string;
}
