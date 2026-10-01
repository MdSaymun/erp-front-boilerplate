import type { AuthSession } from '@/types/auth';
import type { CompanySummary } from '@/types/company';
import type { Tenant } from '@/types/tenant';
import type { User } from '@/types/user';

/** Demo session used by MSW handlers and tests. Mirrors the backend seed plan. */
export const mockTenant: Tenant = {
  id: 'tenant-1',
  name: 'ABC Group',
  slug: 'abc-group',
  status: 'active',
  subscriptionStatus: 'active',
  defaultLocale: 'en-GB',
  defaultTimeZone: 'Asia/Dhaka',
  branding: { primaryColor: '#1d5fb4' },
};

export const mockCompanies: CompanySummary[] = [
  { id: 'company-1', name: 'ABC Electronics Ltd', code: 'ABCE', baseCurrency: 'BDT' },
  { id: 'company-2', name: 'ABC Trading Ltd', code: 'ABCT', baseCurrency: 'USD' },
];

export const mockPermissions = [
  'inventory.module.view',
  'inventory.products.view',
  'inventory.products.create',
  'inventory.products.update',
  'sales.module.view',
  'purchasing.module.view',
  'accounting.module.view',
  'crm.module.view',
  'pos.module.view',
  'manufacturing.module.view',
  'hr.module.view',
  'payroll.module.view',
  'expenses.module.view',
  'projects.module.view',
  'assets.module.view',
  'reports.module.view',
  'dev.patterns.view',
  'dev.patterns.create',
  'dev.patterns.update',
  'dev.patterns.delete',
  'dev.patterns.export',
] as const;

export const mockUser: User = {
  id: 'user-1',
  tenantId: 'tenant-1',
  email: 'jane@abc-group.example',
  displayName: 'Jane Doe',
  status: 'active',
  companyIds: ['company-1', 'company-2'],
  roleIds: ['role-admin'],
  permissions: [...mockPermissions],
  preferredLocale: 'en',
};

export const mockSession: AuthSession = {
  user: mockUser,
  tenant: mockTenant,
  companies: mockCompanies,
  currentCompanyId: 'company-1',
  permissions: mockUser.permissions,
};
