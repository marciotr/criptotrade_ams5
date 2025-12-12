import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Wallet, CreditCard, AlertCircle, ArrowDownCircle, TrendingDown, Check, Lock, Clock, Shield } from 'lucide-react';
import { transactionApi, walletApi } from '../../services/api/api';
import { AuthContext } from '../../store/auth/AuthContext';
import { useNotification } from '../../context/NotificationContext';

// Componente de elementos flutuantes animados
const FloatingElement = ({ children, delay, x, y, duration = 20 }) => (
  <motion.div
    className="absolute pointer-events-none z-0 opacity-20 dark:opacity-10"
    initial={{ opacity: 0 }}
    animate={{ 
      opacity: [0.1, 0.2, 0.1], 
      x: [`${x}%`, `${x + 5}%`, `${x}%`],
      y: [`${y}%`, `${y - 5}%`, `${y}%`]
    }}
    transition={{ 
      repeat: Infinity, 
      repeatType: "reverse",
      duration: duration,
      delay: delay,
      ease: "easeInOut" 
    }}
  >
    {children}
  </motion.div>
);

const paymentMethods = [
  { id: 'bank', name: 'Transferência Bancária', icon: Wallet },
  { id: 'card', name: 'Cartão de Crédito', icon: CreditCard },
];

const availableCurrencies = [
  { id: 'USD', name: 'Dólar Americano', symbol: '$' },
  { id: 'EUR', name: 'Euro', symbol: '€' },
  { id: 'BRL', name: 'Real Brasileiro', symbol: 'R$' },
  { id: 'GBP', name: 'Libra Esterlina', symbol: '£' },
];

export function FiatWithdrawPage() {
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(availableCurrencies[0]);
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]);
  const [destination, setDestination] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);

  const { user } = useContext(AuthContext);
  const { showNotification } = useNotification();

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      const res = await walletApi.getBalance();
      const raw = Array.isArray(res.data) ? res.data : [];
      const normalized = raw.map((b) => ({
        currencyId: b.currencyId ?? b.CurrencyId ?? b.IdCurrency ?? b.idCurrency,
        symbol: (b.symbol ?? b.Symbol ?? b.CurrencySymbol ?? b.currencySymbol ?? '').toUpperCase(),
        name: b.name ?? b.Name ?? '',
        amount: Number(b.amount ?? b.Amount ?? b.availableAmount ?? b.AvailableAmount ?? 0),
        currentPrice: Number(b.currentPrice ?? b.CurrentPrice ?? 1),
        value: Number(b.value ?? b.Value ?? ((Number(b.amount ?? b.Amount ?? 0) * Number(b.currentPrice ?? b.CurrentPrice ?? 1))))
      }));

      const usdSymbols = new Set(['USD', 'USDT', 'USDC']);
      let usdBalance = normalized.reduce((sum, b) => {
        const sym = (b.symbol || '').toUpperCase();
        if (usdSymbols.has(sym)) {
          const val = Number(b.value ?? (Number(b.amount || 0) * Number(b.currentPrice || 1))) || 0;
          return sum + val;
        }
        return sum;
      }, 0);

      // fallback: try to detect USD-like by name or symbol
      if (usdBalance === 0 && normalized.length > 0) {
        const fallback = normalized.reduce((s, b) => {
          const sym = (b.symbol || '').toUpperCase();
          const name = (b.name || '').toLowerCase();
          if (sym.includes('USD') || name.includes('dollar') || name.includes('dólar') || name.includes('tether')) {
            return s + (Number(b.value ?? (Number(b.amount || 0) * Number(b.currentPrice || 1))) || 0);
          }
          return s;
        }, 0);
        if (fallback > 0) usdBalance = fallback;
      }

      setCurrentBalance(Number(usdBalance));
      return Number(usdBalance);
    } catch (err) {
      console.warn('Erro ao carregar saldo', err);
      setCurrentBalance(0);
      return 0;
    }
  };

  const handleWithdraw = async () => {
    if (!user) {
      showNotification({ message: 'Por favor, faça login para continuar', type: 'error' });
      return;
    }

    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) {
      showNotification({ message: 'Por favor, insira um valor válido', type: 'error' });
      return;
    }

    if (!destination || destination.trim().length === 0) {
      showNotification({ message: 'Por favor, insira o destino do saque', type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        Currency: selectedCurrency.id,
        Amount: amt,
        Method: paymentMethod.name,
        Destination: destination
      };

      await transactionApi.withdrawFiat(payload);

      // Reload balance and show remaining amount (calculate from fresh value)
      const newBalance = await loadBalance();
      const remaining = Number(newBalance) - amt;

      showNotification({
        message: `Saque de ${selectedCurrency.symbol}${amt.toFixed(2)} realizado com sucesso! Saldo restante: ${selectedCurrency.symbol}${Math.max(0, remaining).toFixed(2)}`,
        type: 'success'
      });
      setAmount('');
      setDestination('');
    } catch (err) {
      console.error('Erro no saque:', err);
      showNotification({ 
        message: err.response?.data?.message || 'Falha ao processar saque', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-primary relative overflow-hidden">
      {/* Elementos flutuantes de fundo */}
      <FloatingElement delay={0} x={10} y={20} duration={25}>
        <DollarSign size={80} className="text-yellow-500" />
      </FloatingElement>
      <FloatingElement delay={2} x={80} y={60} duration={30}>
        <TrendingDown size={60} className="text-yellow-400" />
      </FloatingElement>
      <FloatingElement delay={4} x={70} y={10} duration={28}>
        <Wallet size={70} className="text-yellow-300" />
      </FloatingElement>
      <FloatingElement delay={1} x={15} y={70} duration={22}>
        <CreditCard size={50} className="text-yellow-600" />
      </FloatingElement>

      <div className="relative z-10 p-4 sm:p-6 pt-20 sm:pt-24">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header com animação */}
          <motion.div 
            className="flex items-center gap-4 mb-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div 
              className="p-4 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowDownCircle className="text-white" size={36} />
            </motion.div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-text-primary bg-gradient-to-r from-yellow-500 to-yellow-700 bg-clip-text text-transparent">
                Sacar Fundos
              </h1>
              <p className="text-sm sm:text-base text-text-secondary mt-1">
                Retire seus fundos de forma rápida, segura e instantânea
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulário Principal */}
            <motion.div 
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="bg-background-primary rounded-2xl shadow-2xl border border-border-primary overflow-hidden backdrop-blur-sm">
                <div className="p-6 sm:p-8 space-y-6">
                  {/* Valor do saque com animação */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="block text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                      <DollarSign size={18} className="text-brand-primary" />
                      Valor do saque
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center">
                        <motion.div 
                          className="h-full px-4 bg-background-secondary border-r border-border-primary rounded-l-xl flex items-center text-text-primary font-bold text-lg"
                          whileHover={{ scale: 1.02 }}
                        >
                          <span>{selectedCurrency.symbol}</span>
                        </motion.div>
                      </div>
                      <input
                        type="text"
                        className="w-full pl-20 pr-4 py-4 rounded-xl border-2 border-border-primary bg-background-secondary text-text-primary text-lg font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all group-hover:border-yellow-300"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                      <motion.div 
                        className="absolute inset-0 rounded-xl pointer-events-none"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        style={{
                          background: 'linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.05), transparent)',
                        }}
                      />
                    </div>
                  </motion.div>
            
                  {/* Seleção de moeda com animação */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label className="block text-sm font-semibold text-text-primary mb-3">
                      Selecione a moeda
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {availableCurrencies.map((currency, idx) => (
                        <motion.button
                          key={currency.id}
                          className={`relative p-4 rounded-xl border-2 transition-all ${
                            selectedCurrency.id === currency.id
                              ? 'border-yellow-500 bg-yellow-500 bg-opacity-10 shadow-lg'
                              : 'border-border-primary bg-background-secondary hover:border-yellow-300 hover:bg-background-tertiary'
                          }`}
                          onClick={() => setSelectedCurrency(currency)}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + idx * 0.1 }}
                        >
                          {selectedCurrency.id === currency.id && (
                            <motion.div
                              className="absolute top-2 right-2"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.25, ease: 'easeOut' }}
                            >
                              <Check size={16} className="text-yellow-500" />
                            </motion.div>
                          )}
                          <div className="flex flex-col items-center">
                            <span className="text-2xl font-bold text-text-primary">{currency.symbol}</span>
                            <span className="text-xs text-text-secondary mt-1">{currency.id}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Destino do saque */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <label className="block text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                      <Lock size={18} className="text-brand-primary" />
                      Destino (conta bancária ou cartão)
                    </label>
                    <div className="relative group">
                      <input
                        type="text"
                        className="w-full px-4 py-4 rounded-xl border-2 border-border-primary bg-background-secondary text-text-primary focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all group-hover:border-yellow-300"
                        placeholder="Número da conta, IBAN ou informações do cartão"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                      />
                      <Shield size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-yellow-500 transition-colors" />
                    </div>
                  </motion.div>
            
                  {/* Método de pagamento */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <label className="block text-sm font-semibold text-text-primary mb-3">
                      Método de Saque
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {paymentMethods.map((method, idx) => (
                        <motion.button
                          key={method.id}
                          className={`relative p-4 rounded-xl border-2 transition-all ${
                            paymentMethod.id === method.id
                              ? 'border-yellow-500 bg-yellow-500 bg-opacity-10 shadow-lg'
                              : 'border-border-primary bg-background-secondary hover:border-yellow-300 hover:bg-background-tertiary'
                          }`}
                          onClick={() => setPaymentMethod(method)}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + idx * 0.1 }}
                        >
                          {paymentMethod.id === method.id && (
                            <motion.div
                              className="absolute top-2 right-2"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.25, ease: 'easeOut' }}
                            >
                              <Check size={16} className="text-yellow-500" />
                            </motion.div>
                          )}
                          <div className="flex flex-col items-center gap-2">
                            <method.icon size={28} className={paymentMethod.id === method.id ? "text-yellow-500" : "text-text-secondary"} />
                            <span className="text-sm font-medium text-text-primary">{method.name}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
            
                  {/* Botão de saque com animação */}
                  <motion.div 
                    className="pt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(245, 158, 11, 0.3)" }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl font-bold text-lg shadow-xl transition-all ${
                        isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:from-yellow-600 hover:to-yellow-700'
                      }`}
                      onClick={handleWithdraw}
                      disabled={isLoading}
                    >
                      <span className="flex items-center justify-center gap-2">
                        {isLoading ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Clock size={20} />
                            </motion.div>
                            Processando...
                          </>
                        ) : (
                          <>
                            <ArrowDownCircle size={20} />
                            Solicitar Saque
                          </>
                        )}
                      </span>
                    </motion.button>
                  </motion.div>
            
                  {/* Aviso informativo */}
                  <motion.div 
                    className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <AlertCircle size={20} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Este é um saque simulado para demonstração. Nenhum valor real será transferido.
                      Seu saldo será atualizado instantaneamente para fins de teste.
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Painel lateral de informações */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* Saldo disponível */}
              <motion.div 
                className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-2xl shadow-2xl text-white"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold opacity-90">Saldo Disponível</h3>
                  <Wallet size={24} className="opacity-80" />
                </div>
                <motion.p 
                  className="text-4xl font-bold"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.45, ease: 'easeOut' }}
                >
                  {selectedCurrency.symbol}{currentBalance.toFixed(2)}
                </motion.p>
                <p className="text-sm opacity-75 mt-2">Valor total disponível para saque</p>
              </motion.div>

              {/* Detalhes da transação */}
              <motion.div 
                className="bg-background-primary border border-border-primary rounded-2xl p-6 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h3 className="text-lg font-bold text-text-primary mb-4">Detalhes da Transação</h3>
                <div className="space-y-4">
                  <motion.div 
                    className="flex items-center justify-between py-3 border-b border-border-secondary"
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex items-center gap-2 text-text-secondary">
                      <DollarSign size={18} />
                      <span className="text-sm">Taxa</span>
                    </div>
                    <span className="text-sm font-semibold text-green-500">Grátis</span>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-center justify-between py-3 border-b border-border-secondary"
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex items-center gap-2 text-text-secondary">
                      <Clock size={18} />
                      <span className="text-sm">Tempo</span>
                    </div>
                    <span className="text-sm font-semibold text-blue-500">Instantâneo</span>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-center justify-between py-3"
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex items-center gap-2 text-text-secondary">
                      <Shield size={18} />
                      <span className="text-sm">Segurança</span>
                    </div>
                    <span className="text-sm font-semibold text-purple-500">Máxima</span>
                  </motion.div>
                </div>
              </motion.div>

              {/* Dicas de segurança */}
              <motion.div 
                className="bg-background-primary border border-border-primary rounded-2xl p-6 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Shield size={20} className="text-green-500" />
                  Dicas de Segurança
                </h3>
                <ul className="space-y-3 text-sm text-text-secondary">
                  <motion.li 
                    className="flex items-start gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Verifique sempre os dados da conta de destino</span>
                  </motion.li>
                  <motion.li 
                    className="flex items-start gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0 }}
                  >
                    <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Utilize redes seguras para realizar transações</span>
                  </motion.li>
                  <motion.li 
                    className="flex items-start gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1 }}
                  >
                    <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Mantenha suas credenciais em segredo</span>
                  </motion.li>
                </ul>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
