import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { ProfileSettings } from './ProfileSettings';
import { UsabilitySettings } from './UsabilitySettings';
import { PriceNotificationsSettings } from './PriceNotificationSettings';
import { SecuritySettings } from './SecuritySettings';
import { CurrencyPreferencesSettings } from './CurrencyPreferencesSetings';
import { useAuth } from '../../store/auth/useAuth';
import { 
  User, 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  DollarSign, 
  ArrowLeft,
  ChevronDown,
  Sparkles,
  Heart,
  Zap,
  Star,
  Clock
} from 'lucide-react';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
};

const pageTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

function WelcomeSettings() {
  const { user } = useAuth();
  const [timeOfDay, setTimeOfDay] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('Bom dia');
    else if (hour < 18) setTimeOfDay('Boa tarde');
    else setTimeOfDay('Boa noite');
  }, []);

  const menuItems = [
    { 
      path: '/settings/profile', 
      icon: User, 
      label: 'Perfil', 
      color: 'from-indigo-500 to-purple-600',
      description: 'Personalize suas informações pessoais e foto de perfil.'
    },
    { 
      path: '/settings/usability', 
      icon: SettingsIcon, 
      label: 'Usabilidade', 
      color: 'from-sky-500 to-blue-600',
      description: 'Ajuste o tema e a experiência da interface.'
    },
    { 
      path: '/settings/price-notifications', 
      icon: Bell, 
      label: 'Notificações de Preço', 
      color: 'from-amber-500 to-orange-600',
      description: 'Configure alertas personalizados para mudanças de preço.'
    },
    { 
      path: '/settings/security', 
      icon: Shield, 
      label: 'Segurança', 
      color: 'from-emerald-500 to-green-600',
      description: 'Proteja sua conta com configurações avançadas de segurança.'
    },
    { 
      path: '/settings/currency-preferences', 
      icon: DollarSign, 
      label: 'Preferências de Moeda', 
      color: 'from-rose-500 to-pink-600',
      description: 'Escolha suas moedas favoritas e unidades de exibição.'
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-5xl mx-auto space-y-8"
    >
      {/* Cartão de boas-vindas */}
      <motion.div 
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="bg-gradient-to-br from-brand-primary/90 to-purple-600/90 p-8 rounded-2xl shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute w-64 h-64 bg-white/10 rounded-full -top-32 -right-32 blur-xl"></div>
          <div className="absolute w-48 h-48 bg-white/5 rounded-full top-40 -left-20 blur-md"></div>
          <motion.div 
            className="absolute bottom-0 right-0 text-white/10 text-[140px] font-bold leading-none"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <Sparkles />
          </motion.div>
        </div>

        <div className="relative z-10">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2 text-text-primary">
              <span>{timeOfDay}, {user?.name?.split(' ')[0] || 'Usuário'}!</span>
              <motion.span
                animate={{ rotate: [0, 10, -10, 10, 0] }}
                transition={{ delay: 1, duration: 0.8, ease: "easeInOut" }}
              >
                <Sparkles size={24} className="text-yellow-300" />
              </motion.span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-text-secondary max-w-lg"
          >
            Seja bem-vindo ao seu centro de configurações personalizado. Aqui você pode gerenciar todos os aspectos da sua conta e personalizar sua experiência de acordo com suas preferências.
          </motion.p>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 flex gap-3 flex-wrap"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/settings/profile')}
              className="bg-white text-purple-700 px-4 py-2 rounded-full font-medium flex items-center gap-2 shadow-lg"
            >
              <User size={18} />
              Começar com Perfil
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="bg-white/20 text-white px-4 py-2 rounded-full font-medium flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Voltar ao Dashboard
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Cards de Configurações */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            className="bg-background-secondary border border-border-primary rounded-xl p-6 cursor-pointer group"
            onClick={() => navigate(item.path)}
          >
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
              <item.icon size={24} className="text-white" />
            </div>

            <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-brand-primary transition-colors">
              {item.label}
            </h3>
            
            <p className="text-text-secondary text-sm mb-4">
              {item.description}
            </p>

            <div className="flex justify-end">
              <motion.button
                whileHover={{ x: 5 }}
                className="text-brand-primary text-sm font-medium flex items-center"
              >
                Configurar
                <ChevronDown size={16} className="ml-1 rotate-270 transform" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Seção de destaques e dicas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-background-secondary border border-border-primary rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Zap className="text-yellow-500" />
          Dicas para melhorar sua experiência
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 bg-background-primary p-4 rounded-lg">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full">
              <Shield size={18} />
            </div>
            <div>
              <h4 className="font-medium text-text-primary">Ative a verificação em duas etapas</h4>
              <p className="text-text-secondary text-sm">Mantenha sua conta segura com uma camada extra de proteção</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 bg-background-primary p-4 rounded-lg">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full">
              <Bell size={18} />
            </div>
            <div>
              <h4 className="font-medium text-text-primary">Configure alertas de preço</h4>
              <p className="text-text-secondary text-sm">Fique por dentro de mudanças importantes no mercado</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 bg-background-primary p-4 rounded-lg">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
              <Star size={18} />
            </div>
            <div>
              <h4 className="font-medium text-text-primary">Personalize seu tema</h4>
              <p className="text-text-secondary text-sm">Escolha entre modo claro e escuro para seu conforto visual</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 bg-background-primary p-4 rounded-lg">
            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full">
              <Heart size={18} />
            </div>
            <div>
              <h4 className="font-medium text-text-primary">Adicione suas moedas favoritas</h4>
              <p className="text-text-secondary text-sm">Personalize sua experiência com as criptomoedas que você mais gosta</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Última atualização */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="text-center text-text-tertiary text-sm flex items-center justify-center gap-1"
      >
        <Clock size={14} /> Última atualização: {new Date().toLocaleDateString('pt-BR')}
      </motion.div>
    </motion.div>
  );
}

