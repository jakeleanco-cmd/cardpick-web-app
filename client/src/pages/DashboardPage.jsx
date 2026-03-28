import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Card, Row, Col, Spin, Empty, Alert, Space, Button } from 'antd';
import { WarningOutlined, FireOutlined, TrophyOutlined, RightOutlined } from '@ant-design/icons';
import useDashboardStore from '../store/useDashboardStore';
import BenefitProgressBar from '../components/BenefitProgressBar';
import PickingRateGauge from '../components/PickingRateGauge';
import DirectUsageModal from '../components/DirectUsageModal';

const { Title, Text } = Typography;

/**
 * 대시보드 페이지 (메인)
 * - 이번 달 혜택 현황 요약
 * - 카드별 혜택 잔여 한도 프로그레스 바
 * - 전체 피킹률 게이지
 * - 실적 미달 카드 경고
 */
const DashboardPage = () => {
  const { dashboard, loading, fetchDashboard } = useDashboardStore();
  const navigate = useNavigate();

  // 바텀 시트 (DirectUsageModal) 상태
  const [usageModalOpen, setUsageModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleOpenUsageModal = (card, category) => {
    setSelectedCard(card);
    setSelectedCategory(category);
    setUsageModalOpen(true);
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <Empty
        description="데이터를 불러오는 중..."
        style={{ marginTop: 60 }}
      />
    );
  }

  const { year, month, totalLimit, totalUsed, overallPickingRate, unmetCards, cardSummaries } = dashboard;

  return (
    <div className="page-container">
      {/* 헤더 */}
      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ color: '#E8E6F0', margin: 0 }}>
          📊 {month}월 혜택 현황
        </Title>
        <Text style={{ color: '#9CA3AF', fontSize: 13 }}>
          {year}년 {month}월 신용카드 혜택 사용 현황
        </Text>
      </div>

      {/* 실적 미달 카드 경고 */}
      {unmetCards > 0 && (
        <Alert
          message={`⚠️ 전월 실적 미달 카드 ${unmetCards}장`}
          description="실적 미달 카드의 혜택은 비활성화 상태입니다. 카드 관리에서 실적 충족 여부를 업데이트해주세요."
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          style={{
            marginBottom: 16,
            borderRadius: 12,
            background: '#F59E0B11',
            border: '1px solid #F59E0B33',
          }}
        />
      )}

      {/* 요약 카드 */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        <Col span={12}>
          <Card
            className="summary-card"
            styles={{ body: { padding: '16px' } }}
          >
            <Text style={{ fontSize: 12, color: '#9CA3AF', display: 'block' }}>
              <TrophyOutlined /> 총 혜택 수령
            </Text>
            <Text style={{ fontSize: 22, fontWeight: 700, color: '#10B981' }}>
              ₩{totalUsed.toLocaleString()}
            </Text>
            <Text style={{ fontSize: 11, color: '#9CA3AF', display: 'block' }}>
              한도 ₩{totalLimit.toLocaleString()}
            </Text>
          </Card>
        </Col>
        <Col span={12}>
          <Card
            className="summary-card"
            styles={{ body: { padding: '16px', display: 'flex', justifyContent: 'center' } }}
          >
            <PickingRateGauge
              rate={overallPickingRate}
              label="전체 피킹률"
              size={90}
            />
          </Card>
        </Col>
      </Row>

      {/* 카드별 혜택 현황 */}
      {cardSummaries.length === 0 ? (
        <Empty
          description="등록된 카드가 없습니다. 카드를 추가해주세요!"
          style={{ marginTop: 40 }}
        />
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Title level={5} style={{ color: '#E8E6F0', margin: 0 }}>
              <FireOutlined style={{ color: '#F59E0B' }} /> 카드별 혜택 잔여 한도
            </Title>
            <Button
              type="text"
              style={{ color: '#9CA3AF', padding: 0 }}
              onClick={() => navigate('/cards')}
            >
              전체보기 <RightOutlined style={{ fontSize: 10 }} />
            </Button>
          </div>

          {cardSummaries.map((card) => (
            <Card
              key={card._id}
              className="card-summary ant-card-hoverable"
              onClick={() => navigate(`/cards/${card._id}`)}
              style={{
                marginBottom: 12,
                cursor: 'pointer',
                background: card.isMinSpendingMet
                  ? `linear-gradient(135deg, ${card.color}11, ${card.color}08)`
                  : '#1a1a2e',
                border: `1px solid ${card.isMinSpendingMet ? card.color + '33' : '#333'}`,
                borderRadius: 16,
                opacity: card.isMinSpendingMet ? 1 : 0.5,
              }}
              styles={{ body: { padding: '16px' } }}
            >
              {/* 카드 헤더 */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}>
                <div>
                  <Text strong style={{ fontSize: 15, color: '#E8E6F0' }}>
                    {card.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 8 }}>
                    {card.company}
                  </Text>
                </div>
                <div style={{
                  background: `${card.color}22`,
                  borderRadius: 8,
                  padding: '4px 10px',
                }}>
                  <Text style={{ fontSize: 13, fontWeight: 600, color: card.color }}>
                    {card.cardPickingRate}%
                  </Text>
                </div>
              </div>

              {/* 실적 미달 표시 */}
              {!card.isMinSpendingMet && (
                <div style={{
                  padding: '8px 12px',
                  background: '#EF444411',
                  borderRadius: 8,
                  marginBottom: 12,
                }}>
                  <Text style={{ fontSize: 12, color: '#EF4444' }}>
                    ⚠️ 전월 실적 미달 — 혜택이 비활성화되었습니다
                  </Text>
                </div>
              )}

              {/* 카테고리별 프로그레스 바 */}
              {card.categories.length === 0 ? (
                <Text style={{ fontSize: 13, color: '#9CA3AF' }}>
                  등록된 혜택 카테고리가 없습니다.
                </Text>
              ) : (
                card.categories.map((cat) => (
                  <BenefitProgressBar
                    key={cat._id}
                    categoryName={cat.categoryName}
                    used={cat.used}
                    monthlyLimit={cat.monthlyLimit}
                    discountType={cat.discountType}
                    onLogUsage={() => handleOpenUsageModal(card, cat)}
                  />
                ))
              )}
            </Card>
          ))}
        </div>
      )}

      {/* 서랍형 빠른 사용 입력 */}
      <DirectUsageModal
        open={usageModalOpen}
        onClose={() => setUsageModalOpen(false)}
        card={selectedCard}
        category={selectedCategory}
        onSuccess={fetchDashboard}
      />
    </div>
  );
};

export default DashboardPage;
