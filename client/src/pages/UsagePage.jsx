import { useEffect, useState } from 'react';
import { Typography, Card, List, Empty, Spin, Button, Popconfirm, Tag, message, DatePicker } from 'antd';
import { DeleteOutlined, EditOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import useUsageStore from '../store/useUsageStore';
import useDashboardStore from '../store/useDashboardStore';
import QuickUsageForm from '../components/QuickUsageForm';
import EditUsageModal from '../components/EditUsageModal';

const { Title, Text } = Typography;

/**
 * 사용 기록 페이지
 * - 빠른 혜택 사용 입력 폼
 * - 이번 달 사용 기록 리스트
 * - 사용 기록 삭제 기능
 */
const UsagePage = () => {
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const { usages, loading, fetchUsages, deleteUsage } = useUsageStore();
  const { fetchDashboard } = useDashboardStore();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUsage, setSelectedUsage] = useState(null);

  useEffect(() => {
    fetchUsages(selectedMonth.year(), selectedMonth.month() + 1);
  }, [selectedMonth]);

  // 사용 기록 등록/수정 성공 시
  const handleUsageSuccess = () => {
    fetchUsages(selectedMonth.year(), selectedMonth.month() + 1);
    fetchDashboard(); // 대시보드도 갱신
  };

  const openEditModal = (usage) => {
    setSelectedUsage(usage);
    setEditModalOpen(true);
  };

  // 사용 기록 삭제
  const handleDelete = async (id) => {
    const success = await deleteUsage(id);
    if (success) {
      message.success('사용 기록이 삭제되었습니다.');
      fetchDashboard();
    }
  };

  return (
    <div className="page-container">
      {/* 빠른 입력 폼 */}
      <Card
        style={{
          marginBottom: 20,
          background: 'linear-gradient(135deg, #252238, #1E1B2E)',
          border: '1px solid #3B3555',
          borderRadius: 16,
        }}
        styles={{ body: { padding: '20px' } }}
      >
        <Title level={5} style={{ color: '#E8E6F0', marginBottom: 16 }}>
          ⚡ 혜택 사용 기록
        </Title>
        <QuickUsageForm onSuccess={handleUsageSuccess} />
      </Card>

      {/* 사용 기록 리스트 헤더 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
      }}>
        <Title level={5} style={{ color: '#E8E6F0', margin: 0 }}>
          📋 사용 내역
        </Title>
        <DatePicker
          picker="month"
          value={selectedMonth}
          onChange={(date) => date && setSelectedMonth(date)}
          format="YYYY년 MM월"
          style={{
            background: '#252238',
            borderColor: '#3B3555',
            borderRadius: 8,
          }}
          allowClear={false}
        />
      </div>

      {/* 사용 기록 리스트 */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin />
        </div>
      ) : usages.length === 0 ? (
        <Empty description="이번 달 사용 기록이 없습니다." style={{ marginTop: 40 }} />
      ) : (
        <List
          dataSource={usages}
          renderItem={(usage) => (
            <Card
              key={usage._id}
              style={{
                marginBottom: 8,
                background: '#252238',
                border: '1px solid #3B3555',
                borderRadius: 12,
              }}
              styles={{ body: { padding: '12px 16px' } }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Text strong style={{ fontSize: 14, color: '#E8E6F0' }}>
                      {usage.benefitCategoryId?.categoryName || '알 수 없음'}
                    </Text>
                    <Tag
                      color={usage.benefitCategoryId?.discountType === 'cashback' ? 'cyan' : 'purple'}
                      style={{ margin: 0, fontSize: 11 }}
                    >
                      {usage.benefitCategoryId?.discountType === 'cashback' ? '캐시백' : '할인'}
                    </Tag>
                  </div>
                  <Text style={{ fontSize: 12, color: '#9CA3AF' }}>
                    {usage.cardId?.name} · {dayjs(usage.date).format('MM/DD')}
                    {usage.memo && ` · ${usage.memo}`}
                  </Text>
                  <div style={{ marginTop: 4 }}>
                    <Text style={{ fontSize: 13, color: '#9CA3AF' }}>
                      결제 {usage.amount?.toLocaleString()}원 →{' '}
                    </Text>
                    <Text strong style={{ fontSize: 14, color: '#10B981' }}>
                      혜택 {usage.benefitAmount?.toLocaleString()}원
                    </Text>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    style={{ color: '#9CA3AF' }}
                    onClick={() => openEditModal(usage)}
                  />
                  <Popconfirm
                    title="삭제하시겠습니까?"
                    onConfirm={() => handleDelete(usage._id)}
                    okText="삭제"
                    cancelText="취소"
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
            </Card>
          )}
        />
      )}

      {/* 내역 수정 모달 */}
      <EditUsageModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        usage={selectedUsage}
        onSuccess={handleUsageSuccess}
      />
    </div>
  );
};

export default UsagePage;
