import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  LineChart,
  History,
  Settings,
  Users,
  BookOpen,
  Shield,
  ChevronRight,
  ChevronLeft,
  X
} from 'lucide-react';
import { useAuth } from '../../store/auth/useAuth';
import { adminRoutes } from '../../routes/adminRoutes';
import { sidebarRoutes } from '../../routes/sidebarRoutes';

export function Sidebar() {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === 'admin';
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

  const collapsedWidth = 68;
  const expandedWidth = 280;
  const isMobile = windowWidth < 768; // Define o breakpoint para dispositivos móveis

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fechar o menu móvel quando mudar de rota
  useEffect(() => {
    setIsMobileMenuOpen(false);
    // Ao mudar de rota, garante que a sidebar desktop volte a ficar recolhida
    setIsHovered(false);
  }, [location.pathname]);

  if (!isAuthenticated) {
    return null;
  }

  // Componente para o avatar do usuário (reutilizável)
  const UserAvatar = ({ size = "h-10 w-10", textSize = "text-lg" }) => (
    user?.photo ? (
      <img 
        src={user.photo} 
        alt={user?.name || 'Usuário'} 
        className={`${size} rounded-full object-cover border-2 border-background-secondary`}
      />
    ) : (
      <div className={`${size} rounded-full bg-gradient-to-r from-brand-primary to-purple-600 flex items-center justify-center text-white font-bold ${textSize}`}>
        {user?.name?.charAt(0) || 'U'}
      </div>
    )
  );

  // Componente para a versão desktop (sidebar flutuante)
  const DesktopSidebar = () => (
    <motion.aside
      className="fixed top-20 left-4 bottom-4 bg-background-primary rounded-2xl shadow-lg z-30 flex flex-col overflow-hidden hidden md:flex"
      initial={{ width: collapsedWidth }}
      animate={{ width: isHovered ? expandedWidth : collapsedWidth }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)" }}
    >
      {/* Removemos o avatar da versão desktop */}
      <SidebarContent isHovered={isHovered} isDesktop={true} />
    </motion.aside>
  );

  // Componente para a versão mobile (menu deslizante com overlay)
  const MobileSidebar = () => (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          {/* Overlay escuro de fundo quando o menu está aberto */}
          <motion.div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Menu lateral deslizante */}
          <motion.aside
            className="fixed top-0 left-0 bottom-0 w-[280px] bg-background-primary z-50 flex flex-col overflow-hidden md:hidden"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="p-4 flex items-center justify-between border-b border-border-primary">
              <div className="flex items-center">
                <UserAvatar />
                <div className="ml-3">
                  <h3 className="font-medium text-text-primary">{user?.name || 'Usuário'}</h3>
                  <p className="text-xs text-text-secondary">{user?.role === 'admin' ? 'Administrador' : 'Usuário'}</p>
                </div>
              </div>
              <button 
                className="p-2 rounded-full hover:bg-background-secondary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X size={20} className="text-text-secondary" />
              </button>
            </div>
            <SidebarContent isHovered={true} isDesktop={false} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );

  // Conteúdo interno da Sidebar - reutilizado entre as versões desktop e mobile
  const SidebarContent = ({ isHovered, isDesktop }) => (
    <nav className="flex-1 overflow-y-auto py-2 px-2">
      {sidebarRoutes.map(({ label, path, icon: Icon }) => {
        const isActive = location.pathname === path;
        return (
          <Link
            key={path}
            to={path}
            className={`flex items-center relative ${isActive ? 'text-brand-primary' : 'text-text-secondary'} group h-14`}
          >
            <div className={`flex items-center justify-center min-w-[52px] h-12 rounded-xl my-1 group-hover:bg-background-secondary transition-all duration-200 
              ${isActive ? 'bg-brand-primary/10' : ''}`}>
              <Icon size={22} className={isActive ? 'text-brand-primary' : 'text-text-secondary group-hover:text-brand-primary'} />
            </div>
            <motion.div
              className="flex items-center overflow-hidden whitespace-nowrap"
              initial={{ opacity: 0, width: 0 }}
              animate={{ 
                opacity: isDesktop ? (isHovered ? 1 : 0) : 1,
                width: isDesktop ? (isHovered ? 'auto' : 0) : 'auto'
              }}
              transition={{ duration: 0.2 }}
            >
              <span className={`ml-3 font-medium ${isActive ? 'text-brand-primary' : 'text-text-secondary'}`}>
                {label}
              </span>
            </motion.div>
            {isActive && (
              <motion.div 
                className="absolute left-0 inset-y-0 w-1 bg-brand-primary rounded-r-full"
                layoutId={isDesktop ? "activeIndicator" : "activeIndicatorMobile"}
              />
            )}
          </Link>
        );
      })}

      {isAdmin && (
        <>
          <div className="my-2 border-t border-border-primary mx-2"></div>
          
          {adminRoutes.map(({ label, path, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center relative ${isActive ? 'text-purple-500' : 'text-text-secondary'} group h-14`}
              >
                <div className={`flex items-center justify-center min-w-[52px] h-12 rounded-xl my-1 group-hover:bg-background-secondary transition-all duration-200 
                  ${isActive ? 'bg-purple-500/10' : ''}`}>
                  <Icon size={22} className={isActive ? 'text-purple-500' : 'text-text-secondary group-hover:text-purple-500'} />
                </div>
                <motion.div
                  className="flex items-center overflow-hidden whitespace-nowrap"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ 
                    opacity: isDesktop ? (isHovered ? 1 : 0) : 1,
                    width: isDesktop ? (isHovered ? 'auto' : 0) : 'auto'
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <span className={`ml-3 font-medium ${isActive ? 'text-purple-500' : 'text-text-secondary'}`}>
                    {label}
                  </span>
                </motion.div>
                {isActive && (
                  <motion.div 
                    className="absolute left-0 inset-y-0 w-1 bg-purple-500 rounded-r-full"
                    layoutId={isDesktop ? "activeIndicatorAdmin" : "activeIndicatorAdminMobile"}
                  />
                )}
              </Link>
            );
          })}
        </>
      )}
      
      {!isDesktop && (
        <div className="mt-6 mx-2 p-4 bg-background-secondary rounded-xl">
          <h4 className="text-sm font-medium text-text-primary mb-2">Seu plano CryptoTrade Pro</h4>
          <div className="w-full h-2 bg-background-tertiary rounded-full overflow-hidden mb-2">
            <div className="h-full bg-brand-primary w-[65%]"></div>
          </div>
          <p className="text-xs text-text-secondary">Validade: 65 dias restantes</p>
        </div>
      )}
    </nav>
  );

  // Botão de hamburger para abrir o menu em dispositivos móveis
  const MobileMenuButton = () => (
    <button 
      className="fixed z-40 bottom-4 left-4 w-12 h-12 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-lg md:hidden"
      onClick={() => setIsMobileMenuOpen(true)}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </button>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
      {isMobile && <MobileMenuButton />}
    </>
  );
}
