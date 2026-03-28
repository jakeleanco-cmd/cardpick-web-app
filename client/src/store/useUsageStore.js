import { create } from 'zustand';
import api from '../api/axios';

/**
 * 사용 기록 상태 관리 스토어
 * - 혜택 사용 기록 조회/등록/삭제
 */
const useUsageStore = create((set, get) => ({
  usages: [],
  loading: false,
  error: null,

  // 사용 기록 조회 (월별 필터)
  fetchUsages: async (year, month, cardId) => {
    set({ loading: true });
    try {
      const params = {};
      if (year) params.year = year;
      if (month) params.month = month;
      if (cardId) params.cardId = cardId;

      const res = await api.get('/usages', { params });
      set({ usages: res.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || '사용 기록 조회 실패', loading: false });
    }
  },

  // 사용 기록 등록
  addUsage: async (usageData) => {
    try {
      const res = await api.post('/usages', usageData);
      set({ usages: [res.data, ...get().usages] });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || '사용 기록 등록 실패' });
      return false;
    }
  },

  // 사용 기록 삭제
  deleteUsage: async (id) => {
    try {
      await api.delete(`/usages/${id}`);
      set({ usages: get().usages.filter((u) => u._id !== id) });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || '사용 기록 삭제 실패' });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useUsageStore;
