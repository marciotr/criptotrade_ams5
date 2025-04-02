import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.clear();
    navigate('/signin', { replace: true });
  }, [navigate]);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      
      if (response && response.token) {
        setUser(response.user);
        setIsAuthenticated(true);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        return true;
      }
      return false;
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    }
  };

  useEffect(() => {
    const initAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const savedUserData = localStorage.getItem('user');

        if (!token || !savedUserData) {
          setIsAuthenticated(false);
          setUser(null);
          setLoading(false);
          return;
        }

        try {
          const userData = JSON.parse(savedUserData);
          if (userData && userData.email) {
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            logout();
          }
        } catch (error) {
          console.error('Erro ao processar dados do usuário:', error);
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [logout]);

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}