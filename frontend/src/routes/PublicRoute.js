import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../store/auth/useAuth';

export function PublicRoute() {
  const { isAuthenticated } = useAuth();
  
  // Se estiver autenticado, redireciona para o dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Se não estiver autenticado, renderiza o componente filho
  return <Outlet />;
}