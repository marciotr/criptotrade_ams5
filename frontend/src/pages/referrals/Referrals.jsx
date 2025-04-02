import React from 'react';
import { motion } from 'framer-motion';
import { User, BarChart2, TrendingUp, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const referrals = [
  { id: 1, username: 'Trader123', trades: 150, profit: 12000 },
  { id: 2, username: 'CryptoKing', trades: 200, profit: 18000 },
  { id: 3, username: 'InvestorPro', trades: 100, profit: 9000 },
  { id: 4, username: 'MarketGuru', trades: 250, profit: 22000 },
];

const referralStats = [
  { name: 'Jan', referrals: 30 },
  { name: 'Feb', referrals: 45 },
  { name: 'Mar', referrals: 60 },
  { name: 'Apr', referrals: 80 },
  { name: 'May', referrals: 100 },
  { name: 'Jun', referrals: 120 },
];

export function Referrals() {
  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background-primary p-6 rounded-xl shadow-lg"
      >
        <h3 className="text-xl font-bold mb-6 text-text-primary">Top Referrals</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {referrals.map((referral) => (
            <motion.div
              key={referral.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * referral.id }}
              className="bg-background-primary p-6 rounded-xl shadow-lg"
            >
              <div className="flex items-center space-x-4">
                <User className="text-brand-primary" size={24} />
                <div>
                  <h4 className="text-lg font-bold text-text-primary">{referral.username}</h4>
                  <p className="text-sm text-text-secondary">Trades: {referral.trades}</p>
                  <p className="text-sm text-text-secondary">Profit: ${referral.profit.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background-primary p-6 rounded-xl shadow-lg"
      >
        <h3 className="text-xl font-bold mb-6 text-text-primary">Referral Statistics</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={referralStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="referrals" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background-primary p-6 rounded-xl shadow-lg"
      >
        <h3 className="text-xl font-bold mb-6 text-text-primary">Referral Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="pb-4 text-text-secondary">Username</th>
                <th className="pb-4 text-text-secondary">Trades</th>
                <th className="pb-4 text-text-secondary">Profit</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((referral) => (
                <tr key={referral.id} className="border-t dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="py-4 text-text-primary">{referral.username}</td>
                  <td className="py-4 text-text-primary">{referral.trades}</td>
                  <td className="py-4 text-text-primary">${referral.profit.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}