import { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, Card, message, Divider, Space } from 'antd';
import { UserOutlined, LockOutlined, LogoutOutlined, SaveOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const { Title, Text } = Typography;

/**
 * 마이페이지 (프로필 수정)
 * - 이름 수정, 비밀번호 변경 기능 제공
 * - 하단 로그아웃 버튼 포함
 */
const ProfilePage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { user, updateProfile, logout, loading, error, clearError } = useAuthStore();

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
      });
    }
  }, [user, form]);

  const handleSubmit = async (values) => {
    clearError();
    const success = await updateProfile(values.name, values.password);
    if (success) {
      message.success('회원 정보가 수정되었습니다.');
      form.setFieldsValue({ password: '', confirmPassword: '' });
    }
  };

  const handleLogout = () => {
    logout();
    message.success('로그아웃 되었습니다.');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="page-container">
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ color: '#E8E6F0', margin: 0 }}>
          👤 내 정보 관리
        </Title>
        <Text style={{ color: '#9CA3AF', fontSize: 13 }}>
          이름과 비밀번호를 수정할 수 있습니다.
        </Text>
      </div>

      <Card
        style={{
          background: '#252238',
          border: '1px solid #3B3555',
          borderRadius: 20,
          marginBottom: 24,
        }}
        styles={{ body: { padding: '24px' } }}
      >
        {user.email && (
          <div style={{ marginBottom: 24, textAlign: 'center' }}>
            <div style={{ 
              width: 64, 
              height: 64, 
              background: 'linear-gradient(135deg, #7C3AED, #6366F1)', 
              borderRadius: '50%', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              margin: '0 auto 12px',
              fontSize: 24,
              color: 'white'
            }}>
              {user.name?.charAt(0) || 'U'}
            </div>
            <Text style={{ color: '#E8E6F0', fontSize: 18, fontWeight: 700, display: 'block' }}>
              {user.name}님
            </Text>
            <Text style={{ color: '#9CA3AF', fontSize: 14 }}>
              <MailOutlined style={{ marginRight: 4 }} /> {user.email}
            </Text>
          </div>
        )}

        {error && (
          <div className="auth-error" style={{ marginBottom: 16 }}>
            {error}
          </div>
        )}

        <Form form={form} onFinish={handleSubmit} layout="vertical" size="large">
          <Form.Item
            name="name"
            label={<Text style={{ color: '#E8E6F0' }}>이름</Text>}
            rules={[{ required: true, message: '이름을 입력해주세요.' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#9CA3AF' }} />}
              placeholder="이름"
            />
          </Form.Item>

          <Divider style={{ borderColor: '#3B3555', margin: '24px 0 16px' }}>
            <Text style={{ color: '#9CA3AF', fontSize: 13 }}>비밀번호 변경 (선택)</Text>
          </Divider>

          <Form.Item
            name="password"
            label={<Text style={{ color: '#E8E6F0' }}>새 비밀번호</Text>}
            rules={[{ min: 6, message: '비밀번호는 최소 6자 이상이어야 합니다.' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#9CA3AF' }} />}
              placeholder="변경할 때만 입력"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={<Text style={{ color: '#E8E6F0' }}>비밀번호 확인</Text>}
            dependencies={['password']}
            rules={[
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
              placeholder="한 번 더 입력"
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              icon={<SaveOutlined />}
              style={{
                height: 50,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #7C3AED, #6366F1)',
                border: 'none',
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              수정사항 저장
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Button
        type="default"
        danger
        block
        onClick={handleLogout}
        icon={<LogoutOutlined />}
        style={{
          height: 50,
          borderRadius: 12,
          background: 'transparent',
          borderColor: '#EF444433',
          borderWidth: 1,
          color: '#EF4444',
          fontWeight: 600,
        }}
      >
        로그아웃
      </Button>
    </div>
  );
};

export default ProfilePage;
