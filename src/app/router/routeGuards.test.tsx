import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { authConfig } from '@/config/auth';
import { useAuthStore } from '@/stores/authStore';
import { mockSession } from '@/test/mocks/session';
import { renderApp } from '@/test/utils';

describe('ProtectedRoute', () => {
  const originalEnforce = authConfig.enforceAuthentication;

  beforeEach(() => {
    useAuthStore.getState().clearSession();
  });

  afterEach(() => {
    authConfig.enforceAuthentication = originalEnforce;
    useAuthStore.getState().clearSession();
  });

  it('lets anonymous users through while enforcement is disabled', async () => {
    authConfig.enforceAuthentication = false;
    renderApp('/dashboard');

    expect(await screen.findByRole('heading', { name: 'Dashboard', level: 3 })).toBeInTheDocument();
  });

  it('redirects anonymous users to the login page when enforcement is enabled', async () => {
    authConfig.enforceAuthentication = true;
    const { router } = renderApp('/dashboard');

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
  });

  it('renders protected content for an authenticated session when enforcement is enabled', async () => {
    authConfig.enforceAuthentication = true;
    useAuthStore.getState().setSession(mockSession);
    const { router } = renderApp('/dashboard');

    expect(await screen.findByRole('heading', { name: 'Dashboard', level: 3 })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/dashboard');
  });

  it('redirects to the forbidden page when a route permission is missing', async () => {
    authConfig.enforceAuthentication = true;
    // Session without the administration permission.
    useAuthStore.getState().setSession(mockSession);
    const { router } = renderApp('/administration');

    expect(await screen.findByText('Access denied')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/forbidden');
  });
});
