import { http, HttpResponse } from 'msw/http';
import { beforeEach, describe, expect, it } from 'vitest';

import { api } from '@/mocks/utils/api';
import { mockSession } from '@/mocks/data/session';
import { server } from '@/mocks/server';
import { http as client } from '@/services/api/client';
import { AUTH_API } from '@/services/api/endpoints/auth';
import { isApiError } from '@/services/api/errors';
import { useAuthStore } from '@/stores/authStore';

describe('token refresh interceptor', () => {
  beforeEach(() => {
    useAuthStore.getState().setSession(mockSession, 'stale-token');
  });

  it('refreshes once for concurrent 401s and retries every request with the new token', async () => {
    let refreshCalls = 0;
    const tokensSeen: string[] = [];
    server.use(
      http.post(api(AUTH_API.refresh), () => {
        refreshCalls += 1;
        return HttpResponse.json({
          accessToken: 'fresh-token',
          expiresAt: new Date().toISOString(),
        });
      }),
      http.get(api('/protected/:n'), ({ request }) => {
        const token = request.headers.get('Authorization') ?? '';
        tokensSeen.push(token);
        if (token === 'Bearer stale-token')
          return HttpResponse.json({ title: 'Unauthorized', status: 401 }, { status: 401 });
        return HttpResponse.json({ ok: true });
      }),
    );

    const results = await Promise.all([
      client.get('/protected/1'),
      client.get('/protected/2'),
      client.get('/protected/3'),
    ]);

    expect(results).toEqual([{ ok: true }, { ok: true }, { ok: true }]);
    expect(refreshCalls).toBe(1);
    expect(tokensSeen.filter((t) => t === 'Bearer fresh-token')).toHaveLength(3);
    expect(useAuthStore.getState().accessToken).toBe('fresh-token');
  });

  it('clears the session when the refresh itself fails', async () => {
    server.use(
      http.post(api(AUTH_API.refresh), () =>
        HttpResponse.json({ title: 'Unauthorized', status: 401 }, { status: 401 }),
      ),
      http.get(api('/protected/x'), () =>
        HttpResponse.json({ title: 'Unauthorized', status: 401 }, { status: 401 }),
      ),
    );

    await expect(client.get('/protected/x')).rejects.toSatisfy(
      (error) => isApiError(error) && error.code === 'unauthorized',
    );
    expect(useAuthStore.getState().status).toBe('anonymous');
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('does not attempt a refresh for anonymous callers', async () => {
    useAuthStore.getState().clearSession();
    let refreshCalls = 0;
    server.use(
      http.post(api(AUTH_API.refresh), () => {
        refreshCalls += 1;
        return HttpResponse.json({ accessToken: 'x', expiresAt: '' });
      }),
      http.get(api('/protected/y'), () =>
        HttpResponse.json({ title: 'Unauthorized', status: 401 }, { status: 401 }),
      ),
    );

    await expect(client.get('/protected/y')).rejects.toSatisfy(
      (error) => isApiError(error) && error.code === 'unauthorized',
    );
    expect(refreshCalls).toBe(0);
  });
});
