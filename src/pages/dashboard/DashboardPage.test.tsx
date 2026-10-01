import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderApp } from '@/test/utils';

describe('Dashboard route', () => {
  it('shows placeholder KPIs clearly labelled as demo data', async () => {
    renderApp('/dashboard');

    expect(await screen.findByRole('heading', { name: 'Dashboard', level: 3 })).toBeInTheDocument();
    expect(await screen.findByText('Total Products')).toBeInTheDocument();
    expect(screen.getByText('Low Stock')).toBeInTheDocument();
    expect(screen.getByText('Pending Purchases')).toBeInTheDocument();
    expect(screen.getByText('Pending Deliveries')).toBeInTheDocument();
    expect(screen.getAllByText('Demo data').length).toBeGreaterThan(0);
  });
});
