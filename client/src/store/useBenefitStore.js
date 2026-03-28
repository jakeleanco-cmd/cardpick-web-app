import { create } from 'zustand';
import api from '../api/axios';

/**
 * 혜택 카테고리 상태 관리 스토어
 * - 카드별 혜택 카테고리 CRUD
 */
const useBenefitStore = create((set, get) => ({
  benefits: [],
  loading: false,
  error: null,

  // 혜택 카테고리 목록 조회 (cardId 필터 가능)
  fetchBenefits: async (cardId) => {
    set({ loading: true });
    try {
      const params = cardId ? { cardId } : {};
      const res = await api.get('/benefits', { params });
      set({ benefits: res.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || '혜택 카테고리 조회 실패', loading: false });
    }
  },

  // 혜택 카테고리 등록
  addBenefit: async (benefitData) => {
    try {
      const res = await api.post('/benefits', benefitData);
      set({ benefits: [res.data, ...get().benefits] });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || '혜택 카테고리 등록 실패' });
      return false;
    }
  },

  // 혜택 카테고리 수정
  updateBenefit: async (id, benefitData) => {
    try {
      const res = await api.put(`/benefits/${id}`, benefitData);
      set({
        benefits: get().benefits.map((b) => (b._id === id ? res.data : b)),
      });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || '혜택 카테고리 수정 실패' });
      return false;
    }
  },

  // 혜택 카테고리 삭제
  deleteBenefit: async (id) => {
    try {
      await api.delete(`/benefits/${id}`);
      set({ benefits: get().benefits.filter((b) => b._id !== id) });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || '혜택 카테고리 삭제 실패' });
      return false;
    }
  },

  clearError: () => set({ error: null }),

  // 상태 초기화
  reset: () => set({ benefits: [], loading: false, error: null }),
}));

export default useBenefitStore;
