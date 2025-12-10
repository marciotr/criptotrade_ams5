import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Globe, Zap } from 'lucide-react';

const WelcomeScreen = ({ userName, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showSkip, setShowSkip] = useState(false);

  const steps = [
    {
      title: `Olá, ${userName}!`,
      subtitle: "Bem-vindo(a) ao CryptoTrade+",
      description: "Estamos felizes em ter você conosco. Vamos começar nossa jornada juntos no mundo das criptomoedas.",
      icon: Sparkles,
      color: "from-brand-primary to-brand-primary/70"
    },
    {
      title: "Acompanhe o Mercado",
      subtitle: "Em tempo real",
      description: "Monitore preços, tendências e movimentações do mercado com dados atualizados a cada minuto.",
      icon: Globe,
      color: "from-green-500 to-teal-500"
    },
    {
      title: "Pronto para Começar",
      subtitle: "Sua dashboard está preparada",
      description: "Personalize sua experiência e explore todas as funcionalidades que preparamos para você.",
      icon: Zap,
      color: "from-amber-500 to-orange-500"
    }
  ];

  useEffect(() => {
    // Exibe o botão de pular após 2 segundos
    const timer = setTimeout(() => setShowSkip(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (currentStep >= steps.length) {
      // Quando completar tudo, chama o callback de conclusão
      onComplete();
    }
  }, [currentStep, steps.length, onComplete]);

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const skipTutorial = () => {
    onComplete();
  };

  if (currentStep >= steps.length) return null;

  const currentStepData = steps[currentStep];

  return (
    <motion.div 
      className="fixed inset-0 flex items-center justify-center z-50 bg-background-primary"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 overflow-hidden">
        {/* Elementos decorativos de fundo */}
        <motion.div 
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ 
            background: `radial-gradient(circle, var(--brand-primary) 0%, transparent 70%)`,
            top: '20%',
            right: '10%'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            repeatType: "reverse" 
          }}
        />
        
        <motion.div 
          className="absolute w-80 h-80 rounded-full blur-3xl opacity-10"
          style={{ 
            background: `radial-gradient(circle, var(--brand-primary) 0%, transparent 70%)`,
            bottom: '10%',
            left: '5%'
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1
          }}
        />
      </div>
      
      <div className="max-w-lg w-full mx-auto px-6 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.div 
              className={`w-20 h-20 mx-auto mb-8 rounded-full flex items-center justify-center bg-gradient-to-br ${currentStepData.color}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, 0] }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <currentStepData.icon className="text-white" size={32} />
            </motion.div>
            
            <motion.h1 
              className="text-4xl font-bold mb-2 text-text-primary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {currentStepData.title}
            </motion.h1>
            
            <motion.h2
              className="text-xl font-medium mb-4 text-brand-primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {currentStepData.subtitle}
            </motion.h2>
            
            <motion.p 
              className="text-text-secondary mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {currentStepData.description}
            </motion.p>
            
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                {steps.map((_, idx) => (
                  <motion.div 
                    key={idx}
                    className={`h-2 rounded-full ${idx === currentStep ? 'w-8 bg-brand-primary' : 'w-2 bg-border-primary'}`}
                    animate={idx === currentStep ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ repeat: idx === currentStep ? Infinity : 0, repeatDelay: 2 }}
                  />
                ))}
              </div>
              
              <div className="flex items-center space-x-4">
                {showSkip && currentStep < steps.length - 1 && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-text-secondary hover:text-text-primary transition-colors"
                    onClick={skipTutorial}
                  >
                    Pular
                  </motion.button>
                )}
                
                <motion.button
                  className="bg-brand-primary text-white px-5 py-2.5 rounded-full flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={nextStep}
                >
                  {currentStep < steps.length - 1 ? 'Próximo' : 'Começar'}
                  <ArrowRight className="ml-2" size={18} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default WelcomeScreen;