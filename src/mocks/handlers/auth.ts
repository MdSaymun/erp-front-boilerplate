import { http, HttpResponse } from 'msw/http';

import { AUTH_API } from '@/services/api/endpoints/auth';
import type { LoginCredentials } from '@/types/auth';

import { mockSession, mockUser } from '../data/session';
import { api } from '../utils/api';
import { problem, validationProblem } from '../utils/problem';

/** Demo credentials for the mock API only. */
export const MOCK_LOGIN = { email: mockUser.email, password: 'Demo!Pass123' } as const;

let tokenCounter = 0;
function issueToken() {
  tokenCounter += 1;
  return {
    accessToken: `mock-access-token-${tokenCounter}`,
    expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
  };
}

export const authHandlers = [
  http.post(api(AUTH_API.login), async ({ request }) => {
    const body = (await request.json()) as Partial<LoginCredentials>;
    const errors: Record<string, string[]> = {};
    if (!body.email) errors.Email = ['Email is required.'];
    if (!body.password) errors.Password = ['Password is required.'];
    if (Object.keys(errors).length) return validationProblem(errors);
    if (body.email !== MOCK_LOGIN.email || body.password !== MOCK_LOGIN.password) {
      return problem(401, 'Invalid email or password.');
    }
    return HttpResponse.json({ ...issueToken(), session: mockSession });
  }),

  http.post(api(AUTH_API.refresh), () => HttpResponse.json(issueToken())),

  http.post(api(AUTH_API.logout), () => new HttpResponse(null, { status: 204 })),

  http.get(api(AUTH_API.session), ({ request }) => {
    const companyId = request.headers.get('X-Company-Id');
    if (companyId && !mockSession.companies.some((c) => c.id === companyId)) {
      return problem(403, 'You are not a member of the requested company.');
    }
    return HttpResponse.json({
      ...mockSession,
      currentCompanyId: companyId ?? mockSession.currentCompanyId,
    });
  }),
];
