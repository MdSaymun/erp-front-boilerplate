import { Typography } from 'antd';
import { Link } from 'react-router';

import { ROUTES } from '@/constants/routes';

export default function DemoNotesWidget() {
  return (
    <Typography.Paragraph style={{ margin: 0 }}>
      Widgets are contributed by modules through the widget registry. Explore the shared UI patterns
      under <Link to={ROUTES.devPatterns}>Developer → Patterns</Link>.
    </Typography.Paragraph>
  );
}
