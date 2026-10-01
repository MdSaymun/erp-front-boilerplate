import { InputNumber, type InputNumberProps } from 'antd';

interface PercentInputProps extends Omit<InputNumberProps<number>, 'value' | 'onChange'> {
  value?: number | null;
  onChange?: (value: number | null) => void;
}

/** 0–100 percentage input; stores a plain number (15 = 15 %). */
export function PercentInput({ value, onChange, style, ...rest }: PercentInputProps) {
  return (
    <InputNumber<number>
      value={value ?? undefined}
      onChange={(next) => onChange?.(next ?? null)}
      min={0}
      max={100}
      precision={2}
      suffix="%"
      controls={false}
      style={{ width: '100%', ...style }}
      {...rest}
    />
  );
}
