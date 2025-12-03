import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowUp, ArrowDown } from 'lucide-react';
import { currencyApi, marketApi, transactionApi, walletApi } from '../../services/api/api';
import { useNotification } from '../../context/NotificationContext';
import CryptoIcon from '../../components/common/CryptoIcons';
import { CryptoChart } from '../dashboard/components/CryptoChart';

const BuyCoin = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();

  // Estados de verificação de currency / wallet
  const [isChecking, setIsChecking] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [amount, setAmount] = useState('');
  const [buyMode, setBuyMode] = useState('qty'); // 'qty' = buy by crypto quantity, 'usd' = buy by fiat amount
  const [loadingBuy, setLoadingBuy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availableFiat, setAvailableFiat] = useState(null);
  const [fiatCurrencySymbol, setFiatCurrencySymbol] = useState('USD');
  const [currentWalletId, setCurrentWalletId] = useState(null);
  const [currentAccountId, setCurrentAccountId] = useState(null);

  // Estados de mercado / gráfico
  const [timeRange, setTimeRange] = useState('24H');
  const [ticker, setTicker] = useState(null); // dados atuais da moeda
  const [klines, setKlines] = useState([]);   // dados para o gráfico
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : false);

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

      const formattedForChart = klinesData.map(point => {
        const date = new Date(point.openTime);
        const shortLabel = timeRange === '1H' || timeRange === '24H'
          ? date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          : date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });

        return {
          time: shortLabel,
          price: point.close,
          volume: point.volume,
          fullDate: date.toLocaleString('pt-BR')
        };
      });
      setChartData(formattedForChart);
    } catch (err) {
      console.error('Erro ao carregar dados de mercado:', err);
      setChartData([]);
    } finally {
      setIsChartLoading(false);
    }
  }, [symbol, timeRange, getIntervalFromTimeRange]);

  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  // Load user's wallet and fiat position on mount so UI reflects available fiat immediately
  useEffect(() => {
    const loadWalletAndFiat = async () => {
      try {
        const wres = await walletApi.getWallets();
        const list = Array.isArray(wres.data) ? wres.data : [];
        let wId = null;
        let aId = null;
        if (list.length > 0) {
          const first = list[0];
          wId = first.idWallet ?? first.IdWallet ?? first.id ?? first.Id ?? null;
          aId = first.idAccount ?? first.IdAccount ?? first.accountId ?? first.AccountId ?? null;
          setCurrentWalletId(wId);
          setCurrentAccountId(aId);
        }

        if (wId) {
          const wb = await walletApi.getWalletBalances(wId);
          const positions = Array.isArray(wb.data) ? wb.data : [];
          const fiatPos = positions.find(p => {
            const s = (p.symbol || p.Symbol || p.currencySymbol || '').toUpperCase();
            return ['USDT', 'USD', 'USDC'].includes(s);
          });
          if (fiatPos) {
            const walletFiatAvailable = Number(fiatPos.amount ?? fiatPos.Amount ?? 0);
            setAvailableFiat(walletFiatAvailable);
            const symbol = (fiatPos.symbol || fiatPos.Symbol || fiatPos.currencySymbol || 'USD').toUpperCase();
            setFiatCurrencySymbol(symbol);
          }
        }
      } catch (e) {
        console.warn('Could not load wallet/fiat on mount', e);
      }
    };

    loadWalletAndFiat();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTimeRangeChange = (value) => {
    setTimeRange(value);
  };

  const { showNotification } = useNotification();

  const handleBuy = async () => {
    setError('');
    setSuccess('');

    const raw = String(amount).replace(',', '.');
    const parsed = parseFloat(raw);
    if (Number.isNaN(parsed) || parsed <= 0) {
      setError('Informe um valor válido.');
      return;
    }

    // Determine fiat amount to send to backend
    let fiatToSpend = 0;
    if (buyMode === 'qty') {
      // buying by quantity: need current price
      if (!price || price <= 0) {
        setError('Preço inválido, tente novamente mais tarde.');
        return;
      }
      const qty = parsed;
      fiatToSpend = qty * price;
    } else {
      // buyMode === 'usd'
      fiatToSpend = parsed;
    }

    if (!isAvailable) {
      setError('Moeda não está disponível no nosso banco.');
      return;
    }

    try {
      setLoadingBuy(true);

      // Ensure we have wallet/account ids (prefer state loaded on mount)
      let walletId = currentWalletId;
      let accountId = currentAccountId;
      try {
        if (!walletId) {
          const wres = await walletApi.getWallets();
          const list = Array.isArray(wres.data) ? wres.data : [];
          if (list.length > 0) {
            const first = list[0];
            walletId = first.idWallet ?? first.IdWallet ?? first.id ?? first.Id ?? null;
            accountId = first.idAccount ?? first.IdAccount ?? first.accountId ?? first.AccountId ?? null;
            setCurrentWalletId(walletId);
            setCurrentAccountId(accountId);
          } else {
            const created = await walletApi.createWallet({ name: 'Default' });
            const w = created.data;
            walletId = w?.idWallet ?? w?.IdWallet ?? w?.id ?? w?.Id ?? null;
            accountId = w?.idAccount ?? w?.IdAccount ?? w?.accountId ?? w?.AccountId ?? null;
            setCurrentWalletId(walletId);
            setCurrentAccountId(accountId);
          }
        }
      } catch (werr) {
        console.warn('Could not fetch/create wallet, proceeding with null ids', werr);
      }

      // Resolve currency GUID from wallet API (match by symbol)
      // First check the public currency service to ensure symbol exists, then map to walletApi's currency id
      const currenciesRes = await currencyApi.getAllCurrencies();
      const currencies = Array.isArray(currenciesRes.data) ? currenciesRes.data : [];
      const publicCurrency = currencies.find(c => (c.symbol || c.Symbol || '').toUpperCase() === baseSymbol.toUpperCase());
      if (!publicCurrency) {
        const msg = 'Currency not found in public currency service';
        setError(msg);
        showNotification(msg, 'error');
        setLoadingBuy(false);
        return;
      }

      // Now ask the wallet API for its list of currencies and match by symbol to obtain the wallet-side IdCurrency
      const walletCurrenciesRes = await walletApi.getCurrencies();
      const walletCurrencies = Array.isArray(walletCurrenciesRes.data) ? walletCurrenciesRes.data : [];
      const walletCurrency = walletCurrencies.find(c => (c.symbol || c.Symbol || '').toUpperCase() === baseSymbol.toUpperCase());
      if (!walletCurrency) {
        const msg = 'Currency not available in wallet service';
        setError(msg);
        showNotification(msg, 'error');
        setLoadingBuy(false);
        return;
      }

      const currencyId = walletCurrency.idCurrency ?? walletCurrency.IdCurrency ?? walletCurrency.id ?? walletCurrency.Id ?? null;

      // If we still don't have availableFiat loaded in state, try to fetch wallet balances now
      try {
        if (walletId && availableFiat === null) {
          const wb = await walletApi.getWalletBalances(walletId);
          const positions = Array.isArray(wb.data) ? wb.data : [];
          const fiatPos = positions.find(p => {
            const s = (p.symbol || p.Symbol || p.currencySymbol || '').toUpperCase();
            return ['USDT', 'USD', 'USDC'].includes(s);
          });
          if (fiatPos) {
            const walletFiatAvailable = Number(fiatPos.amount ?? fiatPos.Amount ?? 0);
            setAvailableFiat(walletFiatAvailable);
            const symbol = (fiatPos.symbol || fiatPos.Symbol || fiatPos.currencySymbol || 'USD').toUpperCase();
            setFiatCurrencySymbol(symbol);
          }
        }
      } catch (e) {
        console.warn('Could not fetch wallet balances', e);
      }

      // If wallet has fiat position in state, validate sufficient funds before sending buy
      if (availableFiat !== null && fiatToSpend > availableFiat) {
        const msg = 'Saldo fiat insuficiente na carteira monetária.';
        setError(msg);
        showNotification(msg, 'error');
        setLoadingBuy(false);
        return;
      }

      const payload = {
        IdAccount: accountId ?? '',
        IdWallet: walletId ?? '',
        IdCurrency: currencyId,
        FiatAmount: fiatToSpend
      };

      const response = await transactionApi.buy(payload);
      const usdSpent = response?.data?.usdSpent;
      const price = response?.data?.priceUsd;
      const succMsg = usdSpent && price
        ? `Compra realizada! Custo: $${usdSpent.toLocaleString(undefined, { maximumFractionDigits: 2 })} @ $${price.toFixed(2)}`
        : 'Compra realizada com sucesso!';
      setSuccess(succMsg);
      showNotification(succMsg, 'success');
      // Notify other parts of the app (portfolio) to refresh their data
      try {
        window.dispatchEvent(new Event('wallet-updated'));
      } catch (e) {
        // ignore if window not available
      }
      // Redirect user to portfolio so they immediately see the updated position and P/L
      try {
        navigate('/portfolio');
      } catch (e) {
        // ignore navigation errors
      }
      setAmount('');
      // Refresh wallet balances (fiat position) for immediate UI update
      try {
        if (walletId) {
          const wb2 = await walletApi.getWalletBalances(walletId);
          const positions2 = Array.isArray(wb2.data) ? wb2.data : [];
          const fiatPos2 = positions2.find(p => {
            const s = (p.symbol || p.Symbol || p.currencySymbol || '').toUpperCase();
            return ['USDT', 'USD', 'USDC'].includes(s);
          });
          if (fiatPos2) {
            const newAvailable = Number(fiatPos2.amount ?? fiatPos2.Amount ?? 0);
            setAvailableFiat(newAvailable);
            const symbol2 = (fiatPos2.symbol || fiatPos2.Symbol || fiatPos2.currencySymbol || 'USD').toUpperCase();
            setFiatCurrencySymbol(symbol2);
          }
        }
      } catch (e) {
        console.warn('Could not refresh wallet balances after buy', e);
      }
      // Refresh wallet balances/summary so portfolio and deposit pages reflect the new position
      try {
        await Promise.all([walletApi.getBalance(), walletApi.getSummary()]);
      } catch (e) {
        // non-fatal; UI will refresh on next navigation or SignalR update
        console.warn('Could not refresh wallet summary after buy', e);
      }
    } catch (err) {
      console.error('Erro ao comprar:', err);
      // Backend may return a plain string (e.g. "Insufficient fiat balance") or an object { message/... }
      const respData = err?.response?.data;
      let msg;
      if (!respData) msg = err?.message || 'Erro ao realizar compra. Tente novamente.';
      else if (typeof respData === 'string') msg = respData;
      else msg = respData.message ?? respData.error ?? JSON.stringify(respData);
      setError(msg);
      showNotification(msg, 'error');
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

      <div className="relative z-10 px-4 sm:px-6 lg:px-10 py-6 lg:py-10 w-full max-w-[1400px] mx-auto">
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
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6 xl:gap-8">
          {/* Esquerda: gráfico */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-border-primary bg-gradient-to-br from-background-primary/90 via-background-secondary/35 to-background-primary/90 shadow-2xl shadow-brand-primary/5 backdrop-blur-xl p-4 md:p-6 relative overflow-hidden"
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
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 text-[11px] md:text-xs text-text-secondary">
                    <div className="flex items-center justify-between sm:block">
                      <span className="text-text-tertiary mr-2 sm:mr-0">Alta 24h </span>
                      <span className="font-medium text-emerald-400">
                        ${Number(ticker.highPrice).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between sm:block">
                      <span className="text-text-tertiary mr-2 sm:mr-0">Baixa 24h </span>
                      <span className="font-medium text-red-400">
                        ${Number(ticker.lowPrice).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between sm:block">
                      <span className="text-text-tertiary mr-2 sm:mr-0">Volume 24h </span>
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

            <div className="relative z-10 w-full h-[260px] md:h-[360px] rounded-xl bg-background-secondary/80 border border-border-primary overflow-hidden">
              {chartData.length === 0 && !isChartLoading ? (
                <div className="absolute inset-0 flex items-center justify-center text-text-secondary text-sm">
                  Não há dados de gráfico disponíveis.
                </div>
              ) : (
                <CryptoChart
                  data={chartData}
                  isLoading={isChartLoading}
                  color={isUp ? '#22c55e' : '#ef4444'}
                  height={isMobile ? 260 : 360}
                  isMobile={isMobile}
                />
              )}
            </div>
          </motion.div>

          {/* Direita: painel de compra */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="rounded-2xl border border-border-primary bg-gradient-to-br from-background-primary/95 via-background-secondary/45 to-background-primary/95 shadow-2xl shadow-black/20 backdrop-blur-xl p-4 md:p-6 flex flex-col justify-between"
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
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] md:text-xs text-text-secondary">
                    {buyMode === 'qty' ? 'Quantidade' : `Valor (${fiatCurrencySymbol})`}
                  </label>
                  <div className="inline-flex bg-background-secondary/80 rounded-xl p-0.5">
                    <button
                      onClick={() => setBuyMode('qty')}
                      className={`px-3 py-1 rounded-xl text-[11px] md:text-xs font-medium ${buyMode === 'qty' ? 'bg-brand-primary text-white' : 'text-text-secondary hover:bg-background-secondary'}`}
                    >
                      Quantidade
                    </button>
                    <button
                      onClick={() => setBuyMode('usd')}
                      className={`px-3 py-1 rounded-xl text-[11px] md:text-xs font-medium ${buyMode === 'usd' ? 'bg-brand-primary text-white' : 'text-text-secondary hover:bg-background-secondary'}`}
                    >
                      {fiatCurrencySymbol}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    step={buyMode === 'qty' ? '0.00000001' : '0.01'}
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border-primary bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/80 text-sm"
                    placeholder={buyMode === 'qty' ? '0.00000000' : '0.00'}
                  />
                </div>

                <p className="text-[11px] text-text-secondary mt-2">
                  {buyMode === 'qty'
                    ? 'Insira a quantidade da criptomoeda que deseja comprar — o sistema calculará o valor em fiat.'
                    : `Insira o valor em ${fiatCurrencySymbol} que deseja gastar — o sistema comprará a quantidade correspondente da criptomoeda.`}
                </p>

                {availableFiat !== null && (
                  <p className="text-[11px] text-text-secondary mt-2">Disponível na carteira fiat ({fiatCurrencySymbol}): <span className="font-medium text-text-primary">${Number(availableFiat).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></p>
                )}
                {availableFiat !== null && (() => {
                  // compute estimated fiat to spend from current input
                  const raw = String(amount).replace(',', '.');
                  const parsed = parseFloat(raw);
                  const estimatedFiat = (buyMode === 'qty' && price) ? (Number.isNaN(parsed) ? 0 : parsed * price) : (Number.isNaN(parsed) ? 0 : parsed);
                  if (estimatedFiat > availableFiat) {
                    return (
                      <p className="text-[11px] text-red-500 mt-2">Saldo insuficiente na carteira fiat para esta ordem.</p>
                    );
                  }
                  return null;
                })()}
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
                  <span>Quantidade estimada</span>
                  <span className="text-text-primary font-medium">
                    {(() => {
                      const raw = String(amount).replace(',', '.');
                      const parsed = parseFloat(raw || '0');
                      if (buyMode === 'qty') {
                        return parsed && parsed > 0 ? `${parsed.toFixed(8)} ${baseSymbol}` : '--';
                      }
                      // buyMode === 'usd'
                      if (price && parsed) {
                        return `${(parsed / price).toFixed(8)} ${baseSymbol}`;
                      }
                      return '--';
                    })()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Valor gasto (USD)</span>
                  <span className="text-text-primary font-medium">
                    {(() => {
                      const raw = String(amount).replace(',', '.');
                      const parsed = parseFloat(raw || '0');
                      if (buyMode === 'qty') {
                        if (!price || Number.isNaN(parsed)) return '--';
                        const fiat = parsed * price;
                        return `$${fiat.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
                      }
                      return parsed ? `$${Number(parsed).toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '--';
                    })()}
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
              disabled={!isAvailable || loadingBuy || isChecking || (availableFiat !== null && (() => {
                const raw = String(amount).replace(',', '.');
                const parsed = parseFloat(raw);
                const estimatedFiat = (buyMode === 'qty' && price) ? (Number.isNaN(parsed) ? 0 : parsed * price) : (Number.isNaN(parsed) ? 0 : parsed);
                return estimatedFiat > availableFiat;
              })())}
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
