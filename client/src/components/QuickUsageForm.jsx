import { useState, useEffect } from 'react';
import { Form, Select, InputNumber, Input, Button, message } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import useCardStore from '../store/useCardStore';
import useBenefitStore from '../store/useBenefitStore';
import useUsageStore from '../store/useUsageStore';

/**
 * 빠른 혜택 사용 입력 폼
 * - 카드 선택 → 카테고리 선택 → 금액 입력의 3단계 폼
 * - 카테고리 선택 시 할인율에 따라 혜택 금액 자동 계산
 */
const QuickUsageForm = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [selectedBenefit, setSelectedBenefit] = useState(null);
  const { cards, fetchCards } = useCardStore();
  const { benefits, fetchBenefits } = useBenefitStore();
  const { addUsage } = useUsageStore();

  useEffect(() => {
    fetchCards();
  }, []);

  // 카드 선택 시 해당 카드의 혜택 카테고리 로드
  const handleCardChange = (cardId) => {
    setSelectedCardId(cardId);
    setSelectedBenefit(null);
    form.setFieldsValue({ benefitCategoryId: undefined, amount: undefined, benefitAmount: undefined });
    fetchBenefits(cardId);
  };

  // 카테고리 선택 시 할인율 정보 저장
  const handleBenefitChange = (benefitId) => {
    const benefit = benefits.find((b) => b._id === benefitId);
    setSelectedBenefit(benefit);
    // 이미 입력된 금액이 있으면 혜택 금액 자동 계산
    const amount = form.getFieldValue('amount');
    if (amount && benefit) {
      const benefitAmount = Math.round(amount * (benefit.discountRate / 100));
      form.setFieldsValue({ benefitAmount });
    }
  };

  // 결제 금액 변경 시 혜택 금액 자동 계산
  const handleAmountChange = (amount) => {
    if (amount && selectedBenefit) {
      const benefitAmount = Math.round(amount * (selectedBenefit.discountRate / 100));
      form.setFieldsValue({ benefitAmount });
    }
  };

  const handleSubmit = async (values) => {
    const success = await addUsage({
      cardId: values.cardId,
      benefitCategoryId: values.benefitCategoryId,
      amount: values.amount,
      benefitAmount: values.benefitAmount,
      memo: values.memo || '',
      date: dayjs().startOf('day').toISOString(),
    });

    if (success) {
      message.success('혜택 사용이 기록되었습니다!');
      form.resetFields();
      setSelectedCardId(null);
      setSelectedBenefit(null);
      onSuccess && onSuccess();
    }
  };

  // 활성 카드만 표시 (실적 충족 카드)
  const activeCards = cards.filter((c) => c.isMinSpendingMet);

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical" size="large">
      {/* 카드 선택 */}
      <Form.Item
        label="카드 선택"
        name="cardId"
        rules={[{ required: true, message: '카드를 선택해주세요.' }]}
      >
        <Select
          placeholder="카드를 선택하세요"
          onChange={handleCardChange}
          options={activeCards.map((card) => ({
            value: card._id,
            label: `${card.name} (${card.company})`,
          }))}
        />
      </Form.Item>

      {/* 혜택 카테고리 선택 */}
      <Form.Item
        label="혜택 카테고리"
        name="benefitCategoryId"
        rules={[{ required: true, message: '카테고리를 선택해주세요.' }]}
      >
        <Select
          placeholder={selectedCardId ? '카테고리를 선택하세요' : '먼저 카드를 선택하세요'}
          disabled={!selectedCardId}
          onChange={handleBenefitChange}
          options={benefits
            .filter((b) => b.cardId?._id === selectedCardId || b.cardId === selectedCardId)
            .map((b) => ({
              value: b._id,
              label: `${b.categoryName} (${b.discountType === 'cashback' ? '캐시백' : '할인'} ${b.discountRate}%)`,
            }))}
        />
      </Form.Item>

      {/* 결제 금액 */}
      <Form.Item
        label="결제 금액"
        name="amount"
        rules={[{ required: true, message: '결제 금액을 입력해주세요.' }]}
      >
        <InputNumber
          placeholder="결제 금액"
          style={{ width: '100%' }}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => value.replace(/\,/g, '')}
          addonAfter="원"
          onChange={handleAmountChange}
        />
      </Form.Item>

      {/* 혜택 금액 (자동 계산 but 수정 가능) */}
      <Form.Item
        label="혜택 금액 (할인/캐시백)"
        name="benefitAmount"
        rules={[{ required: true, message: '혜택 금액을 입력해주세요.' }]}
      >
        <InputNumber
          placeholder="혜택 금액"
          style={{ width: '100%' }}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => value.replace(/\,/g, '')}
          addonAfter="원"
        />
      </Form.Item>

      {/* 메모 */}
      <Form.Item label="메모 (선택)" name="memo">
        <Input placeholder="예: 스타벅스 아메리카노" />
      </Form.Item>

      <Form.Item>
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
          혜택 기록하기
        </Button>
      </Form.Item>
    </Form>
  );
};

export default QuickUsageForm;
