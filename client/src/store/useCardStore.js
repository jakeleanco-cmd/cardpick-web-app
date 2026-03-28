import { create } from 'zustand';
import api from '../api/axios';

/**
 * 카드 상태 관리 스토어
 * - 카드 CRUD 및 전월 실적 충족 여부 토글
 */
const useCardStore = create((set, get) => ({
  cards: [],
  loading: false,
  error: null,

  // 카드 목록 조회
  fetchCards: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/cards');
      set({ cards: res.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || '카드 조회 실패', loading: false });
    }
  },

  // 카드 등록
  addCard: async (cardData) => {
    try {
      const res = await api.post('/cards', cardData);
      set({ cards: [res.data, ...get().cards] });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || '카드 등록 실패' });
      return false;
    }
  },

  // 카드 수정
  updateCard: async (id, cardData) => {
    try {
      const res = await api.put(`/cards/${id}`, cardData);
      set({
        cards: get().cards.map((c) => (c._id === id ? res.data : c)),
      });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || '카드 수정 실패' });
      return false;
    }
  },

  // 전월 실적 충족 여부 토글
  toggleMinSpending: async (id, isMinSpendingMet) => {
    try {
      const res = await api.put(`/cards/${id}`, { isMinSpendingMet });
      set({
        cards: get().cards.map((c) => (c._id === id ? res.data : c)),
      });
    } catch (error) {
      set({ error: error.response?.data?.message || '실적 상태 변경 실패' });
    }
  },

  // 카드 삭제
  deleteCard: async (id) => {
    try {
      await api.delete(`/cards/${id}`);
      set({ cards: get().cards.filter((c) => c._id !== id) });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || '카드 삭제 실패' });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useCardStore;
