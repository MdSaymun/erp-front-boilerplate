import { Card, Skeleton } from 'antd';
import { Suspense } from 'react';

import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import type { DashboardWidget } from '@/features/core/widgets/types';

interface WidgetCardProps {
  widget: DashboardWidget;
}

/** Isolates each widget: its own suspense fallback and error boundary. */
export function WidgetCard({ widget }: WidgetCardProps) {
  const Component = widget.component;
  return (
    <Card
      title={widget.title}
      size="small"
      style={{ height: '100%' }}
      data-testid={`widget-${widget.key}`}
    >
      <ErrorBoundary fallback={<span role="alert">This widget could not be displayed.</span>}>
        <Suspense fallback={<Skeleton active paragraph={{ rows: 2 }} />}>
          <Component />
        </Suspense>
      </ErrorBoundary>
    </Card>
  );
}
