import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, ArrowUp, ArrowDown, DollarSign, 
  Percent, TrendingUp, Settings, Copy, 
  Share2, Download, Eye, Award, Activity,
  TrendingDown, Smile, Trophy, ChevronDown, ChevronUp
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  LineChart, Line, XAxis, YAxis, Tooltip, 
  CartesianGrid, Area, AreaChart, Legend 
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import CryptoIcon from '../../components/common/CryptoIcons';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { walletApi, transactionApi } from '../../services/api/api';
import AssetDetailsModal from './components/AssetDetailsModal';
import SellAssetModal from './components/SellAssetModal';
import { useNotification } from '../../context/NotificationContext';

const PORTFOLIO_COLORS = ['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#14b8a6', '#f97316'];

// Constrói histórico real a partir do preço atual e variação 24h devolvida pelo backend
const buildRealHistoryFromBalances = (balances, totalValue) => {
  const normalizeNumber = (v) => Number(v ?? 0) || 0;
  const currentTotal = normalizeNumber(totalValue);

  const totalYesterday = (balances || []).reduce((acc, b) => {
    const amount = normalizeNumber(b.amount ?? b.Amount ?? b.availableAmount ?? b.AvailableAmount);
    const price = normalizeNumber(b.currentPrice ?? b.CurrentPrice ?? b.price);
    const changePct = normalizeNumber(b.change ?? b.Change ?? b.priceChangePercent ?? b.changePercent24h);
    const divisor = 1 + (changePct / 100);
    const prevPrice = price > 0 && divisor !== 0 ? price / divisor : price;
    return acc + (amount * (Number.isFinite(prevPrice) ? prevPrice : 0));
  }, 0);

  const formatLabel = (d) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  return [
    { date: formatLabel(yesterday), value: Number(totalYesterday.toFixed(2)) },
    { date: formatLabel(today), value: Number(currentTotal.toFixed(2)) }
  ];
};

// Componente de Card com animação para estatísticas
const StatCard = ({ icon: Icon, title, value, change, changeType, iconColor, delay = 0, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 }}
    whileHover={{ 
      y: -5, 
      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -5px rgba(0,0,0,0.05)"
    }}
    className="bg-background-primary p-6 rounded-xl shadow-md border border-border-primary hover:border-brand-primary transition-all duration-300 cursor-pointer"
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div className={`p-3 rounded-lg bg-opacity-20 ${iconColor}`}>
        {Icon && <Icon className={`${iconColor.replace('bg-', 'text-')}`} size={24} />}
      </div>
      <span className="text-sm text-text-secondary">{title}</span>
    </div>
    <h3 className="text-2xl font-bold mt-3 text-text-primary">{value}</h3>
    <div className="flex items-center justify-between mt-3">
      {(change !== undefined && change !== null && change !== '') ? (
        <p className={`flex items-center ${changeType === 'positive' ? 'text-feedback-success' : 'text-feedback-error'}`}>
          {changeType === 'positive' ? <ArrowUp size={16} className="mr-1" /> : <ArrowDown size={16} className="mr-1" />}
          {change}
        </p>
      ) : (
        <div />
      )}
      <span className="text-xs text-text-tertiary">24h</span>
    </div>
  </motion.div>
);

// Componente para renderizar notificações e conquistas
const Achievement = ({ title, description, icon: Icon, completed }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className={`p-4 rounded-lg border ${completed ? 'border-green-500 bg-green-500/10' : 'border-border-primary'} mb-2`}
  >
    <div className="flex items-center">
      <div className={`p-2 rounded-lg ${completed ? 'bg-green-500/20' : 'bg-background-secondary'}`}>
        <Icon size={20} className={completed ? 'text-green-500' : 'text-text-tertiary'} />
      </div>
      <div className="ml-3">
        <h4 className={`font-medium ${completed ? 'text-feedback-success' : 'text-text-primary'}`}>{title}</h4>
        <p className="text-xs text-text-secondary">{description}</p>
      </div>
      {completed && <Award size={20} className="ml-auto text-yellow-500" />}
    </div>
  </motion.div>
);

// Tooltip personalizado para gráficos
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-background-primary border border-border-primary rounded-lg shadow-md">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="text-sm text-brand-primary">
          ${Number(payload[0].value).toLocaleString()}
        </p>
      </div>
    );
  }

  return null;
};

