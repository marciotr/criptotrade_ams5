import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader, ArrowUp, ArrowDown } from 'lucide-react';
import { currencyApi, walletApi, marketApi } from '../../services/api/api';
import CryptoIcon from '../../components/common/CryptoIcons';

const BuyCoin = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();

  // Estados de verificação de currency / wallet
  const [isChecking, setIsChecking] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [amount, setAmount] = useState('');
  const [loadingBuy, setLoadingBuy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados de mercado / gráfico
  const [timeRange, setTimeRange] = useState('24H');
  const [ticker, setTicker] = useState(null); // dados atuais da moeda
  const [klines, setKlines] = useState([]);   // dados para o gráfico
  const [isChartLoading, setIsChartLoading] = useState(true);

  const baseSymbol = useMemo(
    () => (symbol || '').replace('USDT', '').toUpperCase(),
    [symbol]
  );

  const timePeriods = useMemo(() => ({
    '1H': '1 Hora',
    '24H': '24 Horas',
    '1W': '1 Semana',
    '1M': '1 Mês',
    '1Y': '1 Ano'
  }), []);

  const getIntervalFromTimeRange = useCallback((range) => {
    switch (range) {
      case '1H':
        return { interval: '1m', limit: 60 };
      case '24H':
        return { interval: '15m', limit: 96 };
      case '1W':
        return { interval: '1h', limit: 168 };
      case '1M':
        return { interval: '4h', limit: 180 };
      case '1Y':
        return { interval: '1d', limit: 365 };
      default:
        return { interval: '15m', limit: 96 };
    }
  }, []);

  // Verificar se moeda existe no serviço de currency
  useEffect(() => {
    const checkCurrency = async () => {
      try {
        setIsChecking(true);
        setError('');
        const res = await currencyApi.getAllCurrencies();
        const list = res.data || [];

        const exists = list.some(
          c => c.symbol && c.symbol.toUpperCase() === baseSymbol.toUpperCase()
        );

        setIsAvailable(exists);
      } catch (err) {
        console.error('Erro verificando currency:', err);
        setError('Não foi possível verificar disponibilidade da moeda.');
        setIsAvailable(false);
      } finally {
        setIsChecking(false);
      }
    };

    if (baseSymbol) {
      checkCurrency();
    }
  }, [baseSymbol]);

  // Buscar ticker + klines para o gráfico
  const fetchMarketData = useCallback(async () => {
    if (!symbol) return;
    setIsChartLoading(true);
    try {
      const formattedSymbol = symbol.replace(/USDT+$/, '') + 'USDT';
      const { interval, limit } = getIntervalFromTimeRange(timeRange);

      const [tickerRes, klinesRes] = await Promise.all([
        marketApi.getTickerBySymbol(formattedSymbol),
        marketApi.getKlines(formattedSymbol, interval, limit)
      ]);

      setTicker(tickerRes.data);

      // Transformar klines em dados simples para gráfico
      const klinesData = (klinesRes.data || []).map(k => ({
        openTime: k[0],
        open: Number(k[1]),
        high: Number(k[2]),
        low: Number(k[3]),
        close: Number(k[4]),
        volume: Number(k[5])
      }));
      setKlines(klinesData);
    } catch (err) {
      console.error('Erro ao carregar dados de mercado:', err);
    } finally {
      setIsChartLoading(false);
    }
  }, [symbol, timeRange, getIntervalFromTimeRange]);

  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  const handleTimeRangeChange = (value) => {
    setTimeRange(value);
  };

  const handleBuy = async () => {
    setError('');
    setSuccess('');

    const value = parseFloat(String(amount).replace(',', '.'));
    if (Number.isNaN(value) || value <= 0) {
      setError('Informe uma quantidade válida.');
      return;
    }

    if (!isAvailable) {
      setError('Moeda não está disponível no nosso banco.');
      return;
    }

    try {
      setLoadingBuy(true);
      await walletApi.adjustBalance(baseSymbol, value);
      setSuccess('Compra realizada com sucesso!');
      setAmount('');
    } catch (err) {
      console.error('Erro ao comprar:', err);
      const msg = err?.response?.data?.message || 'Erro ao realizar compra. Tente novamente.';
      setError(msg);
    } finally {
      setLoadingBuy(false);
    }
  };

  const price = ticker ? Number(ticker.lastPrice) : null;
  const changePercent = ticker ? Number(ticker.priceChangePercent) : null;
  const isUp = changePercent !== null && changePercent >= 0;

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Background animado suave, seguindo o padrão do dashboard/markets */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          className="absolute -top-32 -left-20 w-72 h-72 rounded-full bg-brand-primary/10 blur-3xl"
          animate={{ 
            y: [0, 25, 0],
            opacity: [0.25, 0.4, 0.25],
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
        <motion.div 
          className="absolute -bottom-32 -right-10 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl"
          animate={{ 
            y: [0, -30, 0],
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{ 
            duration: 24, 
            repeat: Infinity,
            repeatType: 'reverse',
            delay: 3,
          }}
        />
        <motion.div 
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-blue-500/8 blur-3xl"
          animate={{ 
            y: [10, -10, 10],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ 
            duration: 26, 
            repeat: Infinity,
            repeatType: 'reverse',
            delay: 6,
          }}
        />
      </div>

      <div className="relative z-10 px-4 md:px-6 py-6 md:py-8 max-w-6xl mx-auto">
        {/* Header com voltar + nome da moeda */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6 md:mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-text-secondary hover:text-text-primary text-sm md:text-base transition-colors"
          >
            <ArrowLeft size={18} className="mr-2" />
            Voltar
          </button>

          <div className="flex items-center space-x-3 md:space-x-4">
            <motion.div 
              className="p-2.5 md:p-3 rounded-2xl bg-background-secondary/80 border border-border-primary shadow-sm backdrop-blur-sm"
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ type: 'spring', stiffness: 250, damping: 18 }}
            >
              <CryptoIcon symbol={symbol} size={32} />
            </motion.div>
            <div className="text-right">
              <p className="text-[11px] md:text-xs uppercase tracking-[0.16em] text-text-tertiary">Tela de compra</p>
              <div className="flex items-center justify-end space-x-1 md:space-x-2">
                <h1 className="text-lg md:text-2xl font-bold text-text-primary">
                  {baseSymbol}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-background-secondary/80 text-[11px] md:text-xs text-text-tertiary border border-border-primary">
                  {symbol}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Layout em duas colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
          {/* Esquerda: gráfico */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-2 rounded-2xl border border-border-primary bg-gradient-to-br from-background-primary/90 via-background-secondary/30 to-background-primary/90 shadow-xl backdrop-blur-xl p-4 md:p-6 relative overflow-hidden"
          >
            <motion.div 
              className="absolute inset-0 opacity-[0.15] pointer-events-none"
              animate={{
                opacity: [0.1, 0.17, 0.1],
              }}
              transition={{ duration: 18, repeat: Infinity, repeatType: 'reverse' }}
            >
              <div className="absolute -top-16 right-0 w-40 h-40 rounded-full bg-brand-primary/20 blur-3xl" />
              <div className="absolute -bottom-10 left-10 w-32 h-32 rounded-full bg-purple-500/20 blur-3xl" />
            </motion.div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between mb-5 space-y-4 md:space-y-0">
              <div>
                <p className="text-[11px] md:text-xs uppercase tracking-[0.16em] text-text-tertiary mb-1">Preço atual</p>
                <div className="flex items-baseline space-x-3 md:space-x-4">
                  <span className="text-2xl md:text-3xl font-extrabold text-text-primary">
                    {price ? `$${price.toLocaleString(undefined, { maximumFractionDigits: 6 })}` : '--'}
                  </span>
                  {changePercent !== null && (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium shadow-sm border ${
                      isUp
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-red-500/10 text-red-400 border-red-500/30'
                    }`}
                    >
                      {isUp ? <ArrowUp size={13} className="mr-1" /> : <ArrowDown size={13} className="mr-1" />}
                      {Math.abs(changePercent).toFixed(2)}%
                    </span>
                  )}
                </div>
                {ticker && (
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] md:text-xs text-text-secondary">
                    <div className="flex items-center justify-between sm:block">
                      <span className="text-text-tertiary mr-2 sm:mr-0">Alta 24h</span>
                      <span className="font-medium text-emerald-400">
                        ${Number(ticker.highPrice).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between sm:block">
                      <span className="text-text-tertiary mr-2 sm:mr-0">Baixa 24h</span>
                      <span className="font-medium text-red-400">
                        ${Number(ticker.lowPrice).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between sm:block">
                      <span className="text-text-tertiary mr-2 sm:mr-0">Volume 24h</span>
                      <span className="font-medium text-text-primary">
                        {Number(ticker.volume).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Seletor de período */}
              <div className="flex items-center justify-end">
                <div className="inline-flex items-center bg-background-secondary/80 border border-border-primary rounded-2xl p-1.5 shadow-sm backdrop-blur-sm">
                  {Object.entries(timePeriods).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => handleTimeRangeChange(value)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] md:text-xs font-medium transition-all duration-150 ${
                        timeRange === value
                          ? 'bg-brand-primary text-white shadow-md'
                          : 'text-text-secondary hover:bg-background-secondary'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative z-10 w-full h-[260px] md:h-[340px] rounded-xl bg-background-secondary/80 border border-border-primary overflow-hidden">
              {isChartLoading ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-text-secondary text-xs">
                  <Loader size={24} className="animate-spin mb-2" />
                  Carregando gráfico em tempo real...
                </div>
              ) : klines.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-text-secondary text-sm">
                  Não há dados de gráfico disponíveis.
                </div>
              ) : (
                <svg className="w-full h-full">
                  {klines.map((k, index) => {
                    if (index === 0) return null;
                    const prev = klines[index - 1];
                    const x1 = ((index - 1) / klines.length) * 100;
                    const x2 = (index / klines.length) * 100;
                    const maxPrice = Math.max(...klines.map(p => p.close));
                    const minPrice = Math.min(...klines.map(p => p.close));
                    const normalize = (priceVal) => ((priceVal - minPrice) / (maxPrice - minPrice || 1));
                    const y1 = 100 - normalize(prev.close) * 100;
                    const y2 = 100 - normalize(k.close) * 100;
                    return (
                      <line
                        key={k.openTime}
                        x1={`${x1}%`}
                        y1={`${y1}%`}
                        x2={`${x2}%`}
                        y2={`${y2}%`}
                        stroke={isUp ? '#22c55e' : '#ef4444'}
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="transition-all"
                      />
                    );
                  })}
                </svg>
              )}
            </div>
          </motion.div>

          {/* Direita: painel de compra */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="rounded-2xl border border-border-primary bg-gradient-to-br from-background-primary/95 via-background-secondary/40 to-background-primary/95 shadow-xl backdrop-blur-xl p-4 md:p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base md:text-lg font-semibold text-text-primary flex items-center">
                  Comprar {baseSymbol}
                </h2>
                {changePercent !== null && (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium border ${
                    isUp
                      ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/30'
                      : 'bg-red-500/5 text-red-400 border-red-500/30'
                  }`}
                  >
                    {isUp ? 'Tendência de alta' : 'Tendência de baixa'}
                  </span>
                )}
              </div>

              <p className="text-[11px] md:text-xs text-text-secondary mb-4">
                {isChecking
                  ? 'Verificando disponibilidade da moeda...'
                  : isAvailable
                    ? 'Esta moeda está disponível no nosso banco. Defina a quantidade desejada para realizar a compra.'
                    : 'Esta moeda NÃO está disponível no nosso banco no momento. Você não pode realizar a compra.'}
              </p>

              {/* Campo quantidade */}
              <div className="mb-4">
                <label className="block text-[11px] md:text-xs text-text-secondary mb-1">
                  Quantidade de {baseSymbol}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    step="0.00000001"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border-primary bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/80 text-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Resumo da ordem */}
              <div className="mb-4 rounded-2xl bg-background-secondary/70 border border-border-primary/80 p-3.5 space-y-2 text-[11px] md:text-xs text-text-secondary">
                <div className="flex items-center justify-between">
                  <span>Preço atual</span>
                  <span className="text-text-primary font-medium">
                    {price ? `$${price.toLocaleString(undefined, { maximumFractionDigits: 6 })}` : '--'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Valor estimado</span>
                  <span className="text-text-primary font-medium">
                    {price && amount
                      ? `$${(price * parseFloat(amount || '0')).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                      : '--'}
                  </span>
                </div>
                {changePercent !== null && (
                  <div className="flex items-center justify-between">
                    <span>Variação 24h</span>
                    <span className={isUp ? 'text-emerald-400' : 'text-red-400'}>
                      {isUp ? '+' : ''}{changePercent.toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Mensagens */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="mb-3 text-[11px] md:text-xs text-red-500 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2"
                  >
                    {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="mb-3 text-[11px] md:text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2"
                  >
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileHover={isAvailable && !loadingBuy && !isChecking ? { scale: 1.02, y: -1 } : {}}
              whileTap={isAvailable && !loadingBuy && !isChecking ? { scale: 0.97, y: 0 } : {}}
              onClick={handleBuy}
              disabled={!isAvailable || loadingBuy || isChecking}
              className={`w-full py-3 mt-2 rounded-xl font-semibold text-sm md:text-base transition-all duration-150 shadow-lg shadow-brand-primary/20 ${
                !isAvailable || isChecking
                  ? 'bg-gray-600/80 cursor-not-allowed text-white/80'
                  : 'bg-brand-primary hover:bg-brand-primary/90 text-white'
              }`}
            >
              {isChecking
                ? 'Verificando moeda...'
                : !isAvailable
                  ? 'Moeda não disponível no nosso banco'
                  : loadingBuy
                    ? 'Processando compra...'
                    : `Comprar ${baseSymbol}`}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BuyCoin;
