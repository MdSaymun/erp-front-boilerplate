import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Alert, Button, Form, Input, Typography } from 'antd';

import { ROUTES } from '@/constants/routes';

/**
 * Sign-in placeholder. The form is visual only until the authentication API
 * exists; it never fakes a session.
 */
export default function LoginPage() {
  return (
    <div>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Sign in
      </Typography.Title>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Authentication is not connected yet"
        description="This page demonstrates the auth layout. Sign-in will be enabled when the backend identity service is available."
      />
      <Form layout="vertical" name="login" requiredMark={false}>
        <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
          <Input
            prefix={<MailOutlined aria-hidden />}
            autoComplete="email"
            placeholder="you@company.com"
          />
        </Form.Item>
        <Form.Item label="Password" name="password" rules={[{ required: true }]}>
          <Input.Password prefix={<LockOutlined aria-hidden />} autoComplete="current-password" />
        </Form.Item>
        <Form.Item style={{ marginBottom: 8 }}>
          <Button type="primary" htmlType="submit" block disabled>
            Sign in
          </Button>
        </Form.Item>
        <Typography.Link href={ROUTES.dashboard}>Continue to the dashboard preview</Typography.Link>
      </Form>
    </div>
  );
}
