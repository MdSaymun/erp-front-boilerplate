import { http, HttpResponse } from 'msw/http';
import { describe, expect, it } from 'vitest';

import { api } from '@/mocks/utils/api';
import { server } from '@/mocks/server';
import { isApiError } from '@/services/api/errors';
import { createResourceApi } from '@/services/api/resource';

interface Thing {
  id: string;
  name: string;
}

describe('createResourceApi', () => {
  const things = createResourceApi<Thing>('/things');

  it('builds list URLs from the list query contract', async () => {
    let seen = '';
    server.use(
      http.get(api('/things'), ({ request }) => {
        seen = new URL(request.url).search;
        return HttpResponse.json({
          items: [],
          page: 2,
          pageSize: 10,
          totalCount: 0,
          totalPages: 1,
        });
      }),
    );
    const result = await things.list({
      page: 2,
      pageSize: 10,
      search: 'q',
      sort: [{ field: 'name', direction: 'desc' }],
    });
    expect(seen).toBe('?page=2&pageSize=10&search=q&sort=name%3Adesc');
    expect(result.page).toBe(2);
  });

  it('sends If-Match on updates and maps 409 to a conflict error', async () => {
    let ifMatch: string | null = null;
    server.use(
      http.put(api('/things/:id'), ({ request }) => {
        ifMatch = request.headers.get('If-Match');
        return HttpResponse.json({ title: 'Conflict', status: 409 }, { status: 409 });
      }),
    );
    await expect(things.update('42', { name: 'x' }, { rowVersion: 'v7' })).rejects.toSatisfy(
      (error) => isApiError(error) && error.code === 'conflict',
    );
    expect(ifMatch).toBe('v7');
  });

  it('posts workflow actions to the actions sub-resource and encodes ids', async () => {
    let path = '';
    server.use(
      http.post(api('/things/:id/actions/:action'), ({ request }) => {
        path = new URL(request.url).pathname;
        return HttpResponse.json({ id: 'a/b', name: 'done' });
      }),
    );
    const result = await things.action('a/b', 'confirm');
    expect(path).toBe('/api/things/a%2Fb/actions/confirm');
    expect(result.name).toBe('done');
  });
});
