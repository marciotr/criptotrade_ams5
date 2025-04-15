import { userApiConfig, cryptoApiConfig } from './config';

export const authApi = {
  login: (credentials) => userApiConfig.post('/auth/login', credentials),
  register: (userData) => userApiConfig.post('/User', userData),
  verifyToken: () => userApiConfig.get('/auth/verify'),
};

export const userApi = {
  getUsers: () => userApiConfig.get('/User'),
  getProfile: (id) => userApiConfig.get(`/User/${id}`),
  updateProfile: (id, data) => userApiConfig.put(`/User/${id}`, data),
  deleteAccount: (id) => userApiConfig.delete(`/User/${id}`),
  updatePhoto: (id, file) => {
    const formData = new FormData();
    formData.append('photo', file);
    
    return userApiConfig.post(`/User/${id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
};

// Use cryptoApiConfig para todas as chamadas de criptomoeda
export const marketApi = {
  getPrices: () => cryptoApiConfig.get('/crypto/prices'),
  getAllTickers: () => cryptoApiConfig.get('/crypto/tickers'),
  getTickerBySymbol: (symbol) => cryptoApiConfig.get(`/crypto/ticker/${symbol}`),
  getOrderBook: (symbol, limit = 100) => cryptoApiConfig.get(`/crypto/orderbook/${symbol}`, {
    params: { limit }
  }),
  getRecentTrades: (symbol, limit = 500) => cryptoApiConfig.get(`/crypto/trades/${symbol}`, {
    params: { limit }
  }),
  getCoinData: (symbol) => cryptoApiConfig.get(`/market/coin/${symbol}`),
  getHistory: (symbol, timeframe) => cryptoApiConfig.get(`/market/history/${symbol}`, { 
    params: { timeframe } 
  }),
  getAllCryptos: () => userApiConfig.get('/Crypto'), // Esta ainda usa a userApi, está correto?
  getCryptoBySymbol: (symbol) => userApiConfig.get(`/Crypto/${symbol}`), // Essa também
  getCryptoIcon: (symbol) => `https://bin.bnbstatic.com/image/crypto/${symbol.toLowerCase()}.png`,
  getKlines: (symbol, interval = '15m', limit = 100) => 
    cryptoApiConfig.get(`/crypto/klines/${symbol}`, {
      params: { interval, limit }
    }),
};

export const transactionApi = {
  getAll: () => userApiConfig.get('/transactions'),
  create: (data) => userApiConfig.post('/transactions', data),
  getById: (id) => userApiConfig.get(`/transactions/${id}`),
  update: (id, data) => userApiConfig.put(`/transactions/${id}`, data),
};

export const settingsApi = {
  get: () => userApiConfig.get('/settings'),
  update: (data) => userApiConfig.put('/settings', data),
};