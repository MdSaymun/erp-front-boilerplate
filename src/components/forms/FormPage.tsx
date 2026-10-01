import { Form, Space } from 'antd';
import { type FormEventHandler, type PropsWithChildren, type ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router';

import { PageContainer } from '@/components/common/PageContainer';
import { useShortcut } from '@/hooks/useShortcut';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';

import { FormActions } from './FormActions';
import { FormErrorSummary } from './FormErrorSummary';

interface FormPageProps extends PropsWithChildren {
  title: string;
  subtitle?: ReactNode;
  status?: ReactNode;
  /** From React Hook Form `formState.isDirty`. */
  isDirty: boolean;
  isSubmitting: boolean;
  /** `handleSubmit(onValid)` result. */
  onSubmit: FormEventHandler<HTMLFormElement>;
  /** Where Cancel goes (default: back). */
  cancelPath?: string;
  submitLabel?: string;
  /** Form-level error messages (from applyServerErrors). */
  errorMessages?: string[];
  /** Extra header actions. */
  actions?: ReactNode;
  /** Exposes `allowNext` so the page can navigate after a successful save. */
  guardRef?: (api: { allowNext: () => void }) => void;
}

/**
 * Standard create/edit page: breadcrumb, header, form, Save/Cancel, unsaved-
 * changes guard and Ctrl/Cmd+S. Pages supply the fields and the submit handler.
 */
export function FormPage({
  title,
  subtitle,
  status,
  isDirty,
  isSubmitting,
  onSubmit,
  cancelPath,
  submitLabel,
  errorMessages = [],
  actions,
  guardRef,
  children,
}: FormPageProps) {
  const navigate = useNavigate();
  const { allowNext } = useUnsavedChangesGuard(isDirty);

  useEffect(() => {
    guardRef?.({ allowNext });
  }, [guardRef, allowNext]);

  useShortcut({
    id: 'form-save',
    keys: 'mod+s',
    scope: 'form',
    description: 'Save the current form',
    allowInInput: true,
    handler: () => {
      document.querySelector<HTMLFormElement>('form[data-form-page]')?.requestSubmit();
    },
  });

  const handleCancel = () => {
    if (cancelPath) navigate(cancelPath);
    else navigate(-1);
  };

  return (
    <PageContainer title={title} subtitle={subtitle} status={status} actions={actions}>
      <Form
        layout="vertical"
        component="form"
        onSubmitCapture={onSubmit}
        data-form-page
        aria-label={title}
        style={{ maxWidth: 960 }}
      >
        <FormErrorSummary messages={errorMessages} />
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {children}
          <FormActions
            submitting={isSubmitting}
            submitLabel={submitLabel}
            onCancel={handleCancel}
          />
        </Space>
      </Form>
    </PageContainer>
  );
}
