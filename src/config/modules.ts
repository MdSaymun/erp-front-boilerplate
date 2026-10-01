/**
 * Module availability.
 *
 * A simple, configuration-based switch for enabling ERP modules. Later this can
 * be fed from the tenant's subscription plan returned by the backend. Disabling a
 * module hides its navigation and routes; it is NOT an authorization control.
 */
import { env } from '@/config/env';

export const MODULE_KEYS = [
  'dashboard',
  'developer',
  'crm',
  'sales',
  'purchasing',
  'inventory',
  'accounting',
  'pos',
  'manufacturing',
  'hr',
  'payroll',
  'expenses',
  'projects',
  'assets',
  'helpdesk',
  'ecommerce',
  'reports',
  'settings',
  'administration',
  // <module-keys>
] as const;

export type ModuleKey = (typeof MODULE_KEYS)[number];

export interface ModuleDefinition {
  key: ModuleKey;
  label: string;
  /** Whether the module is available for this deployment/tenant. */
  enabled: boolean;
  /** Development stage, for display in placeholders. */
  stage: 'foundation' | 'planned';
}

export const MODULES: Record<ModuleKey, ModuleDefinition> = {
  dashboard: { key: 'dashboard', label: 'Dashboard', enabled: true, stage: 'foundation' },
  developer: {
    key: 'developer',
    label: 'Developer',
    enabled: env.devToolsEnabled,
    stage: 'foundation',
  },
  crm: { key: 'crm', label: 'CRM', enabled: true, stage: 'planned' },
  sales: { key: 'sales', label: 'Sales', enabled: true, stage: 'planned' },
  purchasing: { key: 'purchasing', label: 'Purchasing', enabled: true, stage: 'planned' },
  inventory: { key: 'inventory', label: 'Inventory', enabled: true, stage: 'foundation' },
  accounting: { key: 'accounting', label: 'Accounting', enabled: true, stage: 'planned' },
  pos: { key: 'pos', label: 'Point of Sale', enabled: true, stage: 'planned' },
  manufacturing: { key: 'manufacturing', label: 'Manufacturing', enabled: true, stage: 'planned' },
  hr: { key: 'hr', label: 'Human Resources', enabled: true, stage: 'planned' },
  payroll: { key: 'payroll', label: 'Payroll', enabled: true, stage: 'planned' },
  expenses: { key: 'expenses', label: 'Expenses', enabled: true, stage: 'planned' },
  projects: { key: 'projects', label: 'Projects', enabled: true, stage: 'planned' },
  assets: { key: 'assets', label: 'Assets', enabled: true, stage: 'planned' },
  helpdesk: { key: 'helpdesk', label: 'Helpdesk', enabled: false, stage: 'planned' },
  ecommerce: { key: 'ecommerce', label: 'E-commerce', enabled: false, stage: 'planned' },
  reports: { key: 'reports', label: 'Reports', enabled: true, stage: 'planned' },
  settings: { key: 'settings', label: 'Settings', enabled: true, stage: 'foundation' },
  administration: {
    key: 'administration',
    label: 'Administration',
    enabled: true,
    stage: 'planned',
  },
};

export function isModuleEnabled(key: ModuleKey): boolean {
  return MODULES[key].enabled;
}
