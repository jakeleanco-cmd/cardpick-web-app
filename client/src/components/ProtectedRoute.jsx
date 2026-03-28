import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

/**
 * 인증 보호 라우트 컴포넌트
 * - 로그인하지 않은 사용자는 /login으로 리다이렉트
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
