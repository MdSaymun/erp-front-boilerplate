import type { ComponentType, LazyExoticComponent } from 'react';

import type { ModuleKey } from '@/config/modules';
import type { PermissionKey } from '@/types/permission';

export type WidgetSize = 'sm' | 'md' | 'lg' | 'xl';

/** A dashboard widget contributed by a module. */
export interface DashboardWidget {
  key: string;
  module: ModuleKey;
  title: string;
  size: WidgetSize;
  permission?: PermissionKey;
  /** Lazy component so modules never load eagerly. */
  component: LazyExoticComponent<ComponentType>;
  /** Lower comes first. */
  order?: number;
}
