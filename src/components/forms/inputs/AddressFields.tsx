import { Col, Input, Row, Select } from 'antd';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

import { ControlledFormItem } from '@/components/forms/ControlledFormItem';
import { COUNTRIES } from '@/constants/countries';

interface AddressFieldsProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  /** Path to the address object, e.g. "billingAddress". */
  name: string;
  disabled?: boolean;
}

/** Reusable address sub-form matching the shared `Address` type. */
export function AddressFields<TFieldValues extends FieldValues>({
  control,
  name,
  disabled,
}: AddressFieldsProps<TFieldValues>) {
  const path = (field: string) => `${name}.${field}` as FieldPath<TFieldValues>;

  return (
    <Row gutter={12}>
      <Col span={24}>
        <ControlledFormItem
          control={control}
          name={path('line1')}
          label="Address line 1"
          required
          render={(f, id) => (
            <Input {...f} id={id} disabled={disabled} autoComplete="address-line1" />
          )}
        />
      </Col>
      <Col span={24}>
        <ControlledFormItem
          control={control}
          name={path('line2')}
          label="Address line 2"
          render={(f, id) => (
            <Input {...f} id={id} disabled={disabled} autoComplete="address-line2" />
          )}
        />
      </Col>
      <Col xs={24} md={12}>
        <ControlledFormItem
          control={control}
          name={path('city')}
          label="City"
          required
          render={(f, id) => (
            <Input {...f} id={id} disabled={disabled} autoComplete="address-level2" />
          )}
        />
      </Col>
      <Col xs={24} md={12}>
        <ControlledFormItem
          control={control}
          name={path('state')}
          label="State / Region"
          render={(f, id) => (
            <Input {...f} id={id} disabled={disabled} autoComplete="address-level1" />
          )}
        />
      </Col>
      <Col xs={24} md={12}>
        <ControlledFormItem
          control={control}
          name={path('postalCode')}
          label="Postal code"
          render={(f, id) => (
            <Input {...f} id={id} disabled={disabled} autoComplete="postal-code" />
          )}
        />
      </Col>
      <Col xs={24} md={12}>
        <ControlledFormItem
          control={control}
          name={path('countryCode')}
          label="Country"
          required
          render={(f, id) => (
            <Select
              id={id}
              showSearch
              optionFilterProp="label"
              disabled={disabled}
              options={COUNTRIES}
              value={f.value || undefined}
              onChange={f.onChange}
              onBlur={f.onBlur}
              placeholder="Select country"
            />
          )}
        />
      </Col>
    </Row>
  );
}
