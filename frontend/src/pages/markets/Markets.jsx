import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';
import CryptoIcon from '../../components/common/CryptoIcons';
import { 
  marketData, 
  trendingPairs,
  marketFilters 
} from '../../data/mockData';
import { useNavigate } from 'react-router-dom';

export function Markets() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); 
  const [favorites, setFavorites] = useState(
    marketData.filter(coin => coin.favorite).map(coin => coin.id)
  );

  const toggleFavorite = (coinId) => {
    if (favorites.includes(coinId)) {
      setFavorites(favorites.filter(id => id !== coinId));
    } else {
      setFavorites([...favorites, coinId]);
    }
  };

  const handleCoinClick = (coinId) => {
    // Prevent navigation when clicking the favorite star
    const isStarClick = event.target.closest('.favorite-star');
    if (isStarClick) return;
    
    const coinPath = String(coinId).toLowerCase();
    navigate(`/price/${coinPath}`);
  };

  const filteredData = marketData.filter(coin => {
    const matchesSearch = coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coin.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'favorites') return matchesSearch && favorites.includes(coin.id);
    if (filter === 'gainers') return matchesSearch && coin.change > 0;
    if (filter === 'losers') return matchesSearch && coin.change < 0;
    return matchesSearch;
  });

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
              key={pair.pair}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-background-primary p-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CryptoIcon symbol={pair.base} size={24} />
                  <div>
                    <span className="font-bold text-text-primary block">{pair.pair}</span>
                    <span className="text-sm text-text-secondary">24h Volume</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-text-primary">${pair.price.toLocaleString()}</p>
                  <p className={`text-sm flex items-center justify-end ${
                    pair.change > 0 ? 'text-feedback-success' : 'text-feedback-error'
                  }`}>
                    {pair.change > 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                    {Math.abs(pair.change)}%
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
              {filteredData.map((coin, index) => (
                <motion.tr
                  key={coin.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-t border-border-primary hover:bg-background-secondary transition-colors cursor-pointer"
                  onClick={() => handleCoinClick(coin.id)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <CryptoIcon symbol={coin.symbol} size={20} />
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{coin.name}</span>
                      <span className="text-gray-500 dark:text-gray-400">{coin.symbol}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-700 dark:text-gray-300">
                    ${coin.price.toLocaleString()}
                  </td>
                  <td className={`px-6 py-4 text-right ${
                    coin.change > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    <div className="flex items-center justify-end">
                      {coin.change > 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                      {Math.abs(coin.change)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">{coin.volume}</td>
                  <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">{coin.marketCap}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}