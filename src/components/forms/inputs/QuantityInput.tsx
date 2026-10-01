import { InputNumber, Select, Space } from 'antd';

import { useLocaleSettings } from '@/hooks/useLocaleSettings';
import type { UnitOfMeasure } from '@/types/erp';

export interface QuantityValue {
  quantity: number | null;
  uomId: string | null;
}

interface QuantityInputProps {
  value?: QuantityValue;
  onChange?: (value: QuantityValue) => void;
  units: Pick<UnitOfMeasure, 'id' | 'symbol' | 'name'>[];
  decimals?: number;
  disabled?: boolean;
  id?: string;
  'aria-label'?: string;
}

/** Quantity with a unit-of-measure selector; value is `{ quantity, uomId }`. */
export function QuantityInput({
  value,
  onChange,
  units,
  decimals,
  disabled,
  id,
  ...aria
}: QuantityInputProps) {
  const settings = useLocaleSettings();
  const current: QuantityValue = value ?? { quantity: null, uomId: units[0]?.id ?? null };

  return (
    <Space.Compact style={{ width: '100%' }}>
      <InputNumber<number>
        id={id}
        aria-label={aria['aria-label'] ?? 'Quantity'}
        value={current.quantity ?? undefined}
        min={0}
        precision={decimals ?? settings.quantityDecimals}
        disabled={disabled}
        onChange={(quantity) => onChange?.({ ...current, quantity: quantity ?? null })}
        style={{ flex: 1 }}
      />
      <Select
        aria-label="Unit of measure"
        value={current.uomId ?? undefined}
        disabled={disabled || units.length <= 1}
        options={units.map((u) => ({ value: u.id, label: u.symbol, title: u.name }))}
        onChange={(uomId) => onChange?.({ ...current, uomId })}
        style={{ minWidth: 90 }}
      />
    </Space.Compact>
  );
}
