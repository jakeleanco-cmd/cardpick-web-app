import { Card, Tag, Switch, Typography, Space } from 'antd';
import { CreditCardOutlined, WarningOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

/**
 * 신용카드 카드형 UI 컴포넌트
 * - 글래스모피즘 효과의 카드 디자인
 * - 전월 실적 미달 시 그레이아웃 + 경고 표시
 * - 실적 충족 토글 스위치 포함
 */
const CardItem = ({ card, onToggleSpending, onClick, style }) => {
  const isActive = card.isMinSpendingMet;

  return (
    <Card
      hoverable
      onClick={() => onClick && onClick(card)}
      style={{
        background: isActive
          ? `linear-gradient(135deg, ${card.color}22, ${card.color}11)`
          : 'linear-gradient(135deg, #1a1a2e, #16162a)',
        border: `1px solid ${isActive ? card.color + '44' : '#333'}`,
        borderRadius: 16,
        overflow: 'hidden',
        opacity: isActive ? 1 : 0.6,
        transition: 'all 0.3s ease',
        ...style,
      }}
      styles={{
        body: { padding: '16px 20px' },
      }}
    >
      {/* 카드 상단: 이름과 카드사 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <CreditCardOutlined style={{ color: card.color, fontSize: 18 }} />
            <Text strong style={{ fontSize: 16, color: '#E8E6F0' }}>
              {card.name}
            </Text>
          </div>
          <Text style={{ fontSize: 12, color: '#9CA3AF' }}>
            {card.company}
          </Text>
        </div>
        {!isActive && (
          <Tag color="error" icon={<WarningOutlined />} style={{ margin: 0 }}>
            실적 미달
          </Tag>
        )}
      </div>

      {/* 카드 하단: 전월 실적 정보 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Text style={{ fontSize: 11, color: '#9CA3AF' }}>전월 실적 기준</Text>
          <br />
          <Text style={{ fontSize: 14, color: '#E8E6F0' }}>
            {card.minSpending > 0 ? `${card.minSpending.toLocaleString()}원` : '없음'}
          </Text>
        </div>
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Text style={{ fontSize: 11, color: '#9CA3AF' }}>실적 충족</Text>
          <Switch
            checked={isActive}
            onChange={(checked) => onToggleSpending && onToggleSpending(card._id, checked)}
            size="small"
          />
        </div>
      </div>
    </Card>
  );
};

export default CardItem;
