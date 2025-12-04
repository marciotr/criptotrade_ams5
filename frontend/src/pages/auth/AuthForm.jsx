import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Github, Facebook, Chrome, Bitcoin, DollarSign, ArrowRight, CheckCircle, Wallet, Zap, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../store/auth/useAuth';
import { authApi } from '../../services/api/api';
import WelcomeScreen from '../../components/WelcomeScreen';
import { DecorativeElements } from './DecorativeElements';

// Componente para as partículas flutuantes (ajustado para dispositivos móveis)
const FloatingCoins = () => {
  // manter breakpoint em estado para detectar mudanças de tamanho reais
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // memoizar as partículas para que não sejam recriadas em cada render (digitando não as reinicia)
  const coins = useMemo(() => {
    const particleCount = isMobile ? 10 : 20;
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * (isMobile ? 0.4 : 0.6) + (isMobile ? 0.15 : 0.2),
      duration: Math.random() * 8 + 10,
      type: Math.random() > 0.5 ? 'bitcoin' : 'dollar'
    }));
  }, [isMobile]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {coins.map(coin => (
        <motion.div
          key={coin.id}
          className="absolute"
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
          {coin.type === 'bitcoin' ? (
            <Bitcoin className="text-amber-400/90 dark:text-amber-300/80" />
          ) : (
            <DollarSign className="text-green-400/90 dark:text-green-300/80" />
          )}
        </motion.div>
      ))}
    </div>
  );
};

// Componente para o logo animado
const AnimatedLogo = () => {
  return (
    <motion.div 
      className="flex items-center justify-center mb-4 sm:mb-6"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <div className="relative">
        <motion.div 
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-brand-primary to-purple-600 flex items-center justify-center"
          animate={{ 
            boxShadow: ["0 0 0 rgba(126, 34, 206, 0.4)", "0 0 20px rgba(126, 34, 206, 0.7)", "0 0 0 rgba(126, 34, 206, 0.4)"],
          }}
          transition={{ 
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Bitcoin className="text-white" size={24} />
        </motion.div>
        <motion.div
          className="absolute -right-1 -top-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-400"
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

export function AuthForm({ type }) {
  const { showNotification } = useNotification();
  const { login, verifyMfa } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [userData, setUserData] = useState(null);
  const [mfaPending, setMfaPending] = useState(null);
  const [mfaCode, setMfaCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    address: '',
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [loginMethod, setLoginMethod] = useState('email');
  const containerRef = useRef(null);

  // escala responsiva para reduzir o modal em telas menores
  const [scale, setScale] = useState(1);

  // Detectar tamanho da tela para ajustes responsivos e calcular escala do modal
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        // Ajustar altura mínima para telas pequenas
        const viewportHeight = window.innerHeight;
        containerRef.current.style.minHeight = `${viewportHeight}px`;
      }

      // Ajustar escala do modal com base na largura da janela
      const w = window.innerWidth;
      let newScale = 1;
      // Escalas mais agressivas para notebooks 13" e similares
      // Ordem: menor largura primeiro
      if (w <= 1024) {
        newScale = 0.66; // tablets/pequenas janelas - reduzir mais
      } else if (w <= 1280) {
        newScale = 0.70; // notebooks 13" - redução adicional solicitada
      } else if (w <= 1366) {
        newScale = 0.74; // notebooks 13.3"/14" compactos
      } else if (w <= 1440) {
        newScale = 0.88; // laptops maiores
      } else {
        newScale = 1; // desktops grandes
      }

      // Evita re-renders desnecessários
      if (Math.abs(scale - newScale) > 0.005) setScale(newScale);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
        const response = await login(formData);

        if (response && response.mfaRequired) {
          setMfaPending(response);
          showNotification('Autenticação de dois fatores requerida. Insira o código enviado.', 'info');
          setIsLoading(false);
          return;
        }

        if (response && response.success) {
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

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    if (!mfaPending) return;
    setIsVerifying(true);
    try {
      const result = await verifyMfa({ userId: mfaPending.userId, code: mfaCode });
      if (result && result.success) {
        const userInfo = JSON.parse(localStorage.getItem('user')) || { name: 'Usuário' };
        const isFirstLogin = !localStorage.getItem('hasSeenWelcome');

        if (isFirstLogin) {
          setUserData(userInfo);
          setShowWelcome(true);
          localStorage.setItem('hasSeenWelcome', 'true');
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        showNotification('Código inválido. Tente novamente.', 'error');
      }
    } catch (err) {
      console.error('MFA verification failed', err);
      showNotification(err.message || 'Falha na verificação MFA', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleWelcomeComplete = () => {
    navigate('/dashboard', { replace: true });
  };

  const socialButtons = [
    { icon: Chrome, label: 'Google', color: 'bg-red-500' },
    { icon: Facebook, label: 'Facebook', color: 'bg-blue-600' },
    { icon: Github, label: 'Github', color: 'bg-gray-800' },
  ];

  // Se houver um MFA pendente, renderiza a tela de inserção do código antes da WelcomeScreen
  if (mfaPending) {
    return (
      <div className="fixed inset-0 flex items-center justify-center overflow-auto bg-background-primary px-4 py-6 md:py-10">
        <div className="z-10 w-full max-w-md relative my-auto">
          <div className="backdrop-blur-xl bg-background-primary/80 border border-border-primary rounded-xl sm:rounded-2xl overflow-hidden shadow-xl sm:shadow-2xl p-6">
            <h2 className="text-lg font-bold text-text-primary mb-2">Verificação em duas etapas</h2>
            <p className="text-text-secondary mb-4">Insira o código recebido por {mfaPending.mfaType || 'seu método de autenticação'} para continuar.</p>

            <form onSubmit={handleMfaSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Código de verificação"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  className="w-full text-sm pl-3 pr-3 py-2 rounded-lg border border-border-primary bg-background-secondary text-text-primary placeholder-text-terciary focus:ring-2 focus:ring-brand-primary"
                  required
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="flex-1 px-4 py-2 bg-brand-primary text-background-primary rounded-lg hover:opacity-90 transition-colors"
                >
                  {isVerifying ? 'Verificando...' : 'Verificar'}
                </button>
                <button
                  type="button"
                  onClick={() => { setMfaPending(null); setMfaCode(''); localStorage.removeItem('mfaPending'); }}
                  className="px-4 py-2 border border-border-primary rounded-lg text-text-primary bg-transparent"
                >
                  Cancelar
                </button>
              </div>
            </form>

            <div className="text-xs text-text-secondary mt-3">Não recebeu o código? Verifique seu e-mail ou app autenticador.</div>
          </div>
        </div>
      </div>
    );
  }

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
    <div 
      ref={containerRef}
      className="fixed inset-0 flex items-center justify-center overflow-auto bg-background-primary px-4 py-6 md:py-10"
    >
      <FloatingCoins />
      
      {/* Fundo com gradiente mais expansivo */}
      <div className="fixed inset-0 bg-gradient-to-br from-brand-primary/10 via-background-primary to-purple-900/10 z-0"></div>
      
      {/* Container principal mantido no centro */}
      <motion.div
        initial={{ opacity: 0, scale: Math.max(0.8, scale * 0.95) }}
        animate={{ opacity: 1, scale }}
        transition={{ duration: 0.5 }}
        style={{ transformOrigin: 'top center' }}
        className="z-10 w-full max-w-md relative my-auto"
      >
        {/* Elementos decorativos importados do componente separado */}
        <DecorativeElements />
        
        <div className="backdrop-blur-xl bg-background-primary/80 border border-border-primary rounded-xl sm:rounded-2xl overflow-hidden shadow-xl sm:shadow-2xl">
          <div className="p-5 sm:p-8">
            <AnimatedLogo />
            
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl xs:text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-brand-primary to-purple-400 bg-clip-text text-transparent mb-1 sm:mb-2"
            >
              {type === 'signin' ? 'Acessar Investimentos' : 'Comece a Investir'}
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: 0.3 }}
              className="text-center text-text-secondary mb-5 sm:mb-8 text-xs xs:text-sm"
            >
              {type === 'signin' 
                ? 'Acesse sua carteira digital de forma segura' 
                : 'Crie sua conta e comece a negociar criptomoedas'}
            </motion.p>

            {/* Seletor de método de login */}
            {type === 'signin' && (
              <div className="bg-background-secondary rounded-lg p-1 flex mb-5 sm:mb-6">
                <button 
                  onClick={() => setLoginMethod('email')}
                  className={`flex-1 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                    loginMethod === 'email' 
                      ? 'bg-brand-primary text-white shadow-md' 
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Mail size={12} className="inline mr-1 sm:mr-2 -mt-0.5" />
                  Email
                </button>
                <button 
                  onClick={() => setLoginMethod('wallet')}
                  className={`flex-1 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                    loginMethod === 'wallet' 
                      ? 'bg-brand-primary text-white shadow-md' 
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Wallet size={12} className="inline mr-1 sm:mr-2 -mt-0.5" />
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
                  className="space-y-3 sm:space-y-5"
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
                          <User size={14} className="sm:w-[18px] sm:h-[18px]" />
                        </div>
                        <input
                          type="text"
                          placeholder="Nome Completo"
                          className="w-full text-xs sm:text-base pl-9 sm:pl-12 pr-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-border-primary bg-background-secondary text-text-primary placeholder-text-terciary focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
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
                        <Mail size={14} className="sm:w-[18px] sm:h-[18px]" />
                      </div>
                      <input
                        type="email"
                        placeholder="Email"
                        className="w-full text-xs sm:text-base pl-9 sm:pl-12 pr-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-border-primary bg-background-secondary text-text-primary placeholder-text-terciary focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
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
                        <Lock size={14} className="sm:w-[18px] sm:h-[18px]" />
                      </div>
                      <input
                        type="password"
                        placeholder="Senha"
                        className="w-full text-xs sm:text-base pl-9 sm:pl-12 pr-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-border-primary bg-background-secondary text-text-primary placeholder-text-terciary focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                    </div>

                    {type === 'signup' && formData.password && (
                      <div className="mt-1 sm:mt-2">
                        <div className="flex w-full h-1 mt-1 mb-1 bg-background-terciary rounded-full overflow-hidden">
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
                        <p className="text-xs text-text-terciary flex items-center">
                          {passwordStrength <= 1 && <AlertCircle size={10} className="mr-1 text-red-500" />}
                          {passwordStrength === 2 && <AlertCircle size={10} className="mr-1 text-yellow-500" />}
                          {passwordStrength >= 3 && <CheckCircle size={10} className="mr-1 text-green-500" />}
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
                        className="text-xs text-brand-primary hover:text-brand-primary/80 hover:underline"
                      >
                        Esqueceu a senha?
                      </Link>
                    </motion.div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2 sm:py-3 bg-gradient-to-r from-brand-primary to-purple-600 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2 transition-all hover:shadow-brand-primary/30 disabled:opacity-70"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span className="text-xs sm:text-sm">Processando...</span>
                      </div>
                    ) : (
                      <>
                        <span className="text-xs sm:text-sm">{type === 'signin' ? 'Entrar' : 'Criar Conta'}</span>
                        <ArrowRight size={14} className="sm:w-[18px] sm:h-[18px]" />
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
                  className="text-center py-2 sm:py-4"
                >
                  <div className="inline-block p-2.5 sm:p-4 rounded-full bg-background-secondary mb-3 sm:mb-4">
                    <Wallet size={18} className="text-brand-primary sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2 text-text-primary">Conectar Carteira</h3>
                  <p className="text-text-secondary text-xs mb-3 sm:mb-6">
                    Conecte sua carteira digital para acessar sua conta
                  </p>
                  
                  <div className="space-y-2">
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
                        className="flex items-center w-full p-1.5 sm:p-3 rounded-lg sm:rounded-xl border border-border-primary bg-background-secondary hover:bg-background-terciary text-text-primary transition-colors"
                      >
                        <span className={`w-5 h-5 sm:w-8 sm:h-8 rounded-full ${wallet.color} flex items-center justify-center text-xs sm:text-lg`}>
                          {wallet.icon}
                        </span>
                        <span className="flex-1 text-center font-medium text-xs sm:text-base">{wallet.name}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {loginMethod === 'email' && (
              <>
                <div className="relative my-4 sm:my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border-primary"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    {/* Texto do divisor acompanha as cores globais de texto conforme o tema */}
                    <span className="px-2 bg-transparent text-text-secondary text-xs">Ou continue com</span>
                  </div>
                </div>

                <div className="flex justify-center gap-2 sm:gap-4">
                  {socialButtons.map((button, index) => (
                    <motion.button
                      key={button.label}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.4 }}
                      className={`${button.color} text-white p-1.5 sm:p-3 rounded-md sm:rounded-lg flex items-center justify-center hover:opacity-90 transition-all shadow-lg`}
                    >
                      <button.icon size={14} className="sm:w-5 sm:h-5" />
                    </motion.button>
                  ))}
                </div>
              </>
            )}

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center text-text-secondary mt-5 sm:mt-8 text-xs"
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
          className="absolute -bottom-4 -left-4 w-6 h-6 sm:w-12 sm:h-12 bg-gradient-to-br from-brand-primary to-purple-600 dark:from-brand-primary/80 dark:to-purple-700 rounded-full"
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
          className="absolute -top-4 -right-4 w-5 h-5 sm:w-8 sm:h-8 bg-amber-400 dark:bg-amber-600 rounded-full"
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
      
      {/* Price Ticker na parte inferior */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="fixed bottom-0 left-0 right-0 bg-background-primary/90 backdrop-blur-md border-t border-border-primary py-1 px-2 sm:px-4 overflow-hidden z-10"
      >
        <div className="flex items-center h-5 sm:h-7">
          <motion.div 
            animate={{ x: ["0%", "-100%"] }} 
            transition={{ 
              repeat: Infinity, 
              duration: 30, 
              ease: "linear" 
            }}
            className="flex gap-2 sm:gap-4 whitespace-nowrap"
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
              <div className="flex items-center gap-1" key={coin.name}>
                <span className={`font-medium ${coin.color} text-[10px] sm:text-xs`}>{coin.name}</span>
                <span className="text-text-primary text-[10px] sm:text-xs">R$ {coin.price}</span>
                <span className="text-green-400 text-[9px] sm:text-xs">+{coin.change}</span>
              </div>,
              <span className="text-text-terciary text-[10px] sm:text-xs">|</span>
            ]).slice(0, -1)}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}