import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../store/auth/useAuth';

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  
  // Se não estiver autenticado, redireciona para o login
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }
  
  // Se estiver autenticado, renderiza o componente filho
  return <Outlet />;
}