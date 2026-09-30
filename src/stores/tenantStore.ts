import { create } from 'zustand';

import type { Tenant } from '@/types/tenant';

/**
 * Display state for the current tenant. Populated from the authenticated session.
 * Never read TenantId from the URL, query string or forms; the backend resolves it.
 */
interface TenantState {
  currentTenant: Tenant | null;
  setCurrentTenant: (tenant: Tenant | null) => void;
  clear: () => void;
}

export const useTenantStore = create<TenantState>()((set) => ({
  currentTenant: null,
  setCurrentTenant: (tenant) => set({ currentTenant: tenant }),
  clear: () => set({ currentTenant: null }),
}));
