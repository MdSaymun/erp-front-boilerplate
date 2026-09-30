import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderApp } from '@/test/utils';

describe('Sidebar navigation', () => {
  it('navigates to a module placeholder when a menu item is clicked', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/dashboard');
    await screen.findByRole('heading', { name: 'Dashboard', level: 3 });

    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    await user.click(within(nav).getByText('POS'));

    expect(await screen.findByRole('heading', { name: 'POS', level: 3 })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/pos');
  });

  it('expands a section and navigates to a nested item', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/dashboard');
    await screen.findByRole('heading', { name: 'Dashboard', level: 3 });

    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    await user.click(within(nav).getByText('Inventory'));
    await user.click(await within(nav).findByText('Products'));

    expect(await screen.findByRole('heading', { name: 'Products', level: 3 })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/products');
  });

  it('marks the item matching the current route as selected', async () => {
    renderApp('/warehouses');
    await screen.findByRole('heading', { name: 'Warehouses', level: 3 });

    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    const warehousesItem = within(nav).getByText('Warehouses').closest('li');
    const dashboardItem = within(nav).getByText('Dashboard').closest('li');

    expect(warehousesItem).toHaveClass('ant-menu-item-selected');
    expect(dashboardItem).not.toHaveClass('ant-menu-item-selected');
  });
});
