import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, ArrowUp, ArrowDown, TrendingUp, Loader, Filter, ChevronUp, ChevronDown } from 'lucide-react';
import CryptoIcon from '../../components/common/CryptoIcons';
import { marketFilters } from '../../data/mockData';
import { useNavigate } from 'react-router-dom';
import { marketApi } from '../../services/api/api';
import { FixedSizeList as List } from 'react-window'; // Importe esta biblioteca
import AutoSizer from 'react-virtualized-auto-sizer'; // Importe esta biblioteca
import { LoadingScreen } from '../../components/common/LoadingScreen';

// Componente de card para moedas em trending
const TrendingCoinCard = ({ coin, onClick, index, onBuy }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ 
      y: -5, 
      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -5px rgba(0,0,0,0.05)" 
    }}
    className="bg-background-primary p-5 rounded-xl shadow-lg border border-border-primary hover:border-brand-primary transition-all duration-300 cursor-pointer"
    onClick={(e) => onClick(coin, e)}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-full bg-background-secondary">
          <CryptoIcon symbol={coin.id} size={28} />
        </div>
        <div>
          <span className="font-bold text-text-primary block text-lg">{coin.name}/USDT</span>
          <span className="text-sm text-text-secondary">24h Volume: ${coin.volume.toLocaleString()}</span>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-text-primary text-lg">${coin.price.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 6
        })}</p>
        <p className={`text-sm flex items-center justify-end font-medium ${
          coin.change > 0 ? 'text-feedback-success' : 'text-feedback-error'
        }`}>
          {coin.change > 0 ? <ArrowUp size={16} className="mr-1" /> : <ArrowDown size={16} className="mr-1" />}
          {Math.abs(coin.change).toFixed(2)}%
        </p>
      </div>
    </div>
    <div className="mt-4 pt-4 border-t border-border-primary">
      <div className="flex justify-between items-center">
        <span className="text-sm text-text-tertiary">Preço 7d</span>
        {/* Mini sparkline chart poderia ser adicionado aqui */}
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          coin.change > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
        }`}>
          {coin.change > 0 ? 'Bullish' : 'Bearish'}
        </span>
      </div>
      <button
        className="mt-4 w-full py-2 rounded-lg bg-brand-primary text-white font-semibold hover:bg-brand-primary/90 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onBuy(coin, e);
        }}
      >
        Comprar {coin.name}
      </button>
    </div>
  </motion.div>
);

// Componente para a linha da tabela de moedas
const CoinTableRow = React.memo(({ coin, index, onFavoriteToggle, onCoinClick, isFavorite }) => (
  <motion.tr
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.02 }}
    className="border-b border-border-primary hover:bg-background-secondary transition-all duration-200 cursor-pointer"
    onClick={(e) => onCoinClick(coin, e)}
    whileHover={{ backgroundColor: "var(--background-secondary)" }}
  >
    <td className="px-6 py-4">
      <div className="flex items-center space-x-3">
        <div className="p-1.5 rounded-full bg-background-secondary">
          <CryptoIcon symbol={coin.id} size={24} />
        </div>
        <div>
          <span className="font-semibold text-text-primary block">{coin.name}</span>
          <span className="text-xs text-text-tertiary">{coin.symbol}</span>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 text-right font-semibold text-text-primary">
      ${coin.price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: coin.price < 1 ? 6 : 2
      })}
    </td>
    <td className="px-6 py-4 text-right">
      <div className={`inline-flex items-center px-2 py-1 rounded-full ${
        coin.change > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
      }`}>
        {coin.change > 0 ? <ArrowUp size={12} className="mr-1" /> : <ArrowDown size={12} className="mr-1" />}
        {Math.abs(coin.change).toFixed(2)}%
      </div>
    </td>
    <td className="px-6 py-4 text-right text-text-secondary">
      ${coin.volume.toLocaleString(undefined, {
        maximumFractionDigits: 0
      })}
    </td>
    <td className="px-6 py-4 text-right text-text-secondary">
      ${coin.marketCap.toLocaleString(undefined, {
        maximumFractionDigits: 0
      })}
    </td>
    <td className="px-6 py-4">
      <div className="flex justify-center">
        <motion.div
          whileTap={{ scale: 1.2 }}
          className="favorite-star cursor-pointer"
        >
          <Star
            className={`transition-all duration-300 ${
              isFavorite
                ? 'fill-yellow-500 text-yellow-500 drop-shadow-md'
                : 'text-gray-400 hover:text-yellow-500'
            }`}
            size={20}
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle(coin.id);
            }}
          />
        </motion.div>
      </div>
    </td>
  </motion.tr>
));

// Card de moeda responsivo para substituir as linhas da tabela
const CoinCard = React.memo(({ coin, onFavoriteToggle, onCoinClick, onBuy, isFavorite }) => (
  <motion.div
    className="flex flex-col h-full"
    initial={{ opacity: 0, scale: 0.97 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ 
      y: -4, 
      boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -5px rgba(0,0,0,0.05)",
      backgroundColor: "var(--background-secondary)"
    }}
    transition={{ duration: 0.2 }}
    onClick={(e) => onCoinClick(coin, e)}
  >
    <div className="bg-background-primary border border-border-primary rounded-2xl p-4 cursor-pointer transition-all duration-200 h-full backdrop-blur-sm hover:border-brand-primary/30">
      {/* Cabeçalho do card */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-background-secondary">
            <CryptoIcon symbol={coin.id} size={24} />
          </div>
          <div>
            <div className="flex items-center">
              <span className="font-semibold text-text-primary">{coin.name}</span>
              <span className="ml-1 text-xs bg-background-secondary text-text-tertiary py-0.5 px-1.5 rounded-full">{coin.symbol.replace(coin.name, '')}</span>
            </div>
            <div className={`text-xs flex items-center mt-0.5 ${
              coin.change > 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {coin.change > 0 ? <ArrowUp size={10} className="mr-0.5" /> : <ArrowDown size={10} className="mr-0.5" />}
              {Math.abs(coin.change).toFixed(2)}%
            </div>
          </div>
        </div>
        
        <motion.div
          whileTap={{ scale: 1.2 }}
          className="favorite-star"
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle(coin.id);
          }}
        >
          <Star
            className={`transition-all duration-300 ${
              isFavorite
                ? 'fill-yellow-500 text-yellow-500 drop-shadow-md'
                : 'text-gray-400 hover:text-yellow-500'
            }`}
            size={18}
          />
        </motion.div>
      </div>
      
      {/* Corpo do card com informações principais */}
      <div className="mt-3 pt-3 border-t border-border-primary">
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-text-tertiary">Preço</span>
          <span className="font-bold text-text-primary">
            ${coin.price.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: coin.price < 1 ? 6 : 2
            })}
          </span>
        </div>
        
        <div className="flex justify-between items-baseline mt-1.5">
          <span className="text-xs text-text-tertiary">Volume 24h</span>
          <span className="text-text-secondary text-sm">
            ${coin.volume.toLocaleString(undefined, {
              maximumFractionDigits: 0
            })}
          </span>
        </div>
        
        <div className="flex justify-between items-baseline mt-1.5">
          <span className="text-xs text-text-tertiary">Cap. de Mercado</span>
          <span className="text-text-secondary text-sm">
            ${coin.marketCap.toLocaleString(undefined, {
              maximumFractionDigits: 0
            })}
          </span>
        </div>
      </div>
      
      {/* Gradient indicator na base do card */}
      <div className={`h-1 w-full mt-3 rounded-full ${
        coin.change > 0 ? 'bg-gradient-to-r from-green-500 to-teal-400' : 'bg-gradient-to-r from-red-500 to-pink-500'
      }`}></div>
      <button
        className="mt-4 w-full py-2 rounded-lg bg-brand-primary text-white font-semibold hover:bg-brand-primary/90 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onBuy(coin, e);
        }}
      >
        Comprar {coin.name}
      </button>
    </div>
  </motion.div>
));

// Componente para as categorias do filtro
const FilterButton = ({ label, active, onClick, icon }) => (
  <motion.button
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`flex items-center justify-center px-4 py-2 rounded-xl transition-all ${
      active
        ? 'bg-brand-primary text-white font-medium shadow-lg shadow-brand-primary/20'
        : 'bg-background-secondary/60 backdrop-blur-sm text-text-secondary hover:bg-background-secondary border border-border-primary'
    }`}
  >
    {icon && <span className="mr-2">{icon}</span>}
    {label}
  </motion.button>
);

// Componente do seletor de ordenação
const SortSelector = ({ sortConfig, onSortChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const sortOptions = [
    { key: 'marketCap', label: 'Cap. de Mercado', direction: 'desc' },
    { key: 'price', label: 'Preço (maior)', direction: 'desc' },
    { key: 'price', label: 'Preço (menor)', direction: 'asc' },
    { key: 'change', label: 'Ganhos 24h', direction: 'desc' },
    { key: 'change', label: 'Perdas 24h', direction: 'asc' },
    { key: 'volume', label: 'Volume', direction: 'desc' },
  ];
  
  const currentOption = sortOptions.find(
    opt => opt.key === sortConfig.key && opt.direction === sortConfig.direction
  ) || sortOptions[0];
  
  return (
    <div className="relative">
      <button 
        className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-background-secondary/60 backdrop-blur-sm border border-border-primary text-text-secondary hover:bg-background-secondary"
        onClick={() => setIsOpen(!isOpen)}
      >
        <ArrowUp size={14} className="mr-1" />
        <span>Ordenar: {currentOption.label}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 right-0 mt-1 bg-background-primary border border-border-primary rounded-xl shadow-lg py-1 min-w-[180px]"
          >
            {sortOptions.map((option) => (
              <button
                key={`${option.key}-${option.direction}`}
                className={`w-full text-left px-4 py-2 hover:bg-background-secondary flex items-center ${
                  currentOption.key === option.key && currentOption.direction === option.direction
                    ? 'text-brand-primary font-medium'
                    : 'text-text-secondary'
                }`}
                onClick={() => {
                  onSortChange(option);
                  setIsOpen(false);
                }}
              >
                {option.direction === 'desc' ? <ChevronDown size={14} className="mr-2" /> : <ChevronUp size={14} className="mr-2" />}
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function Markets() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); 
  const [tertiary, settertiary] = useState(() => {
    const storedtertiary = localStorage.getItem('cryptotertiary');
    return storedtertiary ? JSON.parse(storedtertiary) : [];
  });
  const [tickers, setTickers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({
    key: 'marketCap',
    direction: 'desc'
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const tickersResponse = await marketApi.getAllTickers();
        const tickersData = tickersResponse.data;
        
        requestAnimationFrame(() => {
          setTickers(tickersData);
          setIsLoading(false);
        });
      } catch (error) {
        console.error('Error fetching tickers:', error);
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Salvar favoritos no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('cryptotertiary', JSON.stringify(tertiary));
  }, [tertiary]);

  const processedMarketData = useMemo(() => {
    if (!tickers?.length) return [];

    return tickers
      .filter(ticker => ticker.symbol.endsWith('USDT'))
      .map(ticker => ({
        id: ticker.symbol,
        name: ticker.symbol.replace('USDT', ''),
        symbol: ticker.symbol,
        price: Number(ticker.lastPrice),
        change: Number(ticker.priceChangePercent),
        volume: Number(ticker.volume),
        marketCap: Number(ticker.quoteVolume) || Number(ticker.volume) * Number(ticker.lastPrice),
        favorite: tertiary.includes(ticker.symbol)
      }));
  }, [tickers, tertiary]);

  const toggleFavorite = useCallback((coinId) => {
    settertiary(prevtertiary => {
      if (prevtertiary.includes(coinId)) {
        return prevtertiary.filter(id => id !== coinId);
      } else {
        return [...prevtertiary, coinId];
      }
    });
  }, []);

  const handleBuyClick = useCallback((coin, event) => {
    if (event) {
      event.stopPropagation();
    }
    navigate(`/buy/${coin.symbol}`);
  }, [navigate]);

  const handleCoinClick = useCallback((coin, event) => {
    // Prevent navigation when clicking the favorite star
    if (event.target.closest('.favorite-star')) return;
    navigate(`/buy/${coin.symbol}`);
  }, [navigate]);

  // Aplicar filtros aos dados processados
  const filteredData = useMemo(() => {
    let result = processedMarketData.filter(coin => {
      const matchesSearch = 
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filter === 'tertiary') return matchesSearch && tertiary.includes(coin.id);
      if (filter === 'gainers') return matchesSearch && coin.change > 0;
      if (filter === 'losers') return matchesSearch && coin.change < 0;
      return matchesSearch;
    });

    // Aplicar ordenação
    if (sortConfig.key) {
      result = [...result].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return result;
  }, [processedMarketData, searchTerm, filter, tertiary, sortConfig]);

  // Obter as moedas em tendência (top 3 por volume)
  const trendingPairs = useMemo(() => {
    if (!processedMarketData.length) return [];
    
    return [...processedMarketData]
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 3);
  }, [processedMarketData]);

  // Função para ordenar colunas
  const requestSort = useCallback((key) => {
    setSortConfig(prevConfig => {
      if (prevConfig.key === key) {
        return {
          key,
          direction: prevConfig.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return {
        key,
        direction: 'desc' // Padrão para nova coluna
      };
    });
  }, []);

  // Componente de cabeçalho de coluna ordenável
  const SortableColumnHeader = ({ label, sortKey }) => {
    const isSorted = sortConfig.key === sortKey;
    
    return (
      <th 
        className="px-6 py-4 text-right text-sm font-medium text-text-tertiary cursor-pointer hover:text-brand-primary transition-colors"
        onClick={() => requestSort(sortKey)}
      >
        <div className="flex items-center justify-end space-x-1">
          <span>{label}</span>
          <div className="flex flex-col">
            <ChevronUp 
              size={12} 
              className={`${isSorted && sortConfig.direction === 'asc' ? 'text-brand-primary' : 'text-text-tertiary opacity-50'}`} 
            />
            <ChevronDown 
              size={12} 
              className={`${isSorted && sortConfig.direction === 'desc' ? 'text-brand-primary' : 'text-text-tertiary opacity-50'}`} 
            />
          </div>
        </div>
      </th>
    );
  };

  useEffect(() => {
    // Marcar que o primeiro render acabou após o carregamento inicial
    if (isLoading === false && isFirstRender) {
      setIsFirstRender(false);
    }
  }, [isLoading]);

  // Modificar a função de renderização da tabela para usar loading padronizado
  const renderMarketContent = () => {
    if (isLoading && isFirstRender) {
      return <LoadingScreen message="Carregando dados do mercado..." />;
    }

    if (!filteredData.length) {
      return (
        <div className="px-6 py-16 text-center bg-background-primary rounded-2xl border border-border-primary">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <Search size={40} className="text-text-tertiary opacity-50 mb-3" />
            <p className="text-text-tertiary font-medium">
              {searchTerm 
                ? "Nenhuma criptomoeda encontrada com esse termo" 
                : filter === 'tertiary' 
                  ? "Você ainda não tem criptomoedas favoritas" 
                  : "Não há dados disponíveis"}
            </p>
            <button 
              className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-lg"
              onClick={() => {
                setSearchTerm('');
                setFilter('all');
              }}
            >
              Limpar filtros
            </button>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="w-full pb-10">
        {/* Informação de contagem */}
        <div className="flex justify-between items-center mb-4 text-text-terciary text-sm">
          <span>Exibindo {filteredData.length} moedas</span>
          
          <SortSelector 
            sortConfig={sortConfig}
            onSortChange={({key, direction}) => setSortConfig({key, direction})}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
          {filteredData.map((coin, index) => (
            <CoinCard
              key={coin.id}
              coin={coin}
              onFavoriteToggle={toggleFavorite}
              onCoinClick={handleCoinClick}
              onBuy={handleBuyClick}
              isFavorite={tertiary.includes(coin.id)}
              index={index}
            />
          ))}
        </div>
      </div>
    );
  };

  if (isLoading && !tickers.length) {
    return <LoadingScreen message="Carregando dados do mercado..." size="large" />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-6 space-y-6 min-h-screen bg-background"
    >
      {/* Header com estatísticas de mercado */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-7xl mx-auto p-4 bg-background-primary rounded-xl shadow-md border border-border-primary"
      >
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Mercado de Criptomoedas</h1>
            <p className="text-text-secondary">
              {isLoading ? "Atualizando..." : `${filteredData.length} criptomoedas disponíveis`}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm text-text-secondary">Última atualização</span>
            <span className="text-text-primary">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </motion.div>

      {/* Trending Pairs com visual melhorada */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-primary flex items-center">
            <TrendingUp size={20} className="mr-2 text-brand-primary" />
            Criptomoedas em Alta
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-sm text-brand-primary hover:text-brand-primary/80 flex items-center"
          >
            Ver todas <ChevronDown size={16} className="ml-1" />
          </motion.button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trendingPairs.map((pair, index) => (
            <TrendingCoinCard 
              key={pair.id} 
              coin={pair} 
              index={index} 
              onClick={handleCoinClick}
              onBuy={handleBuyClick}
            />
          ))}
        </div>
      </div>

     

      {/* Market Content - Visualização em Grade ao invés de Tabela */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mt-6"
      >
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          {/* Caixa de pesquisa com filtros em linha */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-terciary" size={20} />
            <input
              type="text"
              placeholder="Buscar criptomoedas..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-border-primary bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary transition-shadow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filtros de categoria com design moderno */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <FilterButton 
              label="Todas" 
              active={filter === 'all'} 
              onClick={() => setFilter('all')} 
            />
            <FilterButton 
              label="Favoritas" 
              active={filter === 'tertiary'} 
              onClick={() => setFilter('tertiary')} 
              icon={<Star size={14} />} 
            />
            <FilterButton 
              label="Em Alta" 
              active={filter === 'gainers'} 
              onClick={() => setFilter('gainers')} 
              icon={<ArrowUp size={14} />} 
            />
            <FilterButton 
              label="Em Baixa" 
              active={filter === 'losers'} 
              onClick={() => setFilter('losers')} 
              icon={<ArrowDown size={14} />} 
            />
          </div>
        </div>
        
        {/* Conteúdo das moedas em grid responsivo */}
        {renderMarketContent()}
      </motion.div>
      
      {/* CTA para engajamento */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-7xl mx-auto mt-8 bg-gradient-to-r from-brand-primary to-purple-600 p-6 rounded-xl shadow-lg text-white"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold">Notificações de Preço</h3>
            <p className="text-white/80 mt-1">
              Receba alertas quando os preços das suas criptomoedas favoritas mudarem significativamente
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-white text-brand-primary font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Configurar Alertas
          </motion.button>
        </div>
      </motion.div>

      {/* Background Animado - Adicionado conforme sugestão */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          className="absolute top-[10%] left-[5%] w-72 h-72 rounded-full bg-brand-primary/5 blur-3xl"
          animate={{ 
            y: [0, 30, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity,
            repeatType: "reverse" 
          }}
        />
        
        <motion.div 
          className="absolute bottom-[10%] right-[10%] w-96 h-96 rounded-full bg-purple-500/5 blur-3xl"
          animate={{ 
            y: [0, -30, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity,
            repeatType: "reverse",
            delay: 5
          }}
        />
        
        <motion.div 
          className="absolute top-[40%] right-[30%] w-64 h-64 rounded-full bg-blue-500/5 blur-3xl"
          animate={{ 
            y: [0, 20, 0],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ 
            duration: 18, 
            repeat: Infinity,
            repeatType: "reverse",
            delay: 10
          }}
        />
        
        {/* Elementos decorativos tipo partículas */}
        <motion.div 
          className="fixed w-1 h-1 rounded-full bg-brand-primary/80 top-[15%] left-[20%]" 
          animate={{ scale: [1, 3, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div 
          className="fixed w-1 h-1 rounded-full bg-purple-500/80 top-[25%] left-[80%]" 
          animate={{ scale: [1, 3, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
        />
        <motion.div 
          className="fixed w-1.5 h-1.5 rounded-full bg-blue-500/80 top-[65%] left-[75%]" 
          animate={{ scale: [1, 3, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 7, repeat: Infinity, delay: 2 }}
        />
      </div>
    </motion.div>
  );
}