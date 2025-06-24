import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, Search, Filter, Download, ChevronLeft, ChevronRight, AlertTriangle, 
         CheckCircle, Clock, RefreshCw, TrendingUp, Sparkles, Calendar, Wallet, Zap, 
         BarChart2, Share2, Bookmark, PieChart, ChevronDown } from 'lucide-react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash/debounce';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import {
  BarChart, Bar, PieChart as RechartsPC, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Componentes reutilizáveis

// Mini gráfico - Ajustado para ser responsivo
const MiniChart = ({ data = [], height = 30, width = 80, color = "#3498db" }) => {
  // Dados de fallback caso não sejam fornecidos
  const chartData = data.length > 0 ? data : [4, 7, 5, 9, 6, 8, 7, 8, 10, 7];
  const max = Math.max(...chartData);
  const min = Math.min(...chartData);
  const range = max - min || 1;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <g>
        {chartData.map((value, i) => {
          const x = (i / (chartData.length - 1)) * width;
          const y = height - ((value - min) / range) * height;
          return (
            <React.Fragment key={i}>
              {i > 0 && (
                <motion.line
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  x1={(i - 1) / (chartData.length - 1) * width}
                  y1={height - ((chartData[i - 1] - min) / range) * height}
                  x2={x}
                  y2={y}
                  stroke={color}
                  strokeWidth={1.5}
                />
              )}
              <motion.circle
                initial={{ r: 0, opacity: 0 }}
                animate={{ r: i === chartData.length - 1 ? 3 : 0, opacity: 1 }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                cx={x}
                cy={y}
                fill={color}
              />
            </React.Fragment>
          );
        })}
      </g>
    </svg>
  );
};

// Badge de conquista adaptado para mobile
const AchievementBadge = ({ label, icon, isNew = false }) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.05 }}
    className="relative p-2 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 shadow-lg"
  >
    {isNew && (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-red-500 border-2 border-white"
      />
    )}
    <div className="text-white">{icon}</div>
    {label && (
      <div className="absolute -bottom-5 sm:-bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
        <p className="text-[8px] sm:text-xs font-medium text-amber-700 dark:text-amber-400">{label}</p>
      </div>
    )}
  </motion.div>
);

// Dica contextual responsiva
const FinancialInsight = ({ insight }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-2 sm:p-3 rounded-lg border border-blue-100 dark:border-blue-800"
  >
    <div className="flex items-start">
      <div className="p-1 sm:p-1.5 bg-blue-100 dark:bg-blue-800 rounded-full mr-2 sm:mr-3">
        <Sparkles size={14} className="text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300 font-medium">Insight Financeiro</p>
        <p className="text-[10px] sm:text-xs text-blue-700/80 dark:text-blue-400/80 mt-0.5">{insight}</p>
      </div>
    </div>
  </motion.div>
);

// Badge de transação recorrente
const RecurringTransactionBadge = () => (
  <div className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-xs font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
    <RefreshCw size={10} className="mr-0.5 sm:mr-1" />
    Recorrente
  </div>
);

