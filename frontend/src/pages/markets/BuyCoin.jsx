import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader } from 'lucide-react';
import { currencyApi, walletApi } from '../../services/api/api';
import CryptoIcon from '../../components/common/CryptoIcons';

const BuyCoin = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [amount, setAmount] = useState('');
  const [loadingBuy, setLoadingBuy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const baseSymbol = useMemo(
    () => (symbol || '').replace('USDT', '').toUpperCase(),
    [symbol]
  );

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

  return (
    <div className="min-h-screen bg-background flex justify-center items-start py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-background-primary border border-border-primary rounded-2xl shadow-lg p-6 relative z-10"
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-text-secondary mb-4 hover:text-text-primary"
        >
          <ArrowLeft size={18} className="mr-1" /> Voltar
        </button>

        <div className="flex items-center mb-4">
          <div className="p-3 rounded-full bg-background-secondary mr-3">
            <CryptoIcon symbol={symbol} size={32} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Comprar {baseSymbol}</h1>
            <p className="text-sm text-text-secondary">Par: {symbol}</p>
          </div>
        </div>

        <div className="mb-4">
          {isChecking ? (
            <div className="flex items-center text-sm text-text-secondary">
              <Loader size={16} className="mr-2 animate-spin" />
              Verificando disponibilidade da moeda...
            </div>
          ) : isAvailable ? (
            <p className="text-sm text-green-500">
              Esta moeda está disponível no nosso banco. Você pode comprar.
            </p>
          ) : (
            <p className="text-sm text-red-500">
              Esta moeda NÃO está disponível no nosso banco. Não é possível comprar.
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm text-text-secondary mb-1">
            Quantidade de {baseSymbol}
          </label>
          <input
            type="number"
            min="0"
            step="0.00000001"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border-primary bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
            placeholder="0.00"
          />
        </div>

        {error && (
          <div className="mb-3 text-sm text-red-500 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-3 text-sm text-green-500 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
            {success}
          </div>
        )}

        <motion.button
          whileHover={isAvailable && !loadingBuy ? { scale: 1.02 } : {}}
          whileTap={isAvailable && !loadingBuy ? { scale: 0.97 } : {}}
          onClick={handleBuy}
          disabled={!isAvailable || loadingBuy || isChecking}
          className={`w-full py-3 mt-2 rounded-lg font-semibold transition-colors ${
            !isAvailable || isChecking
              ? 'bg-gray-500 cursor-not-allowed text-white'
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
  );
};

export default BuyCoin;
