import { Descriptions } from 'antd';

import { useLocaleSettings } from '@/hooks/useLocaleSettings';
import type { DocumentTotals as DocumentTotalsModel } from '@/types/erp';
import { formatCurrency } from '@/utils/format/number';

interface DocumentTotalsProps {
  totals: DocumentTotalsModel;
}

/** Right-aligned totals block using the document's currency. */
export function DocumentTotals({ totals }: DocumentTotalsProps) {
  const { locale } = useLocaleSettings();
  const money = (value: number) => formatCurrency(value, { locale, currency: totals.currency });

  return (
    <Descriptions
      size="small"
      column={1}
      bordered
      style={{ maxWidth: 360, marginInlineStart: 'auto' }}
      items={[
        { key: 'subtotal', label: 'Subtotal', children: money(totals.subtotal) },
        { key: 'discount', label: 'Discount', children: money(totals.discountTotal) },
        { key: 'tax', label: 'Tax', children: money(totals.taxTotal) },
        {
          key: 'total',
          label: <strong>Total</strong>,
          children: <strong>{money(totals.grandTotal)}</strong>,
        },
      ]}
    />
  );
}
