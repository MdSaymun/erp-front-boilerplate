import { Button, Result } from 'antd';
import { isRouteErrorResponse, Link, useRouteError } from 'react-router';

import { ROUTES } from '@/constants/routes';

/** `errorElement` for the router: turns route/loader failures into safe Result pages. */
export function RouteErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return (
        <Result
          status="404"
          title="Page not found"
          subTitle="The page you are looking for does not exist or has moved."
          extra={
            <Link to={ROUTES.dashboard}>
              <Button type="primary">Go to dashboard</Button>
            </Link>
          }
        />
      );
    }
    if (error.status === 401) {
      return (
        <Result status="403" title="Sign-in required" subTitle="Please sign in to continue." />
      );
    }
    if (error.status === 403) {
      return (
        <Result
          status="403"
          title="Access denied"
          subTitle="You do not have access to this page."
        />
      );
    }
  }

  console.error('Route error', error);

  return (
    <Result
      status="500"
      title="Something went wrong"
      subTitle="The page could not be loaded."
      extra={
        <Link to={ROUTES.dashboard}>
          <Button type="primary">Go to dashboard</Button>
        </Link>
      }
    />
  );
}
