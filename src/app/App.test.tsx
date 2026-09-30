import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderApp } from '@/test/utils';

describe('Application', () => {
  it('renders the shell and redirects the root path to the dashboard', async () => {
    const { router } = renderApp('/');

    expect(await screen.findByRole('heading', { name: 'Dashboard', level: 3 })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/dashboard');
    expect(screen.getByTestId('app-shell')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
  });

  it('renders the not-found page for unknown routes', async () => {
    renderApp('/this/route/does/not/exist');

    expect(await screen.findByText('Page not found')).toBeInTheDocument();
  });
});
