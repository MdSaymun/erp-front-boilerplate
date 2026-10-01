import { describe, expect, it, vi } from 'vitest';

import { applyServerErrors } from '@/components/forms/applyServerErrors';
import { createApiError } from '@/services/api/errors';

describe('applyServerErrors', () => {
  it('attaches field errors with normalized paths and returns form-level messages', () => {
    const setError = vi.fn();
    const error = createApiError({
      code: 'validation',
      status: 422,
      message: 'Invalid',
      validationErrors: [
        { field: 'name', messages: ['Name is required.'] },
        { field: 'lines.0.quantity', messages: ['Must be positive.'] },
        { field: '_', messages: ['Document is locked.'] },
      ],
    });

    const formLevel = applyServerErrors(error, setError);

    expect(setError).toHaveBeenCalledWith('name', { type: 'server', message: 'Name is required.' });
    expect(setError).toHaveBeenCalledWith('lines.0.quantity', {
      type: 'server',
      message: 'Must be positive.',
    });
    expect(formLevel).toEqual(['Document is locked.']);
  });

  it('returns the message of non-validation API errors without touching fields', () => {
    const setError = vi.fn();
    const formLevel = applyServerErrors(
      createApiError({ code: 'server', message: 'Server unavailable.' }),
      setError,
    );
    expect(setError).not.toHaveBeenCalled();
    expect(formLevel).toEqual(['Server unavailable.']);
  });
});
