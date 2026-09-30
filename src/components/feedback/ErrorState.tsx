import { Alert, Button, Result, Space } from 'antd';

import { isApiError } from '@/services/api/errors';
import type { ApiError } from '@/types/api';

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  /** 'inline' renders an Alert (for sections); 'page' renders a Result. */
  variant?: 'inline' | 'page';
}

function describe(error: unknown): { title: string; message: string; error?: ApiError } {
  if (isApiError(error)) {
    const titles: Partial<Record<ApiError['code'], string>> = {
      network: 'Connection problem',
      timeout: 'Request timed out',
      unauthorized: 'Sign-in required',
      forbidden: 'Access denied',
      not_found: 'Not found',
      conflict: 'Conflict',
      validation: 'Invalid data',
      rate_limited: 'Too many requests',
      server: 'Server error',
    };
    return { title: titles[error.code] ?? 'Something went wrong', message: error.message, error };
  }
  // Non-API errors: never leak internal messages to end users.
  return { title: 'Something went wrong', message: 'An unexpected error occurred.' };
}

/** Consistent API error presentation. Never shows stack traces or server internals. */
export function ErrorState({ error, onRetry, variant = 'page' }: ErrorStateProps) {
  const { title, message, error: apiError } = describe(error);
  const reference = apiError?.traceId ? `Reference: ${apiError.traceId}` : undefined;

  if (variant === 'inline') {
    return (
      <Alert
        type="error"
        showIcon
        role="alert"
        message={title}
        description={
          <Space direction="vertical" size={4}>
            <span>{message}</span>
            {reference ? <small>{reference}</small> : null}
          </Space>
        }
        action={
          onRetry ? (
            <Button size="small" onClick={onRetry}>
              Retry
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <Result
      status="error"
      title={title}
      subTitle={reference ? `${message} ${reference}` : message}
      extra={
        onRetry ? (
          <Button type="primary" onClick={onRetry}>
            Try again
          </Button>
        ) : undefined
      }
    />
  );
}
