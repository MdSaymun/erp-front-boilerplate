import { Card, Col, Form, Row, Tag } from 'antd';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { PageContainer } from '@/components/common/PageContainer';
import { AddressFields } from '@/components/forms/inputs/AddressFields';
import { LocalDatePicker } from '@/components/forms/inputs/LocalDatePicker';
import {
  LocalDateRangePicker,
  type DateRangeValue,
} from '@/components/forms/inputs/LocalDateRangePicker';
import { LookupSelect } from '@/components/forms/inputs/LookupSelect';
import { MoneyInput } from '@/components/forms/inputs/MoneyInput';
import { PercentInput } from '@/components/forms/inputs/PercentInput';
import { QuantityInput, type QuantityValue } from '@/components/forms/inputs/QuantityInput';
import { CompanyProfileDemoForm } from '@/features/organization/components/CompanyProfileDemoForm';

import { sampleRecordsApi } from './sampleRecords';

const UNITS = [
  { id: 'uom-pcs', symbol: 'pcs', name: 'Pieces' },
  { id: 'uom-kg', symbol: 'kg', name: 'Kilogram' },
  { id: 'uom-box', symbol: 'box', name: 'Box' },
];

/** Gallery of the shared form inputs, each bound to local state. */
export default function FormInputsPage() {
  const [money, setMoney] = useState<number | null>(1234.5);
  const [quantity, setQuantity] = useState<QuantityValue>({ quantity: 10, uomId: 'uom-pcs' });
  const [percent, setPercent] = useState<number | null>(15);
  const [date, setDate] = useState<string | null>('2026-10-01');
  const [dateTime, setDateTime] = useState<string | null>('2026-10-01T09:30:00Z');
  const [range, setRange] = useState<DateRangeValue | null>(['2026-10-01', '2026-10-31']);
  const [lookup, setLookup] = useState<string | null>(null);
  const address = useForm({
    defaultValues: {
      address: { line1: '', line2: '', city: '', state: '', postalCode: '', countryCode: 'BD' },
    },
  });

  return (
    <PageContainer
      title="Form inputs"
      subtitle="Shared ERP inputs"
      status={<Tag color="magenta">DEV</Tag>}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <Card size="small" title="Numeric">
            <Form layout="vertical">
              <Form.Item label="Money" htmlFor="demo-money">
                <MoneyInput id="demo-money" value={money} onChange={setMoney} currency="BDT" />
              </Form.Item>
              <Form.Item label="Quantity + unit">
                <QuantityInput value={quantity} onChange={setQuantity} units={UNITS} />
              </Form.Item>
              <Form.Item label="Percent" htmlFor="demo-percent">
                <PercentInput id="demo-percent" value={percent} onChange={setPercent} />
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card size="small" title="Dates (ISO in, ISO out)">
            <Form layout="vertical">
              <Form.Item label={`Date → ${date ?? 'null'}`} htmlFor="demo-date">
                <LocalDatePicker id="demo-date" value={date} onChange={setDate} />
              </Form.Item>
              <Form.Item label={`Date-time (UTC) → ${dateTime ?? 'null'}`} htmlFor="demo-datetime">
                <LocalDatePicker
                  id="demo-datetime"
                  kind="datetime"
                  value={dateTime}
                  onChange={setDateTime}
                />
              </Form.Item>
              <Form.Item label={`Range → ${range ? range.join(' … ') : 'null'}`}>
                <LocalDateRangePicker value={range} onChange={setRange} />
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card size="small" title="Lookup (server search)">
            <Form layout="vertical">
              <Form.Item label={`Sample record → ${lookup ?? 'none'}`}>
                <LookupSelect
                  api={sampleRecordsApi}
                  resourceName="sample-records"
                  value={lookup}
                  onChange={(id) => setLookup(id)}
                  getLabel={(r) => `${r.code} · ${r.name}`}
                  placeholder="Search sample records"
                  onCreateNew={() => undefined}
                  createPermission="dev.patterns.create"
                />
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card size="small" title="Address">
            <Form layout="vertical">
              <AddressFields control={address.control} name="address" />
            </Form>
          </Card>
        </Col>
        <Col span={24}>
          <Card size="small" title="Company profile (React Hook Form + Zod)">
            <CompanyProfileDemoForm />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
}
