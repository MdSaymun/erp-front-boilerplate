import { App } from 'antd';
import { useCallback } from 'react';

import { isApiError } from '@/services/api/errors';

interface FeedbackOptions {
  /** Shown via message.success. */
  success?: string;
  /** Prefix for error notifications; the normalized error message follows. */
  errorTitle?: string;
}

/**
 * Consistent transient feedback for mutations. Validation errors are not
 * announced here because the form renders them next to the fields.
 */
export function useMutationFeedback(options: FeedbackOptions = {}) {
  const { message, notification } = App.useApp();

  const onSuccess = useCallback(() => {
    if (options.success) message.success(options.success);
  }, [message, options.success]);

  const onError = useCallback(
    (error: unknown) => {
      if (isApiError(error)) {
        if (error.code === 'validation' || error.code === 'conflict' || error.code === 'cancelled')
          return;
        notification.error({
          title: options.errorTitle ?? 'Action failed',
          description: error.traceId ? `${error.message} (ref ${error.traceId})` : error.message,
        });
        return;
      }
      notification.error({
        title: options.errorTitle ?? 'Action failed',
        description: 'An unexpected error occurred.',
      });
    },
    [notification, options.errorTitle],
  );

  return { onSuccess, onError };
}
