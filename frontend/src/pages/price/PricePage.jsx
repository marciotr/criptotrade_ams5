import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import { ArrowUp, ArrowDown, ArrowLeft, ChevronDown, Search, ThumbsUp, ThumbsDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import CryptoIcon from '../../components/common/CryptoIcons';
import { marketData } from '../../data/mockData';


// Mock price data
const priceData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
  price: 30000 + Math.random() * 5000
}));

// First, update the mock data
const priceHistoryData = [
  {
    period: 'Today',
    price: 30000,
    amount_change: 1500,
    percent_change: 5.26
  },
  {
    period: '30 Days',
    price: 28500,
    amount_change: -2000,
    percent_change: -6.55
  },
  {
    period: '60 Days',
    price: 31000,
    amount_change: 3500,
    percent_change: 12.73
  },
  {
    period: '90 Days',
    price: 27500,
    amount_change: -1200,
    percent_change: -4.18
  }
];

// Add these animation variants
const dropdownVariants = {
  hidden: { 
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 }
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: { duration: 0.2 }
  },
  exit: { 
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 }
  }
};

// Add these animation variants at the top
const cardVariants = {
  hover: { 
    scale: 1.02,
    transition: { type: "spring", stiffness: 300 }
  }
};

const infoCardVariants = {
  hover: {
    y: -5,
    transition: { type: "spring", stiffness: 300 }
  }
};

// Add these animation variants
const scrollVariants = {
  hidden: (direction = 1) => ({
    opacity: 0,
    x: 50 * direction,
  }),
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

// Create a reusable scroll animation component
const ScrollAnimatedSection = ({ children, direction = 1, delay = 0 }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      variants={scrollVariants}
      initial="hidden"
      custom={direction}
      animate={isInView ? "visible" : "hidden"}
      transition={{ delay }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

export function PricePage() {
  const { coinId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('buy');
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [methodDropdownOpen, setMethodDropdownOpen] = useState(false);
  const [currencySearchQuery, setCurrencySearchQuery] = useState('');
  const [filteredCurrencies, setFilteredCurrencies] = useState(['USD', 'EUR', 'GBP', 'JPY', 'BRL']);
  
  const coin = marketData.find(c => String(c.id).toLowerCase() === String(coinId).toLowerCase());

  if (!coin) {
    return (
      <div className="p-6">
        <div className="text-text-primary">Coin not found</div>
        <button 
          onClick={() => navigate('/markets')}
          className="mt-4 flex items-center text-brand-primary hover:underline"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Markets
        </button>
      </div>
    );
  }

  // Add filter function
  const filterCurrencies = (query) => {
    const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'BRL'];
    const filtered = currencies.filter(currency => 
      currency.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCurrencies(filtered);
  };

  // Calculate estimated value
  const estimatedCrypto = amount ? (parseFloat(amount) / coin.price).toFixed(6) : '0';

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <button 
          onClick={() => navigate('/markets')}
          className="flex items-center text-brand-primary hover:underline"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Markets
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Coin Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-background-primary p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center space-x-4">
              <CryptoIcon symbol={coin.symbol} size={48} />
              <div>
                <h1 className="text-2xl font-bold text-text-primary">
                  {coin.name} ({coin.symbol})
                </h1>
                <div className="flex items-center space-x-3 mt-2">
                  <span className="text-xl font-semibold text-text-primary">
                    ${coin.price.toLocaleString()}
                  </span>
                  <span className={`flex items-center ${
                    coin.change > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {coin.change > 0 ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
                    {Math.abs(coin.change)}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Price Chart */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-background-primary rounded-xl p-6 shadow-lg h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#7C3AED" 
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Buy/Trade Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-background-secondary rounded-xl shadow-lg overflow-hidden"
        >
          {/* Tabs */}
          <div className="relative flex h-14 bg-background-primary">
            <motion.div 
              className="absolute bottom-0 h-1 bg-brand-primary"
              animate={{ 
                left: activeTab === 'buy' ? '0%' : '50%',
                right: activeTab === 'buy' ? '50%' : '0%'
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
            />
            <button 
              className={`flex-1 font-medium ${
                activeTab === 'buy' 
                  ? 'text-brand-primary'
                  : 'text-text-secondary'
              }`}
              onClick={() => setActiveTab('buy')}
            >
              Buy {coin.symbol}
            </button>
            <button 
              className={`flex-1 font-medium ${
                activeTab === 'sell'
                  ? 'text-brand-primary'
                  : 'text-text-secondary'
              }`}
              onClick={() => setActiveTab('sell')}
            >
              Sell {coin.symbol}
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                {activeTab === 'buy' ? 'I want to spend' : 'I want to sell'}
              </label>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                <input
                  type="text"
                  className="w-full sm:flex-grow px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-l-lg sm:rounded-r-none border border-border-primary bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <div className="relative w-full sm:w-auto">
                  <button 
                    className="w-full sm:w-auto flex items-center justify-between min-w-[100px] px-3 sm:px-4 py-2.5 sm:py-3 bg-background-secondary border border-border-primary rounded-lg sm:rounded-l-none sm:rounded-r-lg text-text-primary focus:outline-none"
                    onClick={() => setMethodDropdownOpen(!methodDropdownOpen)}
                  >
                    <span>{selectedCurrency}</span>
                    <ChevronDown size={16} className={`ml-2 transition-transform duration-200 ${methodDropdownOpen ? 'transform rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {methodDropdownOpen && (
                      <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={dropdownVariants}
                        className="absolute right-0 mt-2 w-full sm:w-56 bg-background-primary rounded-lg shadow-lg z-10 overflow-hidden"
                      >
                        <div className="p-2 border-b border-border-primary">
                          <div className="relative">
                            <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-tertiary" />
                            <input
                              type="text"
                              placeholder="Search currency..."
                              value={currencySearchQuery}
                              onChange={(e) => {
                                setCurrencySearchQuery(e.target.value);
                                filterCurrencies(e.target.value);
                              }}
                              className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-border-primary bg-background-secondary text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            />
                          </div>
                        </div>
                        <motion.div className="py-1 max-h-60 overflow-y-auto">
                          {filteredCurrencies.length > 0 ? (
                            filteredCurrencies.map((currency, index) => (
                              <motion.button
                                key={currency}
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ 
                                  opacity: 1, 
                                  y: 0,
                                  transition: { delay: index * 0.05 }
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-secondary"
                                onClick={() => {
                                  setSelectedCurrency(currency);
                                  setMethodDropdownOpen(false);
                                  setCurrencySearchQuery('');
                                  setFilteredCurrencies(['USD', 'EUR', 'GBP', 'JPY', 'BRL']);
                                }}
                              >
                                {currency}
                              </motion.button>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-sm text-text-tertiary">
                              No currencies found
                            </div>
                          )}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Estimated Amount */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                {activeTab === 'buy' ? 'You will receive approximately' : 'You will receive'}
              </label>
              <div className="flex items-center bg-background-secondary rounded-lg p-3 border border-border-primary">
                <div className="flex items-center">
                  <CryptoIcon symbol={coin.symbol} size={20} className="mr-2" />
                  <span className="text-text-primary font-medium">{estimatedCrypto} {coin.symbol}</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              className="w-full py-3 bg-brand-primary text-background-primary rounded-lg hover:opacity-90 transition-colors font-medium"
            >
              {activeTab === 'buy' ? `Buy ${coin.symbol}` : `Sell ${coin.symbol}`}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Market Sentiment - Moved to top */}
      <div className="mt-8 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> {/* Increased spacing */}
        <div className="lg:ml-[5%]">
          <ScrollAnimatedSection>
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-background-primary p-6 rounded-xl shadow-lg"
            >
              <h2 className="text-xl font-bold text-text-primary mb-4">
                How do you feel about {coin.name} today?
              </h2>
              <div className="relative h-2 bg-background-secondary rounded-full overflow-hidden">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 to-green-500"
                  style={{ width: '100%' }}
                />
                <motion.div
                  className="absolute top-0 h-full w-2 bg-white"
                  animate={{
                    left: `${coin.change > 0 ? 50 + Math.min(Math.abs(coin.change), 50) : 50 - Math.min(Math.abs(coin.change), 50)}%`,
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    scale: {
                      duration: 1,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }
                  }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-red-500 text-sm flex items-center">
                  <ThumbsDown size={16} className="mr-1" /> Bad
                </span>
                <span className="text-green-500 text-sm flex items-center">
                  <ThumbsUp size={16} className="mr-1" /> Good
                </span>
              </div>
            </motion.div>
          </ScrollAnimatedSection>
        </div>

        <div className="lg:mr-[5%]">
          <ScrollAnimatedSection direction={-1}>
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-background-primary p-6 rounded-xl shadow-lg"
            >
              <h2 className="text-xl font-bold text-text-primary mb-4">
                {coin.name} Price Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { label: "24h High", value: `$${(coin.price * 1.05).toLocaleString()}`, icon: <ArrowUp /> },
                  { label: "24h Low", value: `$${(coin.price * 0.95).toLocaleString()}`, icon: <ArrowDown /> },
                  { label: "24h Volume", value: `$${(coin.price * 1000000).toLocaleString()}` }
                ].map((info, index) => (
                  <motion.div
                    key={info.label}
                    variants={infoCardVariants}
                    whileHover="hover"
                    className="p-4 bg-background-secondary rounded-lg border border-border-primary hover:border-brand-primary transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-text-secondary">{info.label}</p>
                      {info.icon && <span className={`${info.label.includes('High') ? 'text-green-500' : 'text-red-500'}`}>
                        {info.icon}
                      </span>}
                    </div>
                    <p className="text-text-primary font-medium mt-2">{info.value}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </ScrollAnimatedSection>
        </div>

        <div className="lg:ml-[10%]">
          <ScrollAnimatedSection>
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-background-primary p-6 rounded-xl shadow-lg"
            >
              <h2 className="text-xl font-bold text-text-primary mb-4">
                {coin.name} Market Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <p className="text-text-secondary">Market Cap Rank</p>
                  <p className="text-text-primary font-medium">#1</p>
                </div>
                <div>
                  <p className="text-text-secondary">Market Cap</p>
                  <p className="text-text-primary font-medium">
                    ${(coin.price * 19000000).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-text-secondary">Circulating Supply</p>
                  <p className="text-text-primary font-medium">
                    {(19000000).toLocaleString()} {coin.symbol}
                  </p>
                </div>
              </div>
            </motion.div>
          </ScrollAnimatedSection>
        </div>

        <ScrollAnimatedSection direction={-1}>
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-background-primary p-6 rounded-xl shadow-lg"
          >
            <h2 className="text-xl font-bold text-text-primary mb-4">
              What can you do with {coin.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: "Trade",
                  description: `Buy and sell ${coin.name} on our secure platform`,
                  icon: "💱",
                  color: "from-purple-500 to-blue-500"
                },
                {
                  title: "Store",
                  description: `Store your ${coin.name} safely in our wallet`,
                  icon: "🏦",
                  color: "from-blue-500 to-cyan-500"
                },
                {
                  title: "Stake",
                  description: `Earn rewards by staking your ${coin.name}`,
                  icon: "💎",
                  color: "from-emerald-500 to-green-500"
                }
              ].map((feature) => (
                <motion.div
                  key={feature.title}
                  variants={cardVariants}
                  whileHover="hover"
                  className={`p-6 rounded-lg bg-gradient-to-br ${feature.color} relative overflow-hidden group`}
                >
                  <div className="absolute inset-0 bg-background-secondary opacity-90 group-hover:opacity-85 transition-opacity" />
                  <div className="relative z-10">
                    <span className="text-2xl mb-3 block">{feature.icon}</span>
                    <h3 className="font-medium text-text-primary mb-2">{feature.title}</h3>
                    <p className="text-text-secondary text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </ScrollAnimatedSection>

        <ScrollAnimatedSection>
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-background-primary p-6 rounded-xl shadow-lg"
          >
            <h2 className="text-xl font-bold text-text-primary mb-4">
              {coin.name} Price History
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-primary">
                    <th className="pb-4 text-left text-text-secondary font-medium">Time Period</th>
                    <th className="pb-4 text-right text-text-secondary font-medium">Price</th>
                    <th className="pb-4 text-right text-text-secondary font-medium">Amount Change</th>
                    <th className="pb-4 text-right text-text-secondary font-medium">% Change</th>
                  </tr>
                </thead>
                <tbody>
                  {priceHistoryData.map((data) => (
                    <tr key={data.period} className="border-b border-border-primary">
                      <td className="py-4 text-text-primary font-medium">{data.period}</td>
                      <td className="py-4 text-right text-text-primary">
                        ${data.price.toLocaleString()}
                      </td>
                      <td className={`py-4 text-right ${
                        data.amount_change >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {data.amount_change >= 0 ? '+' : ''}${data.amount_change.toLocaleString()}
                      </td>
                      <td className="py-4 text-right flex items-center justify-end">
                        <span className={`flex items-center ${
                          data.percent_change >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {data.percent_change >= 0 ? (
                            <ArrowUp size={16} className="mr-1" />
                          ) : (
                            <ArrowDown size={16} className="mr-1" />
                          )}
                          {data.percent_change >= 0 ? '+' : ''}{data.percent_change}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </ScrollAnimatedSection>
      </div>
    </div>
  );
}