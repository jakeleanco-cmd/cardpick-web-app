import { useEffect } from 'react';
import { Drawer, Form, InputNumber, Input, Button, message, Typography, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { SaveOutlined } from '@ant-design/icons';
import useUsageStore from '../store/useUsageStore';

const { Text } = Typography;

/**
 * 혜택 사용 내역 수정 모달
 * - 기존 입력 데이터를 불러와 결제/혜택 금액과 메모를 수정
 */
const EditUsageModal = ({ open, onClose, usage, onSuccess }) => {
  const [form] = Form.useForm();
  const { updateUsage } = useUsageStore();

  useEffect(() => {
    if (open && usage) {
      form.setFieldsValue({
        amount: usage.amount || 0,
        benefitAmount: usage.benefitAmount,
        memo: usage.memo || '',
        date: usage.date ? dayjs(usage.date) : null,
      });
    }
  }, [open, usage, form]);

  const handleSubmit = async (values) => {
    if (!usage) return;

    const success = await updateUsage(usage._id, {
      amount: values.amount || 0,
      benefitAmount: values.benefitAmount,
      memo: values.memo || '',
      date: values.date ? values.date.toDate() : undefined,
    });

    if (success) {
      message.success('사용 내역이 수정되었습니다.');
      form.resetFields();
      onSuccess && onSuccess();
      onClose();
    }
  };

  if (!usage) return null;

  return (
    <Drawer
      title={
        <div>
          <Text strong style={{ fontSize: 16 }}>사용 내역 수정</Text>
          <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>
            {usage.cardId?.name} · {usage.benefitCategoryId?.categoryName}
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
          label="사용 일자 (선택)"
          name="date"
          tooltip="비워두시면 현재 시각으로 자동 등록됩니다."
        >
          <DatePicker 
            showTime 
            format="YYYY-MM-DD HH:mm" 
            style={{ width: '100%' }}
            placeholder="사용하신 일자와 시간을 선택하세요"
          />
        </Form.Item>

        <Form.Item
          label="결제 금액 (선택)"
          name="amount"
        >
          <InputNumber
            placeholder="결제 금액"
            style={{ width: '100%' }}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value.replace(/\,/g, '')}
            addonAfter="원"
          />
        </Form.Item>

        <Form.Item
          label="혜택 금액 (필수)"
          name="benefitAmount"
          rules={[{ required: true, message: '적용받은 혜택 금액을 입력해주세요.' }]}
        >
          <InputNumber
            placeholder="혜택 금액"
            style={{ width: '100%' }}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value.replace(/\,/g, '')}
            addonAfter="원"
          />
        </Form.Item>

        <Form.Item label="메모 (선택)" name="memo">
          <Input placeholder="어디서 사용하셨나요?" />
        </Form.Item>

        <Form.Item style={{ margin: 0, marginTop: 16 }}>
          <Button
            type="primary"
            htmlType="submit"
            block
            icon={<SaveOutlined />}
            style={{
              height: 48,
              fontSize: 16,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #7C3AED, #6366F1)',
              border: 'none',
            }}
          >
            수정 완료
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default EditUsageModal;
