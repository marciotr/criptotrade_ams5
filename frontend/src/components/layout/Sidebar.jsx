import React, { useState } from 'react';
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
  X,
  FileText,
  Shield,
  ChevronDown,
  UserCog
} from 'lucide-react';
import { useAuth } from '../../store/auth/useAuth'; // Importar o contexto de autenticação

export function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth(); // Obter o usuário atual
  const isAdmin = user?.role === 'admin'; // Verificar se o usuário é admin
  const [adminMenuOpen, setAdminMenuOpen] = useState(true); // Estado para o submenu de admin
  
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Wallet, label: 'Portfolio', path: '/portfolio' },
    { icon: LineChart, label: 'Markets', path: '/markets' },
    { icon: History, label: 'Transaction History', path: '/history' },
    { icon: Users, label: 'Referrals', path: '/referrals' },
    { icon: BookOpen, label: 'Learn', path: '/learn' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  // Opções de administrador separadas
  const adminItems = [
    { icon: UserCog, label: 'User Management', path: '/admin/users' },
    { icon: FileText, label: 'API', path: '/api-docs' }
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
              {/* Menu items normais */}
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-background-secondary transition-colors mb-1"
                  onClick={onClose}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="text-brand-primary" size={20} />
                    <span className="text-text-secondary">{item.label}</span>
                  </div>
                </Link>
              ))}
              
              {/* Seção de Admin se o usuário for admin */}
              {isAdmin && (
                <div className="mt-4 pt-4 border-t border-border-primary">
                  <div 
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-background-secondary transition-colors mb-1 cursor-pointer"
                    onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                  >
                    <div className="flex items-center space-x-3">
                      <Shield className="text-purple-500" size={20} />
                      <span className="text-text-secondary font-medium">Admin Options</span>
                    </div>
                    <ChevronDown 
                      size={18} 
                      className={`text-text-tertiary transition-transform ${
                        adminMenuOpen ? 'transform rotate-180' : ''
                      }`} 
                    />
                  </div>
                  
                  <AnimatePresence>
                    {adminMenuOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        {adminItems.map((item, index) => (
                          <Link
                            key={index}
                            to={item.path}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-background-secondary transition-colors mb-1"
                            onClick={onClose}
                          >
                            <div className="flex items-center space-x-3">
                              <item.icon className="text-brand-primary" size={20} />
                              <span className="text-text-secondary">{item.label}</span>
                            </div>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}