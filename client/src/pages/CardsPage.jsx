import { useState, useEffect } from 'react';
import {
  Typography, Button, Drawer, Form, Input, InputNumber,
  Select, ColorPicker, Switch, Empty, Spin, message, Popconfirm,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useCardStore from '../store/useCardStore';
import CardItem from '../components/CardItem';

const { Title, Text } = Typography;

// 카드사 목록
const CARD_COMPANIES = [
  '삼성', '현대', '신한', 'KB국민', '롯데', '하나', 'BC', 'NH농협', '우리', '씨티', '카카오뱅크', '토스뱅크', '기타',
];

// 카드 기본 컬러 팔레트
const CARD_COLORS = [
  '#6C5CE7', '#00B894', '#E17055', '#0984E3', '#FDCB6E',
  '#E84393', '#00CEC9', '#FF7675', '#6C5CE7', '#A29BFE',
];

/**
 * 카드 관리 페이지
 * - 카드 목록을 모바일 최적화 UI로 표시
 * - Drawer를 이용한 카드 추가/수정 (모바일 친화)
 * - 전월 실적 충족 토글
 */
const CardsPage = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { cards, loading, fetchCards, addCard, updateCard, deleteCard, toggleMinSpending } = useCardStore();

  useEffect(() => {
    fetchCards();
  }, []);

  // 카드 추가 Drawer 열기
  const openAddDrawer = () => {
    setEditingCard(null);
    form.resetFields();
    form.setFieldsValue({ color: CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)] });
    setDrawerOpen(true);
  };

  // 카드 수정 Drawer 열기
  const openEditDrawer = (card) => {
    setEditingCard(card);
    form.setFieldsValue({
      name: card.name,
      company: card.company,
      annualFee: card.annualFee,
      minSpending: card.minSpending,
      color: card.color,
    });
    setDrawerOpen(true);
  };

  // 카드 저장 (추가 or 수정)
  const handleSave = async (values) => {
    // ColorPicker에서 반환된 값 처리
    const color = typeof values.color === 'string'
      ? values.color
      : values.color?.toHexString?.() || '#6C5CE7';

    const cardData = { ...values, color };

    let success;
    if (editingCard) {
      success = await updateCard(editingCard._id, cardData);
      if (success) message.success('카드가 수정되었습니다.');
    } else {
      success = await addCard(cardData);
      if (success) message.success('카드가 등록되었습니다!');
    }

    if (success) {
      setDrawerOpen(false);
      form.resetFields();
    }
  };

  // 카드 삭제
  const handleDelete = async (id) => {
    const success = await deleteCard(id);
    if (success) {
      message.success('카드가 삭제되었습니다.');
      setDrawerOpen(false);
    }
  };

  // 카드 클릭 시 상세 페이지로 이동
  const handleCardClick = (card) => {
    navigate(`/cards/${card._id}`);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button
            type="text"
            icon={<LeftOutlined />}
            onClick={() => navigate('/')}
            style={{ color: '#E8E6F0', padding: 0 }}
          />
          <Title level={4} style={{ color: '#E8E6F0', margin: 0 }}>
            💳 내 카드
          </Title>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openAddDrawer}
          style={{
            borderRadius: 12,
            background: 'linear-gradient(135deg, #7C3AED, #6366F1)',
            border: 'none',
          }}
        >
          카드 추가
        </Button>
      </div>

      {/* 카드 목록 */}
      {cards.length === 0 ? (
        <Empty
          description="등록된 카드가 없습니다."
          style={{ marginTop: 60 }}
        >
          <Button type="primary" onClick={openAddDrawer}>
            첫 카드 등록하기
          </Button>
        </Empty>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {cards.map((card) => (
            <div key={card._id} style={{ position: 'relative' }}>
              <CardItem
                card={card}
                onClick={handleCardClick}
                onToggleSpending={(id, checked) => toggleMinSpending(id, checked)}
              />
              {/* 수정 버튼 */}
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  openEditDrawer(card);
                }}
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  color: '#9CA3AF',
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* 카드 추가/수정 Drawer (모바일 친화) */}
      <Drawer
        title={editingCard ? '카드 수정' : '새 카드 등록'}
        placement="bottom"
        height="auto"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        styles={{
          header: { background: '#1E1B2E', borderBottom: '1px solid #3B3555', color: '#E8E6F0' },
          body: { background: '#1E1B2E', paddingBottom: 40 },
        }}
        extra={
          editingCard && (
            <Popconfirm
              title="카드를 삭제하시겠습니까?"
              description="해당 카드의 모든 혜택과 사용 기록이 삭제됩니다."
              onConfirm={() => handleDelete(editingCard._id)}
              okText="삭제"
              cancelText="취소"
              okButtonProps={{ danger: true }}
            >
              <Button danger type="text" icon={<DeleteOutlined />}>
                삭제
              </Button>
            </Popconfirm>
          )
        }
      >
        <Form form={form} onFinish={handleSave} layout="vertical" size="large">
          <Form.Item
            name="name"
            label="카드 이름"
            rules={[{ required: true, message: '카드 이름을 입력해주세요.' }]}
          >
            <Input placeholder="예: 삼성카드 taptap O" />
          </Form.Item>

          <Form.Item
            name="company"
            label="카드사"
            rules={[{ required: true, message: '카드사를 선택해주세요.' }]}
          >
            <Select
              placeholder="카드사 선택"
              options={CARD_COMPANIES.map((c) => ({ value: c, label: c }))}
            />
          </Form.Item>

          <Form.Item name="annualFee" label="연회비 (원)">
            <InputNumber
              placeholder="0"
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\,/g, '')}
              addonAfter="원"
            />
          </Form.Item>

          <Form.Item name="minSpending" label="전월 실적 기준 (원)">
            <InputNumber
              placeholder="300,000"
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\,/g, '')}
              addonAfter="원"
            />
          </Form.Item>

          <Form.Item name="color" label="카드 컬러">
            <ColorPicker
              presets={[{ label: '추천 컬러', colors: CARD_COLORS }]}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              className="auth-button"
            >
              {editingCard ? '수정 완료' : '카드 등록'}
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default CardsPage;
