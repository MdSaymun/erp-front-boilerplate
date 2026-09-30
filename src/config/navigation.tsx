import {
  AppstoreOutlined,
  AuditOutlined,
  BankOutlined,
  BarChartOutlined,
  BuildOutlined,
  ContactsOutlined,
  DashboardOutlined,
  DollarOutlined,
  FundProjectionScreenOutlined,
  InboxOutlined,
  ProjectOutlined,
  SettingOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  TeamOutlined,
  ToolOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';

import { ROUTES } from '@/constants/routes';
import type { ModuleKey } from '@/config/modules';
import { isModuleEnabled } from '@/config/modules';
import type { PermissionKey } from '@/types/permission';

/**
 * Navigation metadata. The layout renders this; it never hard-codes menu items.
 *
 * `permission` is used later for permission-aware menu rendering (UX only).
 * `module` ties the item to module availability (see config/modules.ts).
 */
export interface NavItem {
  key: string;
  label: string;
  icon?: ReactNode;
  path?: string;
  module: ModuleKey;
  permission?: PermissionKey;
  children?: NavItem[];
}

export const NAVIGATION: NavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardOutlined />,
    path: ROUTES.dashboard,
    module: 'dashboard',
  },
  {
    key: 'crm',
    label: 'CRM',
    icon: <ContactsOutlined />,
    module: 'crm',
    permission: 'crm.module.view',
    children: [
      { key: 'crm-leads', label: 'Leads', path: `${ROUTES.crm}/leads`, module: 'crm' },
      {
        key: 'crm-opportunities',
        label: 'Opportunities',
        path: `${ROUTES.crm}/opportunities`,
        module: 'crm',
      },
      { key: 'crm-customers', label: 'Customers', path: `${ROUTES.crm}/customers`, module: 'crm' },
      { key: 'crm-contacts', label: 'Contacts', path: `${ROUTES.crm}/contacts`, module: 'crm' },
    ],
  },
  {
    key: 'sales',
    label: 'Sales',
    icon: <ShoppingOutlined />,
    module: 'sales',
    permission: 'sales.module.view',
    children: [
      {
        key: 'sales-quotations',
        label: 'Quotations',
        path: `${ROUTES.sales}/quotations`,
        module: 'sales',
      },
      {
        key: 'sales-orders',
        label: 'Sales Orders',
        path: `${ROUTES.sales}/orders`,
        module: 'sales',
      },
      {
        key: 'sales-deliveries',
        label: 'Deliveries',
        path: `${ROUTES.sales}/deliveries`,
        module: 'sales',
      },
      {
        key: 'sales-customers',
        label: 'Customers',
        path: `${ROUTES.sales}/customers`,
        module: 'sales',
      },
    ],
  },
  {
    key: 'purchasing',
    label: 'Purchasing',
    icon: <ShoppingCartOutlined />,
    module: 'purchasing',
    permission: 'purchasing.module.view',
    children: [
      {
        key: 'purchasing-rfq',
        label: 'RFQ',
        path: `${ROUTES.purchasing}/rfq`,
        module: 'purchasing',
      },
      {
        key: 'purchasing-orders',
        label: 'Purchase Orders',
        path: `${ROUTES.purchasing}/orders`,
        module: 'purchasing',
      },
      {
        key: 'purchasing-receipts',
        label: 'Receipts',
        path: `${ROUTES.purchasing}/receipts`,
        module: 'purchasing',
      },
      {
        key: 'purchasing-vendors',
        label: 'Vendors',
        path: `${ROUTES.purchasing}/vendors`,
        module: 'purchasing',
      },
    ],
  },
  {
    key: 'inventory',
    label: 'Inventory',
    icon: <InboxOutlined />,
    module: 'inventory',
    permission: 'inventory.module.view',
    children: [
      { key: 'inventory-overview', label: 'Overview', path: ROUTES.inventory, module: 'inventory' },
      { key: 'inventory-products', label: 'Products', path: ROUTES.products, module: 'inventory' },
      {
        key: 'inventory-warehouses',
        label: 'Warehouses',
        path: ROUTES.warehouses,
        module: 'inventory',
      },
      {
        key: 'inventory-locations',
        label: 'Locations',
        path: `${ROUTES.inventory}/locations`,
        module: 'inventory',
      },
      {
        key: 'inventory-operations',
        label: 'Operations',
        path: `${ROUTES.inventory}/operations`,
        module: 'inventory',
      },
      {
        key: 'inventory-adjustments',
        label: 'Adjustments',
        path: `${ROUTES.inventory}/adjustments`,
        module: 'inventory',
      },
      {
        key: 'inventory-transfers',
        label: 'Transfers',
        path: `${ROUTES.inventory}/transfers`,
        module: 'inventory',
      },
      {
        key: 'inventory-replenishment',
        label: 'Replenishment',
        path: `${ROUTES.inventory}/replenishment`,
        module: 'inventory',
      },
      {
        key: 'inventory-lots',
        label: 'Lots / Serial Numbers',
        path: `${ROUTES.inventory}/lots`,
        module: 'inventory',
      },
    ],
  },
  {
    key: 'accounting',
    label: 'Accounting',
    icon: <BankOutlined />,
    module: 'accounting',
    permission: 'accounting.module.view',
    children: [
      {
        key: 'accounting-dashboard',
        label: 'Dashboard',
        path: ROUTES.accounting,
        module: 'accounting',
      },
      {
        key: 'accounting-coa',
        label: 'Chart of Accounts',
        path: `${ROUTES.accounting}/chart-of-accounts`,
        module: 'accounting',
      },
      {
        key: 'accounting-journals',
        label: 'Journal Entries',
        path: `${ROUTES.accounting}/journal-entries`,
        module: 'accounting',
      },
      {
        key: 'accounting-invoices',
        label: 'Invoices',
        path: `${ROUTES.accounting}/invoices`,
        module: 'accounting',
      },
      {
        key: 'accounting-payments',
        label: 'Payments',
        path: `${ROUTES.accounting}/payments`,
        module: 'accounting',
      },
      {
        key: 'accounting-reports',
        label: 'Reports',
        path: `${ROUTES.accounting}/reports`,
        module: 'accounting',
      },
    ],
  },
  {
    key: 'pos',
    label: 'POS',
    icon: <ShopOutlined />,
    path: ROUTES.pos,
    module: 'pos',
    permission: 'pos.module.view',
  },
  {
    key: 'manufacturing',
    label: 'Manufacturing',
    icon: <BuildOutlined />,
    path: ROUTES.manufacturing,
    module: 'manufacturing',
    permission: 'manufacturing.module.view',
  },
  {
    key: 'hr',
    label: 'HR',
    icon: <TeamOutlined />,
    path: ROUTES.hr,
    module: 'hr',
    permission: 'hr.module.view',
  },
  {
    key: 'payroll',
    label: 'Payroll',
    icon: <DollarOutlined />,
    path: ROUTES.payroll,
    module: 'payroll',
    permission: 'payroll.module.view',
  },
  {
    key: 'expenses',
    label: 'Expenses',
    icon: <WalletOutlined />,
    path: ROUTES.expenses,
    module: 'expenses',
    permission: 'expenses.module.view',
  },
  {
    key: 'projects',
    label: 'Projects',
    icon: <ProjectOutlined />,
    path: ROUTES.projects,
    module: 'projects',
    permission: 'projects.module.view',
  },
  {
    key: 'assets',
    label: 'Assets',
    icon: <FundProjectionScreenOutlined />,
    path: ROUTES.assets,
    module: 'assets',
    permission: 'assets.module.view',
  },
  {
    key: 'helpdesk',
    label: 'Helpdesk',
    icon: <ToolOutlined />,
    path: ROUTES.helpdesk,
    module: 'helpdesk',
    permission: 'helpdesk.module.view',
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: <BarChartOutlined />,
    path: ROUTES.reports,
    module: 'reports',
    permission: 'reports.module.view',
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: <SettingOutlined />,
    path: ROUTES.settings,
    module: 'settings',
  },
  {
    key: 'administration',
    label: 'Administration',
    icon: <AuditOutlined />,
    path: ROUTES.administration,
    module: 'administration',
    permission: 'administration.module.manage',
  },
];

