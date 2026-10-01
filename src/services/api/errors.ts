import axios, { type AxiosError } from 'axios';

import type {
  ApiError,
  ApiErrorCode,
  ProblemDetails,
  ValidationError,
  ValidationProblemDetails,
} from '@/types/api';

/**
 * Central error normalization.
 *
 * Every failure that leaves the HTTP layer is an `ApiError`. Messages are safe to
 * show; backend exception details, stack traces and SQL text are never surfaced.
 */

const STATUS_MESSAGES: Record<number, string> = {
  400: 'The request could not be processed.',
  401: 'Your session has expired or you are not signed in.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested record could not be found.',
  409: 'The record was changed by someone else or conflicts with existing data.',
  422: 'Some of the submitted values are invalid.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Something went wrong on the server. Please try again later.',
  502: 'The service is temporarily unavailable.',
  503: 'The service is temporarily unavailable.',
  504: 'The server took too long to respond.',
};

export function statusToCode(status: number | undefined): ApiErrorCode {
  if (status === undefined) return 'network';
  if (status === 400) return 'bad_request';
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 409) return 'conflict';
  if (status === 422) return 'validation';
  if (status === 429) return 'rate_limited';
  if (status >= 500) return 'server';
  return 'unknown';
}

/** Codes for which retrying the same request is pointless. */
export const NON_RETRYABLE_CODES: ReadonlySet<ApiErrorCode> = new Set([
  'bad_request',
  'unauthorized',
  'forbidden',
  'not_found',
  'conflict',
  'validation',
  'cancelled',
]);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isProblemDetails(value: unknown): value is ProblemDetails {
  return isObject(value) && ('title' in value || 'detail' in value || 'type' in value);
}

export function isValidationProblemDetails(value: unknown): value is ValidationProblemDetails {
  return isObject(value) && isObject(value.errors);
}

export function isApiError(value: unknown): value is ApiError {
  return isObject(value) && value.name === 'ApiError' && typeof value.code === 'string';
}

/** Model-level (non-field) errors are reported under this key. */
export const FORM_LEVEL_ERROR_FIELD = '_';

/**
 * Converts an ASP.NET member path such as `Lines[0].Quantity` into the dotted,
 * camelCase form React Hook Form expects: `lines.0.quantity`.
 */
export function normalizeFieldPath(path: string): string {
  if (path === '' || path === '$') return FORM_LEVEL_ERROR_FIELD;
  return path
    .replace(/^\$\./, '')
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean)
    .map((segment) =>
      /^\d+$/.test(segment) ? segment : segment.charAt(0).toLowerCase() + segment.slice(1),
    )
    .join('.');
}

function toValidationErrors(errors: Record<string, unknown>): ValidationError[] {
  return Object.entries(errors).map(([field, messages]) => ({
    field: normalizeFieldPath(field),
    messages: Array.isArray(messages) ? messages.map(String) : [String(messages)],
  }));
}

export function createApiError(
  partial: Partial<ApiError> & Pick<ApiError, 'code' | 'message'>,
): ApiError {
  return {
    name: 'ApiError',
    validationErrors: [],
    ...partial,
  };
}

function fromAxiosError(error: AxiosError<unknown>): ApiError {
  if (axios.isCancel(error)) {
    return createApiError({ code: 'cancelled', message: 'The request was cancelled.' });
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return createApiError({ code: 'timeout', message: 'The request timed out. Please try again.' });
  }

  if (!error.response) {
    return createApiError({
      code: 'network',
      message: 'Unable to reach the server. Check your connection and try again.',
    });
  }

  const { status, data } = error.response;
  const code = statusToCode(status);
  const fallbackMessage = STATUS_MESSAGES[status] ?? 'An unexpected error occurred.';

  if (isValidationProblemDetails(data)) {
    return createApiError({
      code: 'validation',
      status,
      message: data.title ?? STATUS_MESSAGES[422] ?? fallbackMessage,
      validationErrors: toValidationErrors(data.errors),
      traceId: data.traceId,
      problemType: data.type,
    });
  }

  if (isProblemDetails(data)) {
    // `detail` from ProblemDetails is intended for clients; `title` is a short summary.
    // Never fall through to raw response bodies, which may contain exception text.
    const message =
      code === 'server' ? fallbackMessage : (data.detail ?? data.title ?? fallbackMessage);
    return createApiError({
      code,
      status,
      message,
      traceId: data.traceId,
      problemType: data.type,
    });
  }

  return createApiError({ code, status, message: fallbackMessage });
}

/** Converts anything thrown by the HTTP layer into a safe `ApiError`. */
export function normalizeApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    return fromAxiosError(error);
  }

  return createApiError({ code: 'unknown', message: 'An unexpected error occurred.' });
}

/** Maps normalized validation errors to a form library's `setError` calls. */
export function forEachValidationError(
  error: ApiError,
  callback: (field: string, message: string) => void,
): void {
  for (const validationError of error.validationErrors) {
    const message = validationError.messages[0];
    if (message) {
      callback(validationError.field, message);
    }
  }
}
