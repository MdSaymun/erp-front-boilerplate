import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it } from 'vitest';

import { forEachValidationError, isApiError, normalizeApiError } from '@/services/api/errors';

function axiosError(status: number | undefined, data?: unknown, code?: string): AxiosError {
  const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
  const response =
    status === undefined ? undefined : { status, statusText: '', headers: {}, config, data };
  return new AxiosError('request failed', code, config, undefined, response);
}

describe('normalizeApiError', () => {
  it('maps ASP.NET ProblemDetails to a safe ApiError', () => {
    const error = normalizeApiError(
      axiosError(404, {
        type: 'https://example.com/problems/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Product 42 was not found.',
        traceId: '00-abc-01',
      }),
    );

    expect(isApiError(error)).toBe(true);
    expect(error.code).toBe('not_found');
    expect(error.status).toBe(404);
    expect(error.message).toBe('Product 42 was not found.');
    expect(error.traceId).toBe('00-abc-01');
    expect(error.problemType).toBe('https://example.com/problems/not-found');
  });

  it('maps ValidationProblemDetails to field-level validation errors', () => {
    const error = normalizeApiError(
      axiosError(422, {
        title: 'One or more validation errors occurred.',
        status: 422,
        errors: { Name: ['Name is required.'], 'Lines[0].Quantity': ['Must be positive.'] },
      }),
    );

    expect(error.code).toBe('validation');
    expect(error.validationErrors).toEqual([
      { field: 'name', messages: ['Name is required.'] },
      { field: 'lines[0].Quantity', messages: ['Must be positive.'] },
    ]);

    const seen: string[] = [];
    forEachValidationError(error, (field, message) => seen.push(`${field}=${message}`));
    expect(seen).toEqual(['name=Name is required.', 'lines[0].Quantity=Must be positive.']);
  });

  it.each([
    [401, 'unauthorized'],
    [403, 'forbidden'],
    [409, 'conflict'],
    [429, 'rate_limited'],
    [500, 'server'],
    [503, 'server'],
  ])('classifies HTTP %i as %s', (status, code) => {
    expect(normalizeApiError(axiosError(status, {})).code).toBe(code);
  });

  it('never exposes server exception details for 5xx responses', () => {
    const error = normalizeApiError(
      axiosError(500, {
        title: 'System.NullReferenceException',
        detail: 'at Inventory.Application.Stock.Handler.Handle() in Handler.cs:line 42',
      }),
    );

    expect(error.code).toBe('server');
    expect(error.message).not.toMatch(/Exception|Handler\.cs/);
  });

  it('classifies network failures and timeouts', () => {
    expect(normalizeApiError(axiosError(undefined)).code).toBe('network');
    expect(normalizeApiError(axiosError(undefined, undefined, 'ECONNABORTED')).code).toBe(
      'timeout',
    );
  });

  it('wraps unknown errors without leaking their message', () => {
    const error = normalizeApiError(new Error('secret internal detail'));

    expect(error.code).toBe('unknown');
    expect(error.message).not.toContain('secret');
  });

  it('returns an existing ApiError untouched', () => {
    const original = normalizeApiError(axiosError(403, {}));
    expect(normalizeApiError(original)).toBe(original);
  });
});
