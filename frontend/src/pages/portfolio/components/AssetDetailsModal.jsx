import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, X } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative max-w-4xl w-full bg-background-primary rounded-2xl p-6 z-10 shadow-2xl border border-border-primary"
      >
        {/* Cabeçalho com ícone à esquerda e informações à direita */}
        <div className="flex items-start justify-between mb-4 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 rounded-2xl bg-background-secondary flex items-center justify-center shadow-inner">
              <CryptoIcon symbol={lots?.assetSymbol ?? ''} size={26} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-text-primary leading-tight">
                {lots?.asset ?? lots?.assetSymbol ?? 'Ativo'}
              </h3>
              <div className="text-xs text-text-tertiary uppercase tracking-wide mt-1">
                {lots?.assetSymbol ?? ''}
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-end space-x-6">
            {lots && (
              <div className="grid grid-cols-3 gap-4 text-right text-xs md:text-sm">
                <div>
                  <div className="text-text-tertiary">Quantidade Total</div>
                  <div className="text-text-primary font-semibold mt-1">
                    {formatAmount8Safe(lots.totalAmount ?? lots.total ?? 0)}
                  </div>
                </div>
                <div>
                  <div className="text-text-tertiary">Valor Atual (USD)</div>
                  <div className="text-text-primary font-semibold mt-1">
                    {formatCurrencySafe(lots.currentValueUsd ?? lots.currentValue ?? 0)}
                  </div>
                </div>
                <div>
                  <div className="text-text-tertiary">Ganho Não Realizado</div>
                  <div
                    className={`font-semibold mt-1 ${
                      (lots.totalUnrealizedGainUsd ?? 0) > 0
                        ? 'text-feedback-success'
                        : (lots.totalUnrealizedGainUsd ?? 0) < 0
                        ? 'text-feedback-error'
                        : 'text-text-primary'
                    }`}
                  >
                    {formatCurrencySafe(lots.totalUnrealizedGainUsd ?? 0)}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              aria-label="Fechar"
              title="Fechar"
              className="p-2 rounded-full bg-background-secondary text-text-secondary hover:bg-background-tertiary flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {loading && <div className="py-6 text-center text-text-secondary">Carregando...</div>}
        {error && <div className="py-4 text-feedback-error">{error}</div>}

        {!loading && !error && (!lots || !lots.lots || lots.lots.length === 0) && (
          <div className="py-6 text-center text-text-secondary">Nenhum lote disponível para este ativo.</div>
        )}

        {!loading && !error && lots && (
          <div className="space-y-4 max-h-[65vh] overflow-auto mt-2">
            {/* Lista de Lotes como cards */}
            <div className="grid grid-cols-1 gap-3">
              {lots.lots.map((lot) => (
                <div key={lot.lotTransactionId} className="p-4 bg-background-secondary border border-border-primary rounded-lg flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-text-tertiary">Compra</div>
                      <div className="text-xs text-text-secondary">{new Date(lot.acquiredAt).toLocaleString()}</div>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
                      <div>
                        <div className="text-xs text-text-tertiary">Quantidade</div>
                        <div className="text-text-primary font-medium">{formatAmount8Safe(lot.amountBought)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-text-tertiary">Restante</div>
                        <div className="text-text-primary font-medium">{formatAmount8Safe(lot.amountRemaining)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-text-tertiary">Preço Unit. (USD)</div>
                        <div className="text-text-primary font-medium">{formatCurrencySafe(lot.unitPriceUsd)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-text-tertiary">Custo Total (USD)</div>
                        <div className="text-text-primary font-medium">{formatCurrencySafe(lot.totalCostUsd)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 md:mt-0 md:ml-4 w-full md:w-56">
                    <div className="text-xs text-text-tertiary">Ganho Não Realizado</div>
                    <div className="flex items-center justify-between">
                      <div className={`font-medium ${lot.unrealizedGainUsd > 0 ? 'text-feedback-success' : lot.unrealizedGainUsd < 0 ? 'text-feedback-error' : 'text-text-primary'}`}>
                        {lot.unrealizedGainUsd > 0 && <ArrowUp size={14} className="inline-block mr-1 text-feedback-success" />}
                        {lot.unrealizedGainUsd < 0 && <ArrowDown size={14} className="inline-block mr-1 text-feedback-error" />}
                        {formatCurrencySafe(lot.unrealizedGainUsd)}
                      </div>
                    </div>

                    <div className="text-xs text-text-tertiary mt-2">Ganho Realizado</div>
                    <div className={`font-medium ${lot.realizedGainUsd > 0 ? 'text-feedback-success' : lot.realizedGainUsd < 0 ? 'text-feedback-error' : 'text-text-primary'}`}>{formatCurrencySafe(lot.realizedGainUsd)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-right text-xs md:text-sm">
              <div className="text-text-secondary">
                Total Não Realizado:{' '}
                <span className="text-text-primary font-medium">
                  {formatCurrencySafe(lots.totalUnrealizedGainUsd)}
                </span>
              </div>
              <div className="text-text-secondary mt-1">
                Total Realizado:{' '}
                <span className="text-text-primary font-medium">
                  {formatCurrencySafe(lots.totalRealizedGainUsd)}
                </span>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
