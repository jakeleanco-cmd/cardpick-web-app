import { Progress, Typography, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Text } = Typography;

/**
 * 혜택 잔여 한도 프로그레스 바
 * - 사용률에 따라 색상 변화: 초록(0-60%) → 노랑(60-85%) → 빨강(85-100%)
 * - 잔여 금액과 한도 표시
 * - onLogUsage 함수 주입 시 우측 상단에 혜택 기록 버튼 표시
 */
const BenefitProgressBar = ({ categoryName, used, monthlyLimit, discountType, onLogUsage }) => {
  const remaining = Math.max(0, monthlyLimit - used);
  const percent = monthlyLimit > 0 ? Math.min(100, (used / monthlyLimit) * 100) : 0;

  // 사용률에 따른 색상 (높을수록 좋으므로 초록 → 파랑 계열)
  const getColor = (pct) => {
    if (pct >= 85) return '#10B981'; // 초록 — 거의 다 채움 (좋음!)
    if (pct >= 60) return '#6366F1'; // 인디고 — 절반 이상
    if (pct >= 30) return '#F59E0B'; // 노랑 — 아직 여유
    return '#9CA3AF';                // 회색 — 거의 안 씀
  };

  const typeLabel = discountType === 'cashback' ? '캐시백' : '할인';

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <Text style={{ fontSize: 13, color: '#E8E6F0' }}>
          {categoryName}
        </Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 12, color: '#9CA3AF' }}>
            {used.toLocaleString()}원 / {monthlyLimit.toLocaleString()}원
          </Text>
          {onLogUsage && (
            <Button
              type="primary"
              shape="circle"
              size="small"
              icon={<PlusOutlined style={{ fontSize: 10 }} />}
              onClick={(e) => {
                e.stopPropagation(); // 카드 클릭 방지
                onLogUsage();
              }}
              style={{
                width: 20,
                minWidth: 20,
                height: 20,
                background: 'linear-gradient(135deg, #7C3AED, #6366F1)',
                border: 'none',
              }}
            />
          )}
        </div>
      </div>
      <Progress
        percent={Math.round(percent * 10) / 10}
        strokeColor={getColor(percent)}
        trailColor="#2D2945"
        size="small"
        format={(pct) => `${Math.round(pct)}%`}
        style={{ marginBottom: 0 }}
      />
      <Text style={{ fontSize: 11, color: '#9CA3AF' }}>
        잔여 {typeLabel}: {remaining.toLocaleString()}원
      </Text>
    </div>
  );
};

export default BenefitProgressBar;
