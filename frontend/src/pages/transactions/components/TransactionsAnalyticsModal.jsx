import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart, Bar, PieChart as RechartsPC, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChevronRight } from 'lucide-react';

export default function TransactionsAnalyticsModal({ isOpen, onClose, data = [] }) {
  const [windowWidthModal, setWindowWidthModal] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  useEffect(() => {
    const handleResize = () => setWindowWidthModal(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isModalMobile = windowWidthModal < 640;
  const modalScaleLocal = useMemo(() => {
    if (windowWidthModal <= 1024) return 0.66;
    if (windowWidthModal <= 1280) return 0.70;
    if (windowWidthModal <= 1366) return 0.74;
    if (windowWidthModal <= 1440) return 0.88;
    return 1;
  }, [windowWidthModal]);

  const monthlyVolumeData = useMemo(() => {
    const months = { 'Jan': 'Jan','Feb': 'Fev','Mar': 'Mar','Apr': 'Abr','May': 'Mai','Jun': 'Jun','Jul': 'Jul','Aug': 'Ago','Sep': 'Set','Oct': 'Out','Nov': 'Nov','Dec': 'Dez' };
    const monthMap = {};
    data.forEach(tx => {
      const date = new Date(tx.date);
      const monthName = date.toLocaleString('en-US', { month: 'short' });
      const monthNamePt = months[monthName] || monthName;
      if (!monthMap[monthNamePt]) monthMap[monthNamePt] = { depositos: 0, saques: 0 };
      if (tx.type === 'Depósito') monthMap[monthNamePt].depositos += tx.amount;
      else monthMap[monthNamePt].saques += tx.amount;
    });
    return Object.keys(monthMap).map(month => ({ name: month, depositos: parseFloat(monthMap[month].depositos.toFixed(2)), saques: parseFloat(monthMap[month].saques.toFixed(2)) }));
  }, [data]);

  const transactionTypesData = useMemo(() => {
    const depositos = data.filter(tx => tx.type === 'Depósito').length;
    const saques = data.filter(tx => tx.type === 'Saque').length;
    return [ { name: 'Depósitos', value: depositos, color: '#10b981' }, { name: 'Saques', value: saques, color: '#ef4444' } ];
  }, [data]);

  const paymentMethodsData = useMemo(() => {
    const methods = {};
    data.forEach(tx => { methods[tx.method] = (methods[tx.method] || 0) + 1; });
    const colors = { 'Cartão de Crédito': '#60a5fa', 'Transferência Bancária': '#818cf8', 'PayPal': '#34d399', 'Cripto': '#f59e0b' };
    return Object.keys(methods).map(method => ({ name: method, value: methods[method], color: colors[method] || '#94a3b8' }));
  }, [data]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
          <motion.div initial={{ scale: modalScaleLocal * 0.9, opacity: 0, y: 20 }} animate={{ scale: isModalMobile ? 1 : modalScaleLocal, opacity: 1, y: 0 }} exit={{ scale: modalScaleLocal * 0.9, opacity: 0, y: 20 }} style={{ transformOrigin: 'center center', willChange: 'transform' }} className={isModalMobile ? 'bg-background-primary rounded-none shadow-none w-full h-full p-0 overflow-auto' : 'bg-background-primary rounded-xl shadow-xl w-full max-w-5xl p-3 sm:p-6 max-h-[90vh] overflow-y-auto'} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-text-primary">Análise de Transações</h3>
                <p className="opacity-80 text-xs sm:text-sm mt-1">Visão geral do seu histórico</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-background-secondary text-text-tertiary hover:text-text-primary transition-colors">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-6">
              <div className="bg-background-secondary p-3 sm:p-4 rounded-lg text-text-tertiary">
                <h4 className="text-xs sm:text-sm font-medium text-text-tertiary mb-2">Volume Mensal de Transações</h4>
                <div className="h-48 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyVolumeData} margin={{ top: 5, right: 5, left: 5, bottom: 15 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border-primary" />
                      <XAxis dataKey="name" tick={{ fill: 'currentColor' }} tickMargin={5} />
                      <YAxis tick={{ fill: 'currentColor' }} tickFormatter={(value) => `R$${value.toLocaleString()}`} />
                      <Tooltip
                        formatter={(value) => [`R$${value.toLocaleString()}`, undefined]}
                        contentStyle={{ backgroundColor: 'var(--background-primary)', borderColor: 'var(--border-primary)', fontSize: '12px', color: 'var(--text-tertiary)' }}
                        labelStyle={{ color: 'var(--text-tertiary)' }}
                        itemStyle={{ color: 'var(--text-tertiary)' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px', color: 'var(--text-tertiary)' }} />
                      <Bar dataKey="depositos" name="Depósitos" fill="#10b981" radius={[4,4,0,0]} />
                      <Bar dataKey="saques" name="Saques" fill="#ef4444" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-background-secondary p-3 sm:p-4 rounded-lg text-text-tertiary">
                  <h4 className="text-xs sm:text-sm font-medium text-text-tertiary mb-2">Tipos de Transações</h4>
                  <div className="h-40 sm:h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPC>
                        <Pie data={transactionTypesData} cx="50%" cy="50%" labelLine={false} outerRadius="70%" dataKey="value" nameKey="name" label={({ name, percent }) => (<text className="text-[8px] sm:text-xs" x={0} y={0} textAnchor="middle" fill="currentColor">{`${name}: ${(percent * 100).toFixed(0)}%`}</text>)}>
                          {transactionTypesData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${value} transações`, undefined]}
                          contentStyle={{ backgroundColor: 'var(--background-primary)', borderColor: 'var(--border-primary)', fontSize: '12px', color: 'var(--text-tertiary)' }}
                          labelStyle={{ color: 'var(--text-tertiary)' }}
                          itemStyle={{ color: 'var(--text-tertiary)' }}
                        />
                      </RechartsPC>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-background-secondary p-3 sm:p-4 rounded-lg text-text-tertiary">
                  <h4 className="text-xs sm:text-sm font-medium text-text-tertiary mb-2">Métodos de Pagamento</h4>
                  <div className="h-40 sm:h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPC>
                        <Pie data={paymentMethodsData} cx="50%" cy="50%" labelLine={false} outerRadius="70%" dataKey="value" nameKey="name" label={({ name, percent }) => (<text className="text-[8px] sm:text-xs" x={0} y={0} textAnchor="middle" fill="currentColor">{`${name.substring(0,5)}... ${(percent * 100).toFixed(0)}%`}</text>)}>
                          {paymentMethodsData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${value} transações`, undefined]}
                          contentStyle={{ backgroundColor: 'var(--background-primary)', borderColor: 'var(--border-primary)', fontSize: '12px', color: 'var(--text-tertiary)' }}
                          labelStyle={{ color: 'var(--text-tertiary)' }}
                          itemStyle={{ color: 'var(--text-tertiary)' }}
                        />
                      </RechartsPC>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-background-secondary p-3 sm:p-4 rounded-lg">
                <h4 className="text-xs font-medium text-text-tertiary mb-1">Média por Transação</h4>
                <p className="text-sm sm:text-lg font-bold text-text-primary">R${(data.reduce((sum, tx) => sum + tx.amount, 0) / (data.length || 1)).toFixed(2)}</p>
              </div>
              <div className="bg-background-secondary p-3 sm:p-4 rounded-lg">
                <h4 className="text-xs font-medium text-text-tertiary mb-1">Maior Transação</h4>
                <p className="text-sm sm:text-lg font-bold text-text-primary">R${(data.length ? Math.max(...data.map(tx => tx.amount)) : 0).toLocaleString()}</p>
              </div>
              <div className="bg-background-secondary p-3 sm:p-4 rounded-lg">
                <h4 className="text-xs font-medium text-text-tertiary mb-1">Total de Transações</h4>
                <p className="text-sm sm:text-lg font-bold text-text-primary">{data.length}</p>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 flex justify-end">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-brand-primary text-white text-sm rounded-lg" onClick={onClose}>Fechar</motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
