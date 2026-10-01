import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw/http';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';

import { QueryProvider } from '@/app/providers/QueryProvider';
import { useCompanySwitch } from '@/hooks/useCompanySwitch';
import { api } from '@/mocks/utils/api';
import { server } from '@/mocks/server';
import { AUTH_API } from '@/services/api/endpoints/auth';
import { useAuthStore } from '@/stores/authStore';
import { useCompanyStore } from '@/stores/companyStore';
import { mockCompanies, mockSession } from '@/test/mocks/session';
import { createTestQueryClient } from '@/test/utils';

describe('useCompanySwitch', () => {
  beforeEach(() => {
    useAuthStore.getState().setSession(mockSession, 'token');
    useCompanyStore.getState().setAvailableCompanies(mockCompanies, 'company-1');
  });

  it('drops company-scoped cache entries and refreshes the session with the new company header', async () => {
    let headerSeen: string | null = null;
    server.use(
      http.get(api(AUTH_API.session), ({ request }) => {
        headerSeen = request.headers.get('X-Company-Id');
        return HttpResponse.json({
          ...mockSession,
          currentCompanyId: headerSeen,
          permissions: ['sales.module.view'],
        });
      }),
    );
    const client = createTestQueryClient();
    client.setQueryData(['company', 'company-1', 'products', 'list', ''], { items: [] });
    client.setQueryData(['global', 'settings'], { ok: true });
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryProvider client={client}>{children}</QueryProvider>
    );
    const { result } = renderHook(() => useCompanySwitch(), { wrapper });

    await act(async () => {
      expect(await result.current('company-2')).toBe(true);
    });

    expect(headerSeen).toBe('company-2');
    expect(useCompanyStore.getState().currentCompanyId).toBe('company-2');
    expect(client.getQueryData(['company', 'company-1', 'products', 'list', ''])).toBeUndefined();
    expect(client.getQueryData(['global', 'settings'])).toEqual({ ok: true });
    expect(useAuthStore.getState().hasPermission('sales.module.view')).toBe(true);
  });

  it('refuses companies the backend did not list', async () => {
    const client = createTestQueryClient();
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryProvider client={client}>{children}</QueryProvider>
    );
    const { result } = renderHook(() => useCompanySwitch(), { wrapper });
    await act(async () => {
      expect(await result.current('company-999')).toBe(false);
    });
    expect(useCompanyStore.getState().currentCompanyId).toBe('company-1');
  });
});
