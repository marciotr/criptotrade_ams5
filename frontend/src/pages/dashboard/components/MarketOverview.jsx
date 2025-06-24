import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { ArrowUp, ArrowDown, ChevronRight, TrendingUp, BarChart2, DollarSign, LineChart, Zap, AlertTriangle } from 'lucide-react';
import CryptoIcon from '../../../components/common/CryptoIcons';
import { FixedSizeList as List } from 'react-window';
import { marketApi } from '../../../services/api/api'; // Importe a API aqui no início do arquivo

// Gradient sparkline canvas component
const SparkLine = ({ prices, trend, height = 40, width = 80 }) => {
  const canvasRef = React.useRef(null);
  
  React.useEffect(() => {
    if (!prices || prices.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // Set canvas dimensions accounting for device pixel ratio
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Calculate points
    const points = [];
    const step = width / (prices.length - 1);
    prices.forEach((price, i) => {
      points.push([i * step, height - (price * height)]);
    });
    
    // Draw gradient path
    ctx.beginPath();
    ctx.moveTo(0, height);
    points.forEach(point => ctx.lineTo(point[0], point[1]));
    ctx.lineTo(width, height);
    ctx.closePath();
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    if (trend >= 0) {
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
    } else {
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.2)');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
    }
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw line
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    points.forEach(point => ctx.lineTo(point[0], point[1]));
    
    ctx.strokeStyle = trend >= 0 ? '#10b981' : '#ef4444';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw end circle
    ctx.beginPath();
    ctx.arc(points[points.length - 1][0], points[points.length - 1][1], 3, 0, 2 * Math.PI);
    ctx.fillStyle = trend >= 0 ? '#10b981' : '#ef4444';
    ctx.fill();
    
  }, [prices, height, width, trend]);
  
  return (
    <canvas 
      ref={canvasRef} 
      style={{ width, height }}
      className="opacity-80 hover:opacity-100 transition-opacity"
    />
  );
};

export const MarketOverview = React.memo(({ data, isLoading, onShowMore }) => {
  const [sortConfig, setSortConfig] = useState({
    key: 'priceChange',
    direction: 'desc'
  });
  const [activeCategory, setActiveCategory] = useState('trending');
  const [animateCards, setAnimateCards] = useState(false);
  const [localData, setLocalData] = useState([]);
  const [animatingCategory, setAnimatingCategory] = useState(false);
  const [previousDisplayData, setPreviousDisplayData] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [renderKey, setRenderKey] = useState(Date.now());
  const [processingOperation, setProcessingOperation] = useState(false);
  // Estado para controlar erros de carregamento
  const [loadError, setLoadError] = useState(false);

  const generateSparkline = useCallback((priceChange) => {
    const trend = Number(priceChange || 0);
    const isPositive = trend >= 0;
    const points = [];
    const pointCount = 24;
    
    let prevValue = 0.5; 
    
    for (let i = 0; i < pointCount; i++) {
      const randomChange = (Math.random() * 0.08) - 0.04;
      const trendFactor = isPositive ? 0.005 : -0.005;
      prevValue = Math.max(0.05, Math.min(0.95, prevValue + randomChange + trendFactor));
      points.push(prevValue);
    }
    
    points[pointCount - 1] = isPositive ? 
      Math.min(0.95, 0.5 + (Math.abs(trend) * 0.02)) : 
      Math.max(0.05, 0.5 - (Math.abs(trend) * 0.02));
      
    return points;
  }, []);

  useEffect(() => {
    if (!data || data.length === 0) {
      const fetchData = async () => {
        setLoadError(false);
        try {
          console.log('Buscando dados da API...');
          const response = await marketApi.getAllTickers();
          
          // Verificar se a resposta contém dados e logar para debug
          console.log('Resposta da API:', response);
          
          if (response && response.data) {
            // Filtramos apenas pares com USDT que são mais relevantes
            const filteredData = response.data
              .filter(ticker => ticker.symbol && ticker.symbol.endsWith('USDT'))
              .map(ticker => ({
                symbol: ticker.symbol,
                name: ticker.symbol.replace('USDT', ''),
                currentPrice: ticker.lastPrice,
                priceChange: ticker.priceChangePercent,
                volume: ticker.quoteVolume || ticker.volume,
                priceChangePercent: ticker.priceChangePercent
              }));
            
            console.log('Dados processados:', filteredData);
            setLocalData(filteredData);
          } else {
            console.error('Resposta da API sem dados válidos');
          }
        } catch (error) {
          console.error('Falha ao buscar dados de mercado:', error);
          setLoadError(true);
        }
      };
      
      fetchData();
    }
  }, [data]);
  
  // Use localData como fallback quando data não estiver disponível
  const enrichedData = useMemo(() => {
    const sourceData = data && data.length > 0 ? data : localData;
    if (!Array.isArray(sourceData) || sourceData.length === 0) {
      return [];
    }
    
    return sourceData.map(coin => ({
      ...coin,
      sparkline: generateSparkline(coin.priceChange),
    }));
  }, [data, localData, generateSparkline]);

  // Category definitions
  const categories = useMemo(() => [
    { 
      id: 'trending', 
      label: 'Tendência', 
      icon: <TrendingUp size={16} />,
      sortKey: 'volume',  // Ordenar por volume para tendências
      sortDirection: 'desc'
    },
    { 
      id: 'gainers', 
      label: 'Em Alta', 
      icon: <ArrowUp size={16} />,
      sortKey: 'priceChangePercent',
      sortDirection: 'desc',
      filter: (coin) => Number(coin.priceChangePercent) > 0
    },
    { 
      id: 'losers', 
      label: 'Em Baixa', 
      icon: <ArrowDown size={16} />,
      sortKey: 'priceChangePercent',
      sortDirection: 'asc',
      filter: (coin) => Number(coin.priceChangePercent) < 0
    },
    { 
      id: 'volume', 
      label: 'Volume', 
      icon: <BarChart2 size={16} />,
      sortKey: 'volume',
      sortDirection: 'desc'
    }
  ], []);

  // Effect to set sorting based on selected category
  useEffect(() => {
    // Não execute este useEffect durante a animação
    if (animatingCategory) return;

    const selectedCategory = categories.find(cat => cat.id === activeCategory);
    if (selectedCategory) {
      setSortConfig({
        key: selectedCategory.sortKey,
        direction: selectedCategory.sortDirection
      });
    }
    
    // Trigger animation when category changes (sem timer adicional)
    setAnimateCards(true);
    
    // Use um único timer para desativar a animação
    const timer = setTimeout(() => {
      setAnimateCards(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [activeCategory, categories, animatingCategory]); // Adicione animatingCategory como dependência

  // Sorted and filtered data
  const displayData = useMemo(() => {
    // Use dados anteriores durante animações
    if (animatingCategory && previousDisplayData.length > 0) {
      return previousDisplayData;
    }
    
    if (!Array.isArray(enrichedData) || enrichedData.length === 0) {
      return [];
    }
    
    // Os dados já vêm ordenados e filtrados da API, só precisamos garantir quantidade
    return enrichedData.slice(0, 5);
  }, [enrichedData, animatingCategory, previousDisplayData]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const pulseAnimation = {
    scale: [1, 1.02, 1],
    transition: { duration: 0.8, repeat: 0 }
  };

  // Price formatting helper
  const formatPrice = useCallback((price) => {
    if (!price) return '0.00';
    
    const numPrice = parseFloat(price);
    
    // If price is less than 1, show more decimals
    if (numPrice < 1) {
      return numPrice.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6
      });
    }
    
    // If price is less than 100, show 2 decimals
    if (numPrice < 100) {
      return numPrice.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
    
    // For higher prices, show no decimals
    return Math.round(numPrice).toLocaleString();
  }, []);
  
  // Volume formatting helper
  const formatVolume = useCallback((volume) => {
    if (!volume) return '0';
    
    const numVolume = typeof volume === 'number' ? volume : parseFloat(volume);
    
    // Format large numbers with K, M, B suffixes
    if (numVolume >= 1e9) return (numVolume / 1e9).toFixed(2) + 'B';
    if (numVolume >= 1e6) return (numVolume / 1e6).toFixed(2) + 'M';
    if (numVolume >= 1e3) return (numVolume / 1e3).toFixed(2) + 'K';
    
    return numVolume.toLocaleString();
  }, []);

  // Modifique a função de mudança de categoria
  const handleCategoryChange = useCallback((categoryId) => {
    // Evite múltiplas operações simultâneas
    if (categoryId === activeCategory || animatingCategory || processingOperation) return;
    
    // Sinal de que estamos processando uma mudança de categoria
    setProcessingOperation(true);
    
    // Preserve os dados atuais para a transição
    if (displayData.length > 0) {
      setPreviousDisplayData(displayData);
    }
    
    // Sinalize que estamos animando
    setAnimatingCategory(true);
    
    // Use um único timeout com um atraso curto para mudar a categoria
    const timer = setTimeout(async () => {
      // Atualize a categoria
      setActiveCategory(categoryId);
      setRenderKey(Date.now());
      
      // Busque novos dados para esta categoria
      try {
        let response;
        
        switch (categoryId) {
          case 'gainers':
            response = await marketApi.getGainers(5);
            break;
          case 'losers':
            response = await marketApi.getLosers(5);
            break;
          case 'trending':
            response = await marketApi.getTrending(5);
            break;
          case 'volume':
            response = await marketApi.getTrending(5);
            break;
          default:
            response = await marketApi.getAllTickers();
        }
        
        if (response && response.data) {
          const processedData = response.data.map(ticker => ({
            symbol: ticker.symbol,
            name: ticker.symbol.replace('USDT', ''),
            currentPrice: ticker.lastPrice,
            priceChange: ticker.priceChangePercent,
            volume: ticker.quoteVolume || ticker.volume,
            priceChangePercent: ticker.priceChangePercent,
            sparkline: generateSparkline(ticker.priceChangePercent)
          }));
          
          setLocalData(processedData);
        }
      } catch (error) {
        console.error(`Erro ao buscar ${categoryId}:`, error);
      }
      
      // Finalize a animação após um tempo adequado
      const finishTimer = setTimeout(() => {
        setAnimatingCategory(false);
        setProcessingOperation(false);
      }, 400);
      
      return () => clearTimeout(finishTimer);
    }, 50);
    
    return () => clearTimeout(timer);
  }, [activeCategory, displayData, animatingCategory, processingOperation, generateSparkline]);

  // Adicione este efeito para garantir que os dados sejam preservados
  useEffect(() => {
    if (displayData.length > 0) {
      setPreviousDisplayData(displayData);
    }
  }, [displayData]);

  // Modifique o useEffect para carregar dados baseado na categoria selecionada
  useEffect(() => {
    // Não busque dados se já temos
    if (data && data.length > 0) return;
    
    const fetchData = async () => {
      setLoadError(false);
      try {
        console.log('Buscando dados da API para categoria:', activeCategory);
        
        let response;
        
        // Use o endpoint específico de acordo com a categoria
        switch (activeCategory) {
          case 'gainers':
            response = await marketApi.getGainers(5);
            break;
          case 'losers':
            response = await marketApi.getLosers(5);
            break;
          case 'trending':
            response = await marketApi.getTrending(5);
            break;
          case 'volume':
            response = await marketApi.getTrending(5); // Usamos trending porque ambos ordenam por volume
            break;
          default:
            response = await marketApi.getAllTickers();
        }
        
        if (response && response.data) {
          // Processar dados (já não precisamos filtrar tanto, pois vêm pré-filtrados da API)
          const processedData = response.data.map(ticker => ({
            symbol: ticker.symbol,
            name: ticker.symbol.replace('USDT', ''),
            currentPrice: ticker.lastPrice,
            priceChange: ticker.priceChangePercent,
            volume: ticker.quoteVolume || ticker.volume,
            priceChangePercent: ticker.priceChangePercent,
            sparkline: generateSparkline(ticker.priceChangePercent)
          }));
          
          console.log(`Recebidos ${processedData.length} dados para ${activeCategory}`);
          setLocalData(processedData);
        } else {
          console.error('Resposta da API sem dados válidos');
        }
      } catch (error) {
        console.error(`Falha ao buscar dados de ${activeCategory}:`, error);
        setLoadError(true);
      }
    };
    
    fetchData();
  }, [activeCategory, data, generateSparkline]);
  
  // Adicione este useEffect para detectar mudanças de tamanho de tela
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <motion.div
      className="rounded-xl bg-background-primary border border-border-primary shadow-xl bg-gradient-to-br from-background-primary to-background-secondary/30 overflow-hidden backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Header with title and glowing effect */}
      <div className="relative p-4 lg:p-6 border-b border-border-primary">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-brand-primary/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-brand-primary/5 rounded-full blur-lg"></div>
        
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center">
            <div className="bg-brand-primary/10 p-2 rounded-lg mr-3">
              <LineChart className="text-brand-primary" size={20} />
            </div>
            <h2 className="text-xl font-bold text-text-primary">Market Pulse</h2>
          </div>
          <motion.span 
            className="text-xs px-2 py-1 bg-brand-primary/10 text-brand-primary rounded-full font-medium flex items-center"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
          >
            <Zap size={12} className="mr-1" /> Live Data
          </motion.span>
        </div>
        
        {/* Category selection */}
        <div className="flex flex-nowrap overflow-x-auto pb-2 scrollbar-hide gap-2 relative z-10">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`flex items-center px-4 py-2 rounded-full text-sm transition-all whitespace-nowrap ${
                activeCategory === category.id
                  ? 'bg-brand-primary text-white font-medium shadow-lg shadow-brand-primary/20'
                  : 'bg-background-secondary hover:bg-background-tertiary text-text-secondary'
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              animate={activeCategory === category.id ? pulseAnimation : {}}
              disabled={animatingCategory}
            >
              <div className="mr-1.5">{category.icon}</div>
              {category.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Cards list */}
      <div className="p-4 lg:p-5">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8">
            <motion.div 
              className="w-10 h-10 border-3 border-brand-primary rounded-full border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <p className="text-text-secondary mt-4 text-sm">Carregando dados de mercado...</p>
          </div>
        ) : loadError ? (
          <motion.div 
            className="text-center py-8 text-text-secondary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <AlertTriangle size={32} className="mx-auto mb-4 text-feedback-error" />
            <p>Não foi possível carregar os dados do mercado</p>
            <button 
              className="mt-4 px-4 py-2 text-sm bg-background-secondary rounded-lg hover:bg-background-tertiary"
              onClick={() => {
                setLoadError(false);
                fetchData();
              }}
            >
              Tentar novamente
            </button>
          </motion.div>
        ) : enrichedData.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${renderKey}-${activeCategory}`}
              className="space-y-3"
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0.6 }}
              transition={{ duration: 0.2 }}
            >
              {/* Usar dados confiáveis - durante animação, use previousDisplayData */}
              {(animatingCategory && previousDisplayData.length > 0 ? previousDisplayData : displayData).map((coin, index) => (
                <motion.div
                  key={coin.symbol || `coin-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={`rounded-xl p-3.5 border border-transparent hover:border-border-primary transition-all ${
                    isMobile ? 'flex flex-col' : 'flex items-center'
                  } bg-gradient-to-r ${
                    Number(coin.priceChange || 0) >= 0 
                      ? 'from-green-500/5 to-background-primary hover:from-green-500/10' 
                      : 'from-red-500/5 to-background-primary hover:from-red-500/10'
                  } hover:shadow-lg group`}
                >
                  {/* Layout específico para mobile */}
                  {isMobile ? (
                    <>
                      {/* Cabeçalho do card móvel */}
                      <div className="flex justify-between items-center w-full mb-2.5">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${
                            Number(coin.priceChange) >= 0 
                              ? 'border-green-500/20 bg-green-500/10' 
                              : 'border-red-500/20 bg-red-500/10'
                          }`}>
                            <CryptoIcon symbol={coin.symbol} size={18} />
                          </div>
                          
                          <div className="ml-2">
                            <div className="flex items-center">
                              <h3 className="font-bold text-text-primary text-sm truncate max-w-[100px]">{coin.name}</h3>
                              <span className="ml-1.5 text-[10px] text-text-tertiary uppercase">{coin.symbol}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-mono font-bold text-text-primary text-sm whitespace-nowrap">
                            R${formatPrice(coin.currentPrice)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Rodapé do card móvel */}
                      <div className="flex justify-between items-center w-full mt-1">
                        <span className="text-[10px] text-text-secondary">Vol: R${formatVolume(coin.volume)}</span>
                        
                        <div className="flex items-center space-x-2">
                          <motion.div
                            className={`text-[10px] px-1.5 py-0.5 rounded-sm font-medium flex items-center ${
                              Number(coin.priceChange) >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                            }`}
                            initial={{ opacity: 0.9 }}
                            whileHover={{ opacity: 1, scale: 1.05 }}
                          >
                            {Number(coin.priceChange) >= 0 ? 
                              <ArrowUp size={8} className="mr-0.5" /> : 
                              <ArrowDown size={8} className="mr-0.5" />}
                            {Math.abs(Number(coin.priceChange || 0)).toFixed(2)}%
                          </motion.div>
                          
                          <motion.div 
                            className="w-6 h-6 flex items-center justify-center rounded-full bg-background-secondary text-text-tertiary"
                            whileHover={{ backgroundColor: "var(--brand-primary)", color: "white" }}
                          >
                            <ChevronRight size={14} />
                          </motion.div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Layout para desktop (existente) */}
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border ${
                          Number(coin.priceChange) >= 0 
                            ? 'border-green-500/20 bg-green-500/10' 
                            : 'border-red-500/20 bg-red-500/10'
                        }`}>
                          <CryptoIcon symbol={coin.symbol} size={24} />
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center">
                            <h3 className="font-bold text-text-primary truncate">
                              {coin.name || coin.symbol.replace('USDT', '')}
                            </h3>
                            <span className="ml-2 text-xs text-text-tertiary uppercase">
                              {coin.symbol.replace('USDT', '')}
                            </span>
                          </div>
                          <motion.div 
                            className="flex items-center" 
                            initial={{ opacity: 0.8 }}
                            whileHover={{ opacity: 1 }}
                          >
                            <span className="text-xs text-text-secondary mr-2">
                              Vol: R${formatVolume(coin.volume || coin.quoteVolume || 0)}
                            </span>
                            <motion.div
                              className={`text-xs px-1.5 py-0.5 rounded-sm font-medium flex items-center ${
                                parseFloat(coin.priceChangePercent || 0) >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                              }`}
                              initial={{ opacity: 0.9 }}
                              whileHover={{ opacity: 1, scale: 1.05 }}
                            >
                              {parseFloat(coin.priceChangePercent || 0) >= 0 ? 
                                <ArrowUp size={10} className="mr-0.5" /> : 
                                <ArrowDown size={10} className="mr-0.5" />}
                              {Math.abs(parseFloat(coin.priceChangePercent || 0)).toFixed(2)}%
                            </motion.div>
                          </motion.div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="hidden sm:block">
                          <SparkLine 
                            prices={coin.sparkline} 
                            trend={Number(coin.priceChange)} 
                            width={80}
                            height={30}
                          />
                        </div>
                        
                        <div className="text-right">
                          <p className="font-mono font-bold text-text-primary whitespace-nowrap">
                            R${formatPrice(coin.currentPrice)}
                          </p>
                          <motion.p 
                            className={`text-xs font-medium group-hover:opacity-100 transition-opacity ${
                              Number(coin.priceChange) >= 0 ? 'text-green-500' : 'text-red-500'
                            }`}
                            initial={{ opacity: 0.8 }}
                            whileHover={{ opacity: 1 }}
                          >
                            {Number(coin.priceChange) >= 0 ? '+' : ''}{Math.abs(Number(coin.priceChange || 0)).toFixed(2)}%/24h
                          </motion.p>
                        </div>
                        
                        <motion.div 
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-background-secondary text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity"
                          whileHover={{ scale: 1.1, backgroundColor: "var(--brand-primary)", color: "white" }}
                        >
                          <ChevronRight size={16} />
                        </motion.div>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
              
              {/* "Ver todos" button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.25 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={onShowMore}
                className="mt-2 w-full py-3 text-sm font-medium text-white bg-gradient-to-r from-brand-primary to-brand-primary/80 rounded-xl flex items-center justify-center hover:shadow-lg hover:shadow-brand-primary/20 transition-all"
              >
                Ver Todos os Mercados
                <ChevronRight size={16} className="ml-2" />
              </motion.button>
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div 
            className="text-center py-12 text-text-secondary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <DollarSign size={32} className="mx-auto mb-4 text-text-tertiary" />
            <p>Dados não disponíveis no momento</p>
            <p className="text-sm mt-2">Tente novamente mais tarde</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  if (prevProps.isLoading !== nextProps.isLoading) return false;
  
  if (prevProps.data.length !== nextProps.data.length) return false;
  
  // Use a version identifier for the data to avoid deep comparison
  const prevIds = prevProps.data.map(item => `${item.symbol}-${item.currentPrice}`).join(',');
  const nextIds = nextProps.data.map(item => `${item.symbol}-${item.currentPrice}`).join(',');
  
  return prevIds === nextIds;
});

MarketOverview.displayName = 'MarketOverview';

// Ajuste as funções de carregamento de dados para usar os endpoints específicos

// Modifique para uma função reutilizável
const fetchDataForCategory = async (categoryId, setLocalData, setLoadError, generateSparkline) => {
  try {
    console.log('Buscando dados para categoria:', categoryId);
    let response;
    
    switch (categoryId) {
      case 'gainers':
        response = await marketApi.getGainers(5);
        break;
      case 'losers':
        response = await marketApi.getLosers(5);
        break;
      case 'trending':
      case 'volume':
        response = await marketApi.getTrending(5);
        break;
      default:
        response = await marketApi.getAllTickers();
    }
    
    console.log(`Resposta para ${categoryId}:`, response);
    
    if (response && response.data) {
      const processedData = response.data.map(ticker => ({
        symbol: ticker.symbol,
        name: ticker.symbol.replace('USDT', ''),
        currentPrice: ticker.lastPrice,
        priceChange: ticker.priceChangePercent,
        volume: ticker.quoteVolume || ticker.volume,
        priceChangePercent: ticker.priceChangePercent,
        sparkline: generateSparkline(ticker.priceChangePercent)
      }));
      
      console.log(`Processados ${processedData.length} itens para ${categoryId}`);
      setLocalData(processedData);
      return processedData;
    } else {
      console.error(`Resposta da API para ${categoryId} sem dados válidos`);
      setLoadError(true);
    }
  } catch (error) {
    console.error(`Erro ao buscar dados para ${categoryId}:`, error);
    setLoadError(true);
    return [];
  }
};

// Usando no useEffect principal
useEffect(() => {
  // Não busque dados se já temos através das props
  if (data && data.length > 0) return;
  
  const loadData = async () => {
    setLoadError(false);
    await fetchDataForCategory(activeCategory, setLocalData, setLoadError, generateSparkline);
  };
  
  loadData();
}, [activeCategory, data, generateSparkline]);

// Modificando o handleCategoryChange para usar a função
const handleCategoryChange = useCallback((categoryId) => {
  // Evite múltiplas operações simultâneas
  if (categoryId === activeCategory || animatingCategory || processingOperation) return;
  
  // Marque como processando
  setProcessingOperation(true);
  
  // Preserve os dados atuais para a transição
  if (displayData.length > 0) {
    setPreviousDisplayData(displayData);
  }
  
  // Marque como animando
  setAnimatingCategory(true);
  
  // Usando um único timeout para melhor performance
  const timer = setTimeout(async () => {
    setActiveCategory(categoryId);
    setRenderKey(Date.now());
    
    // Carregue novos dados para a categoria selecionada
    await fetchDataForCategory(categoryId, setLocalData, setLoadError, generateSparkline);
    
    // Termine a animação após um tempo adequado
    const finishTimer = setTimeout(() => {
      setAnimatingCategory(false);
      setProcessingOperation(false);
    }, 400);
    
    return () => clearTimeout(finishTimer);
  }, 50);
  
  return () => clearTimeout(timer);
}, [activeCategory, displayData, animatingCategory, processingOperation, generateSparkline]);