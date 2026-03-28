import { useState, useEffect } from 'react';
import { Drawer, Form, InputNumber, Input, Button, message, Typography, Divider, List, Popconfirm, Spin, Empty, DatePicker } from 'antd';
import { ThunderboltOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import EditUsageModal from './EditUsageModal';
import dayjs from 'dayjs';
import useUsageStore from '../store/useUsageStore';
import api from '../api/axios';

const { Text } = Typography;

/**
 * 빠른 혜택 사용 입력 모달 (바텀 시트 형식)
 * - 폼 입력 하단에 카테고리별 이번 달 기존 사용 내역 리스트 표출 기능 추가
 */
const DirectUsageModal = ({ open, onClose, card, category, onSuccess }) => {
  const [form] = Form.useForm();
  const { addUsage, deleteUsage } = useUsageStore();
  
  // 현재 카드/카테고리의 이번 달 사용 내역 상태
  const [recentUsages, setRecentUsages] = useState([]);
  const [loadingUsages, setLoadingUsages] = useState(false);

  // 수정 모달 상태
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUsageForEdit, setSelectedUsageForEdit] = useState(null);

  // 이번 달 내역 불러오기
  const loadCategoryUsages = async () => {
    if (!card || !category) return;
    try {
      setLoadingUsages(true);
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      
      const res = await api.get('/usages', {
        params: { year, month, cardId: card._id },
      });
      
      // 카테고리로 필터링 (조회된 내역은 시간 역순 정렬되어 옴)
      const filtered = res.data.filter(
        (u) => (u.benefitCategoryId._id || u.benefitCategoryId) === category._id
      );
      setRecentUsages(filtered);
    } catch (e) {
      console.error('사용 내역 로드 실패', e);
    } finally {
      setLoadingUsages(false);
    }
  };

  useEffect(() => {
    if (open) {
      form.resetFields();
      loadCategoryUsages();
    }
  }, [open, form, card, category]);

  // 사용 기록 추가
  const handleSubmit = async (values) => {
    if (!card || !category) return;

    const success = await addUsage({
      cardId: card._id,
      benefitCategoryId: category._id,
      amount: values.amount || 0,
      benefitAmount: values.benefitAmount,
      memo: values.memo || '',
      date: values.date ? values.date.toDate() : undefined,
    });

    if (success) {
      message.success('혜택 사용이 기록되었습니다!');
      form.resetFields();
      onSuccess && onSuccess();
      // 방금 등록한 내역이 보이도록 리스트 최신화 
      loadCategoryUsages();
      // UX: 창을 닫지 않고 아래에 기록이 남는 걸 자연스레 볼지, 닫을지는 선택이지만 창 유지가 직관성에 어울립니다.
      // 닫길 원하신다면 여기서 onClose() 
    }
  };

  // 기존 내역 삭제 
  const handleDelete = async (usageId) => {
    const success = await deleteUsage(usageId);
    if (success) {
      message.success('내역이 삭제되었습니다.');
      onSuccess && onSuccess(); // 대시보드 쪽(한도 프로그레스바) 재계산을 위해
      // 로컬 리스트에서도 제거
      loadCategoryUsages();
    }
  };

  if (!card || !category) return null;

  const handleEditClick = (usage) => {
    setSelectedUsageForEdit(usage);
    setEditModalOpen(true);
  };

  return (
    <>
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
      height="85vh" // 높이를 조금 넉넉하게 
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
            placeholder="사용 일자 및 시간을 선택하세요"
          />
        </Form.Item>

        <Form.Item label="결제 금액 (선택)" name="amount">
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

        <Form.Item label="메모 (선택)" name="memo" style={{ marginBottom: 16 }}>
          <Input placeholder="어디서 사용하셨나요?" />
        </Form.Item>

        <Form.Item style={{ margin: 0, marginBottom: 8 }}>
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

      <Divider style={{ borderColor: '#3B3555', margin: '24px 0' }}>
        <Text style={{ fontSize: 12, color: '#9CA3AF' }}>이번 달 {category.categoryName} 내역</Text>
      </Divider>

      {/* 이번 달 해당 카테고리 내역 리스트 */}
      {loadingUsages ? (
        <div style={{ textAlign: 'center', padding: 20 }}><Spin /></div>
      ) : recentUsages.length === 0 ? (
        <Empty 
          description="이번 달 내역이 없습니다." 
          imageStyle={{ height: 60 }} 
          style={{ marginTop: 20 }}
        />
      ) : (
        <List
          dataSource={recentUsages}
          renderItem={(usage) => (
            <div
              key={usage._id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                marginBottom: 8,
                background: '#252238',
                borderRadius: 12,
                border: '1px solid #3B3555',
              }}
            >
              <div style={{ flex: 1, paddingRight: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text strong style={{ fontSize: 13, color: '#E8E6F0' }}>
                    혜택 {usage.benefitAmount?.toLocaleString()}원
                  </Text>
                  <Text style={{ fontSize: 11, color: '#9CA3AF' }}>
                    {dayjs(usage.date).format('MM/DD HH:mm')}
                  </Text>
                </div>
                <Text style={{ fontSize: 12, color: '#9CA3AF' }}>
                  {usage.amount > 0 ? `결제 ${usage.amount.toLocaleString()}원 ` : ''} 
                  {usage.memo && `· ${usage.memo}`}
                </Text>
              </div>
              
              <div style={{ display: 'flex', gap: 4 }}>
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  style={{ color: '#9CA3AF' }}
                  onClick={() => handleEditClick(usage)}
                />
                <Popconfirm
                  title="삭제하시겠습니까?"
                  onConfirm={() => handleDelete(usage._id)}
                  okText="삭제"
                  cancelText="취소"
                  placement="topRight"
                >
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                  />
                </Popconfirm>
              </div>
            </div>
          )}
        />
      )}
    </Drawer>

      {/* 혜택 내역 수정용 모달 */}
      <EditUsageModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        usage={selectedUsageForEdit}
        onSuccess={() => {
          // 수정 성공 시 대시보드 쪽 프로그레스바 수치 재계산을 위해 호출
          onSuccess && onSuccess();
          // 현재 모달 내의 리스트도 최신화
          loadCategoryUsages();
        }}
      />
    </>
  );
};

export default DirectUsageModal;
