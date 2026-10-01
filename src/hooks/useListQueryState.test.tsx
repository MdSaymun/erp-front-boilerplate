import { act, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router';
import { describe, expect, it } from 'vitest';

import { useListQueryState } from '@/hooks/useListQueryState';

function createWrapper(initialPath: string) {
  let router: ReturnType<typeof createMemoryRouter> | undefined;
  const Wrapper = ({ children }: PropsWithChildren) => {
    router = createMemoryRouter([{ path: '/list', element: <>{children}</> }], {
      initialEntries: [initialPath],
    });
    return <RouterProvider router={router} />;
  };
  return { Wrapper, location: () => router?.state.location };
}

describe('useListQueryState', () => {
  it('derives the query from the URL and writes changes back, preserving other params', () => {
    const { Wrapper, location } = createWrapper('/list?page=2&sort=name:desc&tab=lines');
    const { result } = renderHook(() => ({ state: useListQueryState(), loc: useLocation() }), {
      wrapper: Wrapper,
    });

    expect(result.current.state.query).toEqual({
      page: 2,
      pageSize: 25,
      sort: [{ field: 'name', direction: 'desc' }],
    });

    act(() => result.current.state.setSearch('abc'));

    expect(result.current.state.query.search).toBe('abc');
    expect(result.current.state.query.page).toBe(1);
    const search = new URLSearchParams(location()?.search);
    expect(search.get('tab')).toBe('lines');
    expect(search.get('search')).toBe('abc');
    expect(search.get('sort')).toBe('name:desc');
  });
});