// Item de transação adaptado para mobile
const VirtualizedTransactionRow = ({ data, index, style }) => {
  const transaction = data.items[index];
  const { onViewDetails, isMobile } = data;
  
  // Gerar dados de gráfico simulados
  const graphData = useMemo(() => {
    return Array(10).fill().map(() => Math.floor(Math.random() * 10) + 1);
  }, []);

  // Determinar se é transação recorrente (simulado)
  const isRecurring = transaction.id % 5 === 0;

  return (
    <motion.div 
      style={style} 
      className="border-t border-border-primary hover:bg-background-secondary transition-all duration-200 cursor-pointer group"
      onClick={() => onViewDetails(transaction)}
      whileHover={{ backgroundColor: "rgba(var(--background-secondary), 0.8)" }}
    >
      {/* Versão para desktop */}
      <div className="hidden sm:flex items-center h-full">
        <div className="px-4 py-4 w-32 sm:w-40">
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-full transition-transform group-hover:scale-110 
              ${transaction.type === 'Depósito' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}
            >
              {transaction.type === 'Depósito' ? (
                <ArrowUp className="text-feedback-success" size={16} />
              ) : (
                <ArrowDown className="text-feedback-error" size={16} />
              )}
            </div>
            <div>
              <span className="text-sm text-text-primary">{transaction.type}</span>
              {isRecurring && (
                <div className="mt-1">
                  <RecurringTransactionBadge />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="px-4 py-4 w-28 sm:w-32 text-sm font-medium text-text-primary">
          <div className="flex flex-col">
            <span>${transaction.amount.toLocaleString()}</span>
            {/* Mini gráfico de tendência */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
              <MiniChart 
                data={graphData} 
                color={transaction.type === 'Depósito' ? "#10b981" : "#ef4444"} 
                height={20} 
                width={60}
              />
            </div>
          </div>
        </div>
        
        <div className="px-4 py-4 w-24 text-sm text-text-primary flex items-center">
          <div className="flex items-center space-x-1.5">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <span className="text-[8px] font-bold text-white">
                {transaction.currency.charAt(0)}
              </span>
            </div>
            <span>{transaction.currency}</span>
          </div>
        </div>
        
        <div className="px-4 py-4 w-32 text-sm text-text-primary">
          <div className="flex items-center">
            {transaction.method === 'Cartão de Crédito' && (
              <div className="w-6 h-4 mr-2 rounded bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
              </div>
            )}
            {transaction.method === 'Transferência Bancária' && (
              <Wallet size={14} className="mr-2 text-gray-500" />
            )}
            {transaction.method === 'PayPal' && (
              <div className="mr-2 text-blue-600 font-bold text-xs">P</div>
            )}
            {transaction.method === 'Cripto' && (
              <div className="p-0.5 bg-orange-500 text-white mr-2 rounded-full">
                <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none">
                  <path d="M9 8l3 8.5L15 8l4.5 16H4.5L9 8z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
            {transaction.method}
          </div>
        </div>
        
        <div className="px-4 py-4 w-32 text-sm text-text-tertiary">
          {new Date(transaction.date).toLocaleDateString()}
        </div>
        
        <div className="px-4 py-4 w-32">
          <TransactionStatus status={transaction.status} />
        </div>
        
        <div className="px-4 py-4 text-xs text-text-tertiary flex-1 items-center justify-between hidden sm:flex">
          <span className="font-mono">{transaction.txId}</span>
          
          {/* Botões de ação rápida (aparecem no hover) */}
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <motion.button whileTap={{ scale: 0.9 }} className="p-1.5 rounded-full hover:bg-background-tertiary">
              <Share2 size={14} className="text-text-tertiary" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} className="p-1.5 rounded-full hover:bg-background-tertiary">
              <Bookmark size={14} className="text-text-tertiary" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Versão para mobile - layout compacto */}
      <div className="flex sm:hidden items-center h-full">
        <div className="flex-1 flex items-center px-3 py-3">
          <div className={`p-1.5 rounded-full mr-2
            ${transaction.type === 'Depósito' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}
          >
            {transaction.type === 'Depósito' ? (
              <ArrowUp className="text-feedback-success" size={15} />
            ) : (
              <ArrowDown className="text-feedback-error" size={15} />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center">
                  <span className="text-xs font-medium text-text-primary">{transaction.type}</span>
                  {isRecurring && (
                    <span className="ml-1.5">
                      <RecurringTransactionBadge />
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-text-tertiary block mt-0.5">
                  {new Date(transaction.date).toLocaleDateString()}
                </span>
              </div>
              
              <div className="text-right">
                <span className="text-xs font-semibold text-text-primary">
                  ${transaction.amount.toLocaleString()}
                </span>
                <div className="flex items-center justify-end mt-1">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mr-1">
                    <span className="text-[6px] font-bold text-white">
                      {transaction.currency.charAt(0)}
                    </span>
                  </div>
                  <span className="text-[10px] text-text-tertiary">{transaction.currency}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-1">
              <TransactionStatus status={transaction.status} />
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MiniChart 
                  data={graphData} 
                  color={transaction.type === 'Depósito' ? "#10b981" : "#ef4444"} 
                  height={15} 
                  width={50}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Card de estatísticas responsivo
const StatCard = ({ label, value, icon, trend, color, onClick }) => (
  <motion.div
    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="bg-background-primary p-3 sm:p-4 rounded-xl shadow-md border border-border-primary cursor-pointer relative overflow-hidden"
  >
    {/* Background pattern */}
    <div className="absolute inset-0 opacity-5">
      <svg width="100%" height="100%" className="text-current">
        <pattern id="pattern-circles" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse">
          <circle id="pattern-circle" cx="10" cy="10" r="1.6257413380501518" fill="currentColor"></circle>
        </pattern>
        <rect id="rect" x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)"></rect>
      </svg>
    </div>
    
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-text-tertiary text-xs sm:text-sm">{label}</p>
        <p className="text-text-primary text-base sm:text-xl font-bold mt-0.5 sm:mt-1">{value}</p>
        {trend && (
          <div className={`flex items-center mt-1 sm:mt-2 text-[9px] sm:text-xs ${color}`}>
            <TrendingUp size={12} className="mr-1" />
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div className={`p-1.5 sm:p-2 rounded-lg ${color.replace('text', 'bg').replace('500', '100')} ${color}`}>
        {icon}
      </div>
    </div>
    
    {/* Indicator for interaction */}
    <div className="absolute bottom-2 right-2 opacity-30">
      <ChevronRight size={14} className="text-text-tertiary" />
    </div>
  </motion.div>
);

// Modal de análise responsivo
const AnalyticsModal = ({ isOpen, onClose, data }) => {
  // Processar dados para o gráfico de barras (volume de transações por mês)
  const monthlyVolumeData = useMemo(() => {
    // Traduzir nomes de meses para português
    const months = {
      'Jan': 'Jan',
      'Feb': 'Fev',
      'Mar': 'Mar',
      'Apr': 'Abr',
      'May': 'Mai',
      'Jun': 'Jun',
      'Jul': 'Jul',
      'Aug': 'Ago',
      'Sep': 'Set',
      'Oct': 'Out',
      'Nov': 'Nov',
      'Dec': 'Dez'
    };

    // Organizar os dados por mês
    const monthMap = {};
    data.forEach(tx => {
      const date = new Date(tx.date);
      const monthName = date.toLocaleString('en-US', { month: 'short' });
      const monthNamePt = months[monthName] || monthName;
      
      if (!monthMap[monthNamePt]) {
        monthMap[monthNamePt] = { depositos: 0, saques: 0 };
      }
      
      if (tx.type === 'Depósito') {
        monthMap[monthNamePt].depositos += tx.amount;
      } else {
        monthMap[monthNamePt].saques += tx.amount;
      }
    });
    
    // Converter para o formato esperado pelo recharts
    return Object.keys(monthMap).map(month => ({
      name: month,
      depositos: parseFloat(monthMap[month].depositos.toFixed(2)),
      saques: parseFloat(monthMap[month].saques.toFixed(2))
    }));
  }, [data]);

  // Processar dados para o gráfico de pizza (tipos de transações)
  const transactionTypesData = useMemo(() => {
    const depositos = data.filter(tx => tx.type === 'Depósito').length;
    const saques = data.filter(tx => tx.type === 'Saque').length;
    
    return [
      { name: 'Depósitos', value: depositos, color: '#10b981' },
      { name: 'Saques', value: saques, color: '#ef4444' }
    ];
  }, [data]);

  // Processar dados para métodos de pagamento
  const paymentMethodsData = useMemo(() => {
    const methods = {};
    data.forEach(tx => {
      if (!methods[tx.method]) {
        methods[tx.method] = 0;
      }
      methods[tx.method]++;
    });
    
    // Definir cores para cada método
    const colors = {
      'Cartão de Crédito': '#60a5fa', 
      'Transferência Bancária': '#818cf8',
      'PayPal': '#34d399',
      'Cripto': '#f59e0b'
    };
    
    return Object.keys(methods).map(method => ({
      name: method,
      value: methods[method],
      color: colors[method] || '#94a3b8'
    }));
  }, [data]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-background-primary rounded-xl shadow-xl w-full max-w-5xl p-3 sm:p-6 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-bold text-text-primary">Análise de Transações</h3>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-background-secondary text-text-tertiary hover:text-text-primary transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* Gráficos responsivos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-6">
              <div className="bg-background-secondary p-3 sm:p-4 rounded-lg">
                <h4 className="text-xs sm:text-sm font-medium text-text-tertiary mb-2">Volume Mensal de Transações</h4>
                <div className="h-48 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyVolumeData}
                      margin={{ top: 5, right: 5, left: 5, bottom: 15 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border-primary" />
                      <XAxis 
                        dataKey="name" 
                        className="text-[9px] sm:text-xs text-text-tertiary"
                        tick={{ fill: 'currentColor' }}
                        tickMargin={5}
                      />
                      <YAxis 
                        className="text-[9px] sm:text-xs text-text-tertiary"
                        tick={{ fill: 'currentColor' }}
                        tickFormatter={(value) => `R$${value.toLocaleString()}`}
                      />
                      <Tooltip 
                        formatter={(value) => [`R$${value.toLocaleString()}`, undefined]}
                        contentStyle={{
                          backgroundColor: 'var(--background-primary)',
                          borderColor: 'var(--border-primary)',
                          fontSize: '12px'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      <Bar dataKey="depositos" name="Depósitos" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="saques" name="Saques" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Gráficos de pizza responsivos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-background-secondary p-3 sm:p-4 rounded-lg">
                  <h4 className="text-xs sm:text-sm font-medium text-text-tertiary mb-2">Tipos de Transações</h4>
                  <div className="h-40 sm:h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPC>
                        <Pie
                          data={transactionTypesData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius="70%"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => (
                            <text 
                              className="text-[8px] sm:text-xs" 
                              x={0} y={0} 
                              textAnchor="middle"
                              fill="currentColor"
                            >
                              {`${name}: ${(percent * 100).toFixed(0)}%`}
                            </text>
                          )}
                        >
                          {transactionTypesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`${value} transações`, undefined]}
                          contentStyle={{
                            backgroundColor: 'var(--background-primary)',
                            borderColor: 'var(--border-primary)',
                            fontSize: '12px'
                          }}
                        />
                      </RechartsPC>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="bg-background-secondary p-3 sm:p-4 rounded-lg">
                  <h4 className="text-xs sm:text-sm font-medium text-text-tertiary mb-2">Métodos de Pagamento</h4>
                  <div className="h-40 sm:h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPC>
                        <Pie
                          data={paymentMethodsData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius="70%"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => (
                            <text 
                              className="text-[8px] sm:text-xs" 
                              x={0} y={0} 
                              textAnchor="middle"
                              fill="currentColor"
                            >
                              {`${name.substring(0, 5)}... ${(percent * 100).toFixed(0)}%`}
                            </text>
                          )}
                        >
                          {paymentMethodsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`${value} transações`, undefined]}
                          contentStyle={{
                            backgroundColor: 'var(--background-primary)',
                            borderColor: 'var(--border-primary)',
                            fontSize: '12px'
                          }}
                        />
                      </RechartsPC>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Métricas adicionais responsivas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-background-secondary p-3 sm:p-4 rounded-lg">
                <h4 className="text-xs font-medium text-text-tertiary mb-1">Média por Transação</h4>
                <p className="text-sm sm:text-lg font-bold text-text-primary">
                  R${(data.reduce((sum, tx) => sum + tx.amount, 0) / data.length).toFixed(2)}
                </p>
              </div>
              <div className="bg-background-secondary p-3 sm:p-4 rounded-lg">
                <h4 className="text-xs font-medium text-text-tertiary mb-1">Maior Transação</h4>
                <p className="text-sm sm:text-lg font-bold text-text-primary">
                  R${Math.max(...data.map(tx => tx.amount)).toLocaleString()}
                </p>
              </div>
              <div className="bg-background-secondary p-3 sm:p-4 rounded-lg">
                <h4 className="text-xs font-medium text-text-tertiary mb-1">Total de Transações</h4>
                <p className="text-sm sm:text-lg font-bold text-text-primary">
                  {data.length}
                </p>
              </div>
            </div>
            
            <FinancialInsight 
              insight="Com base no seu histórico, você poderia economizar aproximadamente 2,5% em taxas agrupando seus saques." 
            />
            
            <div className="mt-4 sm:mt-6 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-brand-primary text-white text-sm rounded-lg"
                onClick={onClose}
              >
                Fechar
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Componente de status de transação responsivo
const TransactionStatus = ({ status }) => {
  let statusConfig = {
    completed: {
      icon: <CheckCircle size={12} />,
      color: "text-green-500",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      label: "Concluída"
    },
    pending: {
      icon: <Clock size={12} />,
      color: "text-yellow-500",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
      label: "Pendente"
    },
    failed: {
      icon: <AlertTriangle size={12} />,
      color: "text-red-500",
      bgColor: "bg-red-100 dark:bg-red-900/30",
      label: "Falhou"
    }
  };

  const config = statusConfig[status.toLowerCase()] || statusConfig.pending;

  return (
    <div className="flex items-center">
      <div className={`flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${config.bgColor}`}>
        <span className={`mr-0.5 sm:mr-1 ${config.color}`}>{config.icon}</span>
        <span className={`text-[8px] sm:text-xs font-medium ${config.color}`}>{config.label}</span>
      </div>
    </div>
  );
};

// Função para gerar dados mock
const generateMockTransactions = (count) => {
  const types = ['Depósito', 'Saque'];
  const statuses = ['completed', 'pending', 'failed'];
  const methods = ['Cartão de Crédito', 'Transferência Bancária', 'PayPal', 'Cripto'];
  const currencies = ['USD', 'EUR', 'BTC', 'ETH'];
  
  return Array(count).fill().map((_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    return {
      id: i + 1,
      type,
      amount: parseFloat((Math.random() * 10000).toFixed(2)),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      date: date.toISOString(),
      txId: `tx_${Math.random().toString(36).substring(2, 10)}`,
      method: methods[Math.floor(Math.random() * methods.length)],
      currency: currencies[Math.floor(Math.random() * currencies.length)]
    };
  });
};

// Componente principal - TransactionHistory totalmente responsivo
export function TransactionHistory() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isTransactionDetailsOpen, setIsTransactionDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [activeInsight, setActiveInsight] = useState(0);
  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'calendar'
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const itemsPerPage = 20;

  // Detectar tamanho da tela
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 640;

  // Simular dados reais com um conjunto maior para testar performance
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // Simulando carregamento de dados
    setIsLoading(true);
    
    setTimeout(() => {
      const mockData = generateMockTransactions(100);
      setTransactions(mockData);
      setIsLoading(false);
    }, 800);
  }, []);

  // Ciclar insights financeiros
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveInsight(prev => (prev + 1) % financialInsights.length);
    }, 10000);
    
    return () => clearInterval(timer);
  }, []);

  // Lista de insights financeiros
  const financialInsights = [
    "Seu volume de depósitos aumentou 24% em comparação com o mês passado.",
    "Considere consolidar seus pequenos saques para economizar em taxas de transação.",
    "Você concluiu 12 transações com sucesso este mês, um novo recorde pessoal!",
    "Com base em seus padrões de atividade, as manhãs dos dias úteis são seus horários de negociação mais ativos."
  ];

  // Debounce para busca
  const handleSearchChange = useCallback(
    debounce((value) => {
      setDebouncedSearchTerm(value);
    }, 300),
    []
  );

  // Filtro
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = 
        tx.txId.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        tx.type.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        tx.method.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      
      const matchesFilter = filterStatus === 'all' || tx.status.toLowerCase() === filterStatus.toLowerCase();
      
      return matchesSearch && matchesFilter;
    });
  }, [transactions, debouncedSearchTerm, filterStatus]);

  // Estatísticas das transações
  const transactionStats = useMemo(() => {
    if (!transactions.length) return { totalVolume: 0, deposits: 0, withdrawals: 0, pending: 0 };
    
    const totalVolume = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const deposits = transactions.filter(tx => tx.type === 'Depósito').length;
    const withdrawals = transactions.filter(tx => tx.type === 'Saque').length;
    const pending = transactions.filter(tx => tx.status === 'pending').length;
    
    return { totalVolume, deposits, withdrawals, pending };
  }, [transactions]);

  // Paginação
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const currentTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handler para visualizar detalhes da transação
  const handleViewTransactionDetails = useCallback((transaction) => {
    setSelectedTransaction(transaction);
    setIsTransactionDetailsOpen(true);
  }, []);

  if (isLoading) {
    return <LoadingScreen message="Carregando histórico de transações..." size="large" />;
  }

  const renderTransactionsContent = () => {
    if (filteredTransactions.length === 0) {
      return (
        <div className="py-8 sm:py-16 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <AlertTriangle size={isMobile ? 36 : 48} className="text-text-tertiary mb-3" />
          </motion.div>
          <p className="text-text-secondary text-center text-sm sm:text-base mb-1 sm:mb-2">Nenhuma transação encontrada</p>
          <p className="text-text-tertiary text-center text-xs sm:text-sm">Tente ajustar sua busca ou critérios de filtro</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSearchTerm('');
              setDebouncedSearchTerm('');
              setFilterStatus('all');
            }}
            className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-background-secondary text-text-primary text-xs sm:text-sm rounded-lg border border-border-primary hover:border-brand-primary transition-colors"
          >
            Limpar Filtros
          </motion.button>
        </div>
      );
    }
  
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-3 sm:p-6 space-y-4 sm:space-y-6 min-h-screen bg-background"
    >
      {/* Header animado com badges de conquistas */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <motion.h2 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-xl sm:text-2xl font-bold text-text-primary"
            >
              Histórico de Transações
            </motion.h2>
            <motion.p 
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-xs sm:text-sm text-text-secondary mt-1"
            >
              Acompanhe e gerencie todas as transações da sua conta
            </motion.p>
          </div>
          
          {/* Badges responsivos - escondidos em telas muito pequenas */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-3 sm:mt-0 flex space-x-2 sm:space-x-3"
          >
            {!isMobile && <AchievementBadge icon={<Zap size={isMobile ? 14 : 18} className="text-white" />} label="Power" isNew />}
            <AchievementBadge icon={<TrendingUp size={isMobile ? 14 : 18} className="text-white" />} label="Trader" />
            {!isMobile && <AchievementBadge icon={<RefreshCw size={isMobile ? 14 : 18} className="text-white" />} label="Ativo" />}
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 border border-amber-300 flex items-center justify-center cursor-pointer"
            >
              <span className="text-[10px] sm:text-xs font-medium text-white">+3</span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Insight financeiro do dia */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="max-w-7xl mx-auto"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeInsight}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
          >
            <FinancialInsight insight={financialInsights[activeInsight]} />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Cards de estatísticas responsivos */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        <StatCard 
          label="Volume Total" 
          value={`R$${transactionStats.totalVolume.toLocaleString()}`} 
          icon={<RefreshCw size={isMobile ? 16 : 20} />}
          trend="+5,2% este mês"
          color="text-blue-500"
          onClick={() => setShowAnalyticsModal(true)}
        />
        <StatCard 
          label="Depósitos" 
          value={transactionStats.deposits} 
          icon={<ArrowUp size={isMobile ? 16 : 20} />}
          trend="23 neste mês"
          color="text-green-500"
          onClick={() => setFilterStatus('completed')}
        />
        <StatCard 
          label="Saques" 
          value={transactionStats.withdrawals} 
          icon={<ArrowDown size={isMobile ? 16 : 20} />}
          color="text-red-500"
          onClick={() => setFilterStatus('completed')}
        />
        <StatCard 
          label="Pendentes" 
          value={transactionStats.pending} 
          icon={<Clock size={isMobile ? 16 : 20} />}
          color="text-yellow-500"
          onClick={() => setFilterStatus('pending')}
        />
      </motion.div>

      {/* Pesquisa e filtros responsivos */}
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-3 sm:gap-4"
        >
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Buscar transações..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleSearchChange(e.target.value);
                }}
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg bg-background-primary border-border-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
              />
              <Search size={isMobile ? 14 : 16} className="absolute left-2.5 sm:left-3 top-1.5 sm:top-2.5 text-text-tertiary" />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg bg-background-primary text-text-primary border-border-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <option value="all">Todos os Status</option>
              <option value="completed">Concluídas</option>
              <option value="pending">Pendentes</option>
              <option value="failed">Falhas</option>
            </select>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Toggle para alternar entre visualizações */}
            <div className="flex p-0.5 sm:p-1 bg-background-secondary rounded-lg">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('list')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md ${
                  viewMode === 'list' 
                    ? 'bg-background-primary text-text-primary shadow-sm' 
                    : 'text-text-tertiary'
                }`}
              >
                Lista
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('calendar')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md flex items-center ${
                  viewMode === 'calendar' 
                    ? 'bg-background-primary text-text-primary shadow-sm' 
                    : 'text-text-tertiary'
                }`}
              >
                <Calendar size={isMobile ? 12 : 14} className="mr-1" />
                Calendário
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-background-primary bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-colors"
            >
              <Download size={isMobile ? 14 : 16} className="mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Exportar</span>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Tabela de transações com virtualização responsiva */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ delay: 0.4 }}
          className="max-w-7xl mx-auto bg-background-primary rounded-xl shadow-lg overflow-hidden border border-border-primary"
        >
          {viewMode === 'list' ? (
            <>
              {/* Cabeçalho da tabela - visível apenas em desktop */}
              <div className="hidden sm:block bg-background-secondary border-b border-border-primary">
                <div className="flex items-center">
                  <div className="px-4 py-3 w-40 text-left text-xs font-medium text-text-tertiary">Tipo</div>
                  <div className="px-4 py-3 w-32 text-left text-xs font-medium text-text-tertiary">Valor</div>
                  <div className="px-4 py-3 w-24 text-left text-xs font-medium text-text-tertiary">Moeda</div>
                  <div className="px-4 py-3 w-32 text-left text-xs font-medium text-text-tertiary">Método</div>
                  <div className="px-4 py-3 w-32 text-left text-xs font-medium text-text-tertiary">Data</div>
                  <div className="px-4 py-3 w-32 text-left text-xs font-medium text-text-tertiary">Status</div>
                  <div className="px-4 py-3 flex-1 text-left text-xs font-medium text-text-tertiary">ID da Transação</div>
                </div>
              </div>

              {/* Lista virtualizada responsiva */}
              {filteredTransactions.length > 0 ? (
                <div style={{ height: isMobile ? 'calc(100vh - 350px)' : 'calc(100vh - 380px)', minHeight: isMobile ? '250px' : '300px' }}>
                  <AutoSizer>
                    {({ height, width }) => (
                      <List
                        height={height}
                        itemCount={filteredTransactions.length}
                        itemSize={isMobile ? 80 : 64} // altura ajustada para mobile
                        width={width}
                        itemData={{
                          items: filteredTransactions,
                          onViewDetails: handleViewTransactionDetails,
                          isMobile
                        }}
                      >
                        {VirtualizedTransactionRow}
                      </List>
                    )}
                  </AutoSizer>
                </div>
              ) : (
                renderTransactionsContent()
              )}
            </>
          ) : (
            // Visualização de calendário responsiva
            <div className="p-4 min-h-[300px] sm:min-h-[500px] flex items-center justify-center">
              <div className="text-center">
                <Calendar size={isMobile ? 40 : 64} className="mx-auto text-text-tertiary opacity-30 mb-2 sm:mb-3" />
                <h3 className="text-sm sm:text-base text-text-primary font-medium">Calendário</h3>
                <p className="text-[10px] sm:text-sm text-text-tertiary mt-1">
                  Visualize suas transações em um calendário interativo.
                </p>
              </div>
            </div>
          )}

          {/* Paginação responsiva */}
          {filteredTransactions.length > 0 && viewMode === 'list' && (
            <div className="flex flex-col xs:flex-row xs:items-center justify-between px-3 sm:px-4 py-3 sm:py-4 border-t border-border-primary gap-2 sm:gap-4">
              <p className="text-[10px] sm:text-xs text-text-secondary">
                Mostrando {Math.min(filteredTransactions.length, 1)}-{Math.min(currentPage * itemsPerPage, filteredTransactions.length)} de {filteredTransactions.length} transações
              </p>
              
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 sm:p-1.5 rounded-lg border border-border-primary hover:border-brand-primary disabled:opacity-50 disabled:border-border-primary"
                >
                  <ChevronLeft size={isMobile ? 16 : 18} className="text-text-primary" />
                </button>
                
                {/* Números de página - visíveis apenas em telas maiores */}
                <div className="hidden sm:flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Lógica para exibir os números de página
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <motion.button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm ${
                          currentPage === pageNum
                            ? 'bg-brand-primary text-background-primary'
                            : 'text-text-primary hover:bg-background-secondary'
                        }`}
                      >
                        {pageNum}
                      </motion.button>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="text-text-tertiary">...</span>
                      <motion.button
                        onClick={() => setCurrentPage(totalPages)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-sm text-text-primary hover:bg-background-secondary"
                      >
                        {totalPages}
                      </motion.button>
                    </>
                  )}
                </div>
                
                {/* Indicador de página simples para mobile */}
                <div className="text-[10px] sm:hidden text-text-primary px-2">
                  {currentPage} / {totalPages}
                </div>
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-1 sm:p-1.5 rounded-lg border border-border-primary hover:border-brand-primary disabled:opacity-50 disabled:border-border-primary"
                >
                  <ChevronRight size={isMobile ? 16 : 18} className="text-text-primary" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Modal de detalhes da transação - Responsivo */}
      <AnimatePresence>
        {isTransactionDetailsOpen && selectedTransaction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
            onClick={() => setIsTransactionDetailsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-background-primary rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-border-primary"
              onClick={e => e.stopPropagation()}
            >
              {/* Header estilizado responsivo */}
              <div className={`p-4 sm:p-6 ${
                selectedTransaction.type === 'Depósito' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                  : 'bg-gradient-to-r from-red-500 to-rose-600'
              } text-white`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      {selectedTransaction.type === 'Depósito' ? (
                        <ArrowUp className="mr-2" size={isMobile ? 16 : 20} />
                      ) : (
                        <ArrowDown className="mr-2" size={isMobile ? 16 : 20} />
                      )}
                      <h3 className="text-lg sm:text-xl font-bold">{selectedTransaction.type}</h3>
                    </div>
                    <p className="opacity-90 text-xs sm:text-sm mt-0.5 sm:mt-1">Transação #{selectedTransaction.id}</p>
                  </div>
                  <button 
                    onClick={() => setIsTransactionDetailsOpen(false)}
                    className="p-1 sm:p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="mt-3 sm:mt-4">
                  <p className="text-xs sm:text-sm opacity-80">Valor</p>
                  <div className="flex items-baseline">
                    <span className="text-2xl sm:text-3xl font-bold">R${selectedTransaction.amount.toLocaleString()}</span>
                    <span className="ml-2 text-sm sm:text-base">{selectedTransaction.currency}</span>
                  </div>
                </div>
              </div>
                
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-5">
                <div className="flex justify-between items-center pb-3 sm:pb-4 border-b border-border-primary">
                  <span className="text-xs sm:text-sm text-text-tertiary">Status</span>
                  <TransactionStatus status={selectedTransaction.status} />
                </div>
                
                <div className="bg-background-secondary p-3 sm:p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-text-tertiary">Data</span>
                    <span className="text-xs sm:text-sm text-text-primary">
                      {new Date(selectedTransaction.date).toLocaleDateString('pt-BR', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
                
                <div className="bg-background-secondary p-3 sm:p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-text-tertiary">Horário</span>
                    <span className="text-xs sm:text-sm text-text-primary">
                      {new Date().toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                
                <div className="bg-background-secondary p-3 sm:p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-text-tertiary">Método</span>
                    <div className="flex items-center text-xs sm:text-sm text-text-primary">
                      {selectedTransaction.method === 'Cartão de Crédito' && (
                        <div className="w-5 sm:w-6 h-3 sm:h-4 mr-1.5 sm:mr-2 rounded bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
                          <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-yellow-400"></div>
                        </div>
                      )}
                      {selectedTransaction.method === 'Transferência Bancária' && (
                        <Wallet size={isMobile ? 12 : 14} className="mr-1.5 sm:mr-2 text-gray-500" />
                      )}
                      {selectedTransaction.method === 'PayPal' && (
                        <div className="mr-1.5 sm:mr-2 text-blue-600 font-bold text-xs">P</div>
                      )}
                      {selectedTransaction.method === 'Cripto' && (
                        <div className="p-0.5 bg-orange-500 text-white mr-1.5 sm:mr-2 rounded-full">
                          <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none">
                            <path d="M9 8l3 8.5L15 8l4.5 16H4.5L9 8z" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                      {selectedTransaction.method}
                    </div>
                  </div>
                </div>
                
                <div className="bg-background-secondary p-3 sm:p-4 rounded-lg">
                  <div>
                    <span className="text-text-tertiary block mb-2">ID da Transação</span>
                    <div className="flex items-center justify-between">
                      <span className="text-text-primary text-xs font-mono">{selectedTransaction.txId}</span>
                      <motion.button 
                        whileTap={{ scale: 0.9 }}
                        className="p-1.5 text-text-tertiary hover:text-brand-primary rounded-full hover:bg-background-tertiary"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedTransaction.txId);
                          // Poderia mostrar um toast de confirmação aqui
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                          <path d="M5 2V1H10V2H5ZM4.75 0C4.33579 0 4 0.335786 4 0.75V1H3.5C2.67157 1 2 1.67157 2 2.5V12.5C2 13.3284 2.67157 14 3.5 14H11.5C12.3284 14 13 13.3284 13 12.5V2.5C13 1.67157 12.3284 1 11.5 1H11V0.75C11 0.335786 10.6642 0 10.25 0H4.75ZM3 2.5C3 2.22386 3.22386 2 3.5 2H4V2.25C4 2.66421 4.33579 3 4.75 3H10.25C10.6642 3 11 2.66421 11 2.25V2H11.5C11.7761 2 12 2.22386 12 2.5V12.5C12 12.7761 11.7761 13 11.5 13H3.5C3.22386 13 3 12.7761 3 12.5V2.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                        </svg>
                      </motion.button>
                    </div>
                  </div>
                </div>
                
                {/* Insight específico da transação */}
                <FinancialInsight 
                  insight={
                    selectedTransaction.type === 'Depósito' 
                      ? "Este depósito foi 24% maior que a média dos seus depósitos." 
                      : "Este saque foi processado 30% mais rápido que a média."
                  } 
                />
              </div>
              
              <div className="px-4 sm:px-6 pb-6 flex justify-between">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 border border-border-primary text-text-primary rounded-lg hover:bg-background-secondary transition-colors"
                  onClick={() => setIsTransactionDetailsOpen(false)}
                >
                  Fechar
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-brand-primary text-white rounded-lg"
                >
                  <Share2 size={16} className="mr-2 inline" />
                  Compartilhar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Modal de análise de transações */}
      <AnalyticsModal 
        isOpen={showAnalyticsModal} 
        onClose={() => setShowAnalyticsModal(false)} 
        data={transactions}
      />
    </motion.div>
  );
}
