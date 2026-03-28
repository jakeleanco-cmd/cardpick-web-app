import { Progress, Typography } from 'antd';

const { Text } = Typography;

/**
 * 피킹률 게이지 차트 (원형)
 * - 전체 또는 카드별 피킹률을 원형 프로그레스로 표시
 * - 피킹률에 따라 색상 변화
 */
const PickingRateGauge = ({ rate, label, size = 120 }) => {
  // 피킹률에 따른 색상
  const getColor = (pct) => {
    if (pct >= 80) return '#10B981'; // 탁월
    if (pct >= 60) return '#6366F1'; // 좋음
    if (pct >= 40) return '#F59E0B'; // 보통
    return '#EF4444';                // 부족
  };

  // 피킹률에 따른 등급 라벨
  const getGrade = (pct) => {
    if (pct >= 80) return '탁월 🔥';
    if (pct >= 60) return '좋음 👍';
    if (pct >= 40) return '보통';
    return '부족';
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <Progress
        type="circle"
        percent={rate}
        size={size}
        strokeColor={{
          '0%': getColor(rate),
          '100%': getColor(rate) + 'CC',
        }}
        trailColor="#2D2945"
        format={(pct) => (
          <div>
            <div style={{ fontSize: size * 0.2, fontWeight: 700, color: '#E8E6F0' }}>
              {pct}%
            </div>
            <div style={{ fontSize: size * 0.1, color: '#9CA3AF' }}>
              {getGrade(pct)}
            </div>
          </div>
        )}
      />
      {label && (
        <Text
          style={{
            display: 'block',
            marginTop: 8,
            fontSize: 13,
            color: '#9CA3AF',
          }}
        >
          {label}
        </Text>
      )}
    </div>
  );
};

export default PickingRateGauge;
