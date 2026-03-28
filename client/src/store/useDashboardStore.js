import { create } from 'zustand';
import api from '../api/axios';

/**
 * 대시보드 상태 관리 스토어
 * - 서버에서 계산된 대시보드 요약 데이터를 관리
 * - 카드별 잔여 한도, 피킹률, 실적 미달 카드 정보
 */
const useDashboardStore = create((set) => ({
  dashboard: null,
  loading: false,
  error: null,

  // 대시보드 데이터 조회
  fetchDashboard: async (year, month) => {
    set({ loading: true });
    try {
      const params = {};
      if (year) params.year = year;
      if (month) params.month = month;

      const res = await api.get('/usages/dashboard', { params });
      set({ dashboard: res.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || '대시보드 데이터 조회 실패', loading: false });
    }
  },

  clearError: () => set({ error: null }),

  // 상태 초기화
  reset: () => set({ dashboard: null, loading: false, error: null }),
}));

export default useDashboardStore;
