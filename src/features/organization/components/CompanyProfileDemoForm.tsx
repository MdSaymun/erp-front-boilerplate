import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, App, Form, Input, Select } from 'antd';
import { useForm } from 'react-hook-form';

import { ControlledFormItem } from '@/components/forms/ControlledFormItem';
import { FormActions } from '@/components/forms/FormActions';

import {
  companyProfileSchema,
  type CompanyProfileInput,
  type CompanyProfileValues,
} from '../schemas/companyProfileSchema';

const CURRENCY_OPTIONS = ['USD', 'EUR', 'GBP', 'BDT', 'INR', 'AED'].map((code) => ({
  label: code,
  value: code,
}));

const TIME_ZONE_OPTIONS = Intl.supportedValuesOf('timeZone').map((zone) => ({
  label: zone,
  value: zone,
}));

interface CompanyProfileDemoFormProps {
  onSubmitted?: (values: CompanyProfileValues) => void;
}

/**
 * Demonstration only: validates locally and shows a success message.
 * It does not call any API and does not change application state.
 */
export function CompanyProfileDemoForm({ onSubmitted }: CompanyProfileDemoFormProps) {
  const { message } = App.useApp();
  const { control, handleSubmit, formState, reset } = useForm<
    CompanyProfileInput,
    unknown,
    CompanyProfileValues
  >({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: { companyName: '', currency: '', timeZone: '' },
    mode: 'onBlur',
  });

  const onSubmit = handleSubmit((values) => {
    message.success(`Validated: ${values.companyName} (${values.currency}, ${values.timeZone})`);
    onSubmitted?.(values);
  });

  return (
    <Form
      layout="vertical"
      onFinish={onSubmit}
      aria-label="Company profile demonstration form"
      style={{ maxWidth: 480 }}
    >
      <Alert
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
        message="Demonstration form: values are validated locally and not saved."
      />
      <ControlledFormItem
        control={control}
        name="companyName"
        label="Company name"
        required
        render={(field, id) => <Input {...field} id={id} placeholder="ABC Electronics Ltd" />}
      />
      <ControlledFormItem
        control={control}
        name="currency"
        label="Base currency"
        required
        render={(field, id) => (
          <Select
            id={id}
            value={field.value || undefined}
            onChange={field.onChange}
            onBlur={field.onBlur}
            options={CURRENCY_OPTIONS}
            placeholder="Select currency"
            showSearch
          />
        )}
      />
      <ControlledFormItem
        control={control}
        name="timeZone"
        label="Time zone"
        required
        render={(field, id) => (
          <Select
            id={id}
            value={field.value || undefined}
            onChange={field.onChange}
            onBlur={field.onBlur}
            options={TIME_ZONE_OPTIONS}
            placeholder="Select time zone"
            showSearch
          />
        )}
      />
      <FormActions
        submitting={formState.isSubmitting}
        submitLabel="Validate"
        cancelLabel="Reset"
        onCancel={() => reset()}
      />
    </Form>
  );
}
