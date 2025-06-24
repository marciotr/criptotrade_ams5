import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { marketApi } from '../../services/api/api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpRight, ArrowDownRight, Zap, TrendingUp, 
  ChevronRight, BarChart2, Activity, PieChart,
  Droplets, Diamond, Star, Clock, Plus, Menu, X,
  ChevronDown, Users, Briefcase, Settings, Bell
} from 'lucide-react';
import logoBranca from '../../assets/img/logoBinanceRemoved.png';
import logoPreta from '../../assets/img/logoBinanceRemoved.png';
import { transactions, news, statsData } from '../../data/mockData';
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

// MobileSideNav component
const MobileSideNav = ({ isOpen, onClose, userName }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div
            className="fixed top-0 left-0 bottom-0 w-[280px] bg-background-primary border-r border-border-primary z-50 flex flex-col"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="p-4 border-b border-border-primary flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-brand-primary to-purple-600 flex items-center justify-center text-white font-bold">
                  {userName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">{userName}</h3>
                  <p className="text-xs text-text-secondary">Trader</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-background-secondary">
                <X size={20} className="text-text-secondary" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto py-4">
              <nav className="px-4 space-y-1">
                {[
                  { icon: BarChart2, label: 'Dashboard', active: true },
                  { icon: Activity, label: 'Mercados' },
                  { icon: PieChart, label: 'Portfólio' },
                  { icon: Users, label: 'Comunidade' },
                  { icon: Briefcase, label: 'Investimentos' },
                  { icon: Settings, label: 'Configurações' },
                ].map((item, index) => (
                  <a 
                    key={item.label}
                    href="#"
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                      item.active 
                        ? 'bg-brand-primary text-white' 
                        : 'hover:bg-background-secondary text-text-secondary'
                    }`}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </a>
                ))}
              </nav>
            </div>
            
            <div className="p-4 border-t border-border-primary">
              <div className="bg-background-secondary rounded-xl p-4">
                <h4 className="text-sm font-medium text-text-primary mb-2">Seu plano CryptoTrade Pro</h4>
                <div className="w-full h-2 bg-background-tertiary rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-brand-primary w-[65%]"></div>
                </div>
                <p className="text-xs text-text-secondary">Validade: 65 dias restantes</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export function Dashboard() {
  // Estados existentes
  const { user } = useAuth();
  const userName = user?.name || 'Usuário';
  const { theme } = useTheme();
  const navigate = useNavigate();
  const mainContentRef = useRef(null);
  
  // Remover o estado de controle de menu mobile já que usaremos o componente Sidebar
  // const [isMobileSideNavOpen, setIsMobileSideNavOpen] = useState(false);
  
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

  // Detectar o tamanho da tela
  const isMobile = useMemo(() => windowWidth < 768, [windowWidth]);
  const isTablet = useMemo(() => windowWidth >= 768 && windowWidth < 1024, [windowWidth]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Função para determinar a altura do gráfico baseado no tamanho da tela
  const getChartHeight = useCallback(() => {
    if (windowWidth < 640) return 260; // Dispositivos móveis pequenos
    if (windowWidth < 768) return 300; // Dispositivos móveis maiores
    if (windowWidth < 1024) return 340; // Tablets
    if (windowWidth < 1280) return 380; // Desktops pequenos
    return 420; // Desktops grandes
  }, [windowWidth]);

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
        delayChildren: 0.2
      }
    }
  };

  const fadeInAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <>
      {/* Remover o MobileSideNav pois já temos o componente Sidebar */}
      
      <motion.div 
        className="relative px-3 py-4 sm:p-4 lg:p-6 transition-colors duration-200 max-w-[2000px] mx-auto overflow-x-hidden"
        initial="hidden"
        animate="show"
        variants={containerAnimation}
        ref={mainContentRef}
      >
        {/* Elementos de fundo - reduzidos em dispositivos móveis para performance */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          {!isMobile && (
            <>
              <FloatingElement delay={0} x={10} y={20} duration={30}>
                <div className="bg-gradient-to-r from-brand-primary/10 to-brand-primary/5 w-64 h-64 rounded-full blur-3xl"></div>
              </FloatingElement>
              
              <FloatingElement delay={5} x={70} y={60} duration={25}>
                <div className="bg-gradient-to-l from-brand-primary/10 to-brand-primary/5 w-96 h-96 rounded-full blur-3xl"></div>
              </FloatingElement>
            </>
          )}
          
          <FloatingElement delay={2} x={40} y={80} duration={35}>
            <div className="bg-gradient-to-tr from-brand-primary/8 to-brand-primary/3 w-60 sm:w-80 h-60 sm:h-80 rounded-full blur-3xl"></div>
          </FloatingElement>
        </div>

        {/* Logo fixa no fundo - apenas em telas grandes */}
        {!isMobile && (
          <div className="fixed bottom-0 right-0 pointer-events-none opacity-5 z-0 transition-opacity duration-300 hidden md:block">
            <motion.img
              src={theme === 'light' ? logoBranca : logoPreta}
              alt=""
              className="w-[300px] md:w-[400px] lg:w-[600px] h-[300px] md:h-[400px] lg:h-[600px] object-contain"
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
        )}

        {/* Header superior com responsividade - removendo o botão de menu */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary truncate">
              Olá, <span className="text-brand-primary">{userName}</span>!
              <span className="hidden sm:inline"> Seja Bem-vindo!</span>
            </h1>
            <p className="text-text-secondary text-xs sm:text-sm mt-0.5 sm:mt-1 max-w-xs sm:max-w-none">Seu painel de negociações personalizado</p>
          </div>
          
          {/* Botões de ações no header */}
          <div className="flex items-center">
            <button className="p-2.5 sm:p-2 rounded-lg bg-background-secondary text-text-primary mr-2 hidden sm:flex hover:bg-background-tertiary relative">
              <Bell size={isMobile ? 18 : 20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <button className="px-3 sm:px-4 py-2 rounded-lg bg-brand-primary text-white flex items-center font-medium hover:bg-opacity-90 transition-all text-xs sm:text-sm">
              <Zap size={isMobile ? 14 : 16} className="mr-1 sm:mr-1.5" />
              {isMobile ? "Negociar" : "Negociação Rápida"}
            </button>
          </div>
        </div>
        
        {/* Seção de Estatísticas - Layout adaptável */}
        <div className="mb-6 sm:mb-8">
          <div className="p-3 sm:p-4 lg:p-6 rounded-xl border border-border-primary bg-background-primary shadow-md mb-4 sm:mb-6">
            <div className="flex flex-col lg:flex-row justify-between">
              <div className="lg:w-1/2 mb-4 lg:mb-0 lg:pr-6">
                <h2 className="text-base sm:text-lg font-semibold text-text-primary flex items-center mb-3 sm:mb-4">
                  <TrendingUp size={isMobile ? 18 : 20} className="mr-1.5 sm:mr-2 text-brand-primary" /> 
                  <span>Moedas em tendência</span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {getTopMovers.gainers.slice(0, isMobile ? 4 : 3).map((coin, index) => (
                    <div key={coin.symbol} className="p-2 sm:p-3 rounded-lg border border-border-primary bg-background-secondary">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-text-primary text-xs sm:text-sm">{coin.coin}</span>
                        <span className="text-green-500 text-[10px] sm:text-xs flex items-center">
                          <ArrowUpRight size={10} className="mr-0.5" />
                          {coin.change.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-text-secondary text-[10px] sm:text-xs mt-0.5 sm:mt-1">R${parseFloat(coin.price).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="lg:w-1/2 lg:border-l lg:pl-6 border-border-primary">
                <h2 className="text-base sm:text-lg font-semibold text-text-primary flex items-center mb-3 sm:mb-4">
                  <Zap size={isMobile ? 18 : 20} className="mr-1.5 sm:mr-2 text-brand-primary" /> 
                  <span>Dicas de trading</span>
                </h2>
                <div className="bg-background-secondary p-3 sm:p-4 rounded-lg border border-border-primary">
                  <p className="text-text-primary italic text-xs sm:text-sm">
                    "Nunca invista mais do que você pode perder. Diversifique sua carteira para reduzir riscos."
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Cards de estatísticas responsivos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            {[
              {
                title: "Valor da Carteira", 
                value: "R$25.670,84", 
                change: "+8.2%", 
                isPositive: true,
                color: "var(--brand-primary)",
                bgColor: "bg-brand-primary",
                icon: TrendingUp
              },
              { 
                title: "Lucro Diário", 
                value: "+R$892,40", 
                change: "+4.3%", 
                isPositive: true,
                color: "#10b981",
                bgColor: "bg-green-500",
                icon: TrendingUp
              },
              { 
                title: "Variação 24h", 
                value: "+12.36%", 
                change: "+6.1%", 
                isPositive: true,
                color: "#f59e0b",
                bgColor: "bg-amber-500",
                icon: TrendingUp
              },
              { 
                title: "Posições", 
                value: "7", 
                change: "+2", 
                isPositive: true,
                color: "#8b5cf6",
                bgColor: "bg-purple-500",
                icon: TrendingUp
              }
            ].map((card, index) => (
              <div 
                key={index}
                className="relative overflow-hidden rounded-xl border border-border-primary bg-background-primary p-3 sm:p-4 shadow-md hover:translate-y-[-5px] transition-all duration-300"
              >
                <div 
                  className="absolute top-0 left-0 w-full h-1" 
                  style={{ background: `linear-gradient(to right, ${card.color}, transparent)` }} 
                />
                <div className="flex items-center justify-between">
                  <div className={`p-1.5 sm:p-2 rounded-lg ${card.bgColor} bg-opacity-10`}>
                    <card.icon size={isMobile ? 16 : 20} style={{ color: card.color }} />
                  </div>
                  <span className="text-[9px] sm:text-xs text-text-tertiary py-0.5 px-1.5 rounded-full bg-background-secondary">24h</span>
                </div>
                <p className="text-xs sm:text-sm text-text-secondary mt-1 sm:mt-2">{card.title}</p>
                <div className="flex items-baseline mt-0.5 sm:mt-1">
                  <p className="text-sm sm:text-lg lg:text-xl font-bold text-text-primary">{card.value}</p>
                  <span className={`ml-1.5 sm:ml-2 text-[9px] sm:text-xs flex items-center ${card.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {card.isPositive ? <ArrowUpRight size={10} className="mr-0.5" /> : <ArrowDownRight size={10} className="mr-0.5" />}
                    {card.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Abas de Navegação - Design responsivo simplificado para mobile */}
        <AnimatedSection className="mb-4 sm:mb-6" delay={0.2}>
          <div className="flex space-x-1 sm:space-x-2 mb-4 sm:mb-6 border-b border-border-primary pb-1 sm:pb-2 overflow-x-auto scrollbar-hide">
            {[
              { id: 'chart', icon: BarChart2, label: 'Gráfico', fullLabel: 'Gráfico em Tempo Real' },
              { id: 'markets', icon: Activity, label: 'Mercados', fullLabel: 'Mercados' },
              { id: 'transactions', icon: PieChart, label: 'Transações', fullLabel: 'Transações' },
              { id: 'news', icon: Clock, label: 'Notícias', fullLabel: 'Últimas Notícias' }
            ].map(tab => (
              <motion.button
                key={tab.id}
                className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-brand-primary text-white font-medium' 
                    : 'hover:bg-background-secondary text-text-secondary'
                }`}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={isMobile ? 16 : 18} className="mr-1 sm:mr-2" />
                <span className={isMobile ? 'text-xs' : 'text-sm'}>
                  {isMobile ? tab.label : tab.fullLabel}
                </span>
              </motion.button>
            ))}
          </div>
        </AnimatedSection>

        {/* Spinner de carregamento para o estado de loading */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background-primary bg-opacity-75 z-30">
            <motion.div 
              className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear"
              }}
            ></motion.div>
          </div>
        )}

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
              <div className="grid lg:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
                <HoverCard className="lg:col-span-2 p-3 sm:p-6" delay={0.1}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                    <CoinSelector 
                      selectedCoin={selectedCoin}
                      coins={availableCoins}
                      isOpen={dropdownOpen}
                      onToggle={() => setDropdownOpen(!dropdownOpen)}
                      onSelect={handleCoinSelection}
                      price={selectedCryptoData?.lastPrice}
                      align="left"
                      isMobile={isMobile}
                    />
                    <TimeRangeSelector 
                      timeRange={timeRange}
                      periods={timePeriods}
                      onTimeRangeChange={handleTimeRangeChange}
                      selectedCoin={selectedCoin}
                      isMobile={isMobile}
                    />
                  </div>
                  
                  <div className="relative w-full" style={{ height: `${getChartHeight()}px` }}>
                    {/* Elementos decorativos */}
                    <motion.div 
                      className="absolute top-2 right-2 w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-gradient-to-r from-brand-primary/5 to-purple-500/5 blur-2xl z-0"
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
                      height={getChartHeight()}
                      isMobile={isMobile}
                    />
                  </div>
                </HoverCard>

                <HoverCard delay={0.2}>
                  <MarketOverview 
                    data={visibleMarketData}
                    isLoading={isLoading}
                    onShowMore={handleShowMore}
                    isMobile={isMobile}
                  />
                </HoverCard>
              </div>

              <div className="grid md:grid-cols-2 gap-3 sm:gap-6">
                <HoverCard delay={0.3}>
                  <TopMovers 
                    data={getTopMovers.gainers} 
                    type="gainers"
                    isMobile={isMobile}
                  />
                </HoverCard>
                <HoverCard delay={0.4}>
                  <TopMovers 
                    data={getTopMovers.losers} 
                    type="losers"
                    isMobile={isMobile}
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
              className="grid md:grid-cols-2 gap-3 sm:gap-6"
            >
              <HoverCard className="md:col-span-2" delay={0.1}>
                <div className="p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
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
                    isLoading={isLoading}
                    onShowMore={handleShowMore}
                    isMobile={isMobile}
                  />
                </div>
              </HoverCard>
              
              <HoverCard delay={0.2}>
                <TopMovers 
                  data={getTopMovers.gainers} 
                  type="gainers"
                  isMobile={isMobile}
                />
              </HoverCard>
              
              <HoverCard delay={0.3}>
                <TopMovers 
                  data={getTopMovers.losers} 
                  type="losers"
                  isMobile={isMobile}
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

        {/* Botão Flutuante de Acesso Rápido - Versão responsiva */}
        <motion.div
          className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-20"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, type: "spring" }}
        >
          <motion.button
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            aria-label="Menu de acesso rápido"
          >
            <Plus size={22} />
          </motion.button>
          
          {/* Botões adicionais - visíveis apenas em telas maiores */}
          <AnimatePresence>
            {!isMobile && (
              <>
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
              </>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </>
  );
}
