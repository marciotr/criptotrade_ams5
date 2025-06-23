import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  TrendingUp, 
  Shield, 
  Database, 
  Award, 
  Star, 
  ArrowRight, 
  Clock, 
  Users, 
  Zap,
  PlayCircle,
  Sparkles,
  LightbulbIcon,
  BarChart2
} from 'lucide-react';

// Recursos de aprendizado expandidos e melhor categorizados
const learnResources = [
  { 
    id: 1, 
    title: 'Introdução às Criptomoedas',
    description: 'Aprenda os conceitos básicos sobre criptomoedas e como elas funcionam no mundo financeiro moderno.',
    difficulty: 'Básico',
    duration: '15 minutos',
    category: 'Fundamentos',
    icon: BookOpen,
    color: 'from-blue-500 to-indigo-600',
    popular: true,
    new: false,
    completionRate: 78
  },
  { 
    id: 2, 
    title: 'Como Negociar Cripto',
    description: 'Um guia completo sobre como negociar criptomoedas de forma eficaz e minimizar riscos.',
    difficulty: 'Intermediário',
    duration: '25 minutos',
    category: 'Trading',
    icon: TrendingUp,
    color: 'from-emerald-500 to-green-600',
    popular: true,
    new: false,
    completionRate: 65
  },
  { 
    id: 3, 
    title: 'Entendendo a Blockchain',
    description: 'Uma análise aprofundada da tecnologia blockchain e suas aplicações além das criptomoedas.',
    difficulty: 'Intermediário',
    duration: '30 minutos',
    category: 'Tecnologia',
    icon: Database,
    color: 'from-purple-500 to-violet-600',
    popular: false,
    new: false,
    completionRate: 42
  },
  { 
    id: 4, 
    title: 'Dicas de Segurança Cripto',
    description: 'Dicas essenciais sobre como manter seus ativos criptográficos seguros contra ameaças digitais.',
    difficulty: 'Básico',
    duration: '20 minutos',
    category: 'Segurança',
    icon: Shield,
    color: 'from-amber-500 to-orange-600',
    popular: false,
    new: false,
    completionRate: 89
  },
  { 
    id: 5, 
    title: 'Análise Técnica para Iniciantes',
    description: 'Aprenda os fundamentos da análise técnica para tomar decisões mais informadas ao negociar.',
    difficulty: 'Intermediário',
    duration: '35 minutos',
    category: 'Trading',
    icon: BarChart2,
    color: 'from-rose-500 to-pink-600',
    popular: false,
    new: true,
    completionRate: 23
  },
  { 
    id: 6, 
    title: 'NFTs: O Guia Completo',
    description: 'Entenda o que são NFTs, como funcionam e como podem ser usados como investimento.',
    difficulty: 'Intermediário',
    duration: '28 minutos',
    category: 'Tecnologia',
    icon: Award,
    color: 'from-cyan-500 to-blue-600',
    popular: true,
    new: true,
    completionRate: 56
  },
];

