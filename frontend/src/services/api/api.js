import api from './config';

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/User', userData),
  verifyToken: () => api.get('/auth/verify'),
};

export const userApi = {
  getUsers: () => api.get('/User'),
  getProfile: (id) => api.get(`/User/${id}`),
  updateProfile: (id, data) => api.put(`/User/${id}`, data),
  deleteAccount: (id) => api.delete(`/User/${id}`),
};

export const marketApi = {
  getPrices: () => api.get('/crypto/prices'),
  getAllTickers: () => api.get('/crypto/tickers'),
  getTickerBySymbol: (symbol) => api.get(`/crypto/ticker/${symbol}`),
  getOrderBook: (symbol, limit = 100) => api.get(`/crypto/orderbook/${symbol}`, {
    params: { limit }
  }),
  getRecentTrades: (symbol, limit = 500) => api.get(`/crypto/trades/${symbol}`, {
    params: { limit }
  }),
  getCoinData: (symbol) => api.get(`/market/coin/${symbol}`),
  getHistory: (symbol, timeframe) => api.get(`/market/history/${symbol}`, { 
    params: { timeframe } 
  }),
  getAllCryptos: () => api.get('/Crypto'),
  getCryptoBySymbol: (symbol) => api.get(`/Crypto/${symbol}`),
  getCryptoIcon: (symbol) => `https://bin.bnbstatic.com/image/crypto/${symbol.toLowerCase()}.png`,
  getKlines: (symbol, interval = '15m', limit = 100) => 
    api.get(`/crypto/klines/${symbol}`, {
      params: { interval, limit }
    }),
};

export const transactionApi = {
  getAll: () => api.get('/transactions'),
  create: (data) => api.post('/transactions', data),
  getById: (id) => api.get(`/transactions/${id}`),
  update: (id, data) => api.put(`/transactions/${id}`, data),
};

export const settingsApi = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};