import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ConfigProvider, Layout, App as AntApp } from 'antd';
import {
  HomeOutlined, CreditCardOutlined,
  PlusCircleOutlined, UnorderedListOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import themeConfig from './theme/themeConfig';
import useAuthStore from './store/useAuthStore';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CardsPage from './pages/CardsPage';
import CardDetailPage from './pages/CardDetailPage';
import UsagePage from './pages/UsagePage';
import './App.css';

/**
 * 하단 탭 네비게이션 (모바일 퍼스트)
 * - 홈, 카드, 입력, 기록 4개 탭
 */
const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();

  const tabs = [
    { key: '/', icon: <HomeOutlined />, label: '홈' },
    { key: '/cards', icon: <CreditCardOutlined />, label: '카드' },
    { key: '/usage', icon: <PlusCircleOutlined />, label: '입력' },
  ];

  // 현재 활성 탭 결정
  const getActiveKey = () => {
    if (location.pathname === '/') return '/';
    if (location.pathname.startsWith('/cards')) return '/cards';
    if (location.pathname === '/usage') return '/usage';
    return '/';
  };

  return (
    <div className="bottom-nav">
      {tabs.map((tab) => (
        <div
          key={tab.key}
          className={`bottom-nav-item ${getActiveKey() === tab.key ? 'active' : ''}`}
          onClick={() => navigate(tab.key)}
        >
          <span className="bottom-nav-icon">{tab.icon}</span>
          <span className="bottom-nav-label">{tab.label}</span>
        </div>
      ))}
      <div
        className="bottom-nav-item"
        onClick={() => { logout(); navigate('/login'); }}
      >
        <span className="bottom-nav-icon"><LogoutOutlined /></span>
        <span className="bottom-nav-label">로그아웃</span>
      </div>
    </div>
  );
};

/**
 * 메인 App 레이아웃
 * - 인증된 사용자에게 하단 탭 네비게이션 표시
 * - Ant Design ConfigProvider로 다크 테마 적용
 */
const AppLayout = () => {
  const { isAuthenticated, fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className="app-wrapper">
      <Routes>
        {/* 인증 페이지 */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />
        } />

        {/* 보호된 페이지 */}
        <Route path="/" element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/cards" element={
          <ProtectedRoute><CardsPage /></ProtectedRoute>
        } />
        <Route path="/cards/:id" element={
          <ProtectedRoute><CardDetailPage /></ProtectedRoute>
        } />
        <Route path="/usage" element={
          <ProtectedRoute><UsagePage /></ProtectedRoute>
        } />

        {/* 404 — 홈으로 리다이렉트 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* 인증된 사용자에게만 하단 네비게이션 표시 */}
      {isAuthenticated && <BottomNav />}
    </div>
  );
};

const App = () => {
  return (
    <ConfigProvider theme={themeConfig}>
      <AntApp>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
};

export default App;
