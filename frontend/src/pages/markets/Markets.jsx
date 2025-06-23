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
const TrendingCoinCard = ({ coin, onClick, index }) => (
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

// VirtualizedCoinRow - Este componente renderiza uma linha dentro do virtualizador
const VirtualizedCoinRow = React.memo(({ data, index, style }) => {
  const coin = data.items[index];
  const { onFavoriteToggle, onCoinClick, tertiary } = data;
  const isFavorite = tertiary.includes(coin.id);

  return (
    <div 
      style={style}
      className="border-b border-border-primary hover:bg-background-secondary transition-all duration-200 cursor-pointer"
      onClick={(e) => onCoinClick(coin, e)}
    >
      <div className="flex items-center h-full">
        <div className="px-6 py-4 flex items-center w-64">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 rounded-full bg-background-secondary">
              <CryptoIcon symbol={coin.id} size={24} />
            </div>
            <div>
              <span className="font-semibold text-text-primary block">{coin.name}</span>
              <span className="text-xs text-text-tertiary">{coin.symbol}</span>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 text-right font-semibold text-text-primary w-40">
          ${coin.price.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: coin.price < 1 ? 6 : 2
          })}
        </div>
        
        <div className="px-6 py-4 text-right w-32">
          <div className={`inline-flex items-center px-2 py-1 rounded-full ${
            coin.change > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
          }`}>
            {coin.change > 0 ? <ArrowUp size={12} className="mr-1" /> : <ArrowDown size={12} className="mr-1" />}
            {Math.abs(coin.change).toFixed(2)}%
          </div>
        </div>
        
        <div className="px-6 py-4 text-right text-text-secondary w-40">
          ${coin.volume.toLocaleString(undefined, {
            maximumFractionDigits: 0
          })}
        </div>
        
        <div className="px-6 py-4 text-right text-text-secondary w-40">
          ${coin.marketCap.toLocaleString(undefined, {
            maximumFractionDigits: 0
          })}
        </div>
        
        <div className="px-6 py-4 w-20 text-center">
          <div className="flex justify-center">
            <div
              className="favorite-star cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onFavoriteToggle(coin.id);
              }}
            >
              <Star
                className={`transition-all duration-300 ${
                  isFavorite
                    ? 'fill-yellow-500 text-yellow-500 drop-shadow-md'
                    : 'text-text-tertiary hover:text-yellow-500'
                }`}
                size={20}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

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

  const handleCoinClick = useCallback((coin, event) => {
    // Prevent navigation when clicking the favorite star
    if (event.target.closest('.favorite-star')) return;
    
    const coinPath = coin.name.toLowerCase();
    navigate(`/price/${coinPath}`);
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
  const renderMarketTable = () => {
    if (isLoading && isFirstRender) {
      return <LoadingScreen message="Carregando dados do mercado..." />;
    }

    if (!filteredData.length) {
      return (
        <div className="px-6 py-16 text-center">
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
      <div className="w-full" style={{ height: 'calc(100vh - 400px)', minHeight: '400px' }}>
        <AutoSizer>
          {({ height, width }) => (
            <List
              className="market-list"
              height={height}
              itemCount={filteredData.length}
              itemSize={72} // altura de cada linha
              width={width}
              itemData={{
                items: filteredData,
                onFavoriteToggle: toggleFavorite,
                onCoinClick: handleCoinClick,
                tertiary
              }}
            >
              {VirtualizedCoinRow}
            </List>
          )}
        </AutoSizer>
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

      {/* Trending Pairs com visual melhorado */}
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
            />
          ))}
        </div>
      </div>

      {/* Search and Filters com melhor responsividade */}
      <div className="max-w-7xl mx-auto mt-8">
        <div className="flex flex-col lg:flex-row justify-between items-stretch gap-4">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={20} />
            <input
              type="text"
              placeholder="Buscar criptomoedas..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-border-primary bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary transition-shadow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="hidden lg:flex flex-wrap gap-2">
            {marketFilters.map((f) => (
              <motion.button
                key={f.id}
                onClick={() => setFilter(f.id)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  filter === f.id
                    ? 'bg-brand-primary text-background-primary shadow-lg'
                    : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
                }`}
              >
                {f.name}
              </motion.button>
            ))}
          </div>
          
          {/* Filtro mobile */}
          <div className="lg:hidden">
            <button 
              className="flex items-center justify-between w-full px-4 py-3 bg-background-secondary rounded-xl text-text-primary"
              onClick={() => setShowMobileFilters(prev => !prev)}
            >
              <span className="flex items-center">
                <Filter size={18} className="mr-2" />
                Filtros
              </span>
              <ChevronDown 
                size={18} 
                className={`transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} 
              />
            </button>
            
            <AnimatePresence>
              {showMobileFilters && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-2 overflow-hidden"
                >
                  <div className="flex flex-wrap gap-2 p-2 bg-background-secondary rounded-xl">
                    {marketFilters.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => {
                          setFilter(f.id);
                          setShowMobileFilters(false);
                        }}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                          filter === f.id
                            ? 'bg-brand-primary text-background-primary shadow-lg'
                            : 'bg-background-tertiary text-text-secondary'
                        }`}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Market Table com virtualização */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mt-6 bg-background-primary rounded-xl shadow-lg overflow-hidden border border-border-primary"
      >
        <div className="overflow-hidden">
          {/* Cabeçalho da tabela (fixo) */}
          <div className="bg-background-secondary border-b border-border-primary">
            <div className="flex items-center">
              <div className="px-6 py-4 w-64 text-left text-sm font-medium text-text-tertiary">Nome</div>
              
              <div 
                className="px-6 py-4 w-40 text-right text-sm font-medium text-text-tertiary cursor-pointer hover:text-brand-primary transition-colors"
                onClick={() => requestSort('price')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Preço</span>
                  <div className="flex flex-col">
                    <ChevronUp 
                      size={12} 
                      className={`${sortConfig.key === 'price' && sortConfig.direction === 'asc' ? 'text-brand-primary' : 'text-text-tertiary opacity-50'}`} 
                    />
                    <ChevronDown 
                      size={12} 
                      className={`${sortConfig.key === 'price' && sortConfig.direction === 'desc' ? 'text-brand-primary' : 'text-text-tertiary opacity-50'}`} 
                    />
                  </div>
                </div>
              </div>
              
              <div 
                className="px-6 py-4 w-32 text-right text-sm font-medium text-text-tertiary cursor-pointer hover:text-brand-primary transition-colors"
                onClick={() => requestSort('change')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>24h</span>
                  <div className="flex flex-col">
                    <ChevronUp 
                      size={12} 
                      className={`${sortConfig.key === 'change' && sortConfig.direction === 'asc' ? 'text-brand-primary' : 'text-text-tertiary opacity-50'}`} 
                    />
                    <ChevronDown 
                      size={12} 
                      className={`${sortConfig.key === 'change' && sortConfig.direction === 'desc' ? 'text-brand-primary' : 'text-text-tertiary opacity-50'}`} 
                    />
                  </div>
                </div>
              </div>
              
              <div 
                className="px-6 py-4 w-40 text-right text-sm font-medium text-text-tertiary cursor-pointer hover:text-brand-primary transition-colors"
                onClick={() => requestSort('volume')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Volume 24h</span>
                  <div className="flex flex-col">
                    <ChevronUp 
                      size={12} 
                      className={`${sortConfig.key === 'volume' && sortConfig.direction === 'asc' ? 'text-brand-primary' : 'text-text-tertiary opacity-50'}`} 
                    />
                    <ChevronDown 
                      size={12} 
                      className={`${sortConfig.key === 'volume' && sortConfig.direction === 'desc' ? 'text-brand-primary' : 'text-text-tertiary opacity-50'}`} 
                    />
                  </div>
                </div>
              </div>
              
              <div 
                className="px-6 py-4 w-40 text-right text-sm font-medium text-text-tertiary cursor-pointer hover:text-brand-primary transition-colors"
                onClick={() => requestSort('marketCap')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Cap. de Mercado</span>
                  <div className="flex flex-col">
                    <ChevronUp 
                      size={12} 
                      className={`${sortConfig.key === 'marketCap' && sortConfig.direction === 'asc' ? 'text-brand-primary' : 'text-text-tertiary opacity-50'}`} 
                    />
                    <ChevronDown 
                      size={12} 
                      className={`${sortConfig.key === 'marketCap' && sortConfig.direction === 'desc' ? 'text-brand-primary' : 'text-text-tertiary opacity-50'}`} 
                    />
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 w-20 text-center text-sm font-medium text-text-tertiary">Favorito</div>
            </div>
          </div>
          
          {/* Corpo da tabela virtualizado */}
          {renderMarketTable()}
        </div>
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
    </motion.div>
  );
}