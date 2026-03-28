import { theme } from 'antd';

/**
 * Ant Design 테마 설정
 * - 다크모드 기반 프리미엄 UI
 * - 모바일 최적화 컬러 팔레트
 * - 컴포넌트별 세부 토큰 커스터마이징
 */
const themeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    // 메인 컬러 팔레트 — 딥 퍼플 계열
    colorPrimary: '#7C3AED',
    colorSuccess: '#10B981',
    colorWarning: '#F59E0B',
    colorError: '#EF4444',
    colorInfo: '#6366F1',

    // 배경색
    colorBgContainer: '#1E1B2E',
    colorBgElevated: '#252238',
    colorBgLayout: '#13111C',

    // 텍스트
    colorText: '#E8E6F0',
    colorTextSecondary: '#9CA3AF',

    // 보더
    colorBorder: '#3B3555',
    colorBorderSecondary: '#2D2945',

    // 라운드 처리 (모바일 친화적 둥근 모서리)
    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusSM: 8,

    // 폰트
    fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 14,

    // 그림자
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
  },
  components: {
    Button: {
      borderRadius: 12,
      controlHeight: 44,
      paddingContentHorizontal: 24,
    },
    Input: {
      controlHeight: 44,
      borderRadius: 12,
    },
    Card: {
      borderRadius: 16,
    },
    Modal: {
      borderRadius: 16,
    },
    Progress: {
      circleSize: 120,
    },
  },
};

export default themeConfig;
