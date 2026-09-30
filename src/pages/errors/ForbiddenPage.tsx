import { Button, Result } from 'antd';
import { Link } from 'react-router';

import { ROUTES } from '@/constants/routes';

export default function ForbiddenPage() {
  return (
    <Result
      status="403"
      title="Access denied"
      subTitle="You do not have permission to view this page. Contact your administrator if you believe this is a mistake."
      extra={
        <Link to={ROUTES.dashboard}>
          <Button type="primary">Go to dashboard</Button>
        </Link>
      }
    />
  );
}
