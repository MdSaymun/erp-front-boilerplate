import { Button, Result } from 'antd';
import { Link } from 'react-router';

import { ROUTES } from '@/constants/routes';

export default function ServerErrorPage() {
  return (
    <Result
      status="500"
      title="Server error"
      subTitle="Something went wrong on our side. Please try again in a moment."
      extra={
        <Link to={ROUTES.dashboard}>
          <Button type="primary">Go to dashboard</Button>
        </Link>
      }
    />
  );
}
