import { Button, Space } from 'antd';

interface FormActionsProps {
  submitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  disabled?: boolean;
}

/** Standard Save / Cancel bar for form pages and drawers. */
export function FormActions({
  submitting = false,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  onCancel,
  disabled,
}: FormActionsProps) {
  return (
    <Space>
      <Button type="primary" htmlType="submit" loading={submitting} disabled={disabled}>
        {submitLabel}
      </Button>
      {onCancel ? (
        <Button htmlType="button" onClick={onCancel} disabled={submitting}>
          {cancelLabel}
        </Button>
      ) : null}
    </Space>
  );
}
