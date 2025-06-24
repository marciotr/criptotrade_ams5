import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bitcoin, DollarSign } from 'lucide-react';

// Componente animado para os cartões de criptomoedas
const CryptoCards = () => {
  const cards = [
    { name: 'Bitcoin', symbol: 'BTC', price: '186.430', change: '+2.4%', color: 'from-amber-500 to-orange-600' },
    { name: 'Ethereum', symbol: 'ETH', price: '9.875', change: '+1.8%', color: 'from-blue-500 to-indigo-600' },
    { name: 'Solana', symbol: 'SOL', price: '437', change: '+5.2%', color: 'from-purple-500 to-fuchsia-600' },
  ];

  return (
    <div className="absolute -right-24 md:-right-20 top-1/2 -translate-y-1/2 space-y-6 hidden lg:block">
      {cards.map((card, index) => (
        <motion.div
          key={card.name}
          className={`bg-gradient-to-r ${card.color} p-4 rounded-l-xl w-48 shadow-lg`}
          initial={{ opacity: 0, x: 100 }}
          animate={{ 
            opacity: 1, 
            x: 0,
            y: [0, -5, 5, 0],
          }}
          transition={{
            y: {
              repeat: Infinity,
              duration: 5,
              delay: index * 0.8,
            },
            opacity: { duration: 0.8, delay: 0.3 + index * 0.2 },
            x: { duration: 0.8, delay: 0.3 + index * 0.2 }
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-white">{card.name}</h4>
            <span className="text-xs font-bold bg-white/20 text-white px-1.5 py-0.5 rounded-md">
              {card.symbol}
            </span>
          </div>
          <div className="font-mono text-lg font-bold text-white">
            R$ {card.price}
          </div>
          <div className="flex justify-between items-center mt-1">
            <div className="w-16 h-6">
              <svg viewBox="0 0 100 30" className="w-full h-full">
                <path
                  d={`M0,15 Q25,${5 + Math.random() * 20} 50,${10 + Math.random() * 10} T100,15`}
                  fill="none"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth="1"
                />
              </svg>
            </div>
            <span className="text-white text-sm font-medium bg-white/10 px-1.5 py-0.5 rounded">
              {card.change}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export function DecorativeElements() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Verificar no carregamento inicial
    checkMobile();
    
    // Adicionar listener para redimensionamento
    window.addEventListener('resize', checkMobile);
    
    // Limpeza
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Em dispositivos móveis, mostrar elementos decorativos mínimos para melhor performance
  if (isMobile) {
    return (
      <>
        <motion.div
          className="absolute -bottom-2 -left-2 w-5 h-5 bg-gradient-to-br from-brand-primary to-purple-600 rounded-full"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute top-8 right-8 w-3 h-3 bg-amber-400/60 rounded-full blur-sm"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </>
    );
  }

  return (
    <>
      {/* Círculos decorativos espalhados */}
      <div className="absolute top-16 left-16 w-24 h-24 rounded-full bg-brand-primary/5 blur-xl hidden sm:block"></div>
      <div className="absolute bottom-32 right-16 w-40 h-40 rounded-full bg-purple-600/5 blur-xl hidden sm:block"></div>
      
      {/* Cartões de cripto para telas grandes */}
      <CryptoCards />
      
      {/* Cartões de cripto à esquerda (versão espelhada) */}
      <div className="hidden xl:block absolute -left-32 top-1/2 -translate-y-1/2 scale-90 opacity-80">
        <div className="space-y-6">
          {[
            { name: 'Polkadot', symbol: 'DOT', price: '37,18', change: '+2.7%', color: 'from-pink-500 to-red-600' },
            { name: 'Cardano', symbol: 'ADA', price: '2,31', change: '+0.6%', color: 'from-blue-400 to-blue-600' },
          ].map((card, index) => (
            <motion.div
              key={card.name}
              className={`bg-gradient-to-r ${card.color} p-4 rounded-r-xl w-48 shadow-lg`}
              initial={{ opacity: 0, x: -100 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                y: [0, -5, 5, 0],
              }}
              transition={{
                y: {
                  repeat: Infinity,
                  duration: 5,
                  delay: index * 0.8,
                },
                opacity: { duration: 0.8, delay: 0.3 + index * 0.2 },
                x: { duration: 0.8, delay: 0.3 + index * 0.2 }
              }}
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-white">{card.name}</h4>
                <span className="text-xs font-bold bg-white/20 text-white px-1.5 py-0.5 rounded-md">
                  {card.symbol}
                </span>
              </div>
              <div className="font-mono text-lg font-bold text-white">
                R$ {card.price}
              </div>
              <div className="flex justify-between items-center mt-1">
                <div className="w-16 h-6">
                  <svg viewBox="0 0 100 30" className="w-full h-full">
                    <path
                      d={`M0,15 Q25,${5 + Math.random() * 20} 50,${10 + Math.random() * 10} T100,15`}
                      fill="none"
                      stroke="rgba(255,255,255,0.5)"
                      strokeWidth="1"
                    />
                  </svg>
                </div>
                <span className="text-white text-sm font-medium bg-white/10 px-1.5 py-0.5 rounded">
                  {card.change}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Elementos decorativos adicionais no fundo (global) - apenas para telas maiores */}
      <div className="hidden lg:block">
        <motion.div
          className="absolute top-16 right-16 w-16 h-16 bg-gradient-to-br from-brand-primary/30 to-purple-600/30 rounded-full blur-sm"
          animate={{
            y: [0, -15, 0],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute bottom-32 left-64 w-10 h-10 bg-amber-400/20 rounded-full blur-sm"
          animate={{
            y: [0, 10, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        
        <motion.div 
          className="absolute top-36 left-24 text-brand-primary/20"
          style={{ fontSize: '64px' }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 15, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Bitcoin />
        </motion.div>
        
        <motion.div 
          className="absolute bottom-48 right-48 text-purple-500/20"
          style={{ fontSize: '48px' }}
          animate={{
            y: [0, 15, 0],
            rotate: [0, -10, 0],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        >
          <DollarSign />
        </motion.div>
      </div>
    </>
  );
}