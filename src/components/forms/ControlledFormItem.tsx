import { Form } from 'antd';
import type { ReactElement, ReactNode } from 'react';
import {
  Controller,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
  type UseControllerProps,
} from 'react-hook-form';

interface ControlledFormItemProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> extends Pick<UseControllerProps<TFieldValues, TName>, 'control' | 'name'> {
  label: ReactNode;
  required?: boolean;
  help?: ReactNode;
  /** Render the Ant Design input, spreading `field` onto it. */
  render: (field: ControllerRenderProps<TFieldValues, TName>, id: string) => ReactElement;
}

/**
 * Bridges React Hook Form and Ant Design's Form.Item: wires value/onChange and
 * surfaces validation errors with `validateStatus`/`help` so screen readers and
 * sighted users both get the message.
 */
export function ControlledFormItem<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({ control, name, label, required, help, render }: ControlledFormItemProps<TFieldValues, TName>) {
  const id = `field-${String(name)}`;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Form.Item
          label={label}
          htmlFor={id}
          required={required}
          validateStatus={fieldState.error ? 'error' : undefined}
          help={fieldState.error?.message ?? help}
        >
          {render(field, id)}
        </Form.Item>
      )}
    />
  );
}
