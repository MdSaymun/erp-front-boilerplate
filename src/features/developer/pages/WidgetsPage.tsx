import { Tag } from 'antd';

import { PageContainer } from '@/components/common/PageContainer';
import { WidgetGrid } from '@/components/dashboard/WidgetGrid';
import { getVisibleWidgets } from '@/features/core/widgets/widgetRegistry';
import { usePermission } from '@/hooks/usePermission';

export default function WidgetsPage() {
  const { hasPermission } = usePermission();
  return (
    <PageContainer
      title="Dashboard widgets"
      subtitle="Widget registry + responsive grid"
      status={<Tag color="magenta">DEV</Tag>}
    >
      <WidgetGrid widgets={getVisibleWidgets(hasPermission)} />
    </PageContainer>
  );
}
