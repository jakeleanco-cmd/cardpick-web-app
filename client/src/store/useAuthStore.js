import { create } from 'zustand';
import api from '../api/axios';
import useCardStore from './useCardStore';
import useUsageStore from './useUsageStore';
import useDashboardStore from './useDashboardStore';
import useBenefitStore from './useBenefitStore';

/**
 * 인증 상태 관리 스토어
 * - JWT 토큰을 localStorage에 저장하여 새로고침 시에도 유지
 * - 로그인/회원가입/로그아웃 + 사용자 정보 조회
 */
const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('cardpick_token') || null,
  isAuthenticated: !!localStorage.getItem('cardpick_token'),
  loading: false,
  error: null,

  // 회원가입
  register: async (email, password, name) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/register', { email, password, name });
      localStorage.setItem('cardpick_token', res.data.token);
      set({
        user: res.data.user,
        token: res.data.token,
        isAuthenticated: true,
        loading: false,
      });
      return true;
    } catch (error) {
      set({
        error: error.response?.data?.message || '회원가입에 실패했습니다.',
        loading: false,
      });
      return false;
    }
  },

  // 로그인
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('cardpick_token', res.data.token);
      set({
        user: res.data.user,
        token: res.data.token,
        isAuthenticated: true,
        loading: false,
      });
      return true;
    } catch (error) {
      set({
        error: error.response?.data?.message || '로그인에 실패했습니다.',
        loading: false,
      });
      return false;
    }
  },

  // 회원 정보 수정
  updateProfile: async (name, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.put('/auth/profile', { name, password });
      set({
        user: res.data.user,
        loading: false,
      });
      return true;
    } catch (error) {
      set({
        error: error.response?.data?.message || '회원 정보 수정에 실패했습니다.',
        loading: false,
      });
      return false;
    }
  },

  // 로그아웃
  logout: () => {
    localStorage.removeItem('cardpick_token');
    
    // 타 스토어 상태 초기화
    useCardStore.getState().reset();
    useUsageStore.getState().reset();
    useDashboardStore.getState().reset();
    useBenefitStore.getState().reset();

    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  // 현재 사용자 정보 조회 (앱 시작 시 호출)
  fetchUser: async () => {
    const token = localStorage.getItem('cardpick_token');
    if (!token) return;

    try {
      const res = await api.get('/auth/me');
      set({ user: res.data, isAuthenticated: true });
    } catch {
      // 토큰이 유효하지 않으면 로그아웃 처리
      localStorage.removeItem('cardpick_token');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  // 에러 초기화
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