export function Settings() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(null);

  const menuItems = [
    { path: '/settings/profile', icon: User, label: 'Perfil', color: 'from-indigo-500 to-purple-600' },
    { path: '/settings/usability', icon: SettingsIcon, label: 'Usabilidade', color: 'from-sky-500 to-blue-600' },
    { path: '/settings/price-notifications', icon: Bell, label: 'Notificações de Preço', color: 'from-amber-500 to-orange-600' },
    { path: '/settings/security', icon: Shield, label: 'Segurança', color: 'from-emerald-500 to-green-600' },
    { path: '/settings/currency-preferences', icon: DollarSign, label: 'Preferências de Moeda', color: 'from-rose-500 to-pink-600' },
  ];

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="flex flex-col h-screen bg-background-primary relative overflow-hidden"
    >
      {/* Botão Voltar */}
      <div className="absolute top-6 left-6 z-20">
        <motion.button
          onClick={() => navigate('/dashboard')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center w-10 h-10 bg-background-secondary border border-border-primary rounded-full shadow-lg hover:bg-background-tertiary transition-all"
        >
          <ArrowLeft size={18} className="text-text-primary" />
        </motion.button>
      </div>

      {/* Menu de navegação flutuante - mantendo classe de texto */}
      <div className="absolute top-6 left-0 right-0 z-10 mx-auto flex justify-center">
        <motion.div 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.2 }}
          className="flex items-center p-2 bg-background-secondary/80 backdrop-blur-md border border-border-primary rounded-full shadow-lg"
        >
          {menuItems.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <motion.div
                className="relative mx-1.5"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className={`flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br ${item.color} shadow-md ${
                    location.pathname === item.path 
                      ? 'ring-2 ring-white/50 shadow-lg' 
                      : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  <item.icon size={18} className="text-white" />
                </motion.div>
                
                <AnimatePresence>
                  {activeIndex === index && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap"
                    >
                      <div className="relative">
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-background-secondary rotate-45 border-t border-l border-border-primary z-0"></div>
                        <div className="bg-background-secondary border border-border-primary rounded-md px-3 py-1.5 text-xs font-medium text-text-primary z-10 relative">
                          {item.label}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>

      {/* Indicador de página atual - usando classes de tema corretas */}
      <div className="pt-24 pb-6 flex justify-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <motion.h1
            layoutId="page-title"
            className="text-xl md:text-2xl font-bold bg-gradient-to-r from-brand-primary to-purple-400 bg-clip-text text-transparent"
          >
            {menuItems.find(item => item.path === location.pathname)?.label || 'Configurações'}
          </motion.h1>
          <motion.div 
            className="h-1 w-12 mt-2 bg-gradient-to-r from-brand-primary to-purple-400 rounded-full mx-auto"
            layoutId="page-indicator"
          />
        </motion.div>
      </div>

      {/* Área de conteúdo */}
      <div className="flex-1 overflow-y-auto mx-auto w-full max-w-5xl px-4">
        <AnimatePresence exitBeforeEnter>
          <Routes>
            <Route index element={
              <motion.div
                key="welcome"
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <WelcomeSettings />
              </motion.div>
            } />
            <Route path="profile" element={
              <motion.div
                key="profile"
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <ProfileSettings />
              </motion.div>
            } />
            <Route path="usability" element={
              <motion.div
                key="usability"
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <UsabilitySettings />
              </motion.div>
            } />
            <Route path="price-notifications" element={
              <motion.div
                key="price-notifications"
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <PriceNotificationsSettings />
              </motion.div>
            } />
            <Route path="security" element={
              <motion.div
                key="security"
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <SecuritySettings />
              </motion.div>
            } />
            <Route path="currency-preferences" element={
              <motion.div
                key="currency-preferences"
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <CurrencyPreferencesSettings />
              </motion.div>
            } />
          </Routes>
        </AnimatePresence>
      </div>

      {/* Círculos decorativos para o fundo */}
      <div className="fixed bottom-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full -mr-32 -mb-32 blur-3xl z-0"></div>
      <div className="fixed top-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full -ml-48 -mt-48 blur-3xl z-0"></div>
    </motion.div>
  );
}