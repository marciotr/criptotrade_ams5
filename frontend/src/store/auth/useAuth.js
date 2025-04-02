import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

<<<<<<< HEAD
  return {
    ...context,
    isAuthenticated: context.isAuthenticated
=======
  const isAuthenticated = Boolean(
    context.user && 
    context.user.email && 
    localStorage.getItem('token')
  );

  return {
    ...context,
    isAuthenticated
>>>>>>> 1eca3b2d26f6e3c41c581351e076587792c19d9f
  };
}