/** Icon used for modules that have none configured. */
export const DEFAULT_MODULE_ICON = <AppstoreOutlined />;

/**
 * Returns the navigation tree filtered by module availability and, optionally,
 * by a permission predicate (UX only; the backend enforces access).
 */
export function getVisibleNavigation(
  items: NavItem[] = NAVIGATION,
  hasPermission: (permission: PermissionKey) => boolean = () => true,
): NavItem[] {
  return items
    .filter((item) => isModuleEnabled(item.module))
    .filter((item) => (item.permission ? hasPermission(item.permission) : true))
    .map((item) =>
      item.children
        ? { ...item, children: getVisibleNavigation(item.children, hasPermission) }
        : item,
    );
}

/** Flattens the tree so active-route lookups can match the longest path prefix. */
export function flattenNavigation(items: NavItem[] = NAVIGATION): NavItem[] {
  return items.flatMap((item) => [
    item,
    ...(item.children ? flattenNavigation(item.children) : []),
  ]);
}

/**
 * Resolves the menu keys to mark as selected/open for a given pathname.
 * Matches the longest configured path that prefixes the current location.
 */
export function resolveActiveNavigation(pathname: string, items: NavItem[] = NAVIGATION) {
  const flat = flattenNavigation(items).filter((item) => item.path);
  const match = flat
    .filter((item) => pathname === item.path || pathname.startsWith(`${item.path}/`))
    .sort((a, b) => (b.path?.length ?? 0) - (a.path?.length ?? 0))[0];

  if (!match) {
    return { selectedKeys: [] as string[], openKeys: [] as string[] };
  }

  const parent = items.find((item) => item.children?.some((child) => child.key === match.key));

  return {
    selectedKeys: [match.key],
    openKeys: parent ? [parent.key] : [],
  };
}
