import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowUp, ArrowDown, DollarSign, Percent } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import CryptoIcon from '../../components/common/CryptoIcons';
import { portfolioData, portfolioHistoricalData, portfolioStats, PORTFOLIO_COLORS } from '../../data/mockData';

export function Portfolio() {
  const totalValue = portfolioStats.totalValue;

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="bg-background-primary p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <Wallet className="text-brand-primary" size={24} />
            <span className="text-sm text-text-secondary">Total Value</span>
          </div>
          <h3 className="text-2xl font-bold mt-2 text-text-primary">${totalValue.toLocaleString()}</h3>
          <p className="text-feedback-success flex items-center mt-2">
            <ArrowUp size={16} className="mr-1" /> +12.5%
          </p>
        </div>

        <div className="bg-background-primary p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <DollarSign className="text-brand-primary" size={24} />
            <span className="text-sm text-text-secondary">24h Profit/Loss</span>
          </div>
          <h3 className="text-2xl font-bold mt-2 text-text-primary">+${portfolioStats.dayChange.toLocaleString()}</h3>
          <p className="text-feedback-success flex items-center mt-2">
            <ArrowUp size={16} className="mr-1" /> +{portfolioStats.dayChangePercent}%
          </p>
        </div>

        <div className="bg-background-primary p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CryptoIcon symbol={portfolioStats.bestPerformer.symbol} size={24} />
            </div>
            <span className="text-sm text-text-secondary">Best Performer</span>
          </div>
          <h3 className="text-2xl font-bold mt-2 text-text-primary">{portfolioStats.bestPerformer.asset}</h3>
          <p className="text-feedback-success flex items-center mt-2">
            <ArrowUp size={16} className="mr-1" /> +{portfolioStats.bestPerformer.change}%
          </p>
        </div>

        <div className="bg-background-primary p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CryptoIcon symbol={portfolioStats.worstPerformer.symbol} size={24} />
            </div>
            <span className="text-sm text-text-secondary">Worst Performer</span>
          </div>
          <h3 className="text-2xl font-bold mt-2 text-text-primary">{portfolioStats.worstPerformer.asset}</h3>
          <p className="text-feedback-error flex items-center mt-2">
            <ArrowDown size={16} className="mr-1" /> {portfolioStats.worstPerformer.change}%
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-background-primary p-6 rounded-xl shadow-lg"
        >
          <h3 className="text-xl font-bold mb-6 text-text-primary">Portfolio Allocation</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={portfolioData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="allocation"
                >
                  {portfolioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PORTFOLIO_COLORS[index % PORTFOLIO_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {portfolioData.map((asset, index) => (
              <div key={asset.asset} className="flex items-center space-x-2">
                <CryptoIcon symbol={asset.symbol} size={16} />
                <span className="text-sm text-text-secondary">{asset.asset}</span>
                <span className="text-sm font-semibold text-text-primary">{asset.allocation}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-background-primary p-6 rounded-xl shadow-lg"
        >
          <h3 className="text-xl font-bold mb-6 text-text-primary">Portfolio Performance</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={portfolioHistoricalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" className="text-text-secondary" />
                <YAxis className="text-text-secondary" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--brand-primary)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background-primary p-6 rounded-xl shadow-lg"
      >
        <h3 className="text-xl font-bold mb-6 text-text-primary">Asset Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="pb-4 text-text-tertiary">Asset</th>
                <th className="pb-4 text-text-tertiary">Amount</th>
                <th className="pb-4 text-text-tertiary">Value</th>
                <th className="pb-4 text-text-tertiary">24h Change</th>
                <th className="pb-4 text-text-tertiary">Allocation</th>
              </tr>
            </thead>
            <tbody>
              {portfolioData.map((asset) => (
                <tr key={asset.asset} className="border-t border-border-primary">
                  <td className="py-4">
                    <div className="flex items-center space-x-2">
                      <CryptoIcon symbol={asset.symbol} size={20} />
                      <span className="font-semibold text-text-primary">{asset.asset}</span>
                    </div>
                  </td>
                  <td className="py-4 text-text-primary">0.5432 {asset.asset}</td>
                  <td className="py-4 text-text-primary">${asset.value.toLocaleString()}</td>
                  <td className={`py-4 ${asset.change > 0 ? 'text-feedback-success' : 'text-feedback-error'}`}>
                    <div className="flex items-center">
                      {asset.change > 0 ? <ArrowUp size={16} className="mr-1" /> : <ArrowDown size={16} className="mr-1" />}
                      {Math.abs(asset.change)}%
                    </div>
                  </td>
                  <td className="py-4 text-text-primary">{asset.allocation}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}