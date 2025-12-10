import React from 'react';
import { motion } from 'framer-motion';
import { Newspaper } from 'lucide-react';

export const LatestNews = React.memo(({ news }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 lg:p-6 rounded-xl bg-background-primary border border-border-primary shadow-lg"
    >
      <h2 className="text-xl font-bold mb-6 text-text-primary">Últimas Notícias</h2>
      <div className="space-y-4">
        {news.map((article) => (
          <div 
            key={article.id} 
            className="flex items-center justify-between p-3 hover:bg-background-secondary rounded-lg transition-colors"
          >
            <div>
              <p className="font-semibold text-text-primary">{article.title}</p>
              <p className="text-sm text-text-secondary">{article.date}</p>
            </div>
            <Newspaper className="text-blue-600 dark:text-yellow-500" size={24} />
          </div>
        ))}
      </div>
    </motion.div>
  );
});

LatestNews.displayName = 'LatestNews';