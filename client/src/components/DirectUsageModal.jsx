import { useEffect } from 'react';
import { Drawer, Form, InputNumber, Input, Button, message, Typography } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import useUsageStore from '../store/useUsageStore';

const { Text } = Typography;

/**
 * 빠른 혜택 사용 입력 모달 (바텀 시트 형식)
 * - 카드와 카테고리가 이미 선택된 상태로 렌더링
 * - 자동 계산 제외, 사용자가 직접 혜택 금액 변경 가능
 */
const DirectUsageModal = ({ open, onClose, card, category, onSuccess }) => {
  const [form] = Form.useForm();
  const { addUsage } = useUsageStore();

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleSubmit = async (values) => {
    if (!card || !category) return;

    const success = await addUsage({
      cardId: card._id,
      benefitCategoryId: category._id,
      amount: values.amount || 0,
      benefitAmount: values.benefitAmount,
      memo: values.memo || '',
    });

    if (success) {
      message.success('혜택 사용이 기록되었습니다!');
      form.resetFields();
      onSuccess && onSuccess();
      onClose();
    }
  };

  if (!card || !category) return null;

  return (
    <Drawer
      title={
        <div>
          <Text strong style={{ fontSize: 16 }}>{category.categoryName} 사용 기록</Text>
          <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>
            {card.name} ({category.discountType === 'cashback' ? '캐시백' : '할인'} {category.discountRate}%)
          </div>
        </div>
      }
      placement="bottom"
      height="auto"
      open={open}
      onClose={onClose}
      styles={{
        header: { background: '#1E1B2E', borderBottom: '1px solid #3B3555' },
        body: { background: '#1E1B2E', paddingBottom: 40 },
      }}
    >
      <Form form={form} onFinish={handleSubmit} layout="vertical" size="large">
        <Form.Item
          label="결제 금액 (선택)"
          name="amount"
        >
          <InputNumber
            placeholder="결제 금액 입력"
            style={{ width: '100%' }}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value.replace(/\,/g, '')}
            addonAfter="원"
          />
        </Form.Item>

        <Form.Item
          label="혜택 금액 (필수)"
          name="benefitAmount"
          rules={[{ required: true, message: '받은 혜택 금액을 입력해주세요.' }]}
        >
          <InputNumber
            placeholder="할인 또는 캐시백 금액 직접 입력"
            style={{ width: '100%' }}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value.replace(/\,/g, '')}
            addonAfter="원"
          />
        </Form.Item>

        <Form.Item label="메모 (선택)" name="memo">
          <Input placeholder="예: 스타벅스 아메리카노" />
        </Form.Item>

        <Form.Item style={{ margin: 0, marginTop: 16 }}>
          <Button
            type="primary"
            htmlType="submit"
            block
            icon={<ThunderboltOutlined />}
            style={{
              height: 48,
              fontSize: 16,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #7C3AED, #6366F1)',
              border: 'none',
            }}
          >
            기록하기
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default DirectUsageModal;
