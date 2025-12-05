import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowLeft, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../store/auth/useAuth';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { DecorativeElements } from './DecorativeElements';

const FloatingShields = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {Array.from({ length: 8 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, -10, 0],
            rotate: [0, 15, -15, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
        >
          <Shield 
            className="text-brand-primary/20" 
            size={24 + Math.random() * 32} 
          />
        </motion.div>
      ))}
    </div>
  );
};

export function MfaVerification({ mfaPending, onCancel, onSuccess }) {
  const { verifyMfa } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focar no primeiro input ao montar
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    // Permitir apenas números
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Mover para o próximo input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Se todos os campos estiverem preenchidos, submeter automaticamente
    if (index === 5 && value && newCode.every(digit => digit !== '')) {
      handleSubmit(newCode.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    // Backspace: voltar para o input anterior
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Setas para navegação
    else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Verificar se é um código válido de 6 dígitos
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
      // Submeter automaticamente
      handleSubmit(pastedData);
    }
  };

  const handleSubmit = async (codeString = code.join('')) => {
    if (codeString.length !== 6) {
      setError('Código incompleto');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const result = await verifyMfa({ 
        userId: mfaPending.userId, 
        code: codeString 
      });

      if (result && result.success) {
        showNotification('Autenticação concluída com sucesso!', 'success');
        
        const userInfo = JSON.parse(localStorage.getItem('user')) || { name: 'Usuário' };
        const isFirstLogin = !localStorage.getItem('hasSeenWelcome');

        if (onSuccess) {
          onSuccess(userInfo, isFirstLogin);
        } else {
          if (isFirstLogin) {
            localStorage.setItem('hasSeenWelcome', 'true');
          }
          navigate('/dashboard', { replace: true });
        }
      } else {
        setError('Código inválido. Tente novamente.');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      console.error('MFA verification failed', err);
      setError(err.message || 'Falha na verificação. Tente novamente.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = () => {
    showNotification('Código reenviado com sucesso!', 'info');
    setCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-auto bg-background-primary px-4 py-6 md:py-10">
      <FloatingShields />
      
      <div className="fixed inset-0 bg-gradient-to-br from-brand-primary/10 via-background-primary to-purple-900/10 z-0"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.4 }}
        className="z-10 w-full max-w-md relative my-auto"
      >
        <DecorativeElements />
        
        <div className="backdrop-blur-xl bg-background-primary/80 border border-border-primary rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-8">
            {/* Header com ícone animado */}
            <motion.div 
              className="flex items-center justify-center mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <div className="relative">
                <motion.div 
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-primary to-purple-600 flex items-center justify-center"
                  animate={{ 
                    boxShadow: [
                      "0 0 0 rgba(126, 34, 206, 0.4)", 
                      "0 0 30px rgba(126, 34, 206, 0.7)", 
                      "0 0 0 rgba(126, 34, 206, 0.4)"
                    ],
                  }}
                  transition={{ 
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Shield className="text-white" size={40} />
                </motion.div>
                <motion.div
                  className="absolute -right-2 -top-2 w-6 h-6 rounded-full bg-green-400 flex items-center justify-center"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <CheckCircle size={16} className="text-white" />
                </motion.div>
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-brand-primary to-purple-400 bg-clip-text text-transparent mb-2"
            >
              Verificação em Duas Etapas
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center text-text-secondary mb-8 text-sm"
            >
              Insira o código de {mfaPending?.mfaType === 'email' ? '6 dígitos enviado para seu e-mail' : 'verificação do seu aplicativo autenticador'}
            </motion.p>

            {/* Inputs do código */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center gap-2 sm:gap-3 mb-6"
              onPaste={handlePaste}
            >
              {code.map((digit, index) => (
                <motion.input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl border-2 bg-background-secondary text-text-primary transition-all focus:outline-none ${
                    error 
                      ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' 
                      : digit 
                        ? 'border-brand-primary focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/20'
                        : 'border-border-primary focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/20'
                  }`}
                  whileFocus={{ scale: 1.05 }}
                  disabled={isVerifying}
                />
              ))}
            </motion.div>

            {/* Mensagem de erro */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2"
                >
                  <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-500">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Botões de ação */}
            <div className="space-y-3 mb-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSubmit()}
                disabled={isVerifying || code.some(d => !d)}
                className="w-full py-3 bg-gradient-to-r from-brand-primary to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2 transition-all hover:shadow-brand-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    <span>Verificar Código</span>
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleResend}
                disabled={isVerifying}
                className="w-full py-3 border-2 border-border-primary rounded-xl text-text-primary font-medium hover:bg-background-secondary transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RefreshCw size={18} />
                <span>Reenviar Código</span>
              </motion.button>
            </div>

            {/* Link de cancelar */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={onCancel}
              className="w-full text-center text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <ArrowLeft size={16} />
              <span>Voltar ao login</span>
            </motion.button>

            {/* Informação adicional */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 p-4 rounded-xl bg-brand-primary/5 border border-brand-primary/20"
            >
              <p className="text-xs text-text-secondary text-center">
                {mfaPending?.mfaType === 'email' 
                  ? 'Não recebeu o código? Verifique sua caixa de spam ou clique em reenviar.'
                  : 'Use o código de 6 dígitos do seu aplicativo autenticador (Google Authenticator, Authy, etc.)'}
              </p>
            </motion.div>
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
          className="absolute -top-4 -right-4 w-8 h-8 bg-green-400 rounded-full"
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
    </div>
  );
}
