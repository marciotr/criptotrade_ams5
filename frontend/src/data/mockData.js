const demoData = [
    { time: '00:00', price: 45000, volume: 12000 },
    { time: '04:00', price: 46200, volume: 14000 },
    { time: '08:00', price: 45800, volume: 11000 },
    { time: '12:00', price: 47300, volume: 15000 },
    { time: '16:00', price: 46900, volume: 13000 },
    { time: '20:00', price: 48000, volume: 16000 },
    { time: '24:00', price: 47500, volume: 14500 },
  ];
  
  const ethData = [
    { time: '00:00', price: 3200, volume: 5000 },
    { time: '04:00', price: 3250, volume: 5500 },
    { time: '08:00', price: 3180, volume: 4800 },
    { time: '12:00', price: 3300, volume: 6000 },
    { time: '16:00', price: 3280, volume: 5800 },
    { time: '20:00', price: 3350, volume: 6200 },
    { time: '24:00', price: 3320, volume: 5900 },
  ];
  
  const adaData = [
    { time: '00:00', price: 1.15, volume: 2000 },
    { time: '04:00', price: 1.18, volume: 2200 },
    { time: '08:00', price: 1.16, volume: 1950 },
    { time: '12:00', price: 1.22, volume: 2400 },
    { time: '16:00', price: 1.21, volume: 2350 },
    { time: '20:00', price: 1.25, volume: 2500 },
    { time: '24:00', price: 1.23, volume: 2450 },
  ];
  
  const solData = [
    { time: '00:00', price: 94.2, volume: 1800 },
    { time: '04:00', price: 95.8, volume: 1950 },
    { time: '08:00', price: 93.5, volume: 1700 },
    { time: '12:00', price: 97.2, volume: 2100 },
    { time: '16:00', price: 96.5, volume: 2050 },
    { time: '20:00', price: 98.8, volume: 2200 },
    { time: '24:00', price: 98.1, volume: 2150 },
  ];
  
  const xrpData = [
    { time: '00:00', price: 22.8, volume: 900 },
    { time: '04:00', price: 23.2, volume: 950 },
    { time: '08:00', price: 22.5, volume: 880 },
    { time: '12:00', price: 23.6, volume: 1000 },
    { time: '16:00', price: 23.4, volume: 980 },
    { time: '20:00', price: 23.9, volume: 1050 },
    { time: '24:00', price: 23.7, volume: 1020 },
  ];
  
  const availableCoins = [
    { id: 'BTC', name: 'Bitcoin', data: demoData, color: '#F7931A' },
    { id: 'ETH', name: 'Ethereum', data: ethData, color: '#627EEA' },
    { id: 'ADA', name: 'Cardano', data: adaData, color: '#0033AD' },
    { id: 'SOL', name: 'Solana', data: solData, color: '#14F195' },
    { id: 'XRP', name: 'XRP', data: xrpData, color: '#23292F' },
  ];
  
  const marketData = [
    { id: 1, name: 'Bitcoin', symbol: 'BTC', price: 47234.12, change: 5.23, volume: '1.2B', marketCap: '892.1B', favorite: true },
    { id: 2, name: 'Ethereum', symbol: 'ETH', price: 3456.78, change: -2.14, volume: '845M', marketCap: '416.2B', favorite: true },
    { id: 3, name: 'Cardano', symbol: 'ADA', price: 1.23, change: 8.56, volume: '234M', marketCap: '39.1B', favorite: false },
    { id: 4, name: 'Solana', symbol: 'SOL', price: 98.45, change: 12.3, volume: '567M', marketCap: '31.2B', favorite: false },
    { id: 5, name: 'Polkadot', symbol: 'DOT', price: 23.45, change: -1.23, volume: '123M', marketCap: '23.1B', favorite: false },
    { id: 6, name: 'Binance Coin', symbol: 'BNB', price: 312.78, change: 3.45, volume: '789M', marketCap: '51.3B', favorite: false },
    { id: 7, name: 'XRP', symbol: 'XRP', price: 0.83, change: -0.76, volume: '432M', marketCap: '38.7B', favorite: false },
    { id: 8, name: 'Avalanche', symbol: 'AVAX', price: 78.92, change: 15.2, volume: '345M', marketCap: '17.8B', favorite: false },
    { id: 9, name: 'Dogecoin', symbol: 'DOGE', price: 0.17, change: -5.32, volume: '987M', marketCap: '22.5B', favorite: true },
    { id: 10, name: 'Chainlink', symbol: 'LINK', price: 16.78, change: 2.89, volume: '254M', marketCap: '7.9B', favorite: false },
  ];
  
  const transactions = [
    { id: 1, type: 'Deposit', amount: 5000, currency: 'USD', date: '2025-03-15', status: 'Completed' },
    { id: 2, type: 'Withdrawal', amount: 2000, currency: 'USD', date: '2025-03-14', status: 'Pending' },
    { id: 3, type: 'Deposit', amount: 3000, currency: 'USD', date: '2025-03-13', status: 'Completed' },
    { id: 4, type: 'Withdrawal', amount: 1500, currency: 'USD', date: '2025-03-12', status: 'Failed' },
  ];
  
  const news = [
    { id: 1, title: 'Bitcoin hits new all-time high', date: '2025-03-15' },
    { id: 2, title: 'Ethereum 2.0 launch date announced', date: '2025-03-14' },
    { id: 3, title: 'Cardano partners with major tech firm', date: '2025-03-13' },
  ];
  
  const gainers = [
    { coin: 'Solana', symbol: 'SOL', price: '98.45', change: '+12.3%', volume: '567M' },
    { coin: 'Cardano', symbol: 'ADA', price: '1.23', change: '+8.56%', volume: '234M' },
  ];
  
  const losers = [
    { coin: 'Ethereum', symbol: 'ETH', price: '3,456.78', change: '-2.14%', volume: '845M' },
    { coin: 'XRP', symbol: 'XRP', price: '23.45', change: '-1.23%', volume: '123M' },
  ];
  
  const statsData = [
    { title: 'Portfolio Value', value: '$48,234.12', subValue: '+12.5% this week' },
    { title: '24h Change', value: '+5.23%', subValue: '+$2,345.67' },
    { title: 'Total Balance', value: '1.234 BTC', subValue: '≈ $47,123.45' },
    { title: 'Active Orders', value: '3', subValue: '2 buy, 1 sell' },
  ];
  
  const portfolioData = [
    { asset: 'Bitcoin', symbol: 'BTC', allocation: 45, value: 28500, change: 5.2 },
    { asset: 'Ethereum', symbol: 'ETH', allocation: 30, value: 19000, change: -2.1 },
    { asset: 'Cardano', symbol: 'ADA', allocation: 15, value: 9500, change: 8.5 },
    { asset: 'Solana', symbol: 'SOL', allocation: 10, value: 6300, change: 12.3 },
  ];
  
  const portfolioHistoricalData = [
    { date: 'Jan', value: 50000 },
    { date: 'Feb', value: 55000 },
    { date: 'Mar', value: 48000 },
    { date: 'Apr', value: 52000 },
    { date: 'May', value: 63000 },
    { date: 'Jun', value: 59000 },
  ];
  
  const portfolioStats = {
    totalValue: portfolioData.reduce((acc, curr) => acc + curr.value, 0),
    dayChange: 1234.56,
    dayChangePercent: 2.3,
    bestPerformer: {
      asset: 'Solana',
      symbol: 'SOL',
      change: 12.3
    },
    worstPerformer: {
      asset: 'Ethereum',
      symbol: 'ETH',
      change: -2.1
    }
  };
  
  const PORTFOLIO_COLORS = ['#F7931A', '#627EEA', '#0033AD', '#14F195'];
  
  const trendingPairs = [
    { pair: 'BTC/USDT', base: 'BTC', quote: 'USDT', price: 47234.12, change: 5.23 },
    { pair: 'ETH/USDT', base: 'ETH', quote: 'USDT', price: 3456.78, change: -2.14 },
    { pair: 'SOL/USDT', base: 'SOL', quote: 'USDT', price: 98.45, change: 12.3 },
    { pair: 'ADA/USDT', base: 'ADA', quote: 'USDT', price: 1.23, change: 8.56 },
    { pair: 'BNB/USDT', base: 'BNB', quote: 'USDT', price: 312.78, change: 3.45 },
  ];
  
  const marketPairVolumes = {
    'BTC/USDT': [1200, 1350, 1100, 1450, 1300, 1550, 1400],
    'ETH/USDT': [850, 900, 800, 950, 920, 980, 910],
    'SOL/USDT': [560, 610, 530, 640, 590, 670, 630],
  };
  
  const marketFilters = [
    { id: 'all', name: 'All' },
    { id: 'favorites', name: 'Favorites' },
    { id: 'gainers', name: 'Gainers' },
    { id: 'losers', name: 'Losers' },
  ];
  
  export {
    demoData,
    ethData,
    adaData,
    solData,
    xrpData,
    availableCoins,
    marketData,
    transactions,
    news,
    gainers,
    losers,
    statsData,
    portfolioData,
    portfolioHistoricalData,
    portfolioStats,
    PORTFOLIO_COLORS,
    trendingPairs,
    marketPairVolumes,
    marketFilters
  };