import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Github, Facebook, Chrome } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../store/auth/useAuth';
import { authApi } from '../../services/api/api';

export function AuthForm({ type }) {
  const { showNotification } = useNotification();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',  // Valor padrão para campos obrigatórios
    address: '',  // Valor padrão para campos obrigatórios
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);

    try {
      if (type === 'signin') {
        const success = await login(formData);
        
        if (success) {
          showNotification('Login realizado com sucesso!', 'success');
          navigate('/dashboard', { replace: true });
        } else {
          showNotification('Credenciais inválidas.', 'error');
        }
      } else {
        // Adicionando role padrão para o novo usuário
        const registerData = {
          ...formData,
          role: 'user'
        };
        
        const response = await authApi.register(registerData);
        
        if (response.data) {
          // Mostrar notificação de sucesso após o registro
          showNotification(`Bem-vindo(a) ${formData.name}! Sua conta foi criada com sucesso.`, 'success');
          
          // Faça login automático após o registro
          await login({
            email: formData.email,
            password: formData.password
          });
          
          navigate('/dashboard', { replace: true });
        }
      }
    } catch (error) {
      console.error('Erro de autenticação:', error);
      
      // Melhor tratamento de erros para capturar erros da API
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors)
          .flat()
          .join(', ');
          
        showNotification(`Erro no registro: ${errorMessages}`, 'error');
      } else {
        showNotification(
          error.response?.data?.message || 'Falha na autenticação. Tente novamente.',
          'error'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const socialButtons = [
    { icon: Chrome, label: 'Google', color: 'bg-brand-primary' },
    { icon: Facebook, label: 'Facebook', color: 'bg-brand-primary' },
    { icon: Github, label: 'Github', color: 'bg-brand-primary' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md p-8 rounded-xl border border-border-primary bg-background-secondary shadow-lg"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-brand-primary mb-2">
          {type === 'signin' ? 'Welcome Back!' : 'Join CryptoEx'}
        </h2>
        <p className="text-text-secondary">
          {type === 'signin'
            ? 'Enter your credentials to access your account'
            : 'Create your account and start trading'}
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {type === 'signup' && (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="relative"
          >
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={20} />
            <input
              type="text"
              placeholder="Full Name"
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-border-primary bg-background-secondary text-text-primary placeholder-text-tertiary focus:ring-2 focus:ring-brand-primary transition-all"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </motion.div>
        )}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={20} />
          <input
            type="email"
            placeholder="Email"
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-border-primary bg-background-secondary text-text-primary placeholder-text-tertiary focus:ring-2 focus:ring-brand-primary transition-all"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </motion.div>
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={20} />
          <input
            type="password"
            placeholder="Password"
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-border-primary bg-background-secondary text-text-primary placeholder-text-tertiary focus:ring-2 focus:ring-brand-primary transition-all"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </motion.div>


        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 bg-brand-primary text-background-primary rounded-lg font-semibold transition-colors hover:opacity-90 disabled:opacity-50"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <span>Loading</span>
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ 
                  duration: 1.2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                ...
              </motion.span>
            </div>
          ) : (
            type === 'signin' ? 'Sign In' : 'Create Account'
          )}
        </motion.button>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-primary"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background-secondary text-text-secondary">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {socialButtons.map((button, index) => (
            <motion.button
              key={button.label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${button.color} text-background-primary p-3 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity`}
            >
              <button.icon size={20} />
            </motion.button>
          ))}
        </div>

        <p className="text-center text-text-secondary mt-6">
          {type === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <Link
            to={type === 'signin' ? '/signup' : '/signin'}
            className="text-brand-primary hover:underline font-medium"
          >
            {type === 'signin' ? 'Sign Up' : 'Sign In'}
          </Link>
        </p>
      </form>
    </motion.div>
  );
}