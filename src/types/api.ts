/**
 * API contract foundation shared by every module.
 *
 * Mirrors what an ASP.NET Core Web API returns, including RFC 7807 ProblemDetails
 * and the `ValidationProblemDetails` shape produced by model validation.
 */

/** RFC 7807 problem details as emitted by ASP.NET Core. */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  /** ASP.NET adds a traceId for correlation. Safe to show to support staff, not sensitive. */
  traceId?: string;
  /** Any additional extension members. */
  [extension: string]: unknown;
}

/** ASP.NET Core `ValidationProblemDetails`: field name -> messages. */
export interface ValidationProblemDetails extends ProblemDetails {
  errors: Record<string, string[]>;
}

/** A single field-level validation error, normalized for forms. */
export interface ValidationError {
  field: string;
  messages: string[];
}

/** Stable, UI-oriented classification of API failures. */
export type ApiErrorCode =
  | 'network'
  | 'timeout'
  | 'cancelled'
  | 'bad_request'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'validation'
  | 'rate_limited'
  | 'server'
  | 'unknown';

/** Normalized error every caller can rely on. Never contains stack traces or server internals. */
export interface ApiError {
  readonly name: 'ApiError';
  readonly code: ApiErrorCode;
  /** HTTP status when the server responded; undefined for network-level failures. */
  readonly status?: number;
  /** Safe, user-presentable message. */
  readonly message: string;
  /** Field-level errors, populated for validation failures. */
  readonly validationErrors: ValidationError[];
  /** Correlation identifier from the backend, if any. */
  readonly traceId?: string;
  /** Problem type URI from the backend, if any. */
  readonly problemType?: string;
}

/** Sort direction used by list endpoints. */
export type SortDirection = 'asc' | 'desc';

export interface Sort {
  field: string;
  direction: SortDirection;
}

/** Filter operators the backend list endpoints are expected to support. */
export type FilterOperator =
  'eq' | 'neq' | 'contains' | 'startsWith' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'between';

export interface Filter {
  field: string;
  operator: FilterOperator;
  value: string | number | boolean | Array<string | number>;
}

/** 1-based pagination request. */
export interface Pagination {
  page: number;
  pageSize: number;
}

/** Standard list query combining paging, sorting, filtering and free-text search. */
export interface ListQuery extends Pagination {
  search?: string;
  sort?: Sort[];
  filters?: Filter[];
  /** Reserved for server-side grouping; not supported by any endpoint yet. */
  groupBy?: string;
}

export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

/** Result of a bulk import run. */
export interface ImportResult {
  imported: number;
  failed: number;
  errors: Array<{ row: number; field?: string; message: string }>;
}

/** Standard paged response envelope. */
export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

/** Tenant/company scoping is resolved by the backend from the authenticated principal. */
export interface ApiRequestContext {
  /** Optional idempotency key for POST operations that create documents. */
  idempotencyKey?: string;
}
