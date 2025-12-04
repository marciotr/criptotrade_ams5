import api from '../api/config';

export const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const data = response.data || {};

      if (data.mfaRequired) {
        return { mfaRequired: true, mfaType: data.mfaType, userId: data.userId };
      }

      const token = data.token;
      if (!token) {
        throw new Error('Invalid credentials');
      }

      localStorage.setItem('token', token);

      const usersResponse = await api.get('/User');
      const currentUser = usersResponse.data.find(u => u.email === credentials.email);

      if (!currentUser) {
        throw new Error('User profile not found');
      }

      localStorage.setItem('user', JSON.stringify(currentUser));
      return { token, user: currentUser };
      
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      }
      if (error.response?.status === 404) {
        throw new Error('User not found');
      }
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  },

  verifyMfa: async ({ userId, code }) => {
    try {
      const response = await api.post('/auth/verify-mfa', { userId, code });
      const data = response.data || {};
      const token = data.token;
      if (!token) throw new Error('MFA verification failed');

      localStorage.setItem('token', token);

      const usersResponse = await api.get('/User');
      const currentUser = usersResponse.data.find(u => u.id === userId || u.email === data.email);
      if (currentUser) localStorage.setItem('user', JSON.stringify(currentUser));

      return { token, user: currentUser };
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'MFA verification failed');
    }
  },

  register: async (userData) => {
    const registerData = {
      email: userData.email,
      password: userData.password,
      name: userData.name || '',
      phone: '',
      address: '',
      photo: ''
    };

    try {
      const response = await api.post('/User', registerData);
      const { token } = response.data;
      
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(registerData));
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to register');
    }
  },

  getUserProfile: async () => {
    try {
      const response = await api.get('/User');
      const email = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email : null;
      return response.data.find(u => u.email === email);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};