import { Alert, Tag } from 'antd';

import { PageContainer } from '@/components/common/PageContainer';
import { WidgetGrid } from '@/components/dashboard/WidgetGrid';
import { getVisibleWidgets } from '@/features/core/widgets/widgetRegistry';
import { usePermission } from '@/hooks/usePermission';

/** Dashboard shell: renders whatever widgets enabled modules have registered. */
export default function DashboardPage() {
  const { hasPermission } = usePermission();
  const widgets = getVisibleWidgets(hasPermission);

  return (
    <PageContainer
      title="Dashboard"
      subtitle="Overview of your operations across modules."
      status={<Tag color="gold">Demo data</Tag>}
      hideBreadcrumb
    >
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Placeholder dashboard"
        description="Widgets shown here use static demo values. Live KPIs appear as modules register their widgets."
      />
      <WidgetGrid widgets={widgets} />
    </PageContainer>
  );
}
