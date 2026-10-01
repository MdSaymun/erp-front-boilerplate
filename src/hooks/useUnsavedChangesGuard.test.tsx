import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { createMemoryRouter, Link, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';

import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { renderWithProviders } from '@/test/utils';

function DirtyPage() {
  const [dirty, setDirty] = useState(true);
  const { allowNext } = useUnsavedChangesGuard(dirty);
  return (
    <div>
      <span>editing</span>
      <button onClick={() => setDirty(false)}>clean</button>
      <button onClick={allowNext}>allow</button>
      <Link to="/other">leave</Link>
    </div>
  );
}

function renderGuard() {
  const router = createMemoryRouter(
    [
      { path: '/form', element: <DirtyPage /> },
      { path: '/other', element: <span>other page</span> },
    ],
    { initialEntries: ['/form'] },
  );
  renderWithProviders(<RouterProvider router={router} />);
  return router;
}

describe('useUnsavedChangesGuard', () => {
  it('blocks navigation while dirty and stays when the user keeps editing', async () => {
    const user = userEvent.setup();
    const router = renderGuard();

    await user.click(screen.getByRole('link', { name: 'leave' }));
    const keep = await screen.findByRole('button', { name: 'Keep editing' });
    expect(screen.getAllByText('Discard unsaved changes?').length).toBeGreaterThan(0);

    await user.click(keep);
    expect(router.state.location.pathname).toBe('/form');
    expect(screen.getByText('editing')).toBeInTheDocument();
  });

  it('proceeds when the user discards changes', async () => {
    const user = userEvent.setup();
    const router = renderGuard();

    await user.click(screen.getByRole('link', { name: 'leave' }));
    await user.click(await screen.findByRole('button', { name: 'Discard' }));

    expect(await screen.findByText('other page')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/other');
  });

  it('does not block after allowNext (post-save navigation)', async () => {
    const user = userEvent.setup();
    const router = renderGuard();

    await user.click(screen.getByRole('button', { name: 'allow' }));
    await user.click(screen.getByRole('link', { name: 'leave' }));

    expect(await screen.findByText('other page')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/other');
  });
});
