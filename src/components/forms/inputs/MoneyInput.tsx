import { InputNumber, type InputNumberProps } from 'antd';

import { useLocaleSettings } from '@/hooks/useLocaleSettings';
import type { CurrencyCode } from '@/types/common';

interface MoneyInputProps extends Omit<
  InputNumberProps<number>,
  'value' | 'onChange' | 'precision'
> {
  value?: number | null;
  onChange?: (value: number | null) => void;
  /** Displayed as a prefix; defaults to the current company currency. */
  currency?: CurrencyCode;
  decimals?: number;
}

/** Monetary amount input. Value is a plain number; formatting is display only. */
export function MoneyInput({
  value,
  onChange,
  currency,
  decimals,
  style,
  ...rest
}: MoneyInputProps) {
  const settings = useLocaleSettings();
  const precision = decimals ?? settings.currencyDecimals;

  return (
    <InputNumber<number>
      value={value ?? undefined}
      onChange={(next) => onChange?.(next ?? null)}
      precision={precision}
      step={1 / 10 ** precision}
      addonBefore={currency ?? settings.currency}
      formatter={(v) =>
        v === undefined || v === null ? '' : String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      }
      parser={(text) => Number(String(text ?? '').replace(/,/g, ''))}
      controls={false}
      style={{ width: '100%', ...style }}
      {...rest}
    />
  );
}
