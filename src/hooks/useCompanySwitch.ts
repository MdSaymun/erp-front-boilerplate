import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { authApi } from '@/services/api/endpoints/auth';
import { useAuthStore } from '@/stores/authStore';
import { useCompanyStore } from '@/stores/companyStore';
import type { Id } from '@/types/common';

/**
 * Switches the working company: drops every company-scoped cache entry and
 * refreshes the session so permissions match the new company. The backend
 * validates membership through the X-Company-Id header on the session call.
 */
export function useCompanySwitch() {
  const client = useQueryClient();
  const selectCompany = useCompanyStore((state) => state.selectCompany);

  return useCallback(
    async (companyId: Id): Promise<boolean> => {
      if (!selectCompany(companyId)) return false;
      await client.cancelQueries();
      client.removeQueries({ predicate: (query) => query.queryKey[0] === 'company' });

      if (useAuthStore.getState().status === 'authenticated') {
        try {
          const session = await authApi.session();
          useAuthStore
            .getState()
            .setSession(session, useAuthStore.getState().accessToken ?? undefined);
        } catch {
          // Session refresh failures surface on the next authorized request.
        }
      }
      return true;
    },
    [client, selectCompany],
  );
}
