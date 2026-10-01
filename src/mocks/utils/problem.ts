import { HttpResponse } from 'msw/http';

import type { ProblemDetails, ValidationProblemDetails } from '@/types/api';

const TITLES: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'One or more validation errors occurred.',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
};

let traceCounter = 0;
function nextTraceId(): string {
  traceCounter += 1;
  return `00-mock-${String(traceCounter).padStart(6, '0')}-01`;
}

/** RFC 7807 response mirroring ASP.NET Core ProblemDetails. */
export function problem(status: number, detail?: string, extra: Partial<ProblemDetails> = {}) {
  const body: ProblemDetails = {
    type: `https://httpstatuses.io/${status}`,
    title: TITLES[status] ?? 'Error',
    status,
    detail,
    traceId: nextTraceId(),
    ...extra,
  };
  return HttpResponse.json(body, {
    status,
    headers: { 'Content-Type': 'application/problem+json' },
  });
}

/** ASP.NET ValidationProblemDetails. Keys may be PascalCase member paths. */
export function validationProblem(errors: Record<string, string[]>) {
  const body: ValidationProblemDetails = {
    type: 'https://httpstatuses.io/422',
    title: TITLES[422] ?? 'Validation failed',
    status: 422,
    traceId: nextTraceId(),
    errors,
  };
  return HttpResponse.json(body, {
    status: 422,
    headers: { 'Content-Type': 'application/problem+json' },
  });
}
