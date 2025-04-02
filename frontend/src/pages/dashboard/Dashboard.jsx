import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Wallet, TrendingUp, DollarSign, Activity, ArrowUp, ArrowDown, Newspaper, ChevronDown, ChevronRight } from 'lucide-react';
import CryptoIcon from '../../components/common/CryptoIcons';
import { CryptoCurrencyIcon } from 'react-cryptocoins';
import { 
  availableCoins, 
  marketData, 
  transactions, 
  news, 
  gainers, 
  losers,
  statsData 
} from '../../data/mockData';
import logoBranca from '../../assets/img/logoBinanceRemoved.png';
import logoPreta from '../../assets/img/logoBinanceRemoved.png';
import { useTheme } from '../../context/ThemeContext';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background-primary border border-border-primary rounded-lg shadow-lg p-3">
        <p className="text-text-secondary">{`Time: ${label}`}</p>
        <p className="font-semibold text-text-primary">
          {`Price: $${payload[0].value.toLocaleString()}`}
        </p>
        {payload[1] && (
          <p className="text-text-tertiary">
            {`Volume: ${payload[1].value.toLocaleString()}`}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function Dashboard() {
  const { theme } = useTheme();
  const [selectedCoin, setSelectedCoin] = useState(availableCoins[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('24H');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const [showAllMarketCoins, setShowAllMarketCoins] = useState(false);

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chartHeight = useMemo(() => {
    if (windowWidth < 640) return 250;
    if (windowWidth < 1024) return 300;
    return 400;
  }, [windowWidth]);

  const timePeriods = useMemo(() => {
    if (windowWidth < 640) {
      return [
        { value: '1H', label: '1H' },
        { value: '24H', label: '24H' },
        { value: '1W', label: '1W' },
      ];
    }
    return [
      { value: '1H', label: '1H' },
      { value: '24H', label: '24H' },
      { value: '1W', label: '1W' },
      { value: '1M', label: '1M' },
      { value: '1Y', label: '1Y' },
    ];
  }, [windowWidth]);

  const visibleMarketData = showAllMarketCoins ? marketData : marketData.slice(0, 4);

  return (
    <div className="relative p-4 lg:p-6 space-y-6">
      <div className="fixed bottom-0 right-0 pointer-events-none opacity-[0.02] z-0">
        <img
          src={theme === 'light' ? logoBranca : logoPreta}
          alt=""
          className="w-[600px] h-[600px] object-contain"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Wallet, title: 'Portfolio Value', value: '$48,234.12', subValue: '+12.5% this week' },
          { icon: TrendingUp, title: '24h Change', value: '+5.23%', subValue: '+$2,345.67' },
          { icon: DollarSign, title: 'Total Balance', value: '1.234 BTC', subValue: '≈ $47,123.45' },
          { icon: Activity, title: 'Active Orders', value: '3', subValue: '2 buy, 1 sell' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 lg:p-6 rounded-xl bg-background-primary border border-border-primary shadow-lg"
          >
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <stat.icon className="text-brand-primary" size={24} />
                <span className="text-text-secondary">24h</span>
              </div>
              <p className="text-sm text-text-secondary">{stat.title}</p>
              <p className="text-lg lg:text-xl font-bold text-text-primary">{stat.value}</p>
              <p className="text-xs text-text-tertiary">{stat.subValue}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 p-4 lg:p-6 rounded-xl bg-background-primary border border-border-primary shadow-lg"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)} 
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="flex items-center space-x-2">
                  {typeof CryptoCurrencyIcon !== 'undefined' ? (
                    <CryptoCurrencyIcon name={selectedCoin.id.toLowerCase()} size={28} />
                  ) : (
                    <CryptoIcon symbol={selectedCoin.id} size={28} />
                  )}
                  <h2 className="text-xl font-bold text-text-primary">{selectedCoin.name} Price</h2>
                  <motion.div
                    animate={{ rotate: dropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown size={16} className="text-gray-900 dark:text-white" />
                  </motion.div>
                </div>
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-48 rounded-md shadow-lg bg-background-primary border border-border-primary z-10 overflow-hidden"
                    style={{ transformOrigin: 'top left' }}
                  >
                    <div className="py-1">
                      {availableCoins.map((coin, index) => (
                        <motion.button
                          key={coin.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          className={`flex items-center w-full px-4 py-2 text-sm text-left hover:bg-background-secondary ${
                            selectedCoin.id === coin.id ? 'bg-background-secondary' : ''
                          }`}
                          onClick={() => {
                            setSelectedCoin(coin);
                            setDropdownOpen(false);
                          }}
                        >
                          <div className="flex items-center space-x-2">
                            <CryptoIcon symbol={coin.id} size={20} />
                            <span className="text-text-primary">{coin.name}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex flex-wrap gap-2">
              {timePeriods.map((period) => (
                <button
                  key={period.value}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    timeRange === period.value 
                      ? `bg-brand-primary text-background-primary` 
                      : 'bg-background-secondary text-text-primary hover:bg-background-tertiary'
                  }`}
                  style={timeRange === period.value ? { backgroundColor: selectedCoin.color } : {}}
                  onClick={() => setTimeRange(period.value)}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[300px] lg:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={selectedCoin.data}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id={`color${selectedCoin.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={selectedCoin.color} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={selectedCoin.color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis 
                  dataKey="time"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  domain={['auto', 'auto']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={selectedCoin.color}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#color${selectedCoin.id})`}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="transparent"
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 lg:p-6 rounded-xl bg-background-primary border border-border-primary shadow-lg"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-text-primary">Market Overview</h2>
          </div>
          <div className="space-y-4">
            <AnimatePresence>
              {visibleMarketData.map((coin, index) => (
                <motion.div 
                  key={coin.id || index}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between p-3 hover:bg-background-secondary rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <CryptoIcon symbol={coin.symbol} />
                    <div>
                      <p className="font-semibold text-text-primary">{coin.name}</p>
                      <p className="text-sm text-text-secondary">Vol: {coin.volume}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-text-primary">${coin.price.toLocaleString()}</p>
                    <p className={`text-sm flex items-center justify-end ${
                      typeof coin.change === 'string' 
                        ? coin.change.startsWith('+') ? 'text-feedback-success' : 'text-feedback-error'
                        : coin.change > 0 ? 'text-feedback-success' : 'text-feedback-error'
                    }`}>
                      {typeof coin.change === 'string'
                        ? (coin.change.startsWith('+') ? <ArrowUp size={12} /> : <ArrowDown size={12} />)
                        : (coin.change > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />)
                      }
                      {typeof coin.change === 'string' ? coin.change : `${coin.change > 0 ? '+' : ''}${coin.change}%`}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAllMarketCoins(!showAllMarketCoins)}
            className="mt-4 w-full py-2 px-4 text-sm font-medium text-brand-primary bg-background-secondary rounded-lg flex items-center justify-center hover:bg-background-tertiary transition-colors"
          >
            {showAllMarketCoins ? 'Show Less' : 'View More'}
            <motion.div
              animate={{ rotate: showAllMarketCoins ? 90 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronRight size={16} className="ml-2" />
            </motion.div>
          </motion.button>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 lg:p-6 rounded-xl bg-background-primary border border-border-primary shadow-lg"
        >
          <h2 className="text-xl font-bold mb-6 text-text-primary">Top Gainers</h2>
          <div className="space-y-4">
            {gainers.map((coin, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-background-secondary rounded-lg transition-colors">
                <div className="flex items-center space-x-2">
                  <CryptoIcon symbol={coin.symbol} />
                  <div>
                    <p className="font-semibold text-text-primary">{coin.coin}</p>
                    <p className="text-sm text-text-secondary">Vol: {coin.volume}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-text-primary">${coin.price}</p>
                  <p className={`text-sm flex items-center justify-end ${
                    typeof coin.change === 'string' 
                      ? coin.change.startsWith('+') ? 'text-feedback-success' : 'text-feedback-error'
                      : coin.change > 0 ? 'text-feedback-success' : 'text-feedback-error'
                  }`}>
                    {typeof coin.change === 'string'
                      ? (coin.change.startsWith('+') ? <ArrowUp size={12} /> : <ArrowDown size={12} />)
                      : (coin.change > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />)
                    }
                    {typeof coin.change === 'string' ? coin.change : `${coin.change > 0 ? '+' : ''}${coin.change}%`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 lg:p-6 rounded-xl bg-background-primary border border-border-primary shadow-lg"
        >
          <h2 className="text-xl font-bold mb-6 text-text-primary">Top Losers</h2>
          <div className="space-y-4">
            {losers.map((coin, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-background-secondary rounded-lg transition-colors">
                <div className="flex items-center space-x-2">
                  <CryptoIcon symbol={coin.symbol} />
                  <div>
                    <p className="font-semibold text-text-primary">{coin.coin}</p>
                    <p className="text-sm text-text-secondary">Vol: {coin.volume}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-text-primary">${coin.price}</p>
                  <p className={`text-sm flex items-center justify-end ${
                    typeof coin.change === 'string' 
                      ? coin.change.startsWith('+') ? 'text-feedback-success' : 'text-feedback-error'
                      : coin.change > 0 ? 'text-feedback-success' : 'text-feedback-error'
                  }`}>
                    {typeof coin.change === 'string'
                      ? (coin.change.startsWith('+') ? <ArrowUp size={12} /> : <ArrowDown size={12} />)
                      : (coin.change > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />)
                    }
                    {typeof coin.change === 'string' ? coin.change : `${coin.change > 0 ? '+' : ''}${coin.change}%`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 lg:p-6 rounded-xl bg-background-primary border border-border-primary shadow-lg"
      >
        <h2 className="text-xl font-bold mb-6 text-text-primary">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="pb-4 text-text-tertiary">Type</th>
                <th className="pb-4 text-text-tertiary">Amount</th>
                <th className="pb-4 text-text-tertiary">Currency</th>
                <th className="pb-4 text-text-tertiary">Date</th>
                <th className="pb-4 text-text-tertiary">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <motion.tr
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * transaction.id }}
                  className="border-t border-border-primary hover:bg-background-secondary transition-colors"
                >
                  <td className="py-4 text-text-secondary">
                    <div className="flex items-center space-x-2">
                      {transaction.type === 'Deposit' ? (
                        <ArrowUp className="text-feedback-success" size={16} />
                      ) : (
                        <ArrowDown className="text-feedback-error" size={16} />
                      )}
                      <span>{transaction.type}</span>
                    </div>
                  </td>
                  <td className="py-4 text-text-secondary">${transaction.amount.toLocaleString()}</td>
                  <td className="py-4 text-text-secondary">{transaction.currency}</td>
                  <td className="py-4 text-text-secondary">{transaction.date}</td>
                  <td className={`py-4 ${
                    transaction.status === 'Completed' ? 'text-feedback-success' : 
                    transaction.status === 'Pending' ? 'text-feedback-warning' : 
                    'text-feedback-error'
                  }`}>
                    {transaction.status}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 lg:p-6 rounded-xl bg-background-primary border border-border-primary shadow-lg"
      >
        <h2 className="text-xl font-bold mb-6 text-text-primary">Latest News</h2>
        <div className="space-y-4">
          {news.map((article) => (
            <div key={article.id} className="flex items-center justify-between p-3 hover:bg-background-secondary rounded-lg transition-colors">
              <div>
                <p className="font-semibold text-text-primary">{article.title}</p>
                <p className="text-sm text-text-secondary">{article.date}</p>
              </div>
              <Newspaper className="text-blue-600 dark:text-yellow-500" size={24} />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
