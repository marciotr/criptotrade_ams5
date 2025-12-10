import React, { useState } from 'react';
import { X, Move, Eye, EyeOff, RotateCcw, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DraggableItem = ({ title, id, isVisible, onToggle, section }) => {
  return (
    <motion.div
      className="p-3 mb-2 bg-background-secondary rounded-lg border border-border-primary flex items-center justify-between"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center">
        <Move className="mr-3 text-text-tertiary" size={16} />
        <span className="text-text-primary">{title}</span>
      </div>
      
      <button
        onClick={() => onToggle(section, id)}
        className={`p-2 rounded-full ${isVisible ? 'text-brand-primary' : 'text-text-tertiary'}`}
      >
        {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
      </button>
    </motion.div>
  );
};

export const CustomizationModal = ({ isOpen, onClose, userLayout, onToggleComponent, onReset, onSave }) => {
  const sections = [
    { 
      id: 'topSection', 
      title: 'Seção Superior', 
      components: [
        { id: 'welcome', title: 'Boas-vindas' },
        { id: 'trendingCoins', title: 'Moedas em Tendência' },
        { id: 'tradingTips', title: 'Dicas de Trading' }
      ]
    },
    { 
      id: 'middleSection', 
      title: 'Estatísticas', 
      components: [
        { id: 'portfolioValue', title: 'Valor do Portfólio' },
        { id: 'dailyProfit', title: 'Lucro Diário' },
        { id: '24hChange', title: 'Variação 24h' },
        { id: 'activePositions', title: 'Posições Ativas' }
      ]
    },
    { 
      id: 'mainContent', 
      title: 'Conteúdo Principal', 
      components: [
        { id: 'chart', title: 'Gráfico de Preços' },
        { id: 'marketOverview', title: 'Visão Geral do Mercado' },
        { id: 'topGainers', title: 'Maiores Altas' },
        { id: 'topLosers', title: 'Maiores Baixas' }
      ]
    }
  ];

  const isComponentVisible = (section, componentId) => {
    return userLayout[section]?.includes(componentId);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-background-primary rounded-xl shadow-xl border border-border-primary z-50 overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="p-4 border-b border-border-primary flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Personalizar Painel</h2>
              <button 
                className="p-2 rounded-full hover:bg-background-secondary transition-colors"
                onClick={onClose}
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {sections.map(section => (
                <div key={section.id} className="mb-6">
                  <h3 className="text-md font-medium mb-3 text-text-primary">{section.title}</h3>
                  
                  {section.components.map(component => (
                    <DraggableItem 
                      key={component.id}
                      title={component.title}
                      id={component.id}
                      isVisible={isComponentVisible(section.id, component.id)}
                      onToggle={onToggleComponent}
                      section={section.id}
                    />
                  ))}
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-border-primary flex items-center justify-between">
              <button 
                className="px-4 py-2 rounded-lg flex items-center text-text-secondary hover:text-text-primary transition-colors"
                onClick={onReset}
              >
                <RotateCcw size={16} className="mr-2" />
                Restaurar padrão
              </button>
              
              <div className="flex space-x-3">
                <button 
                  className="px-4 py-2 rounded-lg border border-border-primary text-text-primary hover:bg-background-secondary transition-colors"
                  onClick={onClose}
                >
                  Cancelar
                </button>
                
                <button 
                  className="px-4 py-2 rounded-lg bg-brand-primary text-white hover:bg-opacity-90 transition-colors flex items-center"
                  onClick={onSave}
                >
                  <Save size={16} className="mr-2" />
                  Salvar alterações
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};