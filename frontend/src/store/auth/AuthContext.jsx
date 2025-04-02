import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
  const [isAuthenticated, setIsAuthenticated] = useState(false);
=======
>>>>>>> 1eca3b2d26f6e3c41c581351e076587792c19d9f
  const navigate = useNavigate();

  const logout = useCallback(() => {
    setUser(null);
<<<<<<< HEAD
    setIsAuthenticated(false);
    localStorage.clear();
=======
    authService.logout();
>>>>>>> 1eca3b2d26f6e3c41c581351e076587792c19d9f
    navigate('/signin', { replace: true });
  }, [navigate]);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
<<<<<<< HEAD
      
      if (response && response.token) {
        setUser(response.user);
        setIsAuthenticated(true);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
=======
      if (response.token) {
        setUser({
          email: credentials.email,
          name: response.name || ''
        });
>>>>>>> 1eca3b2d26f6e3c41c581351e076587792c19d9f
        return true;
      }
      return false;
    } catch (error) {
<<<<<<< HEAD
      setIsAuthenticated(false);
      setUser(null);
      throw error;
=======
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      if (response.token) {
        setUser({
          email: userData.email,
          name: userData.name || ''
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
>>>>>>> 1eca3b2d26f6e3c41c581351e076587792c19d9f
    }
  };

  useEffect(() => {
    const initAuth = () => {
      try {
        const token = localStorage.getItem('token');
<<<<<<< HEAD
        const savedUserData = localStorage.getItem('user');

        if (!token || !savedUserData) {
          setIsAuthenticated(false);
=======
        const savedUser = localStorage.getItem('user');

        if (!token || !savedUser) {
>>>>>>> 1eca3b2d26f6e3c41c581351e076587792c19d9f
          setUser(null);
          setLoading(false);
          return;
        }

        try {
<<<<<<< HEAD
          const userData = JSON.parse(savedUserData);
          if (userData && userData.email) {
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            logout();
          }
        } catch (error) {
          console.error('Erro ao processar dados do usuário:', error);
=======
          const userData = JSON.parse(savedUser);
          setUser(userData);
        } catch (error) {
          console.error('Invalid user data:', error);
>>>>>>> 1eca3b2d26f6e3c41c581351e076587792c19d9f
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
<<<<<<< HEAD
    logout,
    loading,
    isAuthenticated
=======
    register,
    logout,
    loading,
    isAuthenticated: !!user && authService.isAuthenticated()
>>>>>>> 1eca3b2d26f6e3c41c581351e076587792c19d9f
  };

  return (
    <AuthContext.Provider value={value}>
<<<<<<< HEAD
      {!loading && children}
=======
      {children}
>>>>>>> 1eca3b2d26f6e3c41c581351e076587792c19d9f
    </AuthContext.Provider>
  );
}