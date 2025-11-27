import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, ArrowUp, ArrowDown, DollarSign, 
  Percent, TrendingUp, Settings, Copy, 
  Share2, Download, Eye, Award, Activity,
  TrendingDown, Smile, Trophy
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

const PORTFOLIO_COLORS = ['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#14b8a6', '#f97316'];

const buildSyntheticHistory = (totalValue) => {
  const base = totalValue > 0 ? totalValue : 1000;
  const points = [];
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const variance = (Math.random() * 0.04 - 0.02) * base;
    const value = Math.max(0, base + variance);
    points.push({
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      value: Number(value.toFixed(2))
    });
  }
  return points;
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
      <p className={`flex items-center ${changeType === 'positive' ? 'text-feedback-success' : 'text-feedback-error'}`}>
        {changeType === 'positive' ? <ArrowUp size={16} className="mr-1" /> : <ArrowDown size={16} className="mr-1" />}
        {change}
      </p>
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
    bestPerformer: { asset: '-', change: 0 }
  });
  const [portfolioData, setPortfolioData] = useState([]);
  const [portfolioHistoricalData, setPortfolioHistoricalData] = useState(buildSyntheticHistory(0));
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);
  const [portfolioError, setPortfolioError] = useState('');

  const totalValue = portfolioStats.totalValue;
  const [activeView, setActiveView] = useState('overview'); // 'overview', 'allocation', 'performance'
  const [timeRange, setTimeRange] = useState('1M'); // Opções: '1W', '1M', '3M', '1Y', 'ALL'
  const navigate = useNavigate(); // Adicione o hook de navegação
  const [userName, setUserName] = useState(() => {
    // Obter o nome do usuário de algum lugar (localStorage, context API, etc.)
    return localStorage.getItem('userName') || 'Investidor';
  });

  // Verificar se o portfolio está com desempenho positivo ou negativo
  const isPortfolioPositive = portfolioStats.dayChangePercent >= 0;
  const weekPerformance = portfolioHistoricalData.length > 1
    ? portfolioHistoricalData[portfolioHistoricalData.length - 1].value - portfolioHistoricalData[0].value
    : 0;
  const isWeekPositive = weekPerformance > 0;

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

  const handleSell = async (asset) => {
    const qtyStr = window.prompt(`Quantidade de ${asset.symbol} para vender:`);
    if (!qtyStr) return;
    const qty = Number(qtyStr.replace(',', '.'));
    if (isNaN(qty) || qty <= 0) {
      alert('Quantidade inválida');
      return;
    }

    try {
      // Call backend sell endpoint; leave UnitPrice 0 so server will fetch market price
      const payload = {
        FromAsset: asset.symbol,
        AmountFrom: qty,
        UnitPrice: 0,
        ReferenceId: `ui-sell-${Date.now()}`,
        Description: `Sell via UI ${asset.symbol}`,
        Method: 'UI'
      };
      const res = await walletApi.sell(payload);
      if (res && (res.status === 200 || res.status === 204)) {
        alert('Venda realizada com sucesso');
        // Refresh portfolio
        window.location.reload();
      } else {
        alert('Falha ao realizar venda');
      }
    } catch (err) {
      console.error('Sell error', err);
      alert('Erro ao vender. Verifique o console.');
    }
  };

  // Lotes / Detalhes
  const [lotsModalOpen, setLotsModalOpen] = useState(false);
  const [lotsLoading, setLotsLoading] = useState(false);
  const [lotsError, setLotsError] = useState('');
  const [currentLots, setCurrentLots] = useState(null);

  const openLotsModal = async (asset) => {
    setLotsModalOpen(true);
    setLotsLoading(true);
    setLotsError('');
    try {
      const res = await walletApi.getAssetLots(asset.symbol);
      setCurrentLots(res?.data ?? null);
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
    const loadPortfolio = async () => {
      setLoadingPortfolio(true);
      try {
        const [summaryRes, historyRes] = await Promise.all([
          walletApi.getSummary(),
          transactionApi.getAll()
        ]);

        const summary = summaryRes?.data ?? { totalUsdValue: 0, items: [] };
        const items = Array.isArray(summary.items) ? summary.items : [];
        const total = summary.totalUsdValue ?? 0;

        // Map and filter items: remove zero-amount assets and format numbers
        const mappedData = items
          .map(item => {
            const amountNum = Number(item.amount ?? 0);
            const priceNum = Number(item.usdPrice ?? 0);
            const usdValue = Number((item.usdValue ?? (amountNum * priceNum)) ?? 0);
            const purchasePrice = Number(item.averageAcquisitionPrice ?? 0);
            const gainPercent = Number(item.gainPercent ?? 0);
            const totalCost = Number(item.totalCostUsd ?? (purchasePrice * amountNum));

            return {
              name: item.assetSymbol,
              asset: item.assetSymbol,
              symbol: item.assetSymbol,
              value: Number(usdValue),
              amount: amountNum,
              price: Number(priceNum),
              purchasePrice,
              totalCost,
              gainPercent,
              allocation: total > 0 ? Number(((usdValue / total) * 100).toFixed(2)) : 0,
              change: 0
            };
          })
          .filter(a => (a.amount ?? 0) > 0);

        const best = mappedData.reduce((acc, curr) => (
          !acc || curr.value > acc.value ? curr : acc
        ), null);

        setPortfolioData(mappedData);
        setPortfolioStats({
          totalValue: Number(total.toFixed ? total.toFixed(2) : total) || 0,
          dayChange: 0,
          dayChangePercent: 0,
          bestPerformer: best ? { asset: best.asset, change: best.allocation } : { asset: '-', change: 0 }
        });

        const history = historyRes?.data ?? [];
        setPortfolioHistoricalData(buildSyntheticHistory(total));
        setPortfolioError('');
      } catch (err) {
        console.error('Erro ao carregar portfólio', err);
        setPortfolioError('Não foi possível carregar o portfólio agora.');
      } finally {
        setLoadingPortfolio(false);
      }
    };

    loadPortfolio();
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
          change="+12.5%"
          changeType="positive"
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
          change={`+${portfolioStats.bestPerformer.change}%`}
          changeType="positive"
          iconColor="bg-purple-500"
          delay={2}
        />
        
        <StatCard 
          icon={Award}
          title="ROI Total"
          value="+24.8%"
          change="desde início"
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
                  <span className="ml-2 text-text-primary font-medium">$10,000.00</span>
                </div>
                <div>
                  <span className="text-text-tertiary text-sm">Ganho total:</span>
                  <span className="ml-2 text-feedback-success font-medium">+$15,670.84 (156.7%)</span>
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
              <Achievement 
                title="Investidor iniciante" 
                description="Realizar seu primeiro investimento" 
                icon={Award} 
                completed={true}
              />
              
              <Achievement 
                title="Diversificado" 
                description="Ter pelo menos 5 ativos diferentes" 
                icon={Wallet} 
                completed={true}
              />
              
              <Achievement 
                title="HODLer" 
                description="Manter um ativo por mais de 3 meses" 
                icon={TrendingUp} 
                completed={false}
              />
              
              <Achievement 
                title="Trader Expert" 
                description="Realizar 50 trades com lucro" 
                icon={DollarSign} 
                completed={false}
              />
              
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
            <h3 className="text-xl font-bold mb-6 text-text-primary">Detalhamento de Ativos</h3>
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
                    <th className="pb-4 text-text-tertiary">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioData.map((asset, index) => (
                    <tr 
                      key={asset.asset} 
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
                      <td className="py-4 text-text-primary">{formatCurrency(asset.totalCost)}</td>
                      <td className={`py-4 ${asset.gainPercent > 0 ? 'text-feedback-success' : asset.gainPercent < 0 ? 'text-feedback-error' : 'text-text-secondary'}`}>
                        {formatPercent(asset.gainPercent)}
                      </td>
                      <td className="py-4 text-text-primary font-medium">{formatCurrency(asset.value)}</td>
                      <td className={`py-4 ${asset.change > 0 ? 'text-feedback-success' : asset.change < 0 ? 'text-feedback-error' : 'text-text-secondary'}`}>
                        <div className="flex items-center">
                          {asset.change > 0 && <ArrowUp size={16} className="mr-1" />}
                          {asset.change < 0 && <ArrowDown size={16} className="mr-1" />}
                          {asset.change === 0 && <TrendingUp size={16} className="mr-1 opacity-50" />}
                          {Math.abs(asset.change)}%
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
                      <td className="py-4">
                        <div className="flex items-center space-x-1">
                          <button className="p-1.5 rounded-md bg-background-secondary hover:bg-brand-primary/20 text-text-secondary hover:text-brand-primary transition-colors" title="Insights">
                            <TrendingUp size={16} />
                          </button>
                          <button onClick={() => handleSell(asset)} className="p-1.5 rounded-md bg-background-secondary hover:bg-red-500/10 text-text-secondary hover:text-red-500 transition-colors" title="Vender" aria-label={`Vender ${asset.asset}`}>
                            <DollarSign size={16} />
                          </button>
                          <button onClick={() => openLotsModal(asset)} className="p-1.5 rounded-md bg-background-secondary hover:bg-brand-primary/10 text-text-secondary hover:text-brand-primary transition-colors" title="Detalhes" aria-label={`Detalhes ${asset.asset}`}>
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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

      {/* Modal de Lotes (fora do AnimatePresence para evitar conflitos de JSX) */}
      {lotsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeLotsModal}></div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative max-w-5xl w-full bg-background-primary rounded-2xl p-8 z-10 shadow-2xl border border-border-primary"
          >
            <div className="flex items-start justify-between pb-3 mb-4">
              <h3 className="text-xl font-bold text-text-primary">Lotes - {currentLots?.assetSymbol ?? ''}</h3>
              <button onClick={closeLotsModal} className="px-3 py-1 rounded bg-background-secondary text-text-secondary hover:bg-background-tertiary hover:text-text-primary">Fechar</button>
            </div>

            {lotsLoading && <div className="py-6 text-center text-text-secondary">Carregando...</div>}
            {lotsError && <div className="py-4 text-feedback-error">{lotsError}</div>}

            {!lotsLoading && !lotsError && currentLots && (
              <div className="mt-4 overflow-auto max-h-[60vh]">
                <table className="w-full text-left border-separate" style={{ borderSpacing: '0 8px' }}>
                  <thead>
                    <tr className="bg-background-secondary/50 sticky top-0">
                      <th className="text-text-tertiary pb-3 pl-2">Compra</th>
                      <th className="text-text-tertiary pb-3">Quantidade</th>
                      <th className="text-text-tertiary pb-3">Restante</th>
                      <th className="text-text-tertiary pb-3">Preço Unit. (USD)</th>
                      <th className="text-text-tertiary pb-3">Custo Total (USD)</th>
                      <th className="text-text-tertiary pb-3">Ganho Não Realizado (USD)</th>
                      <th className="text-text-tertiary pb-3">Ganho Realizado (USD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentLots.lots.map((lot) => (
                      <tr key={lot.lotTransactionId} className="bg-background-primary border border-border-primary rounded-lg mb-2">
                        <td className="py-3 px-2 text-text-primary w-[220px]">{new Date(lot.acquiredAt).toLocaleString()}</td>
                        <td className="py-3 text-text-primary">{formatAmount8(lot.amountBought)}</td>
                        <td className="py-3 text-text-primary">{formatAmount8(lot.amountRemaining)}</td>
                        <td className="py-3 text-text-primary">{formatCurrency(lot.unitPriceUsd)}</td>
                        <td className="py-3 text-text-primary">{formatCurrency(lot.totalCostUsd)}</td>
                        <td className={`py-3 ${lot.unrealizedGainUsd > 0 ? 'text-feedback-success' : lot.unrealizedGainUsd < 0 ? 'text-feedback-error' : 'text-text-secondary'}`}>
                          {formatCurrency(lot.unrealizedGainUsd)}
                        </td>
                        <td className={`py-3 ${lot.realizedGainUsd > 0 ? 'text-feedback-success' : lot.realizedGainUsd < 0 ? 'text-feedback-error' : 'text-text-secondary'}`}>
                          {formatCurrency(lot.realizedGainUsd)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-4 text-right text-sm">
                  <div className="text-text-secondary">Total Não Realizado: <span className="text-text-primary font-medium">${Number(currentLots.totalUnrealizedGainUsd).toFixed(2)}</span></div>
                  <div className="text-text-secondary">Total Realizado: <span className="text-text-primary font-medium">${Number(currentLots.totalRealizedGainUsd).toFixed(2)}</span></div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

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