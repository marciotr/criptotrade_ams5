import React from 'react';
import { motion } from 'framer-motion';
import { Eye, ArrowUp, ArrowDown } from 'lucide-react';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative max-w-5xl w-full bg-background-primary rounded-2xl p-8 z-10 shadow-2xl border border-border-primary"
      >
        <div className="flex items-start justify-between pb-3 mb-4">
          <h3 className="text-xl font-bold text-text-primary">Lotes - {lots?.assetSymbol ?? ''}</h3>
          <button onClick={onClose} className="px-3 py-1 rounded bg-background-secondary text-text-secondary hover:bg-background-tertiary hover:text-text-primary">Fechar</button>
        </div>

        {loading && <div className="py-6 text-center text-text-secondary">Carregando...</div>}
        {error && <div className="py-4 text-feedback-error">{error}</div>}

        {!loading && !error && (!lots || !lots.lots || lots.lots.length === 0) && (
          <div className="py-6 text-center text-text-secondary">Nenhum lote disponível para este ativo.</div>
        )}

        {!loading && !error && lots && (
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
                {lots.lots.map((lot) => (
                  <tr key={lot.lotTransactionId} className="bg-background-primary border border-border-primary rounded-lg mb-2">
                    <td className="py-3 px-2 text-text-primary w-[220px]">{new Date(lot.acquiredAt).toLocaleString()}</td>
                    <td className="py-3 text-text-primary">{formatAmount8Safe(lot.amountBought)}</td>
                    <td className="py-3 text-text-primary">{formatAmount8Safe(lot.amountRemaining)}</td>
                    <td className="py-3 text-text-primary">{formatCurrencySafe(lot.unitPriceUsd)}</td>
                    <td className="py-3 text-text-primary">{formatCurrencySafe(lot.totalCostUsd)}</td>
                    <td className={`py-3 ${lot.unrealizedGainUsd > 0 ? 'text-feedback-success' : lot.unrealizedGainUsd < 0 ? 'text-feedback-error' : 'text-text-secondary'}`}>
                      {formatCurrencySafe(lot.unrealizedGainUsd)}
                    </td>
                    <td className={`py-3 ${lot.realizedGainUsd > 0 ? 'text-feedback-success' : lot.realizedGainUsd < 0 ? 'text-feedback-error' : 'text-text-secondary'}`}>
                      {formatCurrencySafe(lot.realizedGainUsd)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 text-right text-sm">
              <div className="text-text-secondary">Total Não Realizado: <span className="text-text-primary font-medium">{formatCurrencySafe(lots.totalUnrealizedGainUsd)}</span></div>
              <div className="text-text-secondary">Total Realizado: <span className="text-text-primary font-medium">{formatCurrencySafe(lots.totalRealizedGainUsd)}</span></div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
