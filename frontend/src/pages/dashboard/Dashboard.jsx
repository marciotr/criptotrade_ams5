import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { marketApi } from '../../services/api/api';
import { useNavigate } from 'react-router-dom';
import logoBranca from '../../assets/img/logoBinanceRemoved.png';
import logoPreta from '../../assets/img/logoBinanceRemoved.png';
import { 
  transactions, 
  news, 
  statsData 
} from '../../data/mockData';
import { StatsCards } from '../../components/dashboard/StatsCards';
import { CryptoChart } from '../../components/dashboard/CryptoChart';
import { MarketOverview } from '../../components/dashboard/MarketOverview';
import { TopMovers } from '../../components/dashboard/TopMovers';
import { RecentTransactions } from '../../components/dashboard/RecentTransactions';
import { LatestNews } from '../../components/dashboard/LatestNews';
import { CoinSelector } from '../../components/dashboard/CoinSelector';
import { TimeRangeSelector } from '../../components/dashboard/TimeRangeSelector';

export function Dashboard() {
  const { theme } = useTheme();
  const navigate = useNavigate();
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
  const [visibleCount, setVisibleCount] = useState(5); // Changed from 6 to 5
  const [tickers, setTickers] = useState([]);
  const [chartData, setChartData] = useState([]);

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
        console.error('Error fetching tickers:', error);
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
        console.error('Error fetching crypto data:', error);
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
      console.error('Error fetching coin data:', error);
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
      console.error('Error selecting coin:', error);
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

  return (
    <div className="relative p-4 lg:p-6 space-y-6 transition-colors duration-200 max-w-[1920px] mx-auto">
      <StatsCards 
        stats={statsData}
        className="mb-6" 
      />

      <div className="fixed bottom-0 right-0 pointer-events-none opacity-5 z-0 transition-opacity duration-300">
        <img
          src={theme === 'light' ? logoBranca : logoPreta}
          alt=""
          className="w-[500px] h-[500px] object-contain"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 lg:p-6 rounded bg-background-primary border border-border-primary 
                      shadow-md hover:shadow-lg transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
            <CoinSelector 
              selectedCoin={selectedCoin}
              coins={availableCoins}
              isOpen={dropdownOpen}
              onToggle={() => setDropdownOpen(!dropdownOpen)}
              onSelect={handleCoinSelection}
              price={selectedCryptoData?.lastPrice}
            />
            <TimeRangeSelector 
              timeRange={timeRange}
              periods={timePeriods}
              onTimeRangeChange={handleTimeRangeChange}
              selectedCoin={selectedCoin}
            />
          </div>
          
          <div className="h-[420px] lg:h-[460px] w-full">
            <CryptoChart 
              data={selectedCoin?.data}
              isLoading={isLoading}
              color={selectedCoin?.color}
            />
          </div>
        </div>

        <MarketOverview 
          key="market-overview"
          data={visibleMarketData}
          isLoading={false} 
          visibleCount={visibleCount}
          onShowMore={handleShowMore}
          className="p-5 lg:p-6 rounded bg-background-primary border border-border-primary 
                    shadow-md hover:shadow-lg transition-all duration-300"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <TopMovers 
          data={getTopMovers.gainers} 
          type="gainers"
          className="p-4 lg:p-5 rounded bg-background-primary border border-border-primary 
                    shadow-sm hover:shadow-md transition-all duration-300"
        />
        <TopMovers 
          data={getTopMovers.losers} 
          type="losers"
          className="p-4 lg:p-5 rounded bg-background-primary border border-border-primary 
                    shadow-sm hover:shadow-md transition-all duration-300"
        />
      </div>

      <RecentTransactions 
        transactions={transactions}
        className="p-4 lg:p-5 rounded bg-background-primary border border-border-primary 
                  shadow-sm hover:shadow-md transition-all duration-300"
      />
      <LatestNews 
        news={news}
        className="p-4 lg:p-5 rounded bg-background-primary border border-border-primary 
                  shadow-sm hover:shadow-md transition-all duration-300"
      />
    </div>
  );
}

