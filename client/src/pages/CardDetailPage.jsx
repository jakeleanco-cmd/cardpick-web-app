import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography, Card, Button, Drawer, Form, Input, InputNumber,
  Select, Empty, Spin, message, Popconfirm,
} from 'antd';
import {
  ArrowLeftOutlined, PlusOutlined, EditOutlined,
  DeleteOutlined, CreditCardOutlined,
} from '@ant-design/icons';
import useCardStore from '../store/useCardStore';
import useBenefitStore from '../store/useBenefitStore';
import useDashboardStore from '../store/useDashboardStore';
import BenefitProgressBar from '../components/BenefitProgressBar';

const { Title, Text } = Typography;

/**
 * 카드 상세 페이지
 * - 특정 카드의 혜택 카테고리 목록
 * - 카테고리별 잔여 한도 표시
 * - 혜택 카테고리 추가/수정/삭제
 */
const CardDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingBenefit, setEditingBenefit] = useState(null);
  const [form] = Form.useForm();

  const { cards, fetchCards } = useCardStore();
  const { benefits, fetchBenefits, addBenefit, updateBenefit, deleteBenefit } = useBenefitStore();
  const { dashboard, fetchDashboard } = useDashboardStore();

  useEffect(() => {
    fetchCards();
    fetchBenefits(id);
    fetchDashboard();
  }, [id]);

  const card = cards.find((c) => c._id === id);
  // 대시보드에서 이 카드의 카테고리별 사용량 가져오기
  const cardDashboard = dashboard?.cardSummaries?.find((c) => c._id === id);

  const openAddDrawer = () => {
    setEditingBenefit(null);
    form.resetFields();
    setDrawerOpen(true);
  };

  const openEditDrawer = (benefit) => {
    setEditingBenefit(benefit);
    form.setFieldsValue({
      categoryName: benefit.categoryName,
      discountType: benefit.discountType,
      discountRate: benefit.discountRate,
      monthlyLimit: benefit.monthlyLimit,
      description: benefit.description,
    });
    setDrawerOpen(true);
  };

  const handleSave = async (values) => {
    let success;
    if (editingBenefit) {
      success = await updateBenefit(editingBenefit._id, values);
      if (success) message.success('혜택 카테고리가 수정되었습니다.');
    } else {
      success = await addBenefit({ ...values, cardId: id });
      if (success) message.success('혜택 카테고리가 등록되었습니다!');
    }

    if (success) {
      setDrawerOpen(false);
      form.resetFields();
      fetchDashboard(); // 대시보드 갱신
    }
  };

  const handleDelete = async (benefitId) => {
    const success = await deleteBenefit(benefitId);
    if (success) {
      message.success('혜택 카테고리가 삭제되었습니다.');
      fetchDashboard();
    }
  };

  if (!card) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* 뒤로가기 + 카드 정보 헤더 */}
      <div style={{ marginBottom: 20 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/cards')}
          style={{ color: '#9CA3AF', marginBottom: 8, padding: '4px 0' }}
        >
          카드 목록
        </Button>

        <Card
          style={{
            background: `linear-gradient(135deg, ${card.color}22, ${card.color}11)`,
            border: `1px solid ${card.color}44`,
            borderRadius: 16,
          }}
          styles={{ body: { padding: '16px 20px' } }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <CreditCardOutlined style={{ color: card.color, fontSize: 28 }} />
            <div>
              <Text strong style={{ fontSize: 18, color: '#E8E6F0', display: 'block' }}>
                {card.name}
              </Text>
              <Text style={{ fontSize: 13, color: '#9CA3AF' }}>
                {card.company} · 연회비 {card.annualFee?.toLocaleString() || 0}원
              </Text>
            </div>
          </div>
        </Card>
      </div>

      {/* 혜택 카테고리 헤더 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
      }}>
        <Title level={5} style={{ color: '#E8E6F0', margin: 0 }}>
          🎁 혜택 카테고리
        </Title>
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={openAddDrawer}
          style={{
            borderRadius: 8,
            background: 'linear-gradient(135deg, #7C3AED, #6366F1)',
            border: 'none',
          }}
        >
          추가
        </Button>
      </div>

      {/* 혜택 카테고리 목록 */}
      {benefits.filter((b) => (b.cardId?._id || b.cardId) === id).length === 0 ? (
        <Empty
          description="등록된 혜택 카테고리가 없습니다."
          style={{ marginTop: 40 }}
        >
          <Button type="primary" onClick={openAddDrawer}>
            혜택 카테고리 추가
          </Button>
        </Empty>
      ) : (
        benefits
          .filter((b) => (b.cardId?._id || b.cardId) === id)
          .map((benefit) => {
            // 대시보드에서 사용량 데이터 찾기
            const catData = cardDashboard?.categories?.find((c) => c._id === benefit._id);
            const used = catData?.used || 0;

            return (
              <Card
                key={benefit._id}
                style={{
                  marginBottom: 12,
                  background: '#252238',
                  border: '1px solid #3B3555',
                  borderRadius: 12,
                }}
                styles={{ body: { padding: '14px 16px' } }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 8,
                }}>
                  <div>
                    <Text strong style={{ fontSize: 14, color: '#E8E6F0' }}>
                      {benefit.categoryName}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 8 }}>
                      {benefit.discountType === 'cashback' ? '캐시백' : '할인'} {benefit.discountRate}%
                    </Text>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => openEditDrawer(benefit)}
                      style={{ color: '#9CA3AF' }}
                    />
                    <Popconfirm
                      title="삭제하시겠습니까?"
                      onConfirm={() => handleDelete(benefit._id)}
                      okText="삭제"
                      cancelText="취소"
                    >
                      <Button
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                        style={{ color: '#EF4444' }}
                      />
                    </Popconfirm>
                  </div>
                </div>

                <BenefitProgressBar
                  categoryName=""
                  used={used}
                  monthlyLimit={benefit.monthlyLimit}
                  discountType={benefit.discountType}
                />

                {benefit.description && (
                  <Text style={{ fontSize: 11, color: '#9CA3AF' }}>
                    {benefit.description}
                  </Text>
                )}
              </Card>
            );
          })
      )}

      {/* 혜택 카테고리 추가/수정 Drawer */}
      <Drawer
        title={editingBenefit ? '혜택 카테고리 수정' : '혜택 카테고리 추가'}
        placement="bottom"
        height="auto"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        styles={{
          header: { background: '#1E1B2E', borderBottom: '1px solid #3B3555' },
          body: { background: '#1E1B2E', paddingBottom: 40 },
        }}
      >
        <Form form={form} onFinish={handleSave} layout="vertical" size="large">
          <Form.Item
            name="categoryName"
            label="카테고리 이름"
            rules={[{ required: true, message: '카테고리 이름을 입력해주세요.' }]}
          >
            <Input placeholder="예: 커피, 대중교통, 온라인쇼핑" />
          </Form.Item>

          <Form.Item name="discountType" label="혜택 유형" initialValue="discount">
            <Select
              options={[
                { value: 'discount', label: '즉시 할인' },
                { value: 'cashback', label: '캐시백' },
              ]}
            />
          </Form.Item>

          <Form.Item name="discountRate" label="할인율/캐시백율 (%)">
            <InputNumber
              placeholder="10"
              style={{ width: '100%' }}
              min={0}
              max={100}
              addonAfter="%"
            />
          </Form.Item>

          <Form.Item
            name="monthlyLimit"
            label="월 한도 금액"
            rules={[{ required: true, message: '월 한도 금액을 입력해주세요.' }]}
          >
            <InputNumber
              placeholder="5,000"
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\,/g, '')}
              addonAfter="원"
            />
          </Form.Item>

          <Form.Item name="description" label="설명 (선택)">
            <Input.TextArea placeholder="스타벅스, 투썸, 이디야 등 커피 전문점" rows={2} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block className="auth-button">
              {editingBenefit ? '수정 완료' : '추가'}
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default CardDetailPage;
