import { Button, Result } from 'antd';
import { Link } from 'react-router';

import { ROUTES } from '@/constants/routes';

export default function UnauthorizedPage() {
  return (
    <Result
      status="403"
      title="Sign-in required"
      subTitle="Your session has expired or you are not signed in."
      extra={
        <Link to={ROUTES.dashboard}>
          <Button type="primary">Go to dashboard</Button>
        </Link>
      }
    />
  );
}
