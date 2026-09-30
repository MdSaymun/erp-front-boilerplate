import type { AuthSession } from '@/types/auth';
import type { CompanySummary } from '@/types/company';
import type { Tenant } from '@/types/tenant';
import type { User } from '@/types/user';

/** Fixtures for store and guard tests. They never reach the network. */
export const mockTenant: Tenant = {
  id: 'tenant-1',
  name: 'ABC Group',
  slug: 'abc-group',
  status: 'active',
  subscriptionStatus: 'active',
  defaultLocale: 'en-GB',
  defaultTimeZone: 'Asia/Dhaka',
};

export const mockCompanies: CompanySummary[] = [
  { id: 'company-1', name: 'ABC Electronics Ltd', code: 'ABCE', baseCurrency: 'BDT' },
  { id: 'company-2', name: 'ABC Trading Ltd', code: 'ABCT', baseCurrency: 'USD' },
];

export const mockUser: User = {
  id: 'user-1',
  tenantId: 'tenant-1',
  email: 'jane@abc-group.example',
  displayName: 'Jane Doe',
  status: 'active',
  companyIds: ['company-1', 'company-2'],
  roleIds: ['role-admin'],
  permissions: ['inventory.products.view', 'inventory.module.view'],
};

export const mockSession: AuthSession = {
  user: mockUser,
  tenant: mockTenant,
  companies: mockCompanies,
  currentCompanyId: 'company-1',
  permissions: mockUser.permissions,
};
