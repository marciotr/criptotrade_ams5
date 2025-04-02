import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wallet, 
  LineChart, 
  History,
  Settings,
  Users,
  BookOpen,
  X
} from 'lucide-react';

export function Sidebar({ isOpen, onClose }) {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Wallet, label: 'Portfolio', path: '/portfolio' },
    { icon: LineChart, label: 'Markets', path: '/markets' },
    { icon: History, label: 'Transaction History', path: '/history' },
    { icon: Users, label: 'Referrals', path: '/referrals' },
    { icon: BookOpen, label: 'Learn', path: '/learn' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-30 lg:hidden"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed left-0 top-0 bottom-0 w-72 bg-background-primary shadow-xl z-40 overflow-y-auto"
          >
            <div className="p-4 flex justify-between items-center border-b border-border-primary">
              <span className="text-xl font-bold text-brand-primary">Options</span>
              <button
                onClick={onClose}
                className="p-2 hover:bg-background-secondary rounded-lg lg:hidden"
              >
                <X size={20} className="text-text-secondary" />
              </button>
            </div>
            <nav className="p-4">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-background-secondary transition-colors mb-1"
                  onClick={onClose}
                >
                  <item.icon className="text-brand-primary" size={20} />
                  <span className="text-text-secondary">{item.label}</span>
                </Link>
              ))}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}