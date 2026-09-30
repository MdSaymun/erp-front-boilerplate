import { Button, Result } from 'antd';
import { Link } from 'react-router';

import { ROUTES } from '@/constants/routes';

export default function NotFoundPage() {
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
