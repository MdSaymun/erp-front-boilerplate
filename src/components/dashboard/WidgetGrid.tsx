import { Col, Row } from 'antd';

import { EmptyState } from '@/components/feedback/EmptyState';
import type { DashboardWidget, WidgetSize } from '@/features/core/widgets/types';

import { WidgetCard } from './WidgetCard';

interface WidgetGridProps {
  widgets: DashboardWidget[];
}

const SPANS: Record<WidgetSize, { xs: number; sm: number; xl: number }> = {
  sm: { xs: 24, sm: 12, xl: 6 },
  md: { xs: 24, sm: 12, xl: 8 },
  lg: { xs: 24, sm: 24, xl: 12 },
  xl: { xs: 24, sm: 24, xl: 24 },
};

export function WidgetGrid({ widgets }: WidgetGridProps) {
  if (widgets.length === 0) {
    return (
      <EmptyState
        title="No widgets yet"
        description="Modules add dashboard widgets as they are implemented."
      />
    );
  }
  return (
    <Row gutter={[16, 16]}>
      {widgets.map((widget) => (
        <Col key={widget.key} {...SPANS[widget.size]}>
          <WidgetCard widget={widget} />
        </Col>
      ))}
    </Row>
  );
}
