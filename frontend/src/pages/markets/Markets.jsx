import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, ArrowUp, ArrowDown, TrendingUp, Loader } from 'lucide-react';
import CryptoIcon from '../../components/common/CryptoIcons';
import { marketFilters } from '../../data/mockData';
import { useNavigate } from 'react-router-dom';
import { marketApi } from '../../services/api/api';

export function Markets() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); 
  const [favorites, setFavorites] = useState(() => {
    const storedFavorites = localStorage.getItem('cryptoFavorites');
    return storedFavorites ? JSON.parse(storedFavorites) : [];
  });
  const [tickers, setTickers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
    localStorage.setItem('cryptoFavorites', JSON.stringify(favorites));
  }, [favorites]);

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
        favorite: favorites.includes(ticker.symbol)
      }));
  }, [tickers, favorites]);

  const toggleFavorite = (coinId) => {
    if (favorites.includes(coinId)) {
      setFavorites(favorites.filter(id => id !== coinId));
    } else {
      setFavorites([...favorites, coinId]);
    }
  };

  const handleCoinClick = useCallback((coin, event) => {
    // Prevent navigation when clicking the favorite star
    if (event.target.closest('.favorite-star')) return;
    
    const coinPath = coin.name.toLowerCase();
    navigate(`/price/${coinPath}`);
  }, [navigate]);

  // Aplicar filtros aos dados processados
  const filteredData = useMemo(() => {
    return processedMarketData.filter(coin => {
      const matchesSearch = 
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filter === 'favorites') return matchesSearch && favorites.includes(coin.id);
      if (filter === 'gainers') return matchesSearch && coin.change > 0;
      if (filter === 'losers') return matchesSearch && coin.change < 0;
      return matchesSearch;
    });
  }, [processedMarketData, searchTerm, filter, favorites]);

  // Obter as moedas em tendência (top 3 por volume)
  const trendingPairs = useMemo(() => {
    if (!processedMarketData.length) return [];
    
    return [...processedMarketData]
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 3);
  }, [processedMarketData]);

  if (isLoading && !tickers.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-10 h-10 text-brand-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 min-h-screen bg-background">
      {/* Trending Pairs */}
      <div className="max-w-7xl mx-auto mb-8">
        <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center">
          <TrendingUp size={20} className="mr-2" />
          Trending Pairs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trendingPairs.map((pair, index) => (
            <motion.div
              key={pair.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-background-primary p-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              onClick={(e) => handleCoinClick(pair, e)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CryptoIcon symbol={pair.id} size={24} />
                  <div>
                    <span className="font-bold text-text-primary block">{pair.name}/USDT</span>
                    <span className="text-sm text-text-secondary">24h Volume: ${pair.volume.toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-text-primary">${pair.price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 6
                  })}</p>
                  <p className={`text-sm flex items-center justify-end ${
                    pair.change > 0 ? 'text-feedback-success' : 'text-feedback-error'
                  }`}>
                    {pair.change > 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                    {Math.abs(pair.change).toFixed(2)}%
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-stretch space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={20} />
            <input
              type="text"
              placeholder="Search markets..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-border-primary bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary transition-shadow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {marketFilters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  filter === f.id
                    ? 'bg-brand-primary text-background-primary shadow-lg'
                    : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Market Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto bg-background-primary rounded-xl shadow-lg overflow-hidden"
      >
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <Loader className="w-8 h-8 text-brand-primary animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-background-secondary border-b border-border-primary">
                  <th className="px-6 py-4 text-left text-sm font-medium text-text-tertiary">Name</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-text-tertiary">Price</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-text-tertiary">24h Change</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-text-tertiary">Volume</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-text-tertiary">Market Cap</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-text-tertiary">Favorite</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((coin, index) => (
                    <motion.tr
                      key={coin.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-t border-border-primary hover:bg-background-secondary transition-colors cursor-pointer"
                      onClick={(e) => handleCoinClick(coin, e)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <CryptoIcon symbol={coin.id} size={20} />
                          <span className="font-semibold text-text-primary">{coin.name}</span>
                          <span className="text-text-tertiary">{coin.symbol}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-text-primary">
                        ${coin.price.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: coin.price < 1 ? 6 : 2
                        })}
                      </td>
                      <td className={`px-6 py-4 text-right ${
                        coin.change > 0 ? 'text-feedback-success' : 'text-feedback-error'
                      }`}>
                        <div className="flex items-center justify-end">
                          {coin.change > 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
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
                          <Star
                            className={`favorite-star cursor-pointer ${
                              favorites.includes(coin.id)
                                ? 'fill-yellow-500 text-yellow-500'
                                : 'text-gray-400 hover:text-yellow-500'
                            }`}
                            size={20}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(coin.id);
                            }}
                          />
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-text-tertiary">
                      {searchTerm 
                        ? "No coins found matching your search" 
                        : filter === 'favorites' 
                          ? "You don't have any favorite coins yet" 
                          : "No data available"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}