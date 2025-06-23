import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Github, Facebook, Chrome, Bitcoin, DollarSign, ArrowRight, CheckCircle, Wallet, Zap, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../store/auth/useAuth';
import { authApi } from '../../services/api/api';
import WelcomeScreen from '../../components/WelcomeScreen';

// Componente para as partículas flutuantes
const FloatingCoins = () => {
  const coins = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 0.6 + 0.2,
    duration: Math.random() * 8 + 10,
    type: Math.random() > 0.5 ? 'bitcoin' : 'dollar'
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {coins.map(coin => (
        <motion.div
          key={coin.id}
          className="absolute text-brand-primary/30"
          style={{
            left: `${coin.x}%`,
            top: `${coin.y}%`,
            fontSize: `${coin.size * 24}px`,
          }}
          animate={{
            y: [`${coin.y}%`, `${coin.y - 15}%`, `${coin.y + 10}%`, `${coin.y}%`],
            x: [`${coin.x}%`, `${coin.x + 5}%`, `${coin.x - 10}%`, `${coin.x}%`],
            rotate: [0, 45, -45, 0],
            opacity: [0.2, 0.5, 0.3, 0.2],
          }}
          transition={{
            duration: coin.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {coin.type === 'bitcoin' ? <Bitcoin /> : <DollarSign />}
        </motion.div>
      ))}
    </div>
  );
};

// Componente para o logo animado
const AnimatedLogo = () => {
  return (
    <motion.div 
      className="flex items-center justify-center mb-6"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <div className="relative">
        <motion.div 
          className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-primary to-purple-600 flex items-center justify-center"
          animate={{ 
            boxShadow: ["0 0 0 rgba(126, 34, 206, 0.4)", "0 0 20px rgba(126, 34, 206, 0.7)", "0 0 0 rgba(126, 34, 206, 0.4)"],
          }}
          transition={{ 
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Bitcoin className="text-white" size={28} />
        </motion.div>
        <motion.div
          className="absolute -right-1 -top-1 w-5 h-5 rounded-full bg-amber-400"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </motion.div>
  );
};

// Componente animado para os cartões de criptomoedas
const CryptoCards = () => {
  const cards = [
    { name: 'Bitcoin', symbol: 'BTC', price: '186.430', change: '+2.4%', color: 'from-amber-500 to-orange-600' },
    { name: 'Ethereum', symbol: 'ETH', price: '9.875', change: '+1.8%', color: 'from-blue-500 to-indigo-600' },
    { name: 'Solana', symbol: 'SOL', price: '437', change: '+5.2%', color: 'from-purple-500 to-fuchsia-600' },
  ];

  return (
    <div className="absolute -right-20 top-1/2 -translate-y-1/2 space-y-6 hidden lg:block">
      {cards.map((card, index) => (
        <motion.div
          key={card.name}
          className={`bg-gradient-to-r ${card.color} p-4 rounded-l-xl w-48 shadow-lg`}
          initial={{ opacity: 0, x: 100 }}
          animate={{ 
            opacity: 1, 
            x: 0,
            y: [0, -5, 5, 0],
          }}
          transition={{
            y: {
              repeat: Infinity,
              duration: 5,
              delay: index * 0.8,
            },
            opacity: { duration: 0.8, delay: 0.3 + index * 0.2 },
            x: { duration: 0.8, delay: 0.3 + index * 0.2 }
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-white">{card.name}</h4>
            <span className="text-xs font-bold bg-white/20 text-white px-1.5 py-0.5 rounded-md">
              {card.symbol}
            </span>
          </div>
          <div className="font-mono text-lg font-bold text-white">
            R$ {card.price}
          </div>
          <div className="flex justify-between items-center mt-1">
            <div className="w-16 h-6">
              <svg viewBox="0 0 100 30" className="w-full h-full">
                <path
                  d={`M0,15 Q25,${5 + Math.random() * 20} 50,${10 + Math.random() * 10} T100,15`}
                  fill="none"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth="1"
                />
              </svg>
            </div>
            <span className="text-white text-sm font-medium bg-white/10 px-1.5 py-0.5 rounded">
              {card.change}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export function AuthForm({ type }) {
  const { showNotification } = useNotification();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    address: '',
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [loginMethod, setLoginMethod] = useState('email');

  // Avaliar força da senha quando ela mudar
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength(0);
      return;
    }

    // Lógica de força de senha
    let strength = 0;
    if (formData.password.length > 6) strength += 1;
    if (formData.password.match(/[A-Z]/)) strength += 1;
    if (formData.password.match(/[0-9]/)) strength += 1;
    if (formData.password.match(/[^A-Za-z0-9]/)) strength += 1;

    setPasswordStrength(strength);
  }, [formData.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);

    try {
      if (type === 'signin') {
        const success = await login(formData);
        
        if (success) {
          const userInfo = JSON.parse(localStorage.getItem('user')) || { name: 'Usuário' };
          
          // Verificar se é o primeiro login do usuário
          const isFirstLogin = !localStorage.getItem('hasSeenWelcome');
          
          if (isFirstLogin) {
            setUserData(userInfo);
            setShowWelcome(true);
            // Marcar que o usuário já viu a tela de boas-vindas
            localStorage.setItem('hasSeenWelcome', 'true');
          } else {
            // Se não for o primeiro login, ir direto para a dashboard
            navigate('/dashboard', { replace: true });
          }
        } else {
          showNotification('Credenciais inválidas.', 'error');
        }
      } else {
        // Registro
        const registerData = {
          ...formData,
          role: 'user'
        };
        
        const response = await authApi.register(registerData);
        
        if (response.data) {
          showNotification(`Bem-vindo(a) ${formData.name}! Sua conta foi criada com sucesso.`, 'success');
          
          await login({
            email: formData.email,
            password: formData.password
          });
          
          setUserData({ name: formData.name });
          setShowWelcome(true);
        }
      }
    } catch (error) {
      console.error('Erro de autenticação:', error);
      
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors)
          .flat()
          .join(', ');
          
        showNotification(`Erro no registro: ${errorMessages}`, 'error');
      } else {
        showNotification(
          error.response?.data?.message || 'Falha na autenticação. Tente novamente.',
          'error'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleWelcomeComplete = () => {
    // Quando a tela de boas-vindas for concluída, redirecionar para a dashboard
    navigate('/dashboard', { replace: true });
  };

  const socialButtons = [
    { icon: Chrome, label: 'Google', color: 'bg-red-500' },
    { icon: Facebook, label: 'Facebook', color: 'bg-blue-600' },
    { icon: Github, label: 'Github', color: 'bg-gray-800' },
  ];

  // Renderizar a tela de boas-vindas se showWelcome for true
  if (showWelcome && userData) {
    return (
      <AnimatePresence>
        <WelcomeScreen 
          userName={userData.name} 
          onComplete={handleWelcomeComplete} 
        />
      </AnimatePresence>
    );
  }

  return (
    <div className="relative w-screen h-screen flex items-center justify-center overflow-hidden bg-background-primary">
      <FloatingCoins />
      
      {/* Fundo com gradiente mais expansivo */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 via-background-primary to-purple-900/10 z-0"></div>
      
      {/* Círculos decorativos espalhados */}
      <div className="absolute top-16 left-16 w-24 h-24 rounded-full bg-brand-primary/5 blur-xl"></div>
      <div className="absolute bottom-32 right-16 w-40 h-40 rounded-full bg-purple-600/5 blur-xl"></div>
      
      {/* Container principal mantido no centro */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="z-10 w-full max-w-md relative mx-auto"
      >
        {/* Cartões de cripto agora com maior distância para aparecer melhor */}
        <div className="hidden lg:block absolute -right-32 top-1/2 -translate-y-1/2">
          <CryptoCards />
        </div>
        
        {/* Cartões de cripto à esquerda (versão espelhada) */}
        <div className="hidden xl:block absolute -left-32 top-1/2 -translate-y-1/2 scale-90 opacity-80">
          <div className="space-y-6">
            {[
              { name: 'Polkadot', symbol: 'DOT', price: '37,18', change: '+2.7%', color: 'from-pink-500 to-red-600' },
              { name: 'Cardano', symbol: 'ADA', price: '2,31', change: '+0.6%', color: 'from-blue-400 to-blue-600' },
            ].map((card, index) => (
              <motion.div
                key={card.name}
                className={`bg-gradient-to-r ${card.color} p-4 rounded-r-xl w-48 shadow-lg`}
                initial={{ opacity: 0, x: -100 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  y: [0, -5, 5, 0],
                }}
                transition={{
                  y: {
                    repeat: Infinity,
                    duration: 5,
                    delay: index * 0.8,
                  },
                  opacity: { duration: 0.8, delay: 0.3 + index * 0.2 },
                  x: { duration: 0.8, delay: 0.3 + index * 0.2 }
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-white">{card.name}</h4>
                  <span className="text-xs font-bold bg-white/20 text-white px-1.5 py-0.5 rounded-md">
                    {card.symbol}
                  </span>
                </div>
                <div className="font-mono text-lg font-bold text-white">
                  R$ {card.price}
                </div>
                <div className="flex justify-between items-center mt-1">
                  <div className="w-16 h-6">
                    <svg viewBox="0 0 100 30" className="w-full h-full">
                      <path
                        d={`M0,15 Q25,${5 + Math.random() * 20} 50,${10 + Math.random() * 10} T100,15`}
                        fill="none"
                        stroke="rgba(255,255,255,0.5)"
                        strokeWidth="1"
                      />
                    </svg>
                  </div>
                  <span className="text-white text-sm font-medium bg-white/10 px-1.5 py-0.5 rounded">
                    {card.change}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="backdrop-blur-xl bg-background-primary/80 border border-border-primary rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-8">
            <AnimatedLogo />
            
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-center bg-gradient-to-r from-brand-primary to-purple-400 bg-clip-text text-transparent mb-2"
            >
              {type === 'signin' ? 'Acessar Investimentos' : 'Comece a Investir'}
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: 0.3 }}
              className="text-center text-text-secondary mb-8"
            >
              {type === 'signin' 
                ? 'Acesse sua carteira digital de forma segura' 
                : 'Crie sua conta e comece a negociar criptomoedas'}
            </motion.p>

            {/* Seletor de método de login */}
            {type === 'signin' && (
              <div className="bg-background-secondary rounded-lg p-1 flex mb-6">
                <button 
                  onClick={() => setLoginMethod('email')}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                    loginMethod === 'email' 
                      ? 'bg-brand-primary text-white shadow-md' 
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Mail size={16} className="inline mr-2 -mt-1" />
                  Email
                </button>
                <button 
                  onClick={() => setLoginMethod('wallet')}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                    loginMethod === 'wallet' 
                      ? 'bg-brand-primary text-white shadow-md' 
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Wallet size={16} className="inline mr-2 -mt-1" />
                  Carteira Cripto
                </button>
              </div>
            )}

            <AnimatePresence mode="wait">
              {loginMethod === 'email' ? (
                <motion.form 
                  key="email-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSubmit} 
                  className="space-y-5"
                >
                  {type === 'signup' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="group"
                    >
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-primary group-focus-within:text-brand-primary text-opacity-70 group-focus-within:text-opacity-100 transition-colors">
                          <User size={18} />
                        </div>
                        <input
                          type="text"
                          placeholder="Nome Completo"
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-border-primary bg-background-secondary text-text-primary placeholder-text-tertiary focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                    </motion.div>
                  )}
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="group"
                  >
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-primary group-focus-within:text-brand-primary text-opacity-70 group-focus-within:text-opacity-100 transition-colors">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        placeholder="Email"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-border-primary bg-background-secondary text-text-primary placeholder-text-tertiary focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="group"
                  >
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-primary group-focus-within:text-brand-primary text-opacity-70 group-focus-within:text-opacity-100 transition-colors">
                        <Lock size={18} />
                      </div>
                      <input
                        type="password"
                        placeholder="Senha"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-border-primary bg-background-secondary text-text-primary placeholder-text-tertiary focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                    </div>

                    {type === 'signup' && formData.password && (
                      <div className="mt-2">
                        <div className="flex w-full h-1 mt-1 mb-1 bg-background-tertiary rounded-full overflow-hidden">
                          <motion.div 
                            className={`h-full ${
                              passwordStrength <= 1 
                                ? 'bg-red-500' 
                                : passwordStrength === 2 
                                  ? 'bg-yellow-500' 
                                  : passwordStrength === 3 
                                    ? 'bg-green-500' 
                                    : 'bg-green-400'
                            }`}
                            initial={{ width: '0%' }}
                            animate={{ width: `${passwordStrength * 25}%` }}
                          />
                        </div>
                        <p className="text-xs text-text-tertiary flex items-center">
                          {passwordStrength <= 1 && <AlertCircle size={12} className="mr-1 text-red-500" />}
                          {passwordStrength === 2 && <AlertCircle size={12} className="mr-1 text-yellow-500" />}
                          {passwordStrength >= 3 && <CheckCircle size={12} className="mr-1 text-green-500" />}
                          {passwordStrength <= 1 
                            ? 'Senha fraca' 
                            : passwordStrength === 2 
                              ? 'Senha média' 
                              : 'Senha forte'}
                        </p>
                      </div>
                    )}
                  </motion.div>

                  {type === 'signin' && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="flex justify-end"
                    >
                      <Link 
                        to="/forgot-password" 
                        className="text-sm text-brand-primary hover:text-brand-primary/80 hover:underline"
                      >
                        Esqueceu a senha?
                      </Link>
                    </motion.div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-gradient-to-r from-brand-primary to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2 transition-all hover:shadow-brand-primary/30 disabled:opacity-70"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>Processando...</span>
                      </div>
                    ) : (
                      <>
                        {type === 'signin' ? 'Entrar' : 'Criar Conta'}
                        <ArrowRight size={18} className="ml-1" />
                      </>
                    )}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.div
                  key="wallet-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-4"
                >
                  <div className="inline-block p-4 rounded-full bg-background-secondary mb-4">
                    <Wallet size={32} className="text-brand-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-text-primary">Conectar Carteira</h3>
                  <p className="text-text-secondary text-sm mb-6">
                    Conecte sua carteira digital para acessar sua conta
                  </p>
                  
                  <div className="space-y-3">
                    {[
                      { name: "MetaMask", icon: "🦊", color: "bg-amber-500" },
                      { name: "Coinbase", icon: "💰", color: "bg-blue-500" },
                      { name: "Trust Wallet", icon: "🔐", color: "bg-green-600" }
                    ].map((wallet, index) => (
                      <motion.button
                        key={wallet.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                        className="flex items-center w-full p-3 rounded-xl border border-border-primary bg-background-secondary hover:bg-background-tertiary text-text-primary transition-colors"
                      >
                        <span className={`w-8 h-8 rounded-full ${wallet.color} flex items-center justify-center text-lg`}>
                          {wallet.icon}
                        </span>
                        <span className="flex-1 text-center font-medium">{wallet.name}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {loginMethod === 'email' && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border-primary"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-background-primary text-text-tertiary">Ou continue com</span>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  {socialButtons.map((button, index) => (
                    <motion.button
                      key={button.label}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.4 }}
                      className={`${button.color} text-white p-3 rounded-lg flex items-center justify-center hover:opacity-90 transition-all shadow-lg`}
                    >
                      <button.icon size={20} />
                    </motion.button>
                  ))}
                </div>
              </>
            )}

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center text-text-secondary mt-8"
            >
              {type === 'signin' ? "Novo na plataforma? " : 'Já possui conta? '}
              <Link
                to={type === 'signin' ? '/signup' : '/signin'}
                className="text-brand-primary hover:text-purple-400 font-medium transition-colors"
              >
                {type === 'signin' ? 'Criar conta' : 'Entrar'}
              </Link>
            </motion.p>
          </div>
        </div>

        {/* Elementos decorativos */}
        <motion.div
          className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-brand-primary to-purple-600 rounded-full"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute -top-4 -right-4 w-8 h-8 bg-amber-400 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </motion.div>
      
      {/* Elementos decorativos adicionais no fundo (global) */}
      <div className="hidden lg:block">
        <motion.div
          className="absolute top-16 right-16 w-16 h-16 bg-gradient-to-br from-brand-primary/30 to-purple-600/30 rounded-full blur-sm"
          animate={{
            y: [0, -15, 0],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute bottom-32 left-64 w-10 h-10 bg-amber-400/20 rounded-full blur-sm"
          animate={{
            y: [0, 10, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        
        <motion.div 
          className="absolute top-36 left-24 text-brand-primary/20"
          style={{ fontSize: '64px' }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 15, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Bitcoin />
        </motion.div>
        
        <motion.div 
          className="absolute bottom-48 right-48 text-purple-500/20"
          style={{ fontSize: '48px' }}
          animate={{
            y: [0, 15, 0],
            rotate: [0, -10, 0],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        >
          <DollarSign />
        </motion.div>
      </div>
      
      {/* Price Ticker na parte inferior */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-0 left-0 right-0 bg-background-primary/90 backdrop-blur-md border-t border-border-primary py-2 px-4 overflow-hidden"
      >
        <div className="flex gap-6 items-center">
          <motion.div 
            animate={{ x: ["0%", "-100%"] }} 
            transition={{ 
              repeat: Infinity, 
              duration: 30, 
              ease: "linear" 
            }}
            className="flex gap-6 whitespace-nowrap"
          >
            {[
              { name: "Bitcoin", price: "186.430", change: "+2.4%", color: "text-amber-500" },
              { name: "Ethereum", price: "9.875", change: "+1.8%", color: "text-blue-500" },
              { name: "Solana", price: "437", change: "+5.2%", color: "text-purple-500" },
              { name: "BNB", price: "1.892", change: "+3.1%", color: "text-yellow-500" },
              { name: "Cardano", price: "2,31", change: "+0.6%", color: "text-blue-400" },
              { name: "XRP", price: "2,75", change: "+4.3%", color: "text-teal-500" },
              { name: "Dogecoin", price: "0,42", change: "+8.9%", color: "text-yellow-400" },
              { name: "Polkadot", price: "37,18", change: "+2.7%", color: "text-pink-500" },
            ].flatMap(coin => [
              <div className="flex items-center gap-2" key={coin.name}>
                <span className={`font-bold ${coin.color}`}>{coin.name}</span>
                <span className="text-text-primary">R$ {coin.price}</span>
                <span className="text-green-400 text-sm">{coin.change}</span>
              </div>,
              <span className="text-text-tertiary">|</span>
            ]).slice(0, -1)}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}