import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, BarChart2, TrendingUp, DollarSign, Share2, Award, Gift, Copy, CheckCircle, Users, Zap, Star, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

// Dados mockados com fotos de perfil (GPT pegou os links das fotos)
const referrals = [
  { 
    id: 1, 
    username: 'MariaTrader', 
    fullName: 'Maria Silva',
    trades: 150, 
    profit: 12000, 
    date: '12/05/2025',
    status: 'ativo',
    avatar: 'https://i.pravatar.cc/150?img=29',
    badges: ['premium', 'high_volume']
  },
  { 
    id: 2, 
    username: 'CriptoRei', 
    fullName: 'João Mendes',
    trades: 200, 
    profit: 18000,
    date: '23/04/2025', 
    status: 'ativo',
    avatar: 'https://i.pravatar.cc/150?img=12',
    badges: ['premium', 'early_adopter']
  },
  { 
    id: 3, 
    username: 'InvestidoraPro', 
    fullName: 'Ana Ferreira',
    trades: 100, 
    profit: 9000,
    date: '05/06/2025', 
    status: 'inativo',
    avatar: 'https://i.pravatar.cc/150?img=33',
    badges: ['high_volume']
  },
  { 
    id: 4, 
    username: 'MestreMercado', 
    fullName: 'Carlos Santos',
    trades: 250, 
    profit: 22000,
    date: '18/03/2025', 
    status: 'ativo',
    avatar: 'https://i.pravatar.cc/150?img=67',
    badges: ['premium', 'high_volume', 'early_adopter']
  },
];

const referralStats = [
  { name: 'Jan', indicacoes: 30, conversoes: 18 },
  { name: 'Fev', indicacoes: 45, conversoes: 25 },
  { name: 'Mar', indicacoes: 60, conversoes: 32 },
  { name: 'Abr', indicacoes: 80, conversoes: 46 },
  { name: 'Mai', indicacoes: 100, conversoes: 65 },
  { name: 'Jun', indicacoes: 120, conversoes: 84 },
];

const rewardsData = [
  { name: 'Bônus em BTC', valor: 850 },
  { name: 'Cashback', valor: 350 },
  { name: 'Redução de taxas', valor: 430 },
  { name: 'Prêmios especiais', valor: 220 },
];

