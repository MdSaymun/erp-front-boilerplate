import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderApp } from '@/test/utils';

describe('developer pattern showcase', () => {
  it('lists sample records from the mock API and navigates to a record', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/_dev/patterns/list');

    expect(
      await screen.findByRole('heading', { name: 'Sample records', level: 3 }),
    ).toBeInTheDocument();
    expect(await screen.findByText('SMP/2026/000001')).toBeInTheDocument();
    expect(screen.getByText(/1–25 of 57/)).toBeInTheDocument();

    await user.click(screen.getByText('SMP/2026/000001'));
    expect(
      await screen.findByRole('heading', { name: 'SMP/2026/000001', level: 3 }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/_dev/patterns/records/rec-1');
    expect(screen.getByRole('toolbar', { name: 'Document actions' })).toBeInTheDocument();
  });

  it('shows server validation errors on the matching fields of the form', async () => {
    const user = userEvent.setup();
    renderApp('/_dev/patterns/records/new');

    await screen.findByRole('heading', { name: 'New sample record', level: 3 });
    await user.type(screen.getByLabelText(/^Code/), 'ERR');
    await user.type(screen.getByLabelText(/^Name/), 'Server validated');
    await user.type(screen.getByLabelText('Line 1 description'), 'Something');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('This code is reserved.')).toBeInTheDocument();
  });

  it('creates a record and lands on its detail page', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/_dev/patterns/records/new');

    await screen.findByRole('heading', { name: 'New sample record', level: 3 });
    await user.type(screen.getByLabelText(/^Code/), 'NEW-1');
    await user.type(screen.getByLabelText(/^Name/), 'Created in test');
    await user.type(screen.getByLabelText('Line 1 description'), 'First line');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('heading', { name: 'NEW-1', level: 3 })).toBeInTheDocument();
    await waitFor(() =>
      expect(router.state.location.pathname).toMatch(/\/_dev\/patterns\/records\/rec-\d+$/),
    );
    const toolbar = screen.getByRole('toolbar', { name: 'Document actions' });
    expect(
      within(toolbar).getByRole('button', { name: 'Submit for approval' }),
    ).toBeInTheDocument();
  });
});