export function Learn() {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [hoveredCard, setHoveredCard] = useState(null);
  
  const categories = ['Todos', 'Fundamentos', 'Trading', 'Tecnologia', 'Segurança'];
  
  const filteredResources = selectedCategory === 'Todos' 
    ? learnResources 
    : learnResources.filter(resource => resource.category === selectedCategory);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-8 px-4 md:px-6 space-y-8 max-w-7xl mx-auto"
    >
      {/* Header com título animado */}
      <motion.div 
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="text-center space-y-4 mb-12"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-block"
        >
          <div className="bg-gradient-to-r from-brand-primary to-purple-500 p-3 rounded-full inline-flex">
            <Sparkles className="text-white" size={28} />
          </div>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl md:text-4xl font-bold text-text-primary"
        >
          Centro de Aprendizagem
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-text-secondary max-w-2xl mx-auto"
        >
          Expanda seus conhecimentos sobre criptomoedas, blockchain e finanças digitais com nossos recursos educativos cuidadosamente selecionados.
        </motion.p>
      </motion.div>

      {/* Banner em destaque */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="relative bg-gradient-to-r from-brand-primary to-purple-600 rounded-2xl overflow-hidden"
      >
        <div className="absolute inset-0">
          <div className="absolute w-64 h-64 bg-white/10 rounded-full -top-20 -right-20 blur-xl"></div>
          <div className="absolute w-48 h-48 bg-white/5 rounded-full bottom-10 left-10 blur-md"></div>
        </div>
        
        <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row md:items-center">
          <div className="md:w-3/5 space-y-4">
            <div className="flex items-center space-x-2">
              <span className="bg-white text-brand-primary text-xs font-semibold px-3 py-1 rounded-full">EM DESTAQUE</span>
              <span className="bg-yellow-400 text-yellow-900 text-xs font-semibold px-3 py-1 rounded-full flex items-center">
                <Star size={12} className="mr-1" /> POPULAR
              </span>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-white">Curso Completo: Do Zero ao Trading Profissional</h2>
            
            <p className="text-white/90 md:pr-10">
              Aprenda todos os conceitos essenciais para iniciar sua jornada no mundo das criptomoedas com confiança e conhecimento.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center text-white/80 text-sm">
                <Clock size={16} className="mr-1" />
                <span>5 horas de conteúdo</span>
              </div>
              <div className="flex items-center text-white/80 text-sm">
                <Users size={16} className="mr-1" />
                <span>10.235 alunos</span>
              </div>
              <div className="flex items-center text-white/80 text-sm">
                <Star size={16} className="mr-1" />
                <span>4.9/5 avaliação</span>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center mt-6 bg-white text-brand-primary px-6 py-3 rounded-full font-medium shadow-lg"
            >
              <PlayCircle size={18} className="mr-2" />
              Comece Agora
            </motion.button>
          </div>
          
          <div className="hidden md:block md:w-2/5">
            <motion.img 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              src="https://images.unsplash.com/photo-1639322537504-6427a16b0a28?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1332&q=80" 
              alt="Trading" 
              className="w-full h-64 object-cover rounded-xl shadow-lg transform -rotate-3" 
            />
          </div>
        </div>
      </motion.div>

      {/* Categorias de filtro */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-wrap gap-2 justify-center my-8"
      >
        {categories.map((category, index) => (
          <motion.button
            key={category}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === category 
                ? 'bg-brand-primary text-white shadow-md' 
                : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
            }`}
          >
            {category}
          </motion.button>
        ))}
      </motion.div>

      {/* Cartões de recurso com hover e animações */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredResources.map((resource) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                delay: 0.1 * (resource.id % 6), 
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              onHoverStart={() => setHoveredCard(resource.id)}
              onHoverEnd={() => setHoveredCard(null)}
              className="bg-background-secondary border border-border-primary rounded-xl overflow-hidden cursor-pointer group relative"
            >
              {/* Barra de progresso */}
              <div className="h-1 w-full bg-gray-200 dark:bg-gray-700">
                <div 
                  className={`h-1 bg-gradient-to-r ${resource.color}`} 
                  style={{ width: `${resource.completionRate}%` }}
                ></div>
              </div>
              
              {/* Cabeçalho com ícone e categoria */}
              <div className={`p-1 bg-gradient-to-r ${resource.color} w-full flex justify-between items-center`}>
                <span className="text-xs font-medium text-white px-3">{resource.category}</span>
                <span className="text-xs font-medium text-white/90 px-3 flex items-center">
                  <Clock size={12} className="mr-1" />
                  {resource.duration}
                </span>
              </div>
              
              <div className="p-6">
                {/* Ícone */}
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${resource.color} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                  <resource.icon size={24} className="text-white" />
                </div>
                
                {/* Badges */}
                <div className="flex gap-2 mb-3">
                  {resource.new && (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full font-medium">
                      NOVO
                    </span>
                  )}
                  {resource.popular && (
                    <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full font-medium flex items-center">
                      <Zap size={10} className="mr-1" /> POPULAR
                    </span>
                  )}
                </div>
                
                {/* Título e descrição */}
                <h4 className="text-lg font-bold text-text-primary mb-2 group-hover:text-brand-primary transition-colors">
                  {resource.title}
                </h4>
                
                <p className="text-sm text-text-secondary mb-4">
                  {resource.description}
                </p>
                
                {/* Dificuldade */}
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs font-medium text-text-tertiary bg-background-tertiary px-3 py-1 rounded-full">
                    {resource.difficulty}
                  </span>
                  
                  <motion.div 
                    initial={{ x: -5, opacity: 0 }}
                    animate={{ 
                      x: hoveredCard === resource.id ? 0 : -5,
                      opacity: hoveredCard === resource.id ? 1 : 0 
                    }}
                    className="flex items-center text-brand-primary text-sm font-medium"
                  >
                    Começar <ArrowRight size={16} className="ml-1" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Seção Por que aprender */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-16 bg-background-secondary border border-border-primary rounded-xl p-8"
      >
        <h3 className="text-xl font-bold text-text-primary mb-8 flex items-center">
          <LightbulbIcon className="text-yellow-500 mr-2" size={24} />
          Por que continuar aprendendo sobre cripto?
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            whileHover={{ y: -5 }}
            className="p-5 bg-background-primary rounded-lg"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
              <TrendingUp className="text-indigo-600 dark:text-indigo-400" size={20} />
            </div>
            <h4 className="font-semibold text-text-primary mb-2">Mercado em Crescimento</h4>
            <p className="text-text-secondary text-sm">O mercado de criptomoedas continua a crescer e evoluir, criando novas oportunidades de carreira e investimento.</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="p-5 bg-background-primary rounded-lg"
          >
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <Database className="text-green-600 dark:text-green-400" size={20} />
            </div>
            <h4 className="font-semibold text-text-primary mb-2">Tecnologia do Futuro</h4>
            <p className="text-text-secondary text-sm">Blockchain e tecnologias descentralizadas estão reformulando muitas indústrias além das finanças.</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="p-5 bg-background-primary rounded-lg"
          >
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4">
              <Award className="text-orange-600 dark:text-orange-400" size={20} />
            </div>
            <h4 className="font-semibold text-text-primary mb-2">Habilidades Valiosas</h4>
            <p className="text-text-secondary text-sm">O conhecimento em cripto e blockchain é cada vez mais valorizado no mercado de trabalho global.</p>
          </motion.div>
        </div>
      </motion.div>
      
      {/* CTA Final */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center py-10"
      >
        <motion.h3 
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="text-xl font-bold text-text-primary mb-4"
        >
          Pronto para aprofundar seus conhecimentos?
        </motion.h3>
        
        <motion.p className="text-text-secondary mb-6 max-w-2xl mx-auto">
          Nossa plataforma oferece recursos atualizados constantemente para mantê-lo à frente no dinâmico mundo das criptomoedas.
        </motion.p>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-brand-primary text-white px-6 py-3 rounded-full font-medium shadow-md flex items-center mx-auto"
        >
          Explorar Todos os Cursos
          <ArrowRight size={16} className="ml-2" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}