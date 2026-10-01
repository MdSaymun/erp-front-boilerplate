import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Can } from '@/components/auth/Can';
import { authConfig } from '@/config/auth';
import { useAuthStore } from '@/stores/authStore';
import { mockSession } from '@/test/mocks/session';

describe('Can', () => {
  const original = authConfig.enforceAuthentication;
  afterEach(() => {
    authConfig.enforceAuthentication = original;
    useAuthStore.getState().clearSession();
  });

  it('renders children for everyone while enforcement is off', () => {
    authConfig.enforceAuthentication = false;
    render(<Can permission="accounting.journals.post">post</Can>);
    expect(screen.getByText('post')).toBeInTheDocument();
  });

  it('hides children and shows the fallback when the permission is missing', () => {
    authConfig.enforceAuthentication = true;
    useAuthStore.getState().setSession(mockSession);
    render(
      <>
        <Can permission="inventory.products.view">view</Can>
        <Can permission="accounting.journals.post" fallback={<span>no</span>}>
          post
        </Can>
      </>,
    );
    expect(screen.getByText('view')).toBeInTheDocument();
    expect(screen.queryByText('post')).not.toBeInTheDocument();
    expect(screen.getByText('no')).toBeInTheDocument();
  });
});
