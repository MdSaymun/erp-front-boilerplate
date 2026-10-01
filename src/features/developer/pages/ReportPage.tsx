import { Col, Row, Tag } from 'antd';
import { z } from 'zod';

import { PageContainer } from '@/components/common/PageContainer';
import { ControlledFormItem } from '@/components/forms/ControlledFormItem';
import { LocalDateRangePicker } from '@/components/forms/inputs/LocalDateRangePicker';
import { ReportViewer } from '@/components/reports/ReportViewer';
import { isoDateSchema } from '@/schemas/common';
import type { ReportDefinition } from '@/types/reports';

const parametersSchema = z.object({
  range: z.tuple([isoDateSchema.nullable(), isoDateSchema.nullable()]),
});
type Params = z.infer<typeof parametersSchema>;

const DEFINITION: ReportDefinition<Params> = {
  key: 'sample-summary',
  title: 'Sample summary report',
  module: 'developer',
  parametersSchema,
  formats: ['pdf', 'xlsx'],
  path: '/dev/reports/sample-summary',
};

export default function ReportPage() {
  return (
    <PageContainer
      title="Report viewer"
      subtitle="Parameters + PDF preview"
      status={<Tag color="magenta">DEV</Tag>}
    >
      <ReportViewer<Params>
        definition={DEFINITION}
        defaultValues={{ range: ['2026-10-01', '2026-10-31'] }}
        renderParameters={(control) => (
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <ControlledFormItem
                control={control}
                name="range"
                label="Period"
                required
                render={(f) => <LocalDateRangePicker value={f.value} onChange={f.onChange} />}
              />
            </Col>
          </Row>
        )}
      />
    </PageContainer>
  );
}
