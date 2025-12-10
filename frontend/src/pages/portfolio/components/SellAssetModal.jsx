import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, X, TrendingDown, Wallet, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import CryptoIcon from '../../../components/common/CryptoIcons';

export default function SellAssetModal({
  isOpen,
  onClose,
  asset,
  amount,
  onChangeAmount,
  onConfirm,
  loading,
  error,
  formatCurrency,
  lots
}) {
  if (!isOpen) return null;

  const formatCurrencySafe = formatCurrency || ((v) => `$${Number(v ?? 0).toFixed(2)}`);

  const maxAmount = asset?.amount ?? 0;
  const currentPrice = asset?.currentPrice ?? asset?.price ?? 0;
  const parsedAmount = Number(amount ?? 0) || 0;
  const estimated = parsedAmount * currentPrice;

  const isBaseCurrency = ((asset?.symbol || asset?.asset || '') + '').toUpperCase() === 'USD';

  const [selectedLotId, setSelectedLotId] = useState(null);

  useEffect(() => {
    if (Array.isArray(lots?.lots) && lots.lots.length === 1) {
      setSelectedLotId(lots.lots[0].lotTransactionId ?? lots.lots[0].lotId ?? null);
      onChangeAmount?.(String(Number((lots.lots[0].amountRemaining || lots.lots[0].amountBought || 0).toFixed(8))));
    } else {
      setSelectedLotId(null);
    }
  }, [lots, onChangeAmount]);

  // Obter a quantidade disponível baseada no lote selecionado
  const getAvailableAmount = () => {
    if (selectedLotId === null) {
      return maxAmount || 0;
    }
    
    const selectedLot = lots?.lots?.find(l => 
      (l.lotTransactionId ?? l.lotId ?? l.id) === selectedLotId
    );
    
    if (selectedLot) {
      return Number(selectedLot.amountRemaining ?? selectedLot.amountBought ?? 0);
    }
    
    return maxAmount || 0;
  };

  const quickFill = (percent) => {
    const availableAmount = getAvailableAmount();
    
    // Para 100%, usar o valor exato sem arredondamento
    if (percent === 100) {
      onChangeAmount?.(String(availableAmount));
    } else {
      const val = (availableAmount * percent) / 100;
      onChangeAmount?.(String(Number(val.toFixed(8))));
    }
  };

  // Calcular qual porcentagem está selecionada
  const getActivePercentage = () => {
    if (!maxAmount || maxAmount === 0) return null;
    const percentage = (parsedAmount / maxAmount) * 100;
    if (Math.abs(percentage - 25) < 1) return 25;
    if (Math.abs(percentage - 50) < 1) return 50;
    if (Math.abs(percentage - 75) < 1) return 75;
    if (Math.abs(percentage - 100) < 1) return 100;
    return null;
  };

  const activePercentage = getActivePercentage();

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      y: 20
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={onClose}
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          />

          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative max-w-lg w-full max-h-[90vh] bg-gradient-to-br from-background-primary via-background-primary to-background-secondary rounded-2xl z-10 shadow-2xl border border-border-primary overflow-hidden flex flex-col"
          >
            {/* Floating decoration elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-gray-500/5 to-gray-700/5 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-gray-600/5 to-gray-800/5 rounded-full blur-3xl -z-10" />

            {/* Header with gradient */}
            <div className="relative p-6 pb-4 bg-gradient-to-r from-gray-800/30 via-gray-900/20 to-gray-800/30 border-b border-border-primary">
              <button 
                onClick={onClose} 
                aria-label="Fechar" 
                className="absolute top-4 right-4 p-2 rounded-lg bg-background-secondary/80 backdrop-blur-sm text-text-secondary hover:bg-background-tertiary hover:text-text-primary transition-all"
              >
                <X size={18} />
              </button>

              <div className="flex items-center space-x-4">
                <motion.div 
                  className="relative"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center shadow-lg border border-border-primary">
                    <CryptoIcon symbol={asset?.symbol} size={32} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center shadow-md border border-border-primary">
                    <TrendingDown size={14} className="text-white" />
                  </div>
                </motion.div>

                <div className="flex-1">
                  <motion.h2 
                    className="text-xl font-bold text-text-primary"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    Vender {asset?.asset ?? asset?.symbol}
                  </motion.h2>
                  <motion.div 
                    className="flex items-center space-x-2 mt-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <span className="text-xs text-text-tertiary">{asset?.symbol}</span>
                    <span className="text-xs text-text-tertiary">•</span>
                    <div className="flex items-center space-x-1">
                      <Wallet size={12} className="text-text-tertiary" />
                      <span className="text-xs font-medium text-text-secondary">{Number(maxAmount).toFixed(8)}</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              {/* Lot Selection */}
              {lots && Array.isArray(lots.lots) && lots.lots.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="text-sm font-semibold text-text-primary mb-4 block">
                    Selecionar Lote
                  </label>
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                    <motion.button
                      type="button"
                      onClick={() => { setSelectedLotId(null); onChangeAmount?.(String(Number((asset?.amount || 0).toFixed(8)))); }}
                      whileTap={{ scale: 0.99 }}
                      className={`w-full p-5 rounded-xl border-2 transition-all duration-200 ${
                        selectedLotId === null 
                          ? 'bg-gradient-to-r from-gray-700/30 to-gray-800/30 border-gray-600 shadow-lg shadow-gray-900/30' 
                          : 'bg-background-secondary/50 border-border-primary hover:border-border-secondary hover:bg-background-secondary'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {selectedLotId === null ? (
                            <CheckCircle2 size={20} className="text-gray-400" />
                          ) : (
                            <Circle size={20} className="text-text-tertiary" />
                          )}
                          <div className="text-left">
                            <div className="text-sm font-medium text-text-tertiary">Saldo Consolidado</div>
                            <div className="text-xs text-text-tertiary">Todos os lotes combinados</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-text-tertiary">{Number(asset?.amount || 0).toFixed(8)}</div>
                          <div className="text-xs text-text-tertiary">{asset?.symbol}</div>
                        </div>
                      </div>
                    </motion.button>

                    {lots.lots.map((l, idx) => {
                      const id = l.lotTransactionId ?? l.lotId ?? l.id ?? null;
                      const remaining = Number(l.amountRemaining ?? l.amountBought ?? 0) || 0;
                      const dateLabel = l.acquiredAt ? new Date(l.acquiredAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-';
                      const unitPrice = l.unitPriceUsd ?? l.unitPrice ?? 0;
                      const priceChange = currentPrice > 0 && unitPrice > 0 ? ((currentPrice - unitPrice) / unitPrice) * 100 : 0;
                      
                      return (
                        <motion.button
                          key={id || Math.random()}
                          type="button"
                          onClick={() => { setSelectedLotId(id); onChangeAmount?.(String(Number(remaining.toFixed(8)))); }}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.25 + (idx * 0.05) }}
                          whileTap={{ scale: 0.99 }}
                          
                          className={`w-full p-5 rounded-xl border-2 transition-all duration-200 ${
                            selectedLotId === id 
                              ? 'bg-gradient-to-r from-gray-700/30 to-gray-800/30 border-gray-600 shadow-lg shadow-gray-900/30' 
                              : 'bg-background-secondary/50 border-border-primary hover:border-border-secondary hover:bg-background-secondary'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              {selectedLotId === id ? (
                                <CheckCircle2 size={20} className="text-gray-400 mt-0.5" />
                              ) : (
                                <Circle size={20} className="text-text-tertiary mt-0.5" />
                              )}
                              <div className="text-left flex-1">
                                <div className="text-xs text-text-tertiary mb-1">{dateLabel}</div>
                                <div className="text-sm font-medium text-text-primary">
                                  {remaining.toFixed(8)} {asset?.symbol}
                                </div>
                                <div className="text-xs text-text-secondary mt-1">
                                  Compra: {formatCurrencySafe(unitPrice)}
                                </div>
                              </div>
                            </div>
                            <div className="text-right ml-2">
                              <div className={`text-xs font-medium px-2 py-1 rounded ${
                                priceChange >= 0 
                                  ? 'bg-green-500/20 text-green-600' 
                                  : 'bg-red-500/20 text-red-600'
                              }`}>
                                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Amount Input */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="text-sm font-semibold text-text-primary mb-4 block">
                  Quantidade
                </label>
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      max={maxAmount}
                      value={amount}
                      onChange={(e) => onChangeAmount?.(e.target.value)}
                      className="w-full p-4 pr-20 rounded-xl bg-background-secondary/50 backdrop-blur-sm border-2 border-border-primary text-text-tertiary text-lg font-medium focus:outline-none focus:border-gray-500 focus:ring-4 focus:ring-gray-500/20 transition-all disabled:opacity-50"
                      placeholder="0.00000000"
                      disabled={isBaseCurrency}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-text-tertiary">
                      {asset?.symbol}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {([25, 50, 75, 100].map((p, idx) => (
                      <motion.button
                        key={p}
                        onClick={() => quickFill(p)}
                        disabled={isBaseCurrency}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.35 + (idx * 0.05) }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${
                          activePercentage === p
                            ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow-md hover:shadow-lg border border-gray-600' 
                            : 'bg-background-secondary border border-border-primary text-text-secondary hover:bg-background-tertiary hover:border-gray-600'
                        }`}
                      >
                        {p}%
                      </motion.button>
                    )))}
                  </div>
                </div>
              </motion.div>

              {/* Price Summary */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-5 rounded-xl bg-gradient-to-br from-background-secondary to-background-tertiary border border-border-primary"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Preço Atual</span>
                    <span className="text-sm font-semibold text-text-primary">{formatCurrencySafe(currentPrice)}</span>
                  </div>
                  <div className="h-px bg-border-primary" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Você Receberá</span>
                    <div className="text-right">
                      <div className="text-lg font-bold text-text-primary">{formatCurrencySafe(estimated)}</div>
                      <div className="text-xs text-text-tertiary">≈ {parsedAmount.toFixed(8)} × {formatCurrencySafe(currentPrice)}</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Warning for USD */}
              {isBaseCurrency && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-xl bg-gradient-to-r from-gray-700/20 to-gray-800/20 border border-gray-600/50"
                >
                  <p className="text-sm text-gray-400 font-medium">
                    USD é a moeda base do sistema e não pode ser vendida.
                  </p>
                </motion.div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-xl bg-red-500/10 border border-red-400/30"
                >
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div 
                className="flex items-center space-x-4 pt-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <motion.button
                  onClick={onClose}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3.5 rounded-xl bg-background-secondary border-2 border-border-primary text-text-primary font-semibold hover:bg-background-tertiary hover:border-border-secondary transition-all"
                >
                  Cancelar
                </motion.button>

                <motion.button
                  onClick={() => onConfirm?.(Math.min(parsedAmount, Number(maxAmount || 0)), selectedLotId)}
                  disabled={loading || parsedAmount <= 0 || isBaseCurrency}
                  whileTap={{ scale: loading || parsedAmount <= 0 || isBaseCurrency ? 1 : 0.98 }}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-gray-700 to-gray-800 text-white font-bold shadow-lg hover:shadow-xl hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 border border-gray-600"
                >
                  {loading ? (
                    <>
                      <motion.div 
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>Processando...</span>
                    </>
                  ) : isBaseCurrency ? (
                    <span>Venda não permitida</span>
                  ) : (
                    <>
                      <span>Vender {asset?.symbol}</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
