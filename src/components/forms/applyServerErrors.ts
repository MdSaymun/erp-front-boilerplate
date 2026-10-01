import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

import { FORM_LEVEL_ERROR_FIELD, forEachValidationError, isApiError } from '@/services/api/errors';

interface ApplyOptions<TFieldValues extends FieldValues> {
  /** Map backend field names to form paths when they differ. */
  fieldMap?: Partial<Record<string, Path<TFieldValues>>>;
  /** Form paths that exist; unknown backend fields become form-level messages. */
  knownFields?: Array<Path<TFieldValues>>;
}

/**
 * Pushes backend validation errors into React Hook Form. Returns messages that
 * could not be attached to a field so the form can show them in a summary.
 */
export function applyServerErrors<TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
  options: ApplyOptions<TFieldValues> = {},
): string[] {
  if (!isApiError(error) || error.code !== 'validation') {
    return isApiError(error) ? [error.message] : [];
  }

  const formLevel: string[] = [];
  forEachValidationError(error, (field, message) => {
    const mapped = options.fieldMap?.[field] ?? (field as Path<TFieldValues>);
    const isKnown =
      field !== FORM_LEVEL_ERROR_FIELD &&
      (!options.knownFields || options.knownFields.includes(mapped));
    if (isKnown) {
      setError(mapped, { type: 'server', message });
    } else {
      formLevel.push(message);
    }
  });
  return formLevel;
}
