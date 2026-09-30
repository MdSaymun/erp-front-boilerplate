import { useAuthStore } from '@/stores/authStore';
import { selectCurrentCompany, useCompanyStore } from '@/stores/companyStore';
import { useTenantStore } from '@/stores/tenantStore';

/** Read-only view of the current tenant / company / user for display purposes. */
export function useCurrentContext() {
  const tenant = useTenantStore((state) => state.currentTenant);
  const company = useCompanyStore(selectCurrentCompany);
  const availableCompanies = useCompanyStore((state) => state.availableCompanies);
  const user = useAuthStore((state) => state.user);
  const authStatus = useAuthStore((state) => state.status);

  return { tenant, company, availableCompanies, user, authStatus };
}