export function Referrals() {
  const [activeTab, setActiveTab] = useState('indicacoes');
  const [hoverIndex, setHoverIndex] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  // Novos estados para o modal de detalhes
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

  // Detectar mudanças de tamanho da tela
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];

  const copyReferralLink = () => {
    // Usando a API Clipboard nativa em vez da biblioteca
    navigator.clipboard.writeText("https://criptotrade.com.br/ref/seu_usuario")
      .then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      })
      .catch(err => {
        console.error('Erro ao copiar: ', err);
      });
  };

  const containerAnimation = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemAnimation = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  const renderBadge = (badge) => {
    switch(badge) {
      case 'premium':
        return (
          <div className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full text-[9px] sm:text-xs flex items-center">
            <Star size={isMobile ? 10 : 12} className="mr-0.5 sm:mr-1" />
            <span className="whitespace-nowrap">Premium</span>
          </div>
        );
      case 'high_volume':
        return (
          <div className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[9px] sm:text-xs flex items-center">
            <TrendingUp size={isMobile ? 10 : 12} className="mr-0.5 sm:mr-1" />
            <span className="whitespace-nowrap">Alto Vol</span>
          </div>
        );
      case 'early_adopter':
        return (
          <div className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-[9px] sm:text-xs flex items-center">
            <Clock size={isMobile ? 10 : 12} className="mr-0.5 sm:mr-1" />
            <span className="whitespace-nowrap">Pioneiro</span>
          </div>
        );
      default:
        return null;
    }
  };

  // Função para abrir o modal com os detalhes do trader
  const openTraderDetails = (referral) => {
    setSelectedReferral(referral);
    setIsDetailsModalOpen(true);
  };

  // Função para fechar o modal
  const closeTraderDetails = () => {
    setIsDetailsModalOpen(false);
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 md:space-y-8">
      {/* Banner de indicações - Ajustado para responsividade */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-brand-primary to-purple-600 p-4 sm:p-6 md:p-8 shadow-xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-10 -translate-y-1/2 translate-x-1/3 blur-2xl" />
        <div className="absolute bottom-0 left-20 w-40 h-40 bg-white rounded-full opacity-10 translate-y-1/2 blur-2xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2">Programa de Indicações</h2>
            <p className="text-white/90 mb-3 sm:mb-4 max-w-lg text-xs sm:text-sm md:text-base">
              Indique amigos e ganhe até 40% de comissão sobre as taxas de negociação deles.
              Além disso, cada amigo ganha um bônus de R$50 para começar a investir.
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white flex items-center">
                <DollarSign className="mr-1.5 sm:mr-2" size={isMobile ? 16 : 20} />
                <div>
                  <div className="text-base sm:text-xl font-bold">R$ 2.500</div>
                  <div className="text-[10px] sm:text-xs">Ganhos Totais</div>
                </div>
              </div>
              
              <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white flex items-center">
                <Users className="mr-1.5 sm:mr-2" size={isMobile ? 16 : 20} />
                <div>
                  <div className="text-base sm:text-xl font-bold">24</div>
                  <div className="text-[10px] sm:text-xs">Amigos Indicados</div>
                </div>
              </div>
            </div>
          </div>
          
          <motion.div 
            className="mt-4 md:mt-0 w-full md:w-auto"
            whileHover={{ scale: 1.02 }}
          >
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4 max-w-md">
              <p className="text-white text-xs sm:text-sm mb-1.5 sm:mb-2">Seu link de indicação:</p>
              <div className="flex">
                <input 
                  type="text" 
                  value="https://criptotrade.com.br/ref/seu_usuario" 
                  className="flex-1 bg-white/20 text-white rounded-l-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm outline-none overflow-x-auto"
                  readOnly
                />
                <button 
                  onClick={copyReferralLink}
                  className="bg-white text-brand-primary rounded-r-lg px-2 sm:px-3 flex items-center justify-center transition duration-200 min-w-[40px]"
                >
                  {copiedLink ? <CheckCircle size={isMobile ? 16 : 18} /> : <Copy size={isMobile ? 16 : 18} />}
                </button>
              </div>
              <div className="flex justify-center mt-2 sm:mt-3">
                <button className="bg-white text-brand-primary rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium flex items-center">
                  <Share2 size={isMobile ? 14 : 16} className="mr-1 sm:mr-2" />
                  Compartilhar Agora
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Tabs de navegação - Responsivas */}
      <div className="bg-background-primary rounded-xl p-1 flex justify-start overflow-x-auto">
        <button 
          onClick={() => setActiveTab('indicacoes')}
          className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap ${
            activeTab === 'indicacoes' 
              ? 'bg-brand-primary text-white' 
              : 'text-text-secondary hover:bg-background-secondary'
          }`}
        >
          <Users size={isMobile ? 14 : 16} className="inline mr-1 -translate-y-[1px]" />
          {isMobile ? 'Indicações' : 'Minhas Indicações'}
        </button>
        <button 
          onClick={() => setActiveTab('estatisticas')}
          className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap ${
            activeTab === 'estatisticas' 
              ? 'bg-brand-primary text-white' 
              : 'text-text-secondary hover:bg-background-secondary'
          }`}
        >
          <BarChart2 size={isMobile ? 14 : 16} className="inline mr-1 -translate-y-[1px]" />
          Estatísticas
        </button>
        <button 
          onClick={() => setActiveTab('recompensas')}
          className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap ${
            activeTab === 'recompensas' 
              ? 'bg-brand-primary text-white' 
              : 'text-text-secondary hover:bg-background-secondary'
          }`}
        >
          <Gift size={isMobile ? 14 : 16} className="inline mr-1 -translate-y-[1px]" />
          Recompensas
        </button>
      </div>

      {/* Conteúdo da tab - Responsivo */}
      <AnimatePresence mode="wait">
        {activeTab === 'indicacoes' && (
          <motion.div
            key="indicacoes"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 sm:space-y-6"
          >
            {/* Cards de destaque - Ajustados para responsividade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl p-4 sm:p-6 shadow-lg">
                <h3 className="text-white text-base sm:text-lg font-bold mb-1 sm:mb-2">Dica para aumentar conversões</h3>
                <p className="text-white/80 text-xs sm:text-sm">
                  Compartilhe sua experiência e resultados nas redes sociais para atrair mais pessoas.
                  Use hashtags como #Criptotrade #trading #bitcoin para aumentar o alcance.
                </p>
                <button className="mt-3 sm:mt-4 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/20 text-white text-xs sm:text-sm rounded-lg hover:bg-white/30 transition">
                  Ver Estratégias
                </button>
              </div>
              
              <div className="bg-gradient-to-r from-amber-500 to-amber-700 rounded-xl p-4 sm:p-6 shadow-lg">
                <h3 className="text-white text-base sm:text-lg font-bold mb-1 sm:mb-2">Conquistas do mês</h3>
                <p className="text-white/80 text-xs sm:text-sm mb-2 sm:mb-3">
                  Você está entre os TOP 10% indicadores da plataforma!
                  Continue assim e ganhe acesso ao programa VIP com comissões ainda maiores.
                </p>
                <div className="mt-3 sm:mt-4 flex items-center">
                  <Award className="text-white mr-2" size={isMobile ? 16 : 20} />
                  <span className="text-white text-xs sm:text-sm font-medium">94% do objetivo mensal atingido</span>
                </div>
              </div>
            </div>
            
            {/* Lista de indicados com design responsivo */}
            <motion.div
              className="bg-background-primary rounded-xl shadow-lg overflow-hidden"
              variants={containerAnimation}
              initial="hidden"
              animate="show"
            >
              <div className="p-3 sm:p-6 border-b border-border-primary">
                <h3 className="text-lg sm:text-xl font-bold text-text-primary flex items-center">
                  <Award className="mr-2 text-brand-primary" size={isMobile ? 20 : 24} />
                  Top Indicações
                </h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-6">
                {referrals.map((referral, index) => (
                  <motion.div
                    key={referral.id}
                    variants={itemAnimation}
                    className={`bg-background-secondary rounded-xl overflow-hidden shadow-md transition-transform duration-300 ${
                      hoverIndex === index ? 'transform scale-[1.02]' : ''
                    }`}
                    onMouseEnter={() => setHoverIndex(index)}
                    onMouseLeave={() => setHoverIndex(null)}
                  >
                    <div className="p-1 bg-gradient-to-r from-brand-primary/80 to-purple-500/80">
                      <div className="flex justify-between items-center px-2 sm:px-3 py-0.5 sm:py-1">
                        <span className="text-[10px] sm:text-xs text-text-primary font-medium">
                          {isMobile ? 'Indic.: ' : 'Indicado em: '}{referral.date}
                        </span>
                        <span className={`px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-xs rounded-full ${
                          referral.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {referral.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-3 sm:p-4">
                      <div className="flex space-x-2 sm:space-x-4">
                        <div className="relative flex-shrink-0">
                          <img 
                            src={referral.avatar} 
                            alt={referral.username} 
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover border-2 border-background-secondary" 
                          />
                          {referral.badges.includes('premium') && (
                            <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5 sm:p-1">
                              <Star size={isMobile ? 10 : 12} className="text-white" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-base sm:text-lg font-bold text-text-primary truncate">
                              {isMobile ? referral.fullName.split(' ')[0] : referral.fullName}
                            </h4>
                            <button 
                              onClick={() => openTraderDetails(referral)} 
                              className="text-brand-primary hover:text-brand-primary/80 text-[9px] sm:text-xs font-medium"
                            >
                              Ver detalhes
                            </button>
                          </div>
                          <p className="text-xs sm:text-sm text-text-secondary truncate">@{referral.username}</p>
                          
                          <div className="mt-1.5 sm:mt-2 flex flex-wrap gap-1 sm:gap-2">
                            {referral.badges.map((badge) => (
                              <React.Fragment key={badge}>
                                {renderBadge(badge)}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-3 sm:mt-4">
                        <div className="bg-background-primary rounded-lg p-2 sm:p-3">
                          <p className="text-[9px] sm:text-xs text-text-tertiary">Negociações</p>
                          <p className="text-sm sm:text-lg font-bold text-text-primary">{referral.trades}</p>
                        </div>
                        
                        <div className="bg-background-primary rounded-lg p-2 sm:p-3">
                          <p className="text-[9px] sm:text-xs text-text-tertiary">Sua Comissão</p>
                          <p className="text-sm sm:text-lg font-bold text-green-500">
                            R$ {(referral.profit * 0.1).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="px-3 sm:px-4 py-2 sm:py-3 bg-background-primary border-t border-border-primary flex justify-between items-center">
                      <div className="flex items-center">
                        <Zap size={isMobile ? 14 : 16} className="text-brand-primary mr-1" />
                        <span className="text-[9px] sm:text-xs text-text-secondary">
                          {isMobile ? 'Ativ.: 3d atrás' : 'Atividade recente: 3 dias atrás'}
                        </span>
                      </div>
                      <div className="flex space-x-1">
                        <button className="p-1 rounded-md hover:bg-background-secondary">
                          <Share2 size={isMobile ? 12 : 14} className="text-text-tertiary" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'estatisticas' && (
          <motion.div
            key="estatisticas"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
          >
            <div className="bg-background-primary p-3 sm:p-6 rounded-xl shadow-lg">
              <h3 className="text-base sm:text-xl font-bold mb-3 sm:mb-6 text-text-primary flex items-center">
                <BarChart2 className="mr-2 text-brand-primary" size={isMobile ? 20 : 24} />
                Indicações vs Conversões
              </h3>
              <div className="h-[200px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={referralStats}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" tick={{ fontSize: isMobile ? 10 : 12 }} />
                    <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--background-primary)',
                        borderColor: 'var(--border-primary)',
                        fontSize: isMobile ? '10px' : '12px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="indicacoes" 
                      stackId="1" 
                      stroke="#6366f1" 
                      fill="#6366f1" 
                      fillOpacity={0.6} 
                      name="Indicações"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="conversoes" 
                      stackId="2" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.6} 
                      name="Conversões"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-background-secondary p-3 sm:p-4 rounded-lg">
                  <p className="text-text-tertiary text-[10px] sm:text-sm">Taxa de Conversão</p>
                  <p className="text-lg sm:text-2xl font-bold text-text-primary">72%</p>
                </div>
                <div className="bg-background-secondary p-3 sm:p-4 rounded-lg">
                  <p className="text-text-tertiary text-[10px] sm:text-sm">Crescimento Mensal</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-500">+18%</p>
                </div>
              </div>
            </div>

            <div className="bg-background-primary p-3 sm:p-6 rounded-xl shadow-lg">
              <h3 className="text-base sm:text-xl font-bold mb-3 sm:mb-6 text-text-primary flex items-center">
                <DollarSign className="mr-2 text-brand-primary" size={isMobile ? 20 : 24} />
                Ganhos por Indicação
              </h3>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="h-[200px] sm:h-[250px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={rewardsData}
                          cx="50%"
                          cy="50%"
                          innerRadius={isMobile ? 40 : 60}
                          outerRadius={isMobile ? 60 : 80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="valor"
                          nameKey="name"
                          label={({ name, percent }) => isMobile ? `${(percent * 100).toFixed(0)}%` : `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {rewardsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`R$ ${value}`, 'Valor']}
                          contentStyle={{
                            backgroundColor: 'var(--background-primary)',
                            borderColor: 'var(--border-primary)',
                            fontSize: isMobile ? '10px' : '12px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="space-y-3 sm:space-y-4">
                    {rewardsData.map((item, index) => (
                      <div key={index} className="flex items-center">
                        <div 
                          className="w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-2" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="text-xs sm:text-sm text-text-primary">{item.name}</span>
                            <span className="text-xs sm:text-sm font-medium text-text-primary">
                              R$ {item.valor}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 mt-2 border-t border-border-primary">
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm font-medium text-text-primary">Total</span>
                        <span className="text-xs sm:text-sm font-bold text-brand-primary">
                          R$ {rewardsData.reduce((sum, item) => sum + item.valor, 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'recompensas' && (
          <motion.div
            key="recompensas"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 sm:space-y-6"
          >
            <div className="bg-background-primary p-3 sm:p-6 rounded-xl shadow-lg">
              <h3 className="text-base sm:text-xl font-bold mb-3 sm:mb-6 text-text-primary flex items-center">
                <Gift className="mr-2 text-brand-primary" size={isMobile ? 20 : 24} />
                Sistema de Recompensas
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-4 sm:p-5 text-white relative overflow-hidden shadow-lg">
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full transform translate-x-1/4 translate-y-1/2"></div>
                  <h4 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Nível Bronze</h4>
                  <p className="text-white/80 text-xs sm:text-sm mb-2 sm:mb-3">1-5 indicações</p>
                  <ul className="space-y-1.5 sm:space-y-2">
                    <li className="flex items-center text-xs sm:text-sm">
                      <CheckCircle size={isMobile ? 12 : 14} className="mr-1.5 sm:mr-2" />
                      15% de comissão
                    </li>
                    <li className="flex items-center text-xs sm:text-sm">
                      <CheckCircle size={isMobile ? 12 : 14} className="mr-1.5 sm:mr-2" />
                      Bônus de R$50 por indicação
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl p-4 sm:p-5 text-white relative overflow-hidden shadow-lg">
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full transform translate-x-1/4 translate-y-1/2"></div>
                  <div className="absolute top-0 right-0 bg-amber-400 text-amber-800 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-xs font-bold">
                    SEU NÍVEL
                  </div>
                  <h4 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Nível Prata</h4>
                  <p className="text-white/80 text-xs sm:text-sm mb-2 sm:mb-3">6-15 indicações</p>
                  <ul className="space-y-1.5 sm:space-y-2">
                    <li className="flex items-center text-xs sm:text-sm">
                      <CheckCircle size={isMobile ? 12 : 14} className="mr-1.5 sm:mr-2" />
                      25% de comissão
                    </li>
                    <li className="flex items-center text-xs sm:text-sm">
                      <CheckCircle size={isMobile ? 12 : 14} className="mr-1.5 sm:mr-2" />
                      Bônus de R$100 por indicação
                    </li>
                    <li className="flex items-center text-xs sm:text-sm">
                      <CheckCircle size={isMobile ? 12 : 14} className="mr-1.5 sm:mr-2" />
                      Redução de 10% nas taxas
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl p-4 sm:p-5 text-white relative overflow-hidden shadow-lg">
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full transform translate-x-1/4 translate-y-1/2"></div>
                  <h4 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Nível Ouro</h4>
                  <p className="text-white/80 text-xs sm:text-sm mb-2 sm:mb-3">16+ indicações</p>
                  <ul className="space-y-1.5 sm:space-y-2">
                    <li className="flex items-center text-xs sm:text-sm">
                      <CheckCircle size={isMobile ? 12 : 14} className="mr-1.5 sm:mr-2" />
                      40% de comissão
                    </li>
                    <li className="flex items-center text-xs sm:text-sm">
                      <CheckCircle size={isMobile ? 12 : 14} className="mr-1.5 sm:mr-2" />
                      Bônus de R$200 por indicação
                    </li>
                    <li className="flex items-center text-xs sm:text-sm">
                      <CheckCircle size={isMobile ? 12 : 14} className="mr-1.5 sm:mr-2" />
                      Redução de 25% nas taxas
                    </li>
                    <li className="flex items-center text-xs sm:text-sm">
                      <CheckCircle size={isMobile ? 12 : 14} className="mr-1.5 sm:mr-2" />
                      Acesso a eventos exclusivos
                    </li>
                  </ul>
                  <div className="mt-2 sm:mt-3">
                    <button className="bg-white/20 hover:bg-white/30 text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded text-xs sm:text-sm font-medium transition">
                      {isMobile ? "+2 para desbloquear!" : "Apenas 2 indicações para desbloquear!"}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800/30">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Award className="text-amber-500 mt-1" size={isMobile ? 20 : 24} />
                  </div>
                  <div className="ml-2 sm:ml-3">
                    <h4 className="text-amber-800 dark:text-amber-500 font-medium text-sm sm:text-base">Desafio do Mês</h4>
                    <p className="text-amber-700 dark:text-amber-400 text-xs sm:text-sm mt-0.5 sm:mt-1">
                      Indique 3 amigos este mês e ganhe um bônus especial de R$500 + 1 mês de acesso VIP à plataforma!
                    </p>
                    <div className="mt-2">
                      <div className="w-full bg-amber-200 dark:bg-amber-800/30 rounded-full h-1.5 sm:h-2.5">
                        <div className="bg-amber-500 h-1.5 sm:h-2.5 rounded-full" style={{ width: '66%' }}></div>
                      </div>
                      <div className="flex justify-between mt-1 text-[9px] sm:text-xs text-amber-700 dark:text-amber-400">
                        <span>2/3 indicações</span>
                        <span>Faltam 5 dias</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-background-primary p-3 sm:p-6 rounded-xl shadow-lg">
              <h3 className="text-base sm:text-xl font-bold mb-3 sm:mb-6 text-text-primary">Histórico de Recompensas</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left">
                      <th className="pb-3 sm:pb-4 text-text-secondary text-xs sm:text-sm">Data</th>
                      <th className="pb-3 sm:pb-4 text-text-secondary text-xs sm:text-sm">Tipo</th>
                      <th className="pb-3 sm:pb-4 text-text-secondary text-xs sm:text-sm">Valor</th>
                      <th className="pb-3 sm:pb-4 text-text-secondary text-xs sm:text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="py-3 sm:py-4 text-text-primary text-xs sm:text-sm">15/06/25</td>
                      <td className="py-3 sm:py-4 text-text-primary text-xs sm:text-sm">Comissão</td>
                      <td className="py-3 sm:py-4 text-text-primary text-xs sm:text-sm">R$ 320,00</td>
                      <td className="py-3 sm:py-4"><span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-100 text-green-800 rounded-full text-[9px] sm:text-xs">Pago</span></td>
                    </tr>
                    <tr className="border-t dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="py-3 sm:py-4 text-text-primary text-xs sm:text-sm">10/06/25</td>
                      <td className="py-3 sm:py-4 text-text-primary text-xs sm:text-sm">Bônus</td>
                      <td className="py-3 sm:py-4 text-text-primary text-xs sm:text-sm">R$ 100,00</td>
                      <td className="py-3 sm:py-4"><span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-100 text-green-800 rounded-full text-[9px] sm:text-xs">Pago</span></td>
                    </tr>
                    <tr className="border-t dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="py-3 sm:py-4 text-text-primary text-xs sm:text-sm">02/06/25</td>
                      <td className="py-3 sm:py-4 text-text-primary text-xs sm:text-sm">Desafio</td>
                      <td className="py-3 sm:py-4 text-text-primary text-xs sm:text-sm">R$ 500,00</td>
                      <td className="py-3 sm:py-4"><span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-yellow-100 text-yellow-800 rounded-full text-[9px] sm:text-xs">Processando</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de detalhes do trader - Responsivo */}
      <AnimatePresence>
        {isDetailsModalOpen && selectedReferral && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto"
            onClick={closeTraderDetails}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-background-primary w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl my-4 sm:my-8"
              onClick={e => e.stopPropagation()}
            >
              {/* Cabeçalho mais compacto - Responsivo */}
              <div className="relative h-24 sm:h-32 bg-gradient-to-r from-brand-primary to-purple-600">
                <div className="absolute -bottom-10 sm:-bottom-12 left-4 sm:left-6 border-2 sm:border-3 border-background-primary rounded-lg overflow-hidden">
                  <img 
                    src={selectedReferral.avatar} 
                    alt={selectedReferral.username} 
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover"
                  />
                </div>
                <button
                  onClick={closeTraderDetails}
                  className="absolute top-3 sm:top-4 right-3 sm:right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white"
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="pt-12 sm:pt-16 p-3 sm:p-5">
                {/* Cabeçalho de informações - Responsivo */}
                <div className="flex flex-wrap items-start justify-between mb-3 sm:mb-4">
                  <div>
                    <h2 className="text-base sm:text-xl font-bold text-text-primary flex items-center flex-wrap gap-2">
                      {selectedReferral.fullName}
                      {selectedReferral.badges.includes('premium') && (
                        <span className="bg-amber-500 text-white text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full flex items-center">
                          <Star size={isMobile ? 8 : 10} className="mr-0.5 sm:mr-1" />
                          Premium
                        </span>
                      )}
                    </h2>
                    <p className="text-xs sm:text-sm text-text-secondary">@{selectedReferral.username}</p>
                  </div>
                  
                  <div className="mt-1 sm:mt-0">
                    <div className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-xs font-medium ${
                      selectedReferral.status === 'ativo' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {selectedReferral.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </div>
                  </div>
                </div>
                
                {/* Estatísticas principais em cards - Responsivos */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-5">
                  <div className="bg-background-secondary rounded-lg p-2 sm:p-3">
                    <p className="text-text-tertiary text-[9px] sm:text-xs mb-0.5 sm:mb-1">Total Negociado</p>
                    <p className="text-sm sm:text-base font-bold text-text-primary">R$ {selectedReferral.profit.toLocaleString()}</p>
                  </div>
                  
                  <div className="bg-background-secondary rounded-lg p-2 sm:p-3">
                    <p className="text-text-tertiary text-[9px] sm:text-xs mb-0.5 sm:mb-1">Negociações</p>
                    <p className="text-sm sm:text-base font-bold text-text-primary">{selectedReferral.trades}</p>
                  </div>
                  
                  <div className="bg-background-secondary rounded-lg p-2 sm:p-3">
                    <p className="text-text-tertiary text-[9px] sm:text-xs mb-0.5 sm:mb-1">Sua Comissão</p>
                    <p className="text-sm sm:text-base font-bold text-green-500">R$ {(selectedReferral.profit * 0.1).toLocaleString()}</p>
                  </div>
                  
                  <div className="bg-background-secondary rounded-lg p-2 sm:p-3">
                    <p className="text-text-tertiary text-[9px] sm:text-xs mb-0.5 sm:mb-1">Indicado em</p>
                    <p className="text-sm sm:text-base font-bold text-text-primary">{selectedReferral.date}</p>
                  </div>
                </div>
                
                {/* Atividade do trader - Responsiva */}
                <div className="mb-3 sm:mb-5">
                  <h3 className="text-sm sm:text-base font-semibold text-text-primary mb-2 sm:mb-3 flex items-center">
                    <TrendingUp size={isMobile ? 14 : 16} className="mr-1.5 text-brand-primary" />
                    Atividade de Negociação
                  </h3>
                  
                  <div className="bg-background-secondary rounded-lg p-2 sm:p-3">
                    <div className="h-[150px] sm:h-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={[
                            { data: '01/06', valor: 1200 },
                            { data: '05/06', valor: 1800 },
                            { data: '10/06', valor: 1400 },
                            { data: '15/06', valor: 2200 },
                            { data: '20/06', valor: 1900 },
                          ]}
                          margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="data" tick={{fontSize: isMobile ? 10 : 12}} />
                          <YAxis tick={{fontSize: isMobile ? 10 : 12}} />
                          <Tooltip 
                            formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Volume']}
                            contentStyle={{
                              backgroundColor: 'var(--background-primary)',
                              borderColor: 'var(--border-primary)',
                              fontSize: isMobile ? '10px' : '12px'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="valor" 
                            stroke="#8884d8" 
                            fillOpacity={1} 
                            fill="url(#colorVolume)" 
                            activeDot={{ r: isMobile ? 4 : 6 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                
                {/* Conquistas e badges - Responsivos */}
                <div className="mb-3 sm:mb-5">
                  <h3 className="text-sm sm:text-base font-semibold text-text-primary mb-2 sm:mb-3 flex items-center">
                    <Award size={isMobile ? 14 : 16} className="mr-1.5 text-brand-primary" />
                    Conquistas
                  </h3>
                  
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {selectedReferral.badges.map((badge) => {
                      let badgeInfo = {
                        'premium': {
                          title: 'Usuário Premium',
                          color: 'bg-amber-500',
                          icon: <Star size={isMobile ? 12 : 14} />
                        },
                        'high_volume': {
                          title: 'Alto Volume',
                          color: 'bg-blue-500',
                          icon: <TrendingUp size={isMobile ? 12 : 14} />
                        },
                        'early_adopter': {
                          title: 'Pioneiro',
                          color: 'bg-purple-500',
                          icon: <Clock size={isMobile ? 12 : 14} />
                        }
                      }[badge];
                      
                      return (
                        <div 
                          key={badge}
                          className={`rounded-full px-2 sm:px-3 py-1 sm:py-1.5 ${badgeInfo.color} text-white flex items-center`}
                        >
                          <div className="mr-1 sm:mr-1.5">
                            {badgeInfo.icon}
                          </div>
                          <span className="text-[9px] sm:text-xs font-medium">
                            {isMobile && badge === 'premium' ? 'Premium' : badgeInfo.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Ações - Responsivas */}
                <div className="flex justify-end space-x-2 pt-2 border-t border-border-primary">
                  <button
                    className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-text-primary border border-border-primary hover:bg-background-secondary transition-colors text-xs sm:text-sm"
                    onClick={closeTraderDetails}
                  >
                    Fechar
                  </button>
                  <button 
                    className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors text-xs sm:text-sm"
                  >
                    Ver Histórico
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}