import type { AxiosRequestConfig } from 'axios';

import type { ExportFormat, ImportResult, ListQuery, PagedResult } from '@/types/api';
import type { Id } from '@/types/common';

import { http } from './client';
import { toSearchParams } from './listQuery';

export interface RequestOptions {
  signal?: AbortSignal;
}

export interface UpdateOptions extends RequestOptions {
  /** Sent as `If-Match`; the backend answers 409 when the record changed. */
  rowVersion?: string;
}

/** Uniform REST surface for a collection resource: `/products`, `/sales/orders`, ... */
export interface ResourceApi<T, TCreate = Partial<T>, TUpdate = TCreate> {
  readonly path: string;
  list: (query: Partial<ListQuery>, options?: RequestOptions) => Promise<PagedResult<T>>;
  get: (id: Id, options?: RequestOptions) => Promise<T>;
  create: (body: TCreate, options?: RequestOptions) => Promise<T>;
  update: (id: Id, body: TUpdate, options?: UpdateOptions) => Promise<T>;
  patch: (id: Id, body: Partial<TUpdate>, options?: UpdateOptions) => Promise<T>;
  remove: (id: Id, options?: UpdateOptions) => Promise<void>;
  /** Workflow transition or custom verb: `POST /{path}/{id}/actions/{name}`. */
  action: <TResult = T>(
    id: Id,
    name: string,
    body?: unknown,
    options?: UpdateOptions,
  ) => Promise<TResult>;
  export: (
    query: Partial<ListQuery>,
    format: ExportFormat,
    options?: RequestOptions,
  ) => Promise<Blob>;
  import: (
    file: File,
    mapping: Record<string, string>,
    options?: RequestOptions,
  ) => Promise<ImportResult>;
}

function withOptions(
  options: UpdateOptions | undefined,
  extra: AxiosRequestConfig = {},
): AxiosRequestConfig {
  const headers: Record<string, string> = {};
  if (options?.rowVersion) headers['If-Match'] = options.rowVersion;
  return { signal: options?.signal, headers, ...extra };
}

/**
 * Builds the standard CRUD client for a resource path. Modules compose this
 * instead of hand-writing Axios calls, so URLs, headers and cancellation stay
 * consistent across the ERP.
 */
export function createResourceApi<T, TCreate = Partial<T>, TUpdate = TCreate>(
  path: string,
): ResourceApi<T, TCreate, TUpdate> {
  const base = path.replace(/\/+$/, '');

  return {
    path: base,
    list: (query, options) =>
      http.get<PagedResult<T>>(base, { params: toSearchParams(query), signal: options?.signal }),
    get: (id, options) =>
      http.get<T>(`${base}/${encodeURIComponent(id)}`, { signal: options?.signal }),
    create: (body, options) => http.post<T, TCreate>(base, body, { signal: options?.signal }),
    update: (id, body, options) =>
      http.put<T, TUpdate>(`${base}/${encodeURIComponent(id)}`, body, withOptions(options)),
    patch: (id, body, options) =>
      http.patch<T, Partial<TUpdate>>(
        `${base}/${encodeURIComponent(id)}`,
        body,
        withOptions(options),
      ),
    remove: (id, options) =>
      http.delete<void>(`${base}/${encodeURIComponent(id)}`, withOptions(options)),
    action: (id, name, body, options) =>
      http.post(
        `${base}/${encodeURIComponent(id)}/actions/${encodeURIComponent(name)}`,
        body,
        withOptions(options),
      ),
    export: (query, format, options) => {
      const params = toSearchParams(query);
      params.set('format', format);
      return http.get<Blob>(`${base}/export`, {
        params,
        responseType: 'blob',
        signal: options?.signal,
      });
    },
    import: (file, mapping, options) => {
      const form = new FormData();
      form.append('file', file);
      form.append('mapping', JSON.stringify(mapping));
      return http.post<ImportResult, FormData>(`${base}/import`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal: options?.signal,
      });
    },
  };
}
