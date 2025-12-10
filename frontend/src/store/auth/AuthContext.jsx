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

  const updateUser = useCallback((newUser) => {
    try {
      setUser(newUser);
      if (newUser) localStorage.setItem('user', JSON.stringify(newUser));
      else localStorage.removeItem('user');
    } catch (e) {
      console.error('Failed to update user in AuthContext', e);
    }
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);

      if (response && response.token) {
        setUser(response.user);
        setIsAuthenticated(true);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        return { success: true };
      }

      if (response && response.mfaRequired) {
        localStorage.setItem('mfaPending', JSON.stringify({ userId: response.userId, mfaType: response.mfaType, email: credentials.email }));
        return { mfaRequired: true, mfaType: response.mfaType, userId: response.userId };
      }

      return { success: false };
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    }
  };

  const verifyMfa = async ({ userId, code }) => {
    try {
      const response = await authService.verifyMfa({ userId, code });
      if (response && response.token) {
        setUser(response.user);
        setIsAuthenticated(true);
        localStorage.setItem('token', response.token);
        if (response.user) localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.removeItem('mfaPending');
        return { success: true };
      }
      return { success: false };
    } catch (error) {
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
    verifyMfa,
    logout,
    updateUser,
    loading,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}