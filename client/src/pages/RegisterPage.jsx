import { Form, Input, Button, Typography, message } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined, UserAddOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const { Title, Text } = Typography;

/**
 * 회원가입 페이지
 * - 이름, 이메일, 비밀번호 입력
 */
const RegisterPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuthStore();

  const handleSubmit = async (values) => {
    clearError();
    const success = await register(values.email, values.password, values.name);
    if (success) {
      message.success('회원가입 성공! 환영합니다 🎉');
      navigate('/');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="auth-logo">💳</div>
          <Title level={2} style={{ color: '#E8E6F0', margin: '16px 0 4px' }}>
            CardPick 회원가입
          </Title>
          <Text style={{ color: '#9CA3AF', fontSize: 14 }}>
            카드 혜택 관리를 시작하세요
          </Text>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <Form form={form} onFinish={handleSubmit} layout="vertical" size="large">
          <Form.Item
            name="name"
            rules={[{ required: true, message: '이름을 입력해주세요.' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#9CA3AF' }} />}
              placeholder="이름"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '이메일을 입력해주세요.' },
              { type: 'email', message: '올바른 이메일 형식이 아닙니다.' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#9CA3AF' }} />}
              placeholder="이메일"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '비밀번호를 입력해주세요.' },
              { min: 6, message: '비밀번호는 최소 6자 이상이어야 합니다.' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#9CA3AF' }} />}
              placeholder="비밀번호 (6자 이상)"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '비밀번호를 다시 입력해주세요.' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('비밀번호가 일치하지 않습니다.'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#9CA3AF' }} />}
              placeholder="비밀번호 확인"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              icon={<UserAddOutlined />}
              className="auth-button"
            >
              회원가입
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
          <Text style={{ color: '#9CA3AF' }}>
            이미 계정이 있으신가요?{' '}
            <Link to="/login" style={{ color: '#7C3AED', fontWeight: 600 }}>
              로그인
            </Link>
          </Text>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
