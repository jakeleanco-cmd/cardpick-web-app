import { useState } from 'react';
import { Form, Input, Button, Typography, message, Space, Divider } from 'antd';
import { MailOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const { Title, Text } = Typography;

/**
 * 로그인 페이지
 * - 이메일 + 비밀번호 로그인
 * - 프리미엄 다크 UI, 모바일 최적화
 */
const LoginPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuthStore();

  const handleSubmit = async (values) => {
    clearError();
    const success = await login(values.email, values.password);
    if (success) {
      message.success('로그인 성공!');
      navigate('/');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* 로고 영역 */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="auth-logo">💳</div>
          <Title level={2} style={{ color: '#E8E6F0', margin: '16px 0 4px' }}>
            CardPick
          </Title>
          <Text style={{ color: '#9CA3AF', fontSize: 14 }}>
            신용카드 혜택을 빠짐없이 챙기세요
          </Text>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {/* 로그인 폼 */}
        <Form form={form} onFinish={handleSubmit} layout="vertical" size="large">
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
            rules={[{ required: true, message: '비밀번호를 입력해주세요.' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#9CA3AF' }} />}
              placeholder="비밀번호"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              icon={<LoginOutlined />}
              className="auth-button"
            >
              로그인
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ borderColor: '#3B3555' }}>
          <Text style={{ color: '#9CA3AF', fontSize: 13 }}>처음이신가요?</Text>
        </Divider>

        <div style={{ textAlign: 'center' }}>
          <Button 
            type="default" 
            block 
            onClick={() => navigate('/register')}
            style={{ 
              height: 48, 
              borderRadius: 12, 
              background: 'transparent',
              borderColor: '#7C3AED',
              color: '#7C3AED',
              fontWeight: 600
            }}
          >
            신규 회원가입
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
