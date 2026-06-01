import { useState } from 'react';
import { Form, Input, Button, Alert, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLoginMutation } from './services/loginQueries.js';
import { useAuthStore } from '../../auth/authStore.js';
import styles from './login.module.scss';

const { Title, Text } = Typography;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);
  const loginMutation = useLoginMutation();
  const [errorMsg, setErrorMsg] = useState('');

  const redirectTo = location.state?.from?.pathname || '/dashboard';

  const handleFinish = async (values) => {
    setErrorMsg('');
    try {
      const data = await loginMutation.mutateAsync(values);
      setAuth({ user: data.user, token: data.token });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message || 'Invalid credentials. Try again.';
      setErrorMsg(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.bgGlow} />
      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.logo}>P</div>
          <Title level={3} className={styles.brandText}>
            Patternlab
          </Title>
        </div>
        <Title level={2} className={styles.welcome}>
          Welcome back
        </Title>
        <Text type="secondary" className={styles.hint}>
          Sign in with <strong>admin</strong> / <strong>admin@123</strong>
        </Text>

        {errorMsg && (
          <Alert
            type="error"
            message={errorMsg}
            showIcon
            className={styles.alert}
          />
        )}

        <Form
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{ username: '', password: '' }}
          className={styles.form}
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Username is required' }]}
          >
            <Input
              size="large"
              prefix={<UserOutlined />}
              placeholder="admin"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Password is required' }]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder="admin@123"
              autoComplete="current-password"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loginMutation.isPending}
            className={styles.submit}
          >
            Sign in
          </Button>
        </Form>
      </div>
    </div>
  );
}
