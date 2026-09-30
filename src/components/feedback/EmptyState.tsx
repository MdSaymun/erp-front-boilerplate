import { Empty } from 'antd';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title?: string;
  description?: ReactNode;
  /** Usually a primary "Create ..." button. */
  action?: ReactNode;
}

export function EmptyState({ title = 'Nothing here yet', description, action }: EmptyStateProps) {
  return (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <div>
          <strong>{title}</strong>
          {description ? <div>{description}</div> : null}
        </div>
      }
    >
      {action}
    </Empty>
  );
}
