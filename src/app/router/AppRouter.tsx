import { createBrowserRouter, RouterProvider } from 'react-router';

import { routes } from './routes';

/** Created once at module scope; never inside a component or React state. */
export const router = createBrowserRouter(routes);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
