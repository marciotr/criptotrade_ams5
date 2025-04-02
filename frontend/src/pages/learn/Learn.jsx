import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

const learnResources = [
  { id: 1, title: 'Introduction to Cryptocurrency', description: 'Learn the basics of cryptocurrency and how it works.', link: '#' },
  { id: 2, title: 'How to Trade Crypto', description: 'A guide on how to trade cryptocurrencies effectively.', link: '#' },
  { id: 3, title: 'Understanding Blockchain', description: 'An in-depth look at blockchain technology.', link: '#' },
  { id: 4, title: 'Crypto Security Tips', description: 'Tips on how to keep your crypto assets secure.', link: '#' },
];

export function Learn() {
  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background-primary p-6 rounded-xl shadow-lg"
      >
        <h3 className="text-xl font-bold mb-6 text-text-primary">Learn</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {learnResources.map((resource) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * resource.id }}
              className="bg-background-primary p-6 rounded-xl shadow-lg"
            >
              <div className="flex items-center space-x-4">
                <BookOpen className="text-brand-primary" size={24} />
                <div>
                  <h4 className="text-lg font-bold text-text-primary">{resource.title}</h4>
                  <p className="text-sm text-text-secondary">{resource.description}</p>
                  <a href={resource.link} className="text-brand-primary mt-2 inline-block hover:opacity-90">Read more</a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}