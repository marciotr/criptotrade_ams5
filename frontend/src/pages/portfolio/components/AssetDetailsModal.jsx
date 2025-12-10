import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, X, TrendingUp, Package, Calendar, Coins, DollarSign, PieChart } from 'lucide-react';
import CryptoIcon from '../../../components/common/CryptoIcons';

export default function AssetDetailsModal({
  isOpen,
  onClose,
  lots,
  loading,
  error,
  formatCurrency,
  formatAmount8
}) {
  if (!isOpen) return null;

  const formatCurrencySafe = formatCurrency || ((v) => `$${Number(v ?? 0).toFixed(2)}`);
  const formatAmount8Safe = formatAmount8 || ((v) => (Number(v ?? 0) || 0).toFixed(8));

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
            className="relative max-w-5xl w-full max-h-[90vh] bg-gradient-to-br from-background-primary via-background-primary to-background-secondary rounded-2xl z-10 shadow-2xl border border-border-primary overflow-hidden flex flex-col"
          >
            {/* Floating decoration elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-gray-500/5 to-gray-700/5 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-gray-600/5 to-gray-800/5 rounded-full blur-3xl -z-10" />
            {/* Header com gradiente */}
            <div className="relative p-6 pb-5 bg-gradient-to-r from-gray-800/30 via-gray-900/20 to-gray-800/30 border-b border-border-primary">
              <button 
                onClick={onClose} 
                aria-label="Fechar" 
                className="absolute top-4 right-4 p-2 rounded-lg bg-background-secondary/80 backdrop-blur-sm text-text-secondary hover:bg-background-tertiary hover:text-text-primary transition-all z-10"
              >
                <X size={18} />
              </button>

              <div className="flex items-start gap-6">
                {/* Ícone da moeda */}
                <motion.div 
                  className="relative"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center shadow-lg border border-border-primary">
                    <CryptoIcon symbol={lots?.assetSymbol ?? ''} size={40} />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center shadow-md border border-border-primary">
                    <Package size={16} className="text-white" />
                  </div>
                </motion.div>

                {/* Informações principais */}
                <div className="flex-1">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h3 className="text-2xl font-bold text-text-primary mb-1">
                      Detalhes de Lotes - {lots?.asset ?? lots?.assetSymbol ?? 'Ativo'}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-text-tertiary">
                      <span className="px-2.5 py-1 rounded-full bg-background-secondary/80 border border-border-primary font-medium">
                        {lots?.assetSymbol ?? ''}
                      </span>
                      <span>•</span>
                      <span>{lots?.lots?.length ?? 0} lote(s)</span>
                    </div>
                  </motion.div>

                  {/* Cards de resumo */}
                  {lots && (
                    <motion.div 
                      className="grid grid-cols-3 gap-3 mt-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="p-3 rounded-xl bg-background-secondary/60 backdrop-blur-sm border border-border-primary">
                        <div className="flex items-center space-x-2 text-text-tertiary text-xs mb-1">
                          <Coins size={14} />
                          <span>Quantidade Total</span>
                        </div>
                        <div className="text-text-primary font-bold text-lg">
                          {formatAmount8Safe(lots.totalAmount ?? lots.total ?? 0)}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-background-secondary/60 backdrop-blur-sm border border-border-primary">
                        <div className="flex items-center space-x-2 text-text-tertiary text-xs mb-1">
                          <DollarSign size={14} />
                          <span>Valor Atual</span>
                        </div>
                        <div className="text-text-primary font-bold text-lg">
                          {formatCurrencySafe(lots.currentValueUsd ?? lots.currentValue ?? 0)}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-gradient-to-br from-background-secondary/60 to-background-tertiary/40 backdrop-blur-sm border border-border-primary">
                        <div className="flex items-center space-x-2 text-text-tertiary text-xs mb-1">
                          <TrendingUp size={14} />
                          <span>Ganho Não Realizado</span>
                        </div>
                        <div
                          className={`font-bold text-lg flex items-center ${
                            (lots.totalUnrealizedGainUsd ?? 0) > 0
                              ? 'text-emerald-400'
                              : (lots.totalUnrealizedGainUsd ?? 0) < 0
                              ? 'text-red-400'
                              : 'text-text-primary'
                          }`}
                        >
                          {(lots.totalUnrealizedGainUsd ?? 0) > 0 && <ArrowUp size={18} className="mr-1" />}
                          {(lots.totalUnrealizedGainUsd ?? 0) < 0 && <ArrowDown size={18} className="mr-1" />}
                          {formatCurrencySafe(lots.totalUnrealizedGainUsd ?? 0)}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Conteúdo scrollável */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {loading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <motion.div
                    className="w-12 h-12 border-4 border-brand-primary/30 border-t-brand-primary rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <p className="mt-4 text-text-secondary">Carregando lotes...</p>
                </div>
              )}

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-xl bg-red-500/10 border border-red-400/30"
                >
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </motion.div>
              )}

              {!loading && !error && (!lots || !lots.lots || lots.lots.length === 0) && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 rounded-full bg-background-secondary/50 flex items-center justify-center mb-4">
                    <Package size={32} className="text-text-tertiary" />
                  </div>
                  <p className="text-text-secondary text-center">Nenhum lote disponível para este ativo.</p>
                </div>
              )}

              {!loading && !error && lots && lots.lots && lots.lots.length > 0 && (
                <div className="space-y-3">
                  {lots.lots.map((lot, idx) => {
                    const gainPercent = lot.unitPriceUsd > 0 
                      ? ((lot.unrealizedGainUsd / (lot.amountRemaining * lot.unitPriceUsd)) * 100) 
                      : 0;

                    return (
                      <motion.div
                        key={lot.lotTransactionId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-5 rounded-xl bg-gradient-to-br from-background-secondary/80 to-background-tertiary/40 border border-border-primary hover:border-border-secondary transition-all shadow-sm hover:shadow-md"
                      >
                        {/* Header do lote */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-700/30 to-gray-800/30 border border-border-primary flex items-center justify-center">
                              <Calendar size={20} className="text-gray-400" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-text-primary">
                                Lote #{idx + 1}
                              </div>
                              <div className="text-xs text-text-tertiary">
                                {new Date(lot.acquiredAt).toLocaleDateString('pt-BR', { 
                                  day: '2-digit', 
                                  month: 'short', 
                                  year: 'numeric',
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Badge de performance */}
                          <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1 ${
                            lot.unrealizedGainUsd > 0
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : lot.unrealizedGainUsd < 0
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-background-tertiary text-text-tertiary border border-border-primary'
                          }`}>
                            {lot.unrealizedGainUsd > 0 && <ArrowUp size={14} />}
                            {lot.unrealizedGainUsd < 0 && <ArrowDown size={14} />}
                            <span>{gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%</span>
                          </div>
                        </div>

                        {/* Grid de informações */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <div className="text-xs text-text-tertiary mb-1">Quantidade Comprada</div>
                            <div className="text-sm font-bold text-text-primary">
                              {formatAmount8Safe(lot.amountBought)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-text-tertiary mb-1">Quantidade Restante</div>
                            <div className="text-sm font-bold text-text-primary">
                              {formatAmount8Safe(lot.amountRemaining)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-text-tertiary mb-1">Preço Unit. (USD)</div>
                            <div className="text-sm font-bold text-text-primary">
                              {formatCurrencySafe(lot.unitPriceUsd)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-text-tertiary mb-1">Custo Total (USD)</div>
                            <div className="text-sm font-bold text-text-primary">
                              {formatCurrencySafe(lot.totalCostUsd)}
                            </div>
                          </div>
                        </div>

                        {/* Footer com ganhos */}
                        <div className="pt-4 border-t border-border-primary/50 grid grid-cols-2 gap-4">
                          <div className="p-3 rounded-lg bg-background-primary/50">
                            <div className="text-xs text-text-tertiary mb-1">Ganho Não Realizado</div>
                            <div className={`text-base font-bold flex items-center ${
                              lot.unrealizedGainUsd > 0 
                                ? 'text-emerald-400' 
                                : lot.unrealizedGainUsd < 0 
                                ? 'text-red-400' 
                                : 'text-text-primary'
                            }`}>
                              {lot.unrealizedGainUsd > 0 && <ArrowUp size={16} className="mr-1" />}
                              {lot.unrealizedGainUsd < 0 && <ArrowDown size={16} className="mr-1" />}
                              {formatCurrencySafe(lot.unrealizedGainUsd)}
                            </div>
                          </div>
                          <div className="p-3 rounded-lg bg-background-primary/50">
                            <div className="text-xs text-text-tertiary mb-1">Ganho Realizado</div>
                            <div className={`text-base font-bold flex items-center ${
                              lot.realizedGainUsd > 0 
                                ? 'text-emerald-400' 
                                : lot.realizedGainUsd < 0 
                                ? 'text-red-400' 
                                : 'text-text-primary'
                            }`}>
                              {lot.realizedGainUsd > 0 && <ArrowUp size={16} className="mr-1" />}
                              {lot.realizedGainUsd < 0 && <ArrowDown size={16} className="mr-1" />}
                              {formatCurrencySafe(lot.realizedGainUsd)}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Card de resumo final */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: lots.lots.length * 0.05 + 0.1 }}
                    className="mt-6 p-5 rounded-xl bg-gradient-to-br from-gray-700/20 to-gray-800/20 border-2 border-border-primary"
                  >
                    <div className="flex items-center space-x-2 mb-4">
                      <PieChart size={20} className="text-gray-400" />
                      <h4 className="text-sm font-bold text-text-primary">Resumo Total dos Lotes</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-text-tertiary mb-1">Total Não Realizado</div>
                        <div className={`text-lg font-bold ${
                          (lots.totalUnrealizedGainUsd ?? 0) > 0
                            ? 'text-emerald-400'
                            : (lots.totalUnrealizedGainUsd ?? 0) < 0
                            ? 'text-red-400'
                            : 'text-text-primary'
                        }`}>
                          {formatCurrencySafe(lots.totalUnrealizedGainUsd)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-text-tertiary mb-1">Total Realizado</div>
                        <div className={`text-lg font-bold ${
                          (lots.totalRealizedGainUsd ?? 0) > 0
                            ? 'text-emerald-400'
                            : (lots.totalRealizedGainUsd ?? 0) < 0
                            ? 'text-red-400'
                            : 'text-text-primary'
                        }`}>
                          {formatCurrencySafe(lots.totalRealizedGainUsd)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
