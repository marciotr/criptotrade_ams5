import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, X } from 'lucide-react';
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
  formatCurrency
}) {
  if (!isOpen) return null;

  const formatCurrencySafe = formatCurrency || ((v) => `$${Number(v ?? 0).toFixed(2)}`);

  const headerColor = useMemo(() => {
    const ch = asset?.change ?? 0;
    return ch >= 0 ? 'bg-green-500/10 border-green-200' : 'bg-red-500/10 border-red-200';
  }, [asset]);

  const maxAmount = asset?.amount ?? 0;
  const currentPrice = asset?.currentPrice ?? asset?.price ?? 0;
  const parsedAmount = Number(amount ?? 0) || 0;
  const estimated = parsedAmount * currentPrice;

  const quickFill = (percent) => {
    if (percent === 100) {
      onChangeAmount?.(String(Number((maxAmount || 0).toFixed(8))));
      return;
    }

    const val = ((maxAmount || 0) * percent) / 100;
    onChangeAmount?.(String(Number(val.toFixed(8))));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative max-w-md w-full bg-background-primary rounded-2xl p-6 z-10 shadow-2xl border border-border-primary"
      >
        <div className={`flex items-center justify-between mb-4 p-2 rounded ${headerColor} border`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-background-secondary flex items-center justify-center">
              <CryptoIcon symbol={asset?.symbol} size={22} />
            </div>
            <div>
              <div className="text-sm font-semibold text-text-primary">Vender {asset?.asset ?? asset?.symbol}</div>
              <div className="text-xs text-text-tertiary">{asset?.symbol} • Disponível: {Number(maxAmount).toFixed(8)}</div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Fechar" title="Fechar" className="p-2 rounded bg-background-secondary text-text-secondary hover:bg-background-tertiary">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <label className="text-xs text-text-tertiary">Quantidade</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              step="any"
              min="0"
              max={maxAmount}
              value={amount}
              onChange={(e) => onChangeAmount?.(e.target.value)}
              className="flex-1 p-3 rounded-lg bg-background-secondary border border-border-primary text-text-primary"
              placeholder="0.00000000"
            />
            <div className="flex space-x-1">
              {[25,50,100].map(p => (
                <button key={p} onClick={() => quickFill(p)} className="px-3 py-2 rounded-lg bg-background-secondary text-text-secondary hover:bg-background-tertiary text-sm">{p}%</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm text-text-tertiary">
            <div>Preço atual</div>
            <div className="text-text-primary font-medium text-right">{formatCurrencySafe(currentPrice)}</div>
            <div>Estimativa de recebimento</div>
            <div className="text-text-primary font-medium text-right">{formatCurrencySafe(estimated)}</div>
          </div>

          {error && <div className="text-feedback-error text-sm">{error}</div>}

          <div className="flex space-x-2 mt-4">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg bg-background-secondary text-text-secondary hover:bg-background-tertiary"
            >
              Cancelar
            </button>

            <button
              onClick={() => onConfirm?.(Math.min(parsedAmount, Number(maxAmount || 0)))}
              disabled={loading || parsedAmount <= 0}
              className="flex-1 py-2 rounded-lg bg-amber-500 text-white hover:opacity-95 disabled:opacity-50"
            >
              {loading ? 'Processando...' : `Vender ${asset?.symbol}`}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