export function Portfolio() {
  const formatCurrency = (v) => {
    const n = Number(v ?? 0) || 0;
    return `US$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const toggleAssetLotsInline = async (asset) => {
    const sym = (asset.symbol ?? asset.Symbol ?? '').toUpperCase();
    const currentlyExpanded = !!expandedAssets[sym];
    if (currentlyExpanded) {
      setExpandedAssets(prev => ({ ...prev, [sym]: false }));
      return;
    }

    if (!lotsByAsset[sym]) {
      try {
        const res = await walletApi.getAssetLots(asset.symbol);
        const normalized = normalizeLotsData(res?.data ?? null, asset) ?? { lots: [] };
        setLotsByAsset(prev => ({ ...prev, [sym]: normalized }));
      } catch (err) {
        console.error('Failed to load inline lots', err);
        setLotsByAsset(prev => ({ ...prev, [sym]: { lots: [] } }));
      }
    }

    setExpandedAssets(prev => ({ ...prev, [sym]: true }));
  };

    const fetchAllLotsForPortfolio = async () => {
      setLotsFetchingAll(true);
      const map = {};
      try {
        await Promise.all(portfolioData.map(async (asset) => {
          const sym = (asset.symbol ?? '').toUpperCase();
          try {
            const res = await walletApi.getAssetLots(asset.symbol);
            const normalized = normalizeLotsData(res?.data ?? null, asset) ?? { lots: [] };
            map[sym] = normalized;
          } catch (err) {
            console.error('Failed to load lots for', sym, err);
            map[sym] = { lots: [] };
          }
        }));
        setLotsByAsset(map);
      } finally {
        setLotsFetchingAll(false);
      }
    };

  const formatAmount8 = (v) => {
    const n = Number(v ?? 0) || 0;
    return n.toLocaleString('pt-BR', { minimumFractionDigits: 8, maximumFractionDigits: 8 });
  };

  const formatPercent = (v) => {
    const n = Number(v ?? 0) || 0;
    return `${n.toFixed(2)}%`;
  };

  const [portfolioStats, setPortfolioStats] = useState({
    totalValue: 0,
    dayChange: 0,
    dayChangePercent: 0,
    bestPerformer: { asset: '-', change: 0 },
    totalCost: 0,
    roiTotalPercent: 0
  });
  const [portfolioData, setPortfolioData] = useState([]);
  const [usdBalance, setUsdBalance] = useState(0);
  const [portfolioHistoricalData, setPortfolioHistoricalData] = useState(buildRealHistoryFromBalances([], 0));
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);
  const [portfolioError, setPortfolioError] = useState('');
  const [noTradeableAssets, setNoTradeableAssets] = useState(false);

  const totalValue = portfolioStats.totalValue;
  const totalCost = (portfolioStats.totalCost ?? 0) || portfolioData.reduce((acc, a) => acc + (a.totalCost ?? 0), 0);
  const totalGainPercent = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;
  const totalGainFormatted = `${totalGainPercent > 0 ? '+' : ''}${totalGainPercent.toFixed(2)}%`;
  const totalGainType = totalGainPercent >= 0 ? 'positive' : 'negative';
  const [activeView, setActiveView] = useState('overview'); // 'overview', 'allocation', 'performance'
  const [timeRange, setTimeRange] = useState('1M'); // Opções: '1W', '1M', '3M', '1Y', 'ALL'
  const navigate = useNavigate(); // Adicione o hook de navegação
  const [userName, setUserName] = useState(() => {
    // Obter o nome do usuário de algum lugar (localStorage, context API, etc.)
    return localStorage.getItem('userName') || 'Investidor';
  });

  const { showNotification } = useNotification();

  // Verificar se o portfolio está com desempenho positivo ou negativo
  const isPortfolioPositive = portfolioStats.dayChangePercent >= 0;
  const weekPerformance = portfolioHistoricalData.length > 1
    ? portfolioHistoricalData[portfolioHistoricalData.length - 1].value - portfolioHistoricalData[0].value
    : 0;
  const isWeekPositive = weekPerformance > 0;

  const historyStartValue = portfolioHistoricalData.length ? portfolioHistoricalData[0].value : 0;
  const historyEndValue = portfolioHistoricalData.length ? portfolioHistoricalData[portfolioHistoricalData.length - 1].value : 0;
  const historyGainValue = historyEndValue - historyStartValue;
  const historyGainPercent = historyStartValue > 0 ? (historyGainValue / historyStartValue) * 100 : 0;

  const nonUsdHoldings = portfolioData.filter(a => ((a.symbol ?? a.Symbol ?? '') + '').toUpperCase() !== 'USD').length;
  const achievementsState = {
    beginner: totalValue > 0 && nonUsdHoldings > 0,
    diversified: nonUsdHoldings >= 5,
    hodler: totalGainPercent > 0,
    trader: portfolioStats.dayChangePercent > 0
  };

  const achievements = [
    {
      title: 'Investidor iniciante',
      description: 'Realizar seu primeiro investimento',
      icon: Award,
      completed: achievementsState.beginner
    },
    {
      title: 'Diversificado',
      description: 'Ter pelo menos 5 ativos diferentes',
      icon: Wallet,
      completed: achievementsState.diversified
    },
    {
      title: 'HODLer',
      description: 'Manter retorno acumulado positivo',
      icon: TrendingUp,
      completed: achievementsState.hodler
    },
    {
      title: 'Trader Expert',
      description: 'Fechar o dia no verde',
      icon: DollarSign,
      completed: achievementsState.trader
    }
  ];

  // Animação para transição entre seções
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const handleShare = () => {
    // Implementação futura: compartilhar portfólio
    alert('Compartilhar portfólio: Funcionalidade em desenvolvimento');
  };

  const handleExport = () => {
    // Implementação futura: exportar dados
    alert('Exportar portfólio: Funcionalidade em desenvolvimento');
  };

  const handleNavigateToDeposit = () => {
    navigate('/deposit'); // Função para navegar para a página de depósito
  };

  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [sellLoading, setSellLoading] = useState(false);
  const [sellError, setSellError] = useState('');
  const [sellAsset, setSellAsset] = useState(null);
  const [sellAmount, setSellAmount] = useState('');
  const [sellLots, setSellLots] = useState(null);

  const openSellModal = (asset) => {
    setSellAsset(asset);
    setSellAmount('');
    setSellError('');
    setSellLots(null);
    setSellModalOpen(true);

    (async () => {
      try {
        const sym = (asset?.symbol || asset?.asset || '') + '';
        if (lotsByAsset[sym] && lotsByAsset[sym].lots) {
          setSellLots(lotsByAsset[sym]);
          return;
        }
        const res = await walletApi.getAssetLots(sym);
        const d = res?.data ?? null;
        if (!d) return;
        const normalized = normalizeLotsData(d, asset);
        setSellLots(normalized);
      } catch (err) {
      }
    })();
  };

  const closeSellModal = () => {
    setSellModalOpen(false);
    setSellAsset(null);
    setSellAmount('');
    setSellError('');
    setSellLoading(false);
  };

  const handleConfirmSell = async (amountToSell, lotId = null) => {
    if (!sellAsset) return;
    const qty = Number(amountToSell);
    if (isNaN(qty) || qty <= 0) {
      setSellError('Quantidade inválida');
      return;
    }
    if (qty > (sellAsset.amount ?? 0)) {
      setSellError('Quantidade maior que o disponível');
      return;
    }

    setSellLoading(true);
    setSellError('');
    try {
      const payload = {
        IdCurrency: sellAsset.id || sellAsset.Id || sellAsset.currencyId,
        CriptoAmount: qty,
        Fee: 0,
        ...(lotId ? { IdWalletPositionLot: lotId, LotAmount: qty } : {})
      };

      const res = await transactionApi.sell(payload);
      if (res && (res.status === 200 || res.status === 204)) {
        showNotification('Venda realizada com sucesso', 'success');
        
        // Recarregar os lotes do ativo vendido
        const sym = (sellAsset?.symbol || sellAsset?.asset || '').toUpperCase();
        try {
          const lotsRes = await walletApi.getAssetLots(sellAsset.symbol);
          const normalized = normalizeLotsData(lotsRes?.data ?? null, sellAsset);
          
          // Atualizar cache de lotes para a tabela expandida
          if (normalized) {
            setLotsByAsset(prev => ({
              ...prev,
              [sym]: normalized
            }));
          }
          
          // Atualizar lotes do modal de venda
          setSellLots(normalized);
        } catch (err) {
          console.error('Falha ao recarregar lotes após venda', err);
        }
        
        // trigger global atualização de carteira
        window.dispatchEvent(new Event('wallet-updated'));
        closeSellModal();
      } else {
        const msg = res?.data?.message || 'Falha ao realizar venda';
        setSellError(msg);
        showNotification(msg, 'error');
      }
    } catch (err) {
      console.error('Sell error', err);
      setSellError('Erro ao vender. Verifique o console.');
    } finally {
      setSellLoading(false);
    }
  };

  // Lotes / Detalhes
  const [lotsModalOpen, setLotsModalOpen] = useState(false);
  const [lotsLoading, setLotsLoading] = useState(false);
  const [lotsError, setLotsError] = useState('');
  const [currentLots, setCurrentLots] = useState(null);

  const [lotsByAsset, setLotsByAsset] = useState({});
  const [expandedAssets, setExpandedAssets] = useState({});
  const [showByLots, setShowByLots] = useState(false);
  const [lotsFetchingAll, setLotsFetchingAll] = useState(false);

  const normalizeLotsData = (d, asset) => {
    if (!d) return null;
    const rawLots = Array.isArray(d.lots) ? d.lots : (Array.isArray(d.Lots) ? d.Lots : []);

    const parseDateToMs = (v) => {
      if (v === null || v === undefined || v === '') return null;
      if (typeof v === 'number') return v < 1e12 ? v * 1000 : v;
      const s = (v + '').trim();
      const m = s.match(/\/(?:Date)?\((\d+)(?:[+-]\d+)?\)\//i);
      if (m) {
        const n = Number(m[1]);
        return n < 1e12 ? n * 1000 : n;
      }
      if (/^\d+$/.test(s)) {
        const n = Number(s);
        return n < 1e12 ? n * 1000 : n;
      }
      const parsed = Date.parse(s);
      return Number.isNaN(parsed) ? null : parsed;
    };

    const lots = rawLots.map((l) => {
      const amountBought = Number(l.amountBought ?? l.amount ?? l.originalAmount ?? l.Amount ?? 0) || 0;
      const amountRemaining = Number(l.amountRemaining ?? l.remainingAmount ?? l.remaining ?? l.RemainingAmount ?? amountBought) || 0;
      const unitPriceUsd = Number(l.unitPriceUsd ?? l.unit_price_usd ?? l.avgPrice ?? l.avgPriceUsd ?? l.unitPrice ?? 0) || 0;
      const totalCostUsd = Number(l.totalCostUsd ?? l.totalCost ?? unitPriceUsd * amountBought) || 0;
      const unrealizedGainUsd = Number(l.unrealizedGainUsd ?? l.unrealizedGain ?? l.unrealized ?? 0) || 0;
      const realizedGainUsd = Number(l.realizedGainUsd ?? l.realizedGain ?? l.realized ?? 0) || 0;
      const rawDate = l.acquiredAt ?? l.createdAt ?? l.CreatedAt ?? l.date ?? l.AcquiredAt ?? null;
      const acquiredAtMs = parseDateToMs(rawDate);

      return {
        lotTransactionId: l.lotTransactionId ?? l.lotId ?? l.id ?? l.idWalletPositionLot ?? null,
        acquiredAt: acquiredAtMs,
        amountBought,
        amountRemaining,
        unitPriceUsd,
        totalCostUsd,
        unrealizedGainUsd,
        realizedGainUsd
      };
    });
    // Filtrar lotes com quantidade zero para não exibir lotes vazios
    const filteredLots = lots.filter(l => (Number(l.amountRemaining) || 0) > 0);

    const totalAmount = Number(d.totalAmount ?? d.total ?? d.total_amount ?? filteredLots.reduce((s, L) => s + (L.amountRemaining || 0), 0)) || 0;
    const currentValueUsd = Number(d.currentValueUsd ?? d.currentValue ?? d.current_value_usd ?? 0) || 0;
    const totalUnrealizedGainUsd = Number(d.totalUnrealizedGainUsd ?? d.totalUnrealized ?? d.total_unrealized_gain_usd ?? filteredLots.reduce((s, L) => s + (L.unrealizedGainUsd || 0), 0)) || 0;
    const totalRealizedGainUsd = Number(d.totalRealizedGainUsd ?? d.totalRealized ?? d.total_realized_gain_usd ?? filteredLots.reduce((s, L) => s + (L.realizedGainUsd || 0), 0)) || 0;

    return {
      asset: d.asset ?? d.assetName ?? asset.name ?? asset.asset ?? asset.symbol ?? '',
      assetSymbol: (d.assetSymbol ?? d.asset_symbol ?? d.symbol ?? asset.symbol ?? '').toUpperCase(),
      lots: filteredLots,
      totalAmount,
      total: totalAmount,
      currentValueUsd,
      currentValue: currentValueUsd,
      totalUnrealizedGainUsd,
      totalRealizedGainUsd
    };
  };

  const openLotsModal = async (asset) => {
    setLotsModalOpen(true);
    setLotsLoading(true);
    setLotsError('');
    try {
      const res = await walletApi.getAssetLots(asset.symbol);
      const d = res?.data ?? null;

      if (!d) {
        setCurrentLots(null);
      } else {
        // Normaliza a resposta dos lotes
        const rawLots = Array.isArray(d.lots) ? d.lots : (Array.isArray(d.Lots) ? d.Lots : []);
        // Helper pra parsear datas variadas
        const parseDateToMs = (v) => {
          if (v === null || v === undefined || v === '') return null;
          // Se já é um número
          if (typeof v === 'number') {
            return v < 1e12 ? v * 1000 : v; // converte segundos -> ms
          }
          // string
          const s = (v + '').trim();
          // formato /Date(1234567890)/
          const m = s.match(/\/(?:Date)?\((\d+)(?:[+-]\d+)?\)\//i);
          if (m) {
            const n = Number(m[1]);
            return n < 1e12 ? n * 1000 : n;
          }
          // string numérica
          if (/^\d+$/.test(s)) {
            const n = Number(s);
            return n < 1e12 ? n * 1000 : n;
          }
          // string ISO ou outro formato de data parseável
          const parsed = Date.parse(s);
          return Number.isNaN(parsed) ? null : parsed;
        };

        const lots = rawLots.map((l) => {
          const amountBought = Number(l.amountBought ?? l.amount ?? l.originalAmount ?? l.Amount ?? 0) || 0;
          const amountRemaining = Number(l.amountRemaining ?? l.remainingAmount ?? l.remaining ?? l.RemainingAmount ?? amountBought) || 0;
          const unitPriceUsd = Number(l.unitPriceUsd ?? l.unit_price_usd ?? l.avgPrice ?? l.avgPriceUsd ?? l.unitPrice ?? 0) || 0;
          const totalCostUsd = Number(l.totalCostUsd ?? l.totalCost ?? unitPriceUsd * amountBought) || 0;
          const unrealizedGainUsd = Number(l.unrealizedGainUsd ?? l.unrealizedGain ?? l.unrealized ?? 0) || 0;
          const realizedGainUsd = Number(l.realizedGainUsd ?? l.realizedGain ?? l.realized ?? 0) || 0;

          const rawDate = l.acquiredAt ?? l.createdAt ?? l.CreatedAt ?? l.date ?? l.AcquiredAt ?? null;
          const acquiredAtMs = parseDateToMs(rawDate);

          return {
            lotTransactionId: l.lotTransactionId ?? l.lotId ?? l.id ?? l.idWalletPositionLot ?? null,
            acquiredAt: acquiredAtMs,
            amountBought,
            amountRemaining,
            unitPriceUsd,
            totalCostUsd,
            unrealizedGainUsd,
            realizedGainUsd
          };
        });
        // Filtrar lotes com quantidade zero para não exibir lotes vazios
        const filteredLots = lots.filter(l => (Number(l.amountRemaining) || 0) > 0);

        const totalAmount = Number(d.totalAmount ?? d.total ?? d.total_amount ?? filteredLots.reduce((s, L) => s + (L.amountRemaining || 0), 0)) || 0;
        const currentValueUsd = Number(d.currentValueUsd ?? d.currentValue ?? d.current_value_usd ?? d.currentValueUsd ?? 0) || 0;
        const totalUnrealizedGainUsd = Number(d.totalUnrealizedGainUsd ?? d.totalUnrealized ?? d.total_unrealized_gain_usd ?? filteredLots.reduce((s, L) => s + (L.unrealizedGainUsd || 0), 0)) || 0;
        const totalRealizedGainUsd = Number(d.totalRealizedGainUsd ?? d.totalRealized ?? d.total_realized_gain_usd ?? filteredLots.reduce((s, L) => s + (L.realizedGainUsd || 0), 0)) || 0;

        setCurrentLots({
          asset: d.asset ?? d.assetName ?? asset.name ?? asset.asset ?? asset.symbol ?? '',
          assetSymbol: (d.assetSymbol ?? d.asset_symbol ?? d.symbol ?? asset.symbol ?? '').toUpperCase(),
          lots: filteredLots,
          totalAmount,
          total: totalAmount,
          currentValueUsd,
          currentValue: currentValueUsd,
          totalUnrealizedGainUsd,
          totalRealizedGainUsd
        });
      }
    } catch (err) {
      console.error('Failed to load lots', err);
      setLotsError('Falha ao carregar detalhes.');
      setCurrentLots(null);
    } finally {
      setLotsLoading(false);
    }
  };

  const closeLotsModal = () => {
    setLotsModalOpen(false);
    setCurrentLots(null);
    setLotsError('');
  };

  useEffect(() => {
    let mounted = true;

    const fetchPortfolio = async () => {
      try {
        setLoadingPortfolio(true);
        setPortfolioError('');

        const [summaryRes, balancesRes] = await Promise.all([
          walletApi.getSummary(),
          walletApi.getBalances()
        ]);

        if (!mounted) return;

        const summary = summaryRes?.data ?? {};
        const balances = Array.isArray(balancesRes?.data) ? balancesRes.data : [];

        const onlyUsd = (balances || []).filter(b => {
          const sym = ((b.symbol ?? b.Symbol ?? b.currencySymbol ?? b.CurrencySymbol) + '').toUpperCase();
          const amt = Number(b.amount ?? b.Amount ?? b.availableAmount ?? b.AvailableAmount ?? 0) || 0;
          return sym !== 'USD' && amt > 0;
        }).length === 0;

        let bestPerf = { asset: '-', change: 0 };
        const bp = summary.bestPerformer;
        if (bp) {
          if (typeof bp === 'string') {
            if ((bp + '').toUpperCase() !== 'USD') bestPerf = { asset: bp, change: 0 };
          } else if (bp.symbol) {
            if (((bp.symbol + '').toUpperCase()) !== 'USD') {
              bestPerf = { asset: bp.symbol, change: bp.value ?? bp.change ?? 0 };
            }
          }
        }

        setPortfolioStats({
          totalValue: summary.totalValue ?? 0,
          dayChange: summary.dayChange ?? 0,
          dayChangePercent: summary.dayChangePercent ?? 0,
          bestPerformer: bestPerf,
          totalCost: summary.totalCost ?? 0,
          roiTotalPercent: summary.roiTotalPercent ?? 0
        });

        setNoTradeableAssets(onlyUsd);

        const mapped = balances.map((b, idx) => {
          const amount = Number(b.amount ?? b.Amount ?? b.availableAmount ?? b.AvailableAmount ?? 0);
          const currentPrice = Number(b.currentPrice ?? b.CurrentPrice ?? b.price ?? 0) || 0;
          const purchasePrice = Number(b.avgPrice ?? b.avgPurchasePrice ?? b.purchasePrice ?? b.avgPriceUsd ?? 0) || 0;
          const value = amount * currentPrice;
          const totalCost = amount * purchasePrice;
          const gainPercent = purchasePrice > 0 ? ((currentPrice - purchasePrice) / purchasePrice) * 100 : 0;
          const change = Number(b.change ?? b.priceChangePercent ?? b.changePercent24h ?? 0) || 0;
          const allocation = (summary.totalValue && summary.totalValue > 0) ? (value / (summary.totalValue || 1)) * 100 : 0;
          return {
            id: b.currencyId ?? b.idCurrency ?? idx,
            symbol: (b.symbol ?? b.Symbol ?? b.currencySymbol ?? b.CurrencySymbol ?? 'UNKNOWN').toUpperCase(),
            name: b.name ?? b.asset ?? b.Asset ?? b.Name ?? (b.symbol ?? b.Symbol ?? 'UNKNOWN'),
            asset: b.name ?? b.asset ?? (b.symbol ?? b.Symbol ?? 'UNKNOWN'),
            amount,
            price: currentPrice,
            currentPrice,
            purchasePrice,
            totalCost,
            gainPercent,
            change,
            value,
            allocation: Number(allocation.toFixed(2))
          };
        });

        setPortfolioData(mapped);
        try {
          const usdVal = mapped.reduce((acc, a) => {
            const sym = (a.symbol || '').toUpperCase();
            if (sym === 'USD') {
              const amt = Number(a.amount ?? 0) || 0;
              const price = Number(a.currentPrice ?? a.price ?? 1) || 1;
              const val = Number(a.value ?? (amt * price)) || 0;zz
              return acc + val;
            }
            return acc;
          }, 0);
          setUsdBalance(usdVal);
        } catch (e) {
          setUsdBalance(0);
        }

        setPortfolioHistoricalData(buildRealHistoryFromBalances(balances, summary.totalValue ?? 0));
      } catch (err) {
        console.error('Erro ao carregar portfolio', err);
        if (mounted) setPortfolioError('Erro ao carregar dados da carteira');
      } finally {
        if (mounted) setLoadingPortfolio(false);
      }
    };

    fetchPortfolio();

    // Re-fetch when other parts of the app emit update event (e.g. after a buy)
    const onWalletUpdated = () => {
      fetchPortfolio();
    };
    window.addEventListener('wallet-updated', onWalletUpdated);

    return () => { mounted = false; window.removeEventListener('wallet-updated', onWalletUpdated); };
  }, []);

  // Gera uma mensagem personalizada com base no desempenho
  const getPerformanceMessage = () => {
    if (isPortfolioPositive) {
      const positiveMessages = [
        `Parabéns, ${userName}! Seus investimentos estão rendendo bem hoje.`,
        `Muito bem, ${userName}! Você parece estar lucrando! Continue assim.`,
        `Excelente trabalho, ${userName}! Sua estratégia está funcionando.`,
        `Impressionante, ${userName}! Você está colhendo bons resultados.`
      ];
      return positiveMessages[Math.floor(Math.random() * positiveMessages.length)];
    } else {
      const negativeMessages = [
        `Não desanime, ${userName}. Mercados têm altos e baixos, a persistência é chave.`,
        `Dias de queda fazem parte da jornada, ${userName}. Mantenha o foco no longo prazo.`,
        `Paciência, ${userName}. Os melhores investidores prosperam nos momentos de volatilidade.`,
        `Lembre-se, ${userName}: toda grande fortuna passou por momentos de desafio.`
      ];
      return negativeMessages[Math.floor(Math.random() * negativeMessages.length)];
    }
  };

  if (loadingPortfolio) {
    return <LoadingScreen message="Carregando portfólio..." size="large" />;
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="p-6 space-y-6"
    >
      {/* Cabeçalho do portfolio com valor total e ações */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-4 md:mb-0"
        >
          <h1 className="text-3xl font-bold text-text-primary">Meu Portfolio</h1>
          <p className="text-text-secondary">Acompanhe seus investimentos e desempenho</p>
        </motion.div>
        
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg bg-background-secondary text-text-secondary hover:text-brand-primary"
            onClick={handleShare}
          >
            <Share2 size={20} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg bg-background-secondary text-text-secondary hover:text-brand-primary"
            onClick={handleExport}
          >
            <Download size={20} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg bg-brand-primary text-white"
          >
            <Settings size={20} />
          </motion.button>
        </div>
      </div>
      
      {noTradeableAssets && (
        <div className="mt-3 p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 text-sm">
          Você possui apenas saldo em USD — nenhum ativo negociável disponível no momento.
        </div>
      )}
      {portfolioError && (
        <div className="p-4 rounded-xl border border-red-400 bg-red-500/10 text-red-500">
          {portfolioError}
        </div>
      )}

      {/* NOVA SEÇÃO: Mensagem personalizada baseada no desempenho */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`p-4 rounded-xl border ${isPortfolioPositive 
          ? 'bg-green-500/10 border-green-500' 
          : 'bg-amber-500/10 border-amber-500'}`}
      >
        <div className="flex items-start">
          <div className={`p-3 rounded-full ${isPortfolioPositive 
            ? 'bg-green-500/20 text-green-500' 
            : 'bg-amber-500/20 text-amber-500'}`}
          >
            {isPortfolioPositive ? <Trophy size={24} /> : <Smile size={24} />}
          </div>
          <div className="ml-4">
            <h3 className={`font-medium text-lg ${isPortfolioPositive 
              ? 'text-green-600' 
              : 'text-amber-600'}`}
            >
              {getPerformanceMessage()}
            </h3>
            <p className="text-text-secondary mt-1">
              {isPortfolioPositive 
                ? `Seu portfólio cresceu ${portfolioStats.dayChangePercent}% nas últimas 24 horas.` 
                : `Mantenha-se firme em sua estratégia. Os mercados frequentemente se recuperam.`}
            </p>
            {!isPortfolioPositive && (
              <motion.button 
                whileHover={{ scale: 1.02 }} 
                className="text-brand-primary text-sm font-medium flex items-center mt-2"
              >
                <Eye size={14} className="mr-1" /> Ver dicas de diversificação
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Cartões de estatísticas com informações chave */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={Wallet}
          title="Valor Total"
          value={`$${totalValue.toLocaleString()}`}
          change={totalGainFormatted}
          changeType={totalGainType}
          iconColor="bg-brand-primary"
          delay={0}
        />
        
        <StatCard 
          icon={Activity}
          title="Lucro/Perda 24h"
          value={`${portfolioStats.dayChange > 0 ? '+' : ''}$${portfolioStats.dayChange.toLocaleString()}`}
          change={`${portfolioStats.dayChangePercent > 0 ? '+' : ''}${portfolioStats.dayChangePercent}%`}
          changeType={portfolioStats.dayChangePercent > 0 ? 'positive' : 'negative'}
          iconColor={portfolioStats.dayChangePercent > 0 ? "bg-green-500" : "bg-red-500"}
          delay={1}
        />
        
        <StatCard 
          icon={TrendingUp}
          title="Melhor Performance"
          value={portfolioStats.bestPerformer.asset}
          change={`${portfolioStats.bestPerformer.change >= 0 ? '+' : ''}${portfolioStats.bestPerformer.change}%`}
          changeType={portfolioStats.bestPerformer.change >= 0 ? 'positive' : 'negative'}
          iconColor="bg-purple-500"
          delay={2}
        />
        
        <StatCard 
          icon={Award}
          title="Saldo"
          value={formatCurrency(usdBalance)}
          change={undefined}
          changeType="positive"
          iconColor="bg-amber-500"
          delay={3}
        />
      </div>

      {/* Navegação para diferentes visualizações */}
      <div className="flex items-center space-x-2 border-b border-border-primary pb-4">
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          className={`px-4 py-2 rounded-lg ${activeView === 'overview' ? 'bg-brand-primary text-white' : 'hover:bg-background-secondary text-text-secondary'}`}
          onClick={() => setActiveView('overview')}
        >
          Visão Geral
        </motion.button>
        
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          className={`px-4 py-2 rounded-lg ${activeView === 'allocation' ? 'bg-brand-primary text-white' : 'hover:bg-background-secondary text-text-secondary'}`}
          onClick={() => setActiveView('allocation')}
        >
          Alocação
        </motion.button>
        
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          className={`px-4 py-2 rounded-lg ${activeView === 'performance' ? 'bg-brand-primary text-white' : 'hover:bg-background-secondary text-text-secondary'}`}
          onClick={() => setActiveView('performance')}
        >
          Performance
        </motion.button>
      </div>

      {/* Conteúdo principal - muda com base na visualização ativa */}
      <AnimatePresence mode="wait">
        {activeView === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Gráfico de performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-background-primary p-6 rounded-xl shadow-md border border-border-primary lg:col-span-2"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-text-primary">Performance do Portfolio</h3>
                <div className="flex space-x-1">
                  {['1W', '1M', '3M', '1Y', 'ALL'].map((range) => (
                    <button
                      key={range}
                      className={`px-2 py-1 text-xs rounded-md ${timeRange === range ? 'bg-brand-primary text-white' : 'bg-background-secondary text-text-secondary'}`}
                      onClick={() => setTimeRange(range)}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={portfolioHistoricalData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" opacity={0.2} />
                    <XAxis dataKey="date" className="text-text-secondary" />
                    <YAxis className="text-text-secondary" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="var(--brand-primary)" 
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <div>
                  <span className="text-text-tertiary text-sm">Valor inicial:</span>
                  <span className="ml-2 text-text-primary font-medium">{formatCurrency(historyStartValue)}</span>
                </div>
                <div>
                  <span className="text-text-tertiary text-sm">Ganho total:</span>
                  <span className={`ml-2 font-medium ${historyGainValue >= 0 ? 'text-feedback-success' : 'text-feedback-error'}`}>
                    {`${historyGainValue >= 0 ? '+' : '-'}${formatCurrency(Math.abs(historyGainValue))}`} ({historyGainPercent >= 0 ? '+' : ''}{historyGainPercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Conquistas e objetivos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-background-primary p-6 rounded-xl shadow-md border border-border-primary"
            >
              <h3 className="text-xl font-bold text-text-primary mb-4">Conquistas</h3>
              {achievements.map((ach) => (
                <Achievement
                  key={ach.title}
                  title={ach.title}
                  description={ach.description}
                  icon={ach.icon}
                  completed={ach.completed}
                />
              ))}
              
              <motion.div 
                className="mt-6 p-4 bg-brand-primary/10 rounded-lg border border-brand-primary"
                whileHover={{ scale: 1.02 }}
              >
                <h4 className="text-text-primary font-medium">Próximo objetivo:</h4>
                <p className="text-sm text-text-secondary mt-1">Aumente seu portfolio em 25% para desbloquear novas funcionalidades premium!</p>
                <div className="mt-3 w-full bg-background-secondary rounded-full h-2.5">
                  <div className="bg-brand-primary h-2.5 rounded-full" style={{ width: '70%' }}></div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-text-tertiary">
                  <span>70% concluído</span>
                  <span>Faltam: $3,750.00</span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {activeView === 'allocation' && (
          <motion.div
            key="allocation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de pizza da alocação */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-background-primary p-6 rounded-xl shadow-md border border-border-primary"
              >
                <h3 className="text-xl font-bold mb-6 text-text-primary">Alocação de Portfolio</h3>
                <div className="h-[300px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={portfolioData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={90}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="allocation"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {portfolioData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={PORTFOLIO_COLORS[index % PORTFOLIO_COLORS.length]} 
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Alocação']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <p className="text-text-tertiary text-xs">Total</p>
                    <p className="text-text-primary font-bold text-xl">${totalValue.toLocaleString()}</p>
                  </div>
                </div>
              </motion.div>

              {/* Sugestões e insights de alocação */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-background-primary p-6 rounded-xl shadow-md border border-border-primary"
              >
                <h3 className="text-xl font-bold mb-6 text-text-primary">Insights de Portfolio</h3>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500">
                    <div className="flex items-center">
                      <Percent size={20} className="text-amber-500 mr-2" />
                      <h4 className="font-semibold text-text-primary">Alta Concentração</h4>
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">
                      Aproximadamente 45% do seu portfolio está em Bitcoin. Considere diversificar para reduzir riscos.
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500">
                    <div className="flex items-center">
                      <TrendingUp size={20} className="text-green-500 mr-2" />
                      <h4 className="font-semibold text-text-primary">Oportunidade de Crescimento</h4>
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">
                      Ethereum está mostrando sinais técnicos positivos. Considere aumentar sua posição.
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500">
                    <div className="flex items-center">
                      <Eye size={20} className="text-purple-500 mr-2" />
                      <h4 className="font-semibold text-text-primary">Ativos em Observação</h4>
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">
                      Solana e Cardano estão ganhando momentum. Adicione à sua lista de observação.
                    </p>
                  </div>
                </div>

                <button className="mt-6 w-full py-3 rounded-lg bg-brand-primary text-white font-medium hover:bg-opacity-90 transition-all">
                  Obter mais recomendações
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {activeView === 'performance' && (
          <motion.div
            key="performance"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-background-primary p-6 rounded-xl shadow-md border border-border-primary"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-text-primary">Detalhamento de Ativos</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={async () => {
                    const next = !showByLots;
                    setShowByLots(next);
                    if (next) await fetchAllLotsForPortfolio();
                  }}
                  className={`px-3 py-2 rounded-md text-sm ${showByLots ? 'bg-brand-primary text-white' : 'bg-background-secondary text-text-secondary'}`}
                >
                  {lotsFetchingAll ? 'Carregando...' : (showByLots ? 'Exibir por Lotes' : 'Exibir por Ativo')}
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="pb-4 text-text-tertiary">Ativo</th>
                    <th className="pb-4 text-text-tertiary">Quantidade</th>
                    <th className="pb-4 text-text-tertiary">Preço Atual</th>
                    <th className="pb-4 text-text-tertiary">Preço Compra</th>
                    <th className="pb-4 text-text-tertiary">Ganho (%)</th>
                    <th className="pb-4 text-text-tertiary">Valor</th>
                    <th className="pb-4 text-text-tertiary">Var 24h</th>
                    <th className="pb-4 text-text-tertiary">Alocação</th>
                    <th className="py-4 align-middle whitespace-nowrap text-text-tertiary">
                      <div className="flex items-center justify-end h-full">Ações</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {showByLots ? (
                    // Renderiza linhas agrupadas por lotes
                    portfolioData.map((asset, index) => {
                      const sym = (asset.symbol || '').toUpperCase();
                      const lotsGroup = lotsByAsset[sym];
                      if (lotsGroup && Array.isArray(lotsGroup.lots) && lotsGroup.lots.length > 0) {
                        return lotsGroup.lots.map((lot) => {
                          const lotValue = (lot.amountRemaining || 0) * (asset.price || 0);
                          const gainPercent = lot.unitPriceUsd > 0 ? ((asset.price - lot.unitPriceUsd) / lot.unitPriceUsd) * 100 : 0;
                          const isBaseCurrency = sym === 'USD';
                          return (
                            <tr key={`${sym}-${lot.lotTransactionId}`} className="border-t border-border-primary hover:bg-background-secondary transition-colors">
                              <td className="py-4">
                                <div className="flex items-center space-x-3">
                                  <CryptoIcon symbol={asset.symbol} size={24} />
                                  <div>
                                    <span className="font-semibold text-text-primary">{asset.asset} — Lote</span>
                                    <p className="text-xs text-text-tertiary">{asset.symbol}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 text-text-primary">{formatAmount8(lot.amountRemaining)} {asset.symbol}</td>
                              <td className="py-4 text-text-primary">{formatCurrency(asset.price)}</td>
                              <td className="py-4 text-text-primary">{formatCurrency(lot.unitPriceUsd)}</td>
                              <td className={`py-4 ${gainPercent > 0 ? 'text-feedback-success' : gainPercent < 0 ? 'text-feedback-error' : 'text-text-secondary'}`}>
                                {formatPercent(gainPercent)}
                              </td>
                              <td className="py-4 text-text-primary font-medium">{formatCurrency(lotValue)}</td>
                              <td className={`py-4 ${asset.change > 0 ? 'text-feedback-success' : asset.change < 0 ? 'text-feedback-error' : 'text-text-secondary'}`}>
                                <div className="flex items-center">
                                  {asset.change > 0 && <ArrowUp size={16} className="mr-1" />}
                                  {asset.change < 0 && <ArrowDown size={16} className="mr-1" />}
                                  {asset.change === 0 && <TrendingUp size={16} className="mr-1 opacity-50" />}
                                  {asset.change > 0 ? '+' + formatPercent(asset.change) : formatPercent(asset.change)}
                                </div>
                              </td>
                              <td className="py-4">
                                <div className="w-full bg-background-secondary rounded-full h-2">
                                  <div className="h-2 rounded-full" style={{ width: `${((lotValue / (portfolioStats.totalValue || 1)) * 100).toFixed(2)}%`, backgroundColor: PORTFOLIO_COLORS[index % PORTFOLIO_COLORS.length] }}></div>
                                </div>
                                <span className="text-xs text-text-tertiary">{((lotValue / (portfolioStats.totalValue || 1)) * 100).toFixed(2)}%</span>
                              </td>
                              <td className="py-4 align-middle text-right whitespace-nowrap">
                                <div className="inline-flex items-center justify-end space-x-2">
                                  <button className="w-9 h-9 flex items-center justify-center rounded-md bg-background-secondary hover:bg-brand-primary/20 text-text-secondary hover:text-brand-primary transition-colors" title="Insights"><TrendingUp size={16} /></button>
                                  <button onClick={() => { if (!isBaseCurrency) openSellModal(asset); }} disabled={isBaseCurrency} className={`w-9 h-9 flex items-center justify-center rounded-md bg-background-secondary text-text-secondary transition-colors ${isBaseCurrency ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-500/10 hover:text-red-500'}`} title={isBaseCurrency ? 'Venda não permitida para USD' : 'Vender'}><DollarSign size={16} /></button>
                                </div>
                              </td>
                            </tr>
                          );
                        });
                      }

                      // sem lotes -> fallback para linha de ativo
                      return (
                        <tr key={asset.asset} className="border-t border-border-primary hover:bg-background-secondary transition-colors cursor-pointer">
                          <td className="py-4">
                            <div className="flex items-center space-x-3">
                              <CryptoIcon symbol={asset.symbol} size={24} />
                              <div>
                                <span className="font-semibold text-text-primary">{asset.asset}</span>
                                <p className="text-xs text-text-tertiary">{asset.symbol}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-text-primary">{Number(asset.amount ?? 0).toFixed(4)} {asset.symbol}</td>
                          <td className="py-4 text-text-primary">{formatCurrency(asset.price)}</td>
                          <td className="py-4 text-text-primary">{formatCurrency(asset.purchasePrice)}</td>
                          <td className={`py-4 ${asset.gainPercent > 0 ? 'text-feedback-success' : asset.gainPercent < 0 ? 'text-feedback-error' : 'text-text-secondary'}`}>{formatPercent(asset.gainPercent)}</td>
                          <td className="py-4 text-text-primary font-medium">{formatCurrency(asset.value)}</td>
                          <td className={`py-4 ${asset.change > 0 ? 'text-feedback-success' : asset.change < 0 ? 'text-feedback-error' : 'text-text-secondary'}`}>
                            <div className="flex items-center">
                              {asset.change > 0 && <ArrowUp size={16} className="mr-1" />}
                              {asset.change < 0 && <ArrowDown size={16} className="mr-1" />}
                              {asset.change === 0 && <TrendingUp size={16} className="mr-1 opacity-50" />}
                              {asset.change > 0 ? '+' + formatPercent(asset.change) : formatPercent(asset.change)}
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="w-full bg-background-secondary rounded-full h-2"><div className="h-2 rounded-full" style={{ width: `${asset.allocation}%`, backgroundColor: PORTFOLIO_COLORS[index % PORTFOLIO_COLORS.length] }}></div></div>
                            <span className="text-xs text-text-tertiary">{asset.allocation}%</span>
                          </td>
                          <td className="py-4 align-middle text-right whitespace-nowrap">
                            <div className="inline-flex items-center justify-end space-x-2">
                              <button className="w-9 h-9 flex items-center justify-center rounded-md bg-background-secondary hover:bg-brand-primary/20 text-text-secondary hover:text-brand-primary transition-colors" title="Insights"><TrendingUp size={16} /></button>
                              <button onClick={() => openSellModal(asset)} className="w-9 h-9 flex items-center justify-center rounded-md bg-background-secondary text-text-secondary transition-colors hover:bg-red-500/10 hover:text-red-500" title="Vender"><DollarSign size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    // visualização padrão do ativo (com expansão inline)
                    portfolioData.map((asset, index) => {
                      const isBaseCurrency = ((asset.symbol || '') + '').toUpperCase() === 'USD';
                      const sym = (asset.symbol || '').toUpperCase();
                      return (
                        <React.Fragment key={asset.asset}>
                          <tr 
                            className="border-t border-border-primary hover:bg-background-secondary transition-colors cursor-pointer"
                          >
                            <td className="py-4">
                              <div className="flex items-center space-x-3">
                                <CryptoIcon symbol={asset.symbol} size={24} />
                                <div>
                                  <span className="font-semibold text-text-primary">{asset.asset}</span>
                                  <p className="text-xs text-text-tertiary">{asset.symbol}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-text-primary">{Number(asset.amount ?? 0).toFixed(4)} {asset.symbol}</td>
                            <td className="py-4 text-text-primary">{formatCurrency(asset.price)}</td>
                            <td className="py-4 text-text-primary">{formatCurrency(asset.purchasePrice)}</td>
                            <td className={`py-4 ${asset.gainPercent > 0 ? 'text-feedback-success' : asset.gainPercent < 0 ? 'text-feedback-error' : 'text-text-secondary'}`}>
                              {formatPercent(asset.gainPercent)}
                            </td>
                            <td className="py-4 text-text-primary font-medium">{formatCurrency(asset.value)}</td>
                            <td className={`py-4 ${asset.change > 0 ? 'text-feedback-success' : asset.change < 0 ? 'text-feedback-error' : 'text-text-secondary'}`}>
                              <div className="flex items-center">
                                {asset.change > 0 && <ArrowUp size={16} className="mr-1" />}
                                {asset.change < 0 && <ArrowDown size={16} className="mr-1" />}
                                {asset.change === 0 && <TrendingUp size={16} className="mr-1 opacity-50" />}
                                {asset.change > 0 ? '+' + formatPercent(asset.change) : formatPercent(asset.change)}
                              </div>
                            </td>
                            <td className="py-4">
                              <div className="w-full bg-background-secondary rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full" 
                                  style={{ 
                                    width: `${asset.allocation}%`,
                                    backgroundColor: PORTFOLIO_COLORS[index % PORTFOLIO_COLORS.length]
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs text-text-tertiary">{asset.allocation}%</span>
                            </td>
                            <td className="py-4 align-middle text-right whitespace-nowrap">
                              <div className="inline-flex items-center justify-end space-x-2">
                                <button
                                  className="w-9 h-9 flex items-center justify-center rounded-md bg-background-secondary hover:bg-brand-primary/20 text-text-secondary hover:text-brand-primary transition-colors"
                                  title="Insights"
                                  aria-label={`Insights ${asset.asset}`}
                                >
                                  <TrendingUp size={16} />
                                </button>

                                <button
                                  onClick={() => { if (!isBaseCurrency) openSellModal(asset); }}
                                  disabled={isBaseCurrency}
                                  className={`w-9 h-9 flex items-center justify-center rounded-md bg-background-secondary text-text-secondary transition-colors ${isBaseCurrency ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-500/10 hover:text-red-500'}`}
                                  title={isBaseCurrency ? 'Venda não permitida para USD' : 'Vender'}
                                  aria-label={isBaseCurrency ? `Venda não permitida para ${asset.asset}` : `Vender ${asset.asset}`}
                                >
                                  <DollarSign size={16} />
                                </button>

                                <button
                                  onClick={() => toggleAssetLotsInline(asset)}
                                  className="w-9 h-9 flex items-center justify-center rounded-md bg-background-secondary hover:bg-brand-primary/10 text-text-secondary hover:text-brand-primary transition-colors"
                                  title={expandedAssets[sym] ? 'Fechar lotes' : 'Mostrar lotes'}
                                  aria-label={expandedAssets[sym] ? `Fechar lotes ${asset.asset}` : `Mostrar lotes ${asset.asset}`}
                                >
                                  {expandedAssets[sym] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>

                                <button
                                  onClick={() => openLotsModal(asset)}
                                  className="w-9 h-9 flex items-center justify-center rounded-md bg-background-secondary hover:bg-brand-primary/10 text-text-secondary hover:text-brand-primary transition-colors"
                                  title="Detalhes"
                                  aria-label={`Detalhes ${asset.asset}`}
                                >
                                  <Eye size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {expandedAssets[sym] && lotsByAsset[sym] && (
                            <tr>
                              <td colSpan={9} className="bg-background-secondary p-4">
                                <div className="space-y-3">
                                  {(lotsByAsset[sym].lots || []).length === 0 ? (
                                    <div className="text-text-secondary">Nenhum lote disponível para este ativo.</div>
                                  ) : (
                                    <div className="grid grid-cols-1 gap-3">
                                      {lotsByAsset[sym].lots.map((lot) => (
                                        <div key={lot.lotTransactionId ?? Math.random()} className="p-3 bg-background-primary border border-border-primary rounded-md flex items-center justify-between">
                                          <div>
                                            <div className="text-sm text-text-tertiary">Compra</div>
                                            <div className="text-xs text-text-secondary">{lot.acquiredAt ? new Date(lot.acquiredAt).toLocaleString() : '-'}</div>
                                            <div className="mt-2 grid grid-cols-2 gap-4">
                                              <div>
                                                <div className="text-xs text-text-tertiary">Quantidade</div>
                                                <div className="text-text-primary font-medium">{formatAmount8(lot.amountBought)}</div>
                                              </div>
                                              <div>
                                                <div className="text-xs text-text-tertiary">Restante</div>
                                                <div className="text-text-primary font-medium">{formatAmount8(lot.amountRemaining)}</div>
                                              </div>
                                              <div>
                                                <div className="text-xs text-text-tertiary">Preço Unit. (USD)</div>
                                                <div className="text-text-primary font-medium">{formatCurrency(lot.unitPriceUsd)}</div>
                                              </div>
                                              <div>
                                                <div className="text-xs text-text-tertiary">Custo Total (USD)</div>
                                                <div className="text-text-primary font-medium">{formatCurrency(lot.totalCostUsd)}</div>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <div className="text-xs text-text-tertiary">Ganho Não Realizado</div>
                                            <div className={`font-medium ${lot.unrealizedGainUsd > 0 ? 'text-feedback-success' : lot.unrealizedGainUsd < 0 ? 'text-feedback-error' : 'text-text-primary'}`}>
                                              {formatCurrency(lot.unrealizedGainUsd)}
                                            </div>
                                            <div className="text-xs text-text-tertiary mt-2">Ganho Realizado</div>
                                            <div className={`font-medium ${lot.realizedGainUsd > 0 ? 'text-feedback-success' : lot.realizedGainUsd < 0 ? 'text-feedback-error' : 'text-text-primary'}`}>{formatCurrency(lot.realizedGainUsd)}</div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  <div className="text-right text-xs md:text-sm">
                                    <div className="text-text-secondary">Total Não Realizado: <span className="text-text-primary font-medium">{formatCurrency(lotsByAsset[sym].totalUnrealizedGainUsd ?? 0)}</span></div>
                                    <div className="text-text-secondary mt-1">Total Realizado: <span className="text-text-primary font-medium">{formatCurrency(lotsByAsset[sym].totalRealizedGainUsd ?? 0)}</span></div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                  {portfolioData.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-text-secondary">
                        Nenhum ativo encontrado. Faça um depósito ou compra para começar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
              
        )}
      </AnimatePresence>

      <AssetDetailsModal
        isOpen={lotsModalOpen}
        onClose={closeLotsModal}
        lots={currentLots}
        loading={lotsLoading}
        error={lotsError}
        formatCurrency={formatCurrency}
        formatAmount8={formatAmount8}
      />

      <SellAssetModal
        isOpen={sellModalOpen}
        onClose={closeSellModal}
        asset={sellAsset}
        amount={sellAmount}
        onChangeAmount={setSellAmount}
        onConfirm={handleConfirmSell}
        loading={sellLoading}
        error={sellError}
        formatCurrency={formatCurrency}
        lots={sellLots}
      />

      {/* Seção para adicionar novos ativos ou transações */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-brand-primary/90 to-purple-500/90 p-6 rounded-xl text-white shadow-md"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Expanda seu portfolio</h3>
            <p className="mt-1 text-white/80">
              Adicione novos ativos ou faça um depósito para aumentar seus investimentos
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-white text-brand-primary font-medium rounded-lg hover:bg-opacity-90"
              onClick={handleNavigateToDeposit}  // Adicione o handler de clique aqui
            >
              Adicionar Fundos
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-white/20 text-white font-medium rounded-lg hover:bg-white/30"
            >
              Nova Transação
            </motion.button>
           
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}