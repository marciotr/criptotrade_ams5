import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Clock, Check, AlertCircle, ChevronRight } from 'lucide-react';
import { transactionApi, currencyApi } from '../../../services/api/api';
import CryptoIcon from '../../../components/common/CryptoIcons';

export const RecentTransactions = React.memo(() => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const mapTypeLabel = (raw) => {
    if (!raw) return 'Desconhecido';
    const t = String(raw).toLowerCase();
    if (t.includes('deposit') || t.includes('depósito') || t.includes('deposito')) return 'Depósito';
    if (t.includes('withdraw') || t.includes('saque')) return 'Saque';
    if (t.includes('buy') || t.includes('compra')) return 'Compra';
    if (t.includes('sell') || t.includes('venda')) return 'Venda';
    return String(raw).charAt(0).toUpperCase() + String(raw).slice(1);
  };

  const mapMethodLabel = (raw) => {
    if (!raw) return 'Desconhecido';
    const r = String(raw).toLowerCase();
    if (r.includes('card') || r.includes('cartao') || r.includes('cartão')) return 'Cartão de Crédito';
    if (r.includes('transfer') || r.includes('transferencia') || r.includes('transferência')) return 'Transferência';
    if (r.includes('paypal')) return 'PayPal';
    if (r.includes('crypto') || r.includes('cripto')) return 'Cripto';
    return String(raw).trim();
  };

  useEffect(() => {
    let mounted = true;
    const fetchRecent = async () => {
      setIsLoading(true);
      try {
        const res = await transactionApi.getAll();
        const data = Array.isArray(res.data) ? res.data : [];

        const mapped = data.map((tx, idx) => ({
          id: tx.id ?? tx.Id ?? tx.idTransaction ?? idx + 1,
          type: mapTypeLabel(tx.type ?? tx.Type ?? tx.transactionType),
          amount: Number(tx.totalAmount ?? tx.TotalAmount ?? tx.amount ?? tx.Amount ?? tx.value ?? 0),
          status: String(tx.status ?? tx.Status ?? 'completed').toLowerCase(),
          date: tx.createdAt ?? tx.createdAtUtc ?? tx.date ?? tx.Date ?? new Date().toISOString(),
          txId: tx.txId ?? tx.TxId ?? tx.idTransaction ?? tx.IdTransaction ?? tx.id ?? `tx_${Math.random().toString(36).slice(2,9)}`,
          method: mapMethodLabel(tx.method ?? tx.Method ?? tx.paymentMethod ?? 'Desconhecido'),
          currency: tx.currency ?? tx.Currency ?? tx.asset ?? tx.assetSymbol ?? 'USD',
          rawType: (tx.type ?? tx.Type ?? tx.transactionType ?? '').toString()
        }));

        if (!mounted) return;

        mapped.sort((a,b) => new Date(b.date) - new Date(a.date));

        const top = mapped.slice(0, 4);
        setTransactions(top);

        const likelyCryptoRegex = /buy|sell|swap|compra|venda/i;
        const toEnrich = top.filter(m => (
          (m.currency === 'USD' || !m.currency || m.currency === 'UNKNOWN') && likelyCryptoRegex.test(m.rawType)
        ));

        if (toEnrich.length > 0) {
          const promises = toEnrich.map(async (t) => {
            try {
              const detRes = await transactionApi.getById(t.id);
              const det = detRes?.data ?? {};
              const cripto = det?.cripto ?? det?.transactionCripto ?? det?.transactionCriptos ?? null;
              if (cripto) {
                const idCurrency = cripto.idCurrency ?? cripto.IdCurrency ?? null;
                if (idCurrency) {
                  try {
                    const cRes = await currencyApi.getCurrencyById(idCurrency);
                    const c = cRes?.data ?? null;
                    const symbol = c?.symbol ?? c?.Symbol ?? c?.name ?? c?.Name ?? null;
                    return { id: t.id, currency: symbol || c?.name || t.currency };
                  } catch (e) {
                    return { id: t.id, currency: t.currency };
                  }
                }
              }
              if (det?.currency) {
                const symbol = det.currency.symbol ?? det.currency.Symbol ?? det.currency.name ?? null;
                return { id: t.id, currency: symbol || t.currency };
              }
              return { id: t.id, currency: t.currency };
            } catch (e) {
              return { id: t.id, currency: t.currency };
            }
          });

          try {
            const results = await Promise.all(promises);
            if (!mounted) return;
            setTransactions(prev => prev.map(p => {
              const found = results.find(r => r.id === p.id);
              if (found && found.currency) return { ...p, currency: (found.currency || p.currency) };
              return p;
            }));
          } catch (e) {
          }
        }

      } catch (err) {
        console.error('Erro ao buscar transações no RecentTransactions', err);
        setTransactions([]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchRecent();
    return () => { mounted = false; };
  }, []);

  const recentTransactions = useMemo(() => transactions.slice(0,4), [transactions]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 lg:p-6 rounded-xl bg-background-primary border border-border-primary shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-text-primary">Transações Recentes</h2>
        <button className="text-sm text-brand-primary flex items-center hover:underline">
          Ver todas <ChevronRight size={16} />
        </button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-text-tertiary text-sm">Carregando...</div>
        ) : recentTransactions.length > 0 ? (
          recentTransactions.map((transaction) => {
            const status = String(transaction.status || '').toLowerCase();
            return (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (transaction.id || 0) * 0.02 }}
                className="p-3 rounded-lg border border-border-primary hover:border-brand-primary/30 transition-all bg-background-secondary/30 flex items-center justify-between"
              >
                {/* Ícone e tipo de transação */}
                <div className="flex items-center">
                  <div className={`p-2 rounded-full mr-3 ${
                    transaction.type === 'Deposit' || transaction.type === 'Depósito' ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}>
                    {transaction.type === 'Deposit' || transaction.type === 'Depósito' ? (
                      <ArrowUp className="text-feedback-success" size={16} />
                    ) : (
                      <ArrowDown className="text-feedback-error" size={16} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">
                      {transaction.type === 'Deposit' || transaction.type === 'Depósito' ? 'Depósito' : transaction.type === 'Withdrawal' || transaction.type === 'Saque' ? 'Saque' : transaction.type}
                    </p>
                    <p className="text-xs text-text-tertiary">{new Date(transaction.date).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Valor e moeda (ícone + nome) */}
                <div className="text-right">
                  <p className="font-semibold text-text-primary flex items-center justify-end space-x-2">
                    <span>R${transaction.amount.toLocaleString()}</span>
                    <span className="flex items-center text-text-tertiary text-sm">
                      <span className="w-5 h-5 mr-2 inline-flex items-center justify-center">
                        <CryptoIcon symbol={transaction.currency} size={18} />
                      </span>
                      <span className="truncate">{transaction.currency}</span>
                    </span>
                  </p>
                  <div className={`text-xs flex items-center justify-end ${
                    status === 'completed' ? 'text-feedback-success' : status === 'pending' ? 'text-feedback-warning' : 'text-feedback-error'
                  }`}>
                    {status === 'completed' ? (
                      <><Check size={12} className="mr-1" /> Concluído</>
                    ) : status === 'pending' ? (
                      <><Clock size={12} className="mr-1" /> Pendente</>
                    ) : (
                      <><AlertCircle size={12} className="mr-1" /> Falhou</>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-8 text-text-tertiary">
            <p>Nenhuma transação recente encontrada</p>
          </div>
        )}
      </div>
      
      {transactions.length > 0 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => navigate('/history')}
            className="text-sm text-brand-primary py-2 px-4 rounded-lg border border-border-primary hover:bg-background-secondary transition-colors"
          >
            Ver mais
          </button>
        </div>
      )}
    </motion.div>
  );
});

RecentTransactions.displayName = 'RecentTransactions';