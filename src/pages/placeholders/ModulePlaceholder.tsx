import { Alert, Card, Descriptions, Tag } from 'antd';
import type { ReactNode } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useModuleRouteMeta } from '@/hooks/useModuleRouteMeta';

interface ModulePlaceholderProps {
  children?: ReactNode;
}

/**
 * Consistent placeholder for modules that are not implemented yet. Demonstrates
 * routing, layout, breadcrumbs and page structure without business logic.
 */
export function ModulePlaceholder({ children }: ModulePlaceholderProps) {
  const { handle, module, section } = useModuleRouteMeta();
  const baseTitle = handle?.title ?? 'Module';
  const title = section ? `${baseTitle} · ${section}` : baseTitle;

  return (
    <PageContainer
      title={title}
      subtitle={module ? `${module.label} module` : undefined}
      status={
        module ? (
          <Tag color={module.stage === 'foundation' ? 'blue' : 'default'}>{module.stage}</Tag>
        ) : null
      }
    >
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Placeholder page"
        description="This route exists to prove navigation and layout. Business functionality for this module is implemented in a later phase."
      />
      <Card title="Route information" size="small" style={{ marginBottom: 16 }}>
        <Descriptions
          size="small"
          column={{ xs: 1, md: 3 }}
          items={[
            { key: 'module', label: 'Module', children: module?.label ?? 'Unknown' },
            { key: 'section', label: 'Section', children: section ?? 'Overview' },
            { key: 'enabled', label: 'Enabled', children: module?.enabled ? 'Yes' : 'No' },
          ]}
        />
      </Card>
      {children ?? (
        <Card size="small">
          <EmptyState
            title="No records"
            description="Lists, filters and tables will appear here."
          />
        </Card>
      )}
    </PageContainer>
  );
}
