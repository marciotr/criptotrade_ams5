import React from 'react';
import { motion } from 'framer-motion';

export const StatsCards = React.memo(({ stats }) => {
  if (!stats || !Array.isArray(stats)) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-4 lg:p-6 rounded-xl bg-background-primary border border-border-primary shadow-lg"
        >
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              {stat.icon && <stat.icon className="text-brand-primary" size={24} />}
              <span className="text-text-secondary">24h</span>
            </div>
            <p className="text-sm text-text-secondary">{stat.title}</p>
            <p className="text-lg lg:text-xl font-bold text-text-primary">
              {stat.value}
            </p>
            <p className="text-xs text-text-tertiary">{stat.subValue}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
});

StatsCards.displayName = 'StatsCards';