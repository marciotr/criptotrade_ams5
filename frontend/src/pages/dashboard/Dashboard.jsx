import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { marketApi } from '../../services/api/api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpRight, ArrowDownRight, Zap, TrendingUp, 
  ChevronRight, BarChart2, Activity, PieChart,
  Droplets, Diamond, Star, Clock, Plus
} from 'lucide-react';
import logoBranca from '../../assets/img/logoBinanceRemoved.png';
import logoPreta from '../../assets/img/logoBinanceRemoved.png';
import { 
  transactions, 
  news, 
  statsData 
} from '../../data/mockData';
import { StatsCards } from './components/StatsCards';
import { CryptoChart } from './components/CryptoChart';
import { MarketOverview } from './components/MarketOverview';
import { TopMovers } from './components/TopMovers';
import { RecentTransactions } from './components/RecentTransactions';
import { LatestNews } from './components/LatestNews';
import { CoinSelector } from './components/CoinSelector';
import { TimeRangeSelector } from './components/TimeRangeSelector';
import { useAuth } from '../../store/auth/useAuth';

// Componente de elementos flutuantes
const FloatingElement = ({ children, delay, x, y, duration = 20 }) => (
  <motion.div
    className="absolute pointer-events-none z-0"
    initial={{ opacity: 0 }}
    animate={{ 
      opacity: [0.2, 0.3, 0.2], 
      x: [`${x}%`, `${x + 5}%`, `${x}%`],
      y: [`${y}%`, `${y - 5}%`, `${y}%`]
    }}
    transition={{ 
      repeat: Infinity, 
      repeatType: "reverse",
      duration: duration,
      delay: delay,
      ease: "easeInOut" 
    }}
  >
    {children}
  </motion.div>
);

// Contêiner de seção animada
const AnimatedSection = ({ className, children, delay = 0, direction = "up" }) => {
  const variants = {
    hidden: { 
      opacity: 0, 
      y: direction === "up" ? 40 : direction === "down" ? -40 : 0,
      x: direction === "left" ? 40 : direction === "right" ? -40 : 0
    },
    visible: { 
      opacity: 1, 
      y: 0,
      x: 0
    }
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={variants}
      transition={{ 
        type: "spring",
        stiffness: 100, 
        damping: 20,
        delay: delay
      }}
    >
      {children}
    </motion.div>
  );
};

// Card com efeito de hover
const HoverCard = ({ children, className = "", delay = 0 }) => (
  <motion.div
    className={`${className} relative overflow-hidden rounded-xl border border-border-primary bg-background-primary shadow-lg transition-all duration-300`}
    initial={{ opacity: 0, scale: 0.98 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ delay }}
    whileHover={{ 
      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
      y: -5
    }}
  >
    {children}
  </motion.div>
);

