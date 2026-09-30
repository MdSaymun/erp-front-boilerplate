import { HomeOutlined } from '@ant-design/icons';
import { Breadcrumb } from 'antd';
import { Link, useMatches } from 'react-router';

import { isRouteHandle } from '@/app/router/routeHandle';
import { ROUTES } from '@/constants/routes';

/** Builds breadcrumbs from route `handle.breadcrumb` metadata. */
export function AppBreadcrumb() {
  const matches = useMatches();

  const crumbs = matches
    .filter((match) => isRouteHandle(match.handle) && match.handle.breadcrumb)
    .map((match, index, all) => {
      const label = isRouteHandle(match.handle) ? match.handle.breadcrumb : undefined;
      const isLast = index === all.length - 1;
      return {
        key: match.id,
        title: isLast ? (
          <span aria-current="page">{label}</span>
        ) : (
          <Link to={match.pathname}>{label}</Link>
        ),
      };
    });

  const items = [
    {
      key: 'home',
      title: (
        <Link to={ROUTES.dashboard} aria-label="Dashboard">
          <HomeOutlined />
        </Link>
      ),
    },
    ...crumbs,
  ];

  return <Breadcrumb items={items} aria-label="Breadcrumb" />;
}
