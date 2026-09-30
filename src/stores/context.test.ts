import { beforeEach, describe, expect, it } from 'vitest';

import { useAuthStore } from '@/stores/authStore';
import { selectCurrentCompany, useCompanyStore } from '@/stores/companyStore';
import { useTenantStore } from '@/stores/tenantStore';
import { mockCompanies, mockSession, mockTenant } from '@/test/mocks/session';

describe('tenant and company context stores', () => {
  beforeEach(() => {
    useTenantStore.getState().clear();
    useCompanyStore.getState().clear();
    useAuthStore.getState().clearSession();
  });

  it('holds the current tenant for display', () => {
    useTenantStore.getState().setCurrentTenant(mockTenant);
    expect(useTenantStore.getState().currentTenant?.name).toBe('ABC Group');
  });

  it('selects the preferred company from the available list', () => {
    useCompanyStore.getState().setAvailableCompanies(mockCompanies, 'company-2');

    expect(useCompanyStore.getState().currentCompanyId).toBe('company-2');
    expect(selectCurrentCompany(useCompanyStore.getState())?.name).toBe('ABC Trading Ltd');
  });

  it('falls back to the first company when no preference is given', () => {
    useCompanyStore.getState().setAvailableCompanies(mockCompanies);
    expect(useCompanyStore.getState().currentCompanyId).toBe('company-1');
  });

  it('refuses to select a company that the backend did not list', () => {
    useCompanyStore.getState().setAvailableCompanies(mockCompanies);

    expect(useCompanyStore.getState().selectCompany('company-999')).toBe(false);
    expect(useCompanyStore.getState().currentCompanyId).toBe('company-1');
    expect(useCompanyStore.getState().selectCompany('company-2')).toBe(true);
    expect(useCompanyStore.getState().currentCompanyId).toBe('company-2');
  });

  it('exposes session permissions for UX checks only', () => {
    useAuthStore.getState().setSession(mockSession);

    const state = useAuthStore.getState();
    expect(state.status).toBe('authenticated');
    expect(state.hasPermission('inventory.products.view')).toBe(true);
    expect(state.hasPermission('accounting.journals.post')).toBe(false);

    state.clearSession();
    expect(useAuthStore.getState().status).toBe('anonymous');
    expect(useAuthStore.getState().user).toBeNull();
  });
});