export function Dashboard() {
  // Estados existentes
  const { user } = useAuth();
  const userName = user?.name || 'Usuário';
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  // Novo estado para o modo de edição
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Estado para armazenar a configuração de layout do usuário
  const [userLayout, setUserLayout] = useState(() => {
    const savedLayout = localStorage.getItem('userDashboardLayout');
    return savedLayout ? JSON.parse(savedLayout) : {
      topSection: ['welcome', 'trendingCoins', 'tradingTips'],
      middleSection: ['portfolioValue', 'dailyProfit', '24hChange', 'activePositions'],
      mainContent: ['chart', 'marketOverview', 'topGainers', 'topLosers']
    };
  });

  // Função para salvar layout no localStorage
  const saveLayout = useCallback((newLayout) => {
    setUserLayout(newLayout);
    localStorage.setItem('userDashboardLayout', JSON.stringify(newLayout));
  }, []);
  
  // Função para alternar visibilidade de um componente
  const toggleComponent = useCallback((section, component) => {
    setUserLayout(prevLayout => {
      const newLayout = { ...prevLayout };
      if (newLayout[section].includes(component)) {
        newLayout[section] = newLayout[section].filter(item => item !== component);
      } else {
        newLayout[section] = [...newLayout[section], component];
      }
      localStorage.setItem('userDashboardLayout', JSON.stringify(newLayout));
      return newLayout;
    });
  }, []);

  const [selectedCoin, setSelectedCoin] = useState({
    id: '',
    name: '',
    color: '#F7931A',
    data: []
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('24H');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const [cryptoData, setCryptoData] = useState([]);
  const [selectedCryptoData, setSelectedCryptoData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(5);
  const [tickers, setTickers] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [activeTab, setActiveTab] = useState('chart'); // 'chart', 'transactions', 'news'

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tickersResponse = await marketApi.getAllTickers();
        const tickersData = tickersResponse.data;
        
        requestAnimationFrame(() => {
          setTickers(tickersData);
        });
      } catch (error) {
        console.error('Erro ao buscar tickers:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const processedCryptoData = useMemo(() => {
    if (!tickers?.length) return [];

    return tickers
      .filter(ticker => ticker.symbol.endsWith('USDT'))
      .map(ticker => ({
        symbol: ticker.symbol,
        name: ticker.symbol.replace('USDT', ''),
        currentPrice: Number(ticker.lastPrice),
        priceChange: Number(ticker.priceChangePercent),
        volume: ticker.volume,
        highPrice: Number(ticker.highPrice),
        lowPrice: Number(ticker.lowPrice)
      }));
  }, [tickers]);

  useEffect(() => {
    setCryptoData(processedCryptoData);
  }, [processedCryptoData]);

  const getIntervalFromTimeRange = (range) => {
    switch (range) {
      case '1H':
        return { interval: '1m', limit: 60 }; // 60 pontos x 1 minuto = 1 hora
      case '24H':
        return { interval: '15m', limit: 96 }; // 96 pontos x 15 minutos = 24 horas
      case '7D':
      case '1W':
        return { interval: '1h', limit: 168 }; // 168 pontos x 1 hora = 1 semana
      case '30D':
      case '1M':
        return { interval: '4h', limit: 180 }; // 180 pontos x 4 horas = 30 dias (aprox. 1 mês)
      case '1Y':
        return { interval: '1d', limit: 365 }; // 365 pontos x 1 dia = 1 ano
      default:
        return { interval: '15m', limit: 96 };
    }
  };

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        setIsLoading(true);
        
        if (processedCryptoData.length > 0) {
          const firstCrypto = processedCryptoData[0];
          setSelectedCoin({
            id: firstCrypto.symbol,
            name: firstCrypto.name,
            color: '#F7931A',
            data: []
          });

          await fetchCoinData(firstCrypto.symbol);
        }
      } catch (error) {
        console.error('Erro ao buscar dados de criptomoedas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCryptoData();
  }, [processedCryptoData]);

  const fetchCoinData = useCallback(async (symbol) => {
    try {
      const formattedSymbol = symbol.replace(/USDT+$/, '') + 'USDT';
      const { interval, limit } = getIntervalFromTimeRange(timeRange);
      
      const [tickerData, klinesData] = await Promise.all([
        marketApi.getTickerBySymbol(formattedSymbol),
        marketApi.getKlines(formattedSymbol, interval, limit)
      ]);

      const formattedKlines = klinesData.data.map(([timestamp, open, high, low, close, volume]) => ({
        time: new Date(timestamp).toLocaleString(),
        price: Number(close),
        volume: Number(volume),
        high: Number(high),
        low: Number(low),
        open: Number(open),
        fullDate: new Date(timestamp).toLocaleString()
      }));

      requestAnimationFrame(() => {
        setSelectedCryptoData(tickerData.data);
        setSelectedCoin(prev => ({
          ...prev,
          data: formattedKlines
        }));
      });

    } catch (error) {
      console.error('Erro ao buscar dados da moeda:', error);
    }
  }, [timeRange]);

  const handleCoinSelection = useCallback(async (coin) => {
    setIsLoading(true);
    setDropdownOpen(false);

    try {
      setSelectedCoin(prev => ({
        ...prev,
        ...coin,
        data: []
      }));
      
      await fetchCoinData(coin.id);
    } catch (error) {
      console.error('Erro ao selecionar moeda:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchCoinData]);

  useEffect(() => {
    if (selectedCoin?.id) {
      fetchCoinData(selectedCoin.id);
    }
  }, [selectedCoin?.id, fetchCoinData]);

  const handleTimeRangeChange = useCallback((newRange) => {
    setTimeRange(newRange);
    if (selectedCoin?.id) {
      fetchCoinData(selectedCoin.id);
    }
  }, [selectedCoin?.id, fetchCoinData]);

  const getTopMovers = useMemo(() => {
    if (!tickers?.length) return { gainers: [], losers: [] };

    const processedTickers = tickers
      .filter(ticker => ticker.symbol.endsWith('USDT'))
      .map(ticker => ({
        symbol: ticker.symbol,
        coin: ticker.symbol.replace('USDT', ''),
        price: parseFloat(ticker.lastPrice),
        change: parseFloat(ticker.priceChangePercent),
        volume: ticker.volume,
        normalizedVolume: parseFloat(ticker.volume)
      }));

    const validTickers = processedTickers.filter(
      t => !isNaN(t.change) && !isNaN(t.price) && t.price > 0
    );

    return {
      gainers: validTickers
        .filter(t => t.change > 0)
        .sort((a, b) => b.change - a.change)
        .slice(0, 5),
      losers: validTickers
        .filter(t => t.change < 0)
        .sort((a, b) => a.change - b.change)
        .slice(0, 5)
    };
  }, [tickers]);

  const timePeriods = useMemo(() => {
    if (windowWidth < 640) {
      return [
        { value: '1H', label: '1H' },
        { value: '24H', label: '24H' },
        { value: '1W', label: '1S' },
      ];
    }
    return [
      { value: '1H', label: '1H' },
      { value: '24H', label: '24H' },
      { value: '1W', label: '1S' },
      { value: '1M', label: '1M' },
      { value: '1Y', label: '1A' },
    ];
  }, [windowWidth]);

  const availableCoins = useMemo(() => {
    const colorMap = {
      'BTC': '#F7931A',
      'ETH': '#627EEA',
    };

    return processedCryptoData.map(coin => ({
      id: coin.symbol,
      name: coin.name,
      color: colorMap[coin.name] || '#F7931A',
      data: []
    }));
  }, [processedCryptoData]);

  const visibleMarketData = cryptoData.slice(0, visibleCount);

  const handleShowMore = useCallback(() => {
    navigate('/markets'); 
  }, [navigate]);

  // Define constantes de animação
  const containerAnimation = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const fadeInAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="relative p-4 lg:p-6 transition-colors duration-200 max-w-[2000px] mx-auto overflow-x-hidden"
      initial="hidden"
      animate="show"
      variants={containerAnimation}
    >
      {/* Elementos de fundo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <FloatingElement delay={0} x={10} y={20} duration={30}>
          <div className="bg-gradient-to-r from-brand-primary/10 to-brand-primary/5 w-64 h-64 rounded-full blur-3xl"></div>
        </FloatingElement>
        
        <FloatingElement delay={5} x={70} y={60} duration={25}>
          <div className="bg-gradient-to-l from-brand-primary/10 to-brand-primary/5 w-96 h-96 rounded-full blur-3xl"></div>
        </FloatingElement>
        
        <FloatingElement delay={2} x={40} y={80} duration={35}>
          <div className="bg-gradient-to-tr from-brand-primary/8 to-brand-primary/3 w-80 h-80 rounded-full blur-3xl"></div>
        </FloatingElement>
      </div>

      {/* Logo fixa no fundo */}
      <div className="fixed bottom-0 right-0 pointer-events-none opacity-5 z-0 transition-opacity duration-300">
        <motion.img
          src={theme === 'light' ? logoBranca : logoPreta}
          alt=""
          className="w-[600px] h-[600px] object-contain"
          animate={{ 
            opacity: [0.05, 0.07, 0.05],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut" 
          }}
        />
      </div>

      {/* Seção de Estatísticas Hero */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              Olá, <span className="text-brand-primary">{userName}</span>! Seja Bem-vindo!
            </h1>
            <p className="text-text-secondary mt-1">Seu painel de negociações personalizado</p>
          </div>
          
          <button className="px-4 py-2 rounded-lg bg-brand-primary text-white flex items-center font-medium hover:bg-opacity-90 transition-all">
            <Zap size={16} className="mr-1" />
            Negociação Rápida
          </button>
        </div>
        
        <div className="p-6 rounded-xl border border-border-primary bg-background-primary shadow-md mb-6">
          <div className="flex flex-col lg:flex-row justify-between">
            <div className="lg:w-1/2 mb-6 lg:mb-0 lg:pr-6">
              <h2 className="text-lg font-semibold text-text-primary flex items-center mb-4">
                <TrendingUp size={20} className="mr-2 text-brand-primary" /> 
                <span>Moedas em tendência</span>
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {getTopMovers.gainers.slice(0, 3).map((coin, index) => (
                  <div key={coin.symbol} className="p-3 rounded-lg border border-border-primary bg-background-secondary">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-text-primary">{coin.coin}</span>
                      <span className="text-green-500 text-xs flex items-center">
                        <ArrowUpRight size={12} className="mr-0.5" />
                        {coin.change.toFixed(2)}%
                      </span>
                    </div>
                    <div className="text-text-secondary text-sm mt-1">R${parseFloat(coin.price).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="lg:w-1/2 lg:border-l lg:pl-6 lg:border-border-primary">
              <h2 className="text-lg font-semibold text-text-primary flex items-center mb-4">
                <Zap size={20} className="mr-2 text-brand-primary" /> 
                <span>Dicas de trading</span>
              </h2>
              <div className="bg-background-secondary p-4 rounded-lg border border-border-primary">
                <p className="text-text-primary italic">"Nunca invista mais do que você pode perder. Diversifique sua carteira para reduzir riscos."</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="relative overflow-hidden rounded-xl border border-border-primary bg-background-primary p-4 shadow-md hover:translate-y-[-5px] transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1" style={{ 
              background: "linear-gradient(to right, var(--brand-primary), transparent)"
            }} />
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-brand-primary bg-opacity-10">
                <TrendingUp size={20} className="text-brand-primary" />
              </div>
              <span className="text-xs text-text-tertiary py-1 px-2 rounded-full bg-background-secondary">24h</span>
            </div>
            <p className="text-sm text-text-secondary mt-2">Valor da Carteira</p>
            <div className="flex items-baseline mt-1">
              <p className="text-xl font-bold text-text-primary">R$25.670,84</p>
              <span className="ml-2 text-xs flex items-center text-green-500">
                <ArrowUpRight size={12} className="mr-0.5" />
                8.2%
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-border-primary bg-background-primary p-4 shadow-md hover:translate-y-[-5px] transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1" style={{ 
              background: "linear-gradient(to right, #10b981, transparent)"
            }} />
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-green-500 bg-opacity-10">
                <TrendingUp size={20} className="text-green-500" />
              </div>
              <span className="text-xs text-text-tertiary py-1 px-2 rounded-full bg-background-secondary">24h</span>
            </div>
            <p className="text-sm text-text-secondary mt-2">Lucro Diário</p>
            <div className="flex items-baseline mt-1">
              <p className="text-xl font-bold text-text-primary">+R$892,40</p>
              <span className="ml-2 text-xs flex items-center text-green-500">
                <ArrowUpRight size={12} className="mr-0.5" />
                4.3%
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-border-primary bg-background-primary p-4 shadow-md hover:translate-y-[-5px] transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1" style={{ 
              background: "linear-gradient(to right, #f59e0b, transparent)"
            }} />
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-amber-500 bg-opacity-10">
                <TrendingUp size={20} className="text-amber-500" />
              </div>
              <span className="text-xs text-text-tertiary py-1 px-2 rounded-full bg-background-secondary">24h</span>
            </div>
            <p className="text-sm text-text-secondary mt-2">Variação 24h</p>
            <div className="flex items-baseline mt-1">
              <p className="text-xl font-bold text-text-primary">+12.36%</p>
              <span className="ml-2 text-xs flex items-center text-green-500">
                <ArrowUpRight size={12} className="mr-0.5" />
                6.1%
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-border-primary bg-background-primary p-4 shadow-md hover:translate-y-[-5px] transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1" style={{ 
              background: "linear-gradient(to right, #8b5cf6, transparent)"
            }} />
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-purple-500 bg-opacity-10">
                <TrendingUp size={20} className="text-purple-500" />
              </div>
              <span className="text-xs text-text-tertiary py-1 px-2 rounded-full bg-background-secondary">24h</span>
            </div>
            <p className="text-sm text-text-secondary mt-2">Posições Ativas</p>
            <div className="flex items-baseline mt-1">
              <p className="text-xl font-bold text-text-primary">7</p>
              <span className="ml-2 text-xs flex items-center text-green-500">
                <ArrowUpRight size={12} className="mr-0.5" />
                2
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Abas de Navegação */}
      <AnimatedSection className="mb-6" delay={0.2}>
        <div className="flex space-x-2 mb-6 border-b border-border-primary pb-2 overflow-x-auto scrollbar-hide">
          <motion.button
            className={`px-4 py-2 rounded-lg flex items-center ${
              activeTab === 'chart' 
                ? 'bg-brand-primary text-white font-medium' 
                : 'hover:bg-background-secondary text-text-secondary'
            }`}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('chart')}
          >
            <BarChart2 size={18} className="mr-2" />
            Gráfico em Tempo Real
          </motion.button>
          
          <motion.button
            className={`px-4 py-2 rounded-lg flex items-center ${
              activeTab === 'markets' 
                ? 'bg-brand-primary text-white font-medium' 
                : 'hover:bg-background-secondary text-text-secondary'
            }`}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('markets')}
          >
            <Activity size={18} className="mr-2" />
            Mercados
          </motion.button>
          
          <motion.button
            className={`px-4 py-2 rounded-lg flex items-center ${
              activeTab === 'transactions' 
                ? 'bg-brand-primary text-white font-medium' 
                : 'hover:bg-background-secondary text-text-secondary'
            }`}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('transactions')}
          >
            <PieChart size={18} className="mr-2" />
            Transações
          </motion.button>
          
          <motion.button
            className={`px-4 py-2 rounded-lg flex items-center ${
              activeTab === 'news' 
                ? 'bg-brand-primary text-white font-medium' 
                : 'hover:bg-background-secondary text-text-secondary'
            }`}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('news')}
          >
            <PieChart size={18} className="mr-2" />
            Últimas Notícias
          </motion.button>
        </div>
      </AnimatedSection>

      <AnimatePresence mode="wait">
        {/* Conteúdo baseado na aba ativa */}
        {activeTab === 'chart' && (
          <motion.div
            key="chart-tab"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid lg:grid-cols-3 gap-6 mb-6">
              <HoverCard className="lg:col-span-2 p-6" delay={0.1}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
                  <CoinSelector 
                    selectedCoin={selectedCoin}
                    coins={availableCoins}
                    isOpen={dropdownOpen}
                    onToggle={() => setDropdownOpen(!dropdownOpen)}
                    onSelect={handleCoinSelection}
                    price={selectedCryptoData?.lastPrice}
                    align="left"
                  />
                  <TimeRangeSelector 
                    timeRange={timeRange}
                    periods={timePeriods}
                    onTimeRangeChange={handleTimeRangeChange}
                    selectedCoin={selectedCoin}
                  />
                </div>
                
                <div className="relative h-[420px] lg:h-[460px] w-full">
                  {/* Elementos decorativos */}
                  <motion.div 
                    className="absolute top-2 right-2 w-20 h-20 rounded-full bg-gradient-to-r from-brand-primary/5 to-purple-500/5 blur-2xl z-0"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.2, 0.3]
                    }}
                    transition={{
                      duration: 8, 
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />
                  
                  <CryptoChart 
                    data={selectedCoin?.data}
                    isLoading={isLoading}
                    color={selectedCoin?.color}
                  />
                </div>
              </HoverCard>

              <HoverCard delay={0.2}>
                <MarketOverview 
                  data={visibleMarketData}
                  isLoading={false} 
                  onShowMore={handleShowMore}
                />
              </HoverCard>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <HoverCard delay={0.3}>
                <TopMovers 
                  data={getTopMovers.gainers} 
                  type="gainers"
                />
              </HoverCard>
              <HoverCard delay={0.4}>
                <TopMovers 
                  data={getTopMovers.losers} 
                  type="losers"
                />
              </HoverCard>
            </div>
          </motion.div>
        )}

        {activeTab === 'markets' && (
          <motion.div
            key="markets-tab"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid md:grid-cols-2 gap-6"
          >
            <HoverCard className="md:col-span-2" delay={0.1}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-text-primary">Visão Geral do Mercado</h2>
                  <motion.button 
                    className="px-3 py-1 text-sm rounded-lg bg-brand-primary/10 text-brand-primary flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Ver Tudo <ChevronRight size={16} className="ml-1" />
                  </motion.button>
                </div>
                
                <MarketOverview 
                  data={cryptoData.slice(0, 10)}
                  isLoading={false}
                  onShowMore={handleShowMore}
                />
              </div>
            </HoverCard>
            
            <HoverCard delay={0.2}>
              <TopMovers 
                data={getTopMovers.gainers} 
                type="gainers"
              />
            </HoverCard>
            
            <HoverCard delay={0.3}>
              <TopMovers 
                data={getTopMovers.losers} 
                type="losers"
              />
            </HoverCard>
          </motion.div>
        )}

        {activeTab === 'transactions' && (
          <motion.div
            key="transactions-tab"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <HoverCard delay={0.1}>
              <RecentTransactions transactions={transactions} />
            </HoverCard>
          </motion.div>
        )}

        {activeTab === 'news' && (
          <motion.div
            key="news-tab"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <HoverCard delay={0.1}>
              <LatestNews news={news} />
            </HoverCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botão Flutuante de Acesso Rápido */}
      <motion.div
        className="fixed bottom-6 right-6 z-20"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
      >
        <motion.button
          className="w-14 h-14 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-lg"
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          aria-label="Menu de acesso rápido"
        >
          <Plus size={24} />
        </motion.button>
        
        <motion.div
          className="absolute -top-16 -left-4 w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-md"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.1, 1] }}
          transition={{ delay: 1.2, type: "spring" }}
          whileHover={{ y: -5 }}
          aria-label="Depósito rápido"
        >
          <Droplets size={18} />
        </motion.div>
        
        <motion.div
          className="absolute -top-4 -left-16 w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-md opacity-90"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.1, 1] }}
          transition={{ delay: 1.3, type: "spring" }}
          whileHover={{ y: -5 }}
          aria-label="Comprar criptomoedas"
        >
          <Diamond size={18} />
        </motion.div>
        
        <motion.div
          className="absolute -top-20 -left-16 w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-md opacity-80"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.1, 1] }}
          transition={{ delay: 1.4, type: "spring" }}
          whileHover={{ y: -5 }}
          aria-label="Adicionar aos favoritos"
        >
          <Star size={18} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
