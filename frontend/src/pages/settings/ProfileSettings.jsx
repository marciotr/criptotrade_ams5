import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { ModalDeactivate } from './components/ModalDeactivate';
import { ModalDeleteAccount } from './components/ModalDeleteAccount';
import { ModalUpdatePhoto } from './components/ModalUpdatePhoto';
import { 
  Camera, MapPin, Phone, Globe, Shield, 
  User, Mail, Building, Calendar, Save,
  CheckCircle, AlertCircle, Lock, ArrowRight,
  ChevronDown, X, Edit
} from 'lucide-react';
import InputMask from 'react-input-mask';
import axios from 'axios';
import { NotificationToast } from '../../components/common/NotificationToast';
import { useAuth } from '../../store/auth/useAuth';
import { userApi } from '../../services/api/api';

export function ProfileSettings() {
  const { user, updateUser } = useAuth();
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [address, setAddress] = useState({
    cep: user?.address || '',
    street: '',
    neighborhood: '',
    city: '',
    state: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    website: user?.website || '',
    bio: user?.bio || '',
    photo: user?.photo || ''
  });
  const [notification, setNotification] = useState(null);
  const [activeSection, setActiveSection] = useState('personal');
  const [progress, setProgress] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [saveAnimation, setSaveAnimation] = useState(false);
  
  // Ref para o componente de foto
  const photoRef = useRef(null);
  
  // Motion values para animações interativas
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const response = await userApi.getProfile(user.id);
        const userData = response.data;

        setFormData({
          fullName: userData.name || '',
          username: userData.username || '',
          email: userData.email || '',
          phone: userData.phone || '',
          website: userData.website || '',
          bio: userData.bio || '',
          photo: userData.photo || ''
        });

        // Quebra o endereço completo em partes
        if (userData.address) {
          const addressParts = userData.address.split(',').map(part => part.trim());
          
          // Tenta identificar cada parte do endereço
          const addressObj = {
            street: addressParts[0] || '',
            neighborhood: addressParts[1] || '',
            city: addressParts[2] || '',
            state: addressParts[3] || '',
            cep: addressParts[4]?.replace('CEP: ', '') || ''
          };

          setAddress(addressObj);
        }

        // Calcular progresso de completude do perfil
        calculateProfileProgress(userData);
        
        setNotification({
          type: 'success',
          message: 'Dados do perfil carregados com sucesso!'
        });
      } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        setNotification({
          type: 'error',
          message: 'Falha ao carregar dados do perfil. Por favor, tente novamente.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchUserProfile();
    }
  }, [user]);

  // Calcular a porcentagem de completude do perfil
  const calculateProfileProgress = (userData) => {
    const fields = [
      userData.name,
      userData.username,
      userData.email,
      userData.phone,
      userData.address,
      userData.website,
      userData.bio,
      userData.photo
    ];
    
    const completedFields = fields.filter(field => field && field.trim() !== '').length;
    const percentage = Math.round((completedFields / fields.length) * 100);
    setProgress(percentage);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCEPChange = async (event) => {
    const cep = event.target.value;
    setAddress(prev => ({ ...prev, cep }));

    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length === 8) {
      setIsLoading(true);
      try {
        const response = await axios.get(`https://viacep.com.br/ws/${cleanCEP}/json/`);
        const data = response.data;
        
        if (!data.erro) {
          setAddress(prev => ({
            ...prev,
            street: data.logradouro || '',
            neighborhood: data.bairro || '',
            city: data.localidade || '',
            state: data.uf || '',
          }));
        } else {
          setAddress(prev => ({
            ...prev,
            street: '',
            neighborhood: '',
            city: '',
            state: '',
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar endereço:', error);
        setAddress(prev => ({
          ...prev,
          street: '',
          neighborhood: '',
          city: '',
          state: '',
        }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeactivate = (days) => {
    console.log(`Conta será desativada por ${days} dias.`);
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await userApi.deleteAccount(user.id);
      
      // Limpar dados do usuário e redirecionar
      localStorage.clear();
      setNotification({
        type: 'success',
        message: 'Sua conta foi excluída com sucesso.'
      });
      
      // Pequeno atraso para mostrar a notificação antes de redirecionar
      setTimeout(() => {
        window.location.href = '/signin';
      }, 1500);
      
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      setNotification({
        type: 'error',
        message: 'Falha ao excluir conta. Por favor, tente novamente.'
      });
    } finally {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setSaveAnimation(true);
      
      // Concatena os dados do endereço
      const fullAddress = [
        address.street,
        address.neighborhood,
        address.city,
        address.state,
        address.cep
      ]
        .filter(Boolean) 
        .join(', '); 

      // Cria o objeto de dados sem incluir a senha
      const updatedUserData = {
        id: user.id,
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: fullAddress, 
        photo: user?.photo,
        website: formData.website,
        bio: formData.bio,
        username: formData.username,
        role: user.role 
      };

      await userApi.updateProfile(user.id, updatedUserData);

      // Recalcular progresso após a atualização
      calculateProfileProgress(updatedUserData);

      setNotification({
        type: 'success',
        message: 'Seu perfil foi atualizado com sucesso!'
      });
      
      // Resetar animação após atraso
      setTimeout(() => {
        setSaveAnimation(false);
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setNotification({
        type: 'error',
        message: 'Falha ao atualizar perfil. Por favor, tente novamente.'
      });
      setSaveAnimation(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePhoto = async (file) => {
    try {
      setIsLoading(true);
      await userApi.updatePhoto(user.id, file);
      
      try {
        const resp = await userApi.getProfile(user.id);
        const updated = resp.data;
        setFormData(prev => ({ ...prev, photo: updated.photo || prev.photo }));
        if (updateUser) updateUser(updated);
      } catch (err) {
        console.warn('Foto atualizada, mas falha ao buscar perfil atualizado:', err);
      }

      setNotification({
        type: 'success',
        message: 'Foto de perfil atualizada com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao atualizar foto:', error);
      setNotification({
        type: 'error',
        message: 'Falha ao atualizar foto de perfil. Por favor, tente novamente.'
      });
    } finally {
      setIsLoading(false);
      setIsPhotoModalOpen(false);
    }
  };
  
  // Efeito 3D para mouse hover na foto
  const handleMouseMove = (e) => {
    const rect = photoRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const resetMousePosition = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <AnimatePresence>
        {notification && (
          <div className="fixed top-4 right-4 z-50">
            <NotificationToast
              type={notification.type}
              message={notification.message}
              onClose={() => setNotification(null)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Cabeçalho Perfil com Círculo de Progresso */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background-secondary border border-border-primary rounded-2xl p-6 shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary opacity-5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-6">
            {/* Foto de perfil 3D interativa */}
            <motion.div
              ref={photoRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={resetMousePosition}
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              className="relative group perspective-1000"
            >
              <motion.div 
                className="relative w-24 h-24 md:w-32 md:h-32 rounded-xl bg-gradient-to-br from-brand-primary to-purple-600 p-1 shadow-xl"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <img
                  src={formData.photo || "https://via.placeholder.com/150"}
                  alt="Perfil"
                  className="w-full h-full object-cover rounded-lg"
                />
                <motion.div 
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity"
                >
                  <button 
                    onClick={() => setIsPhotoModalOpen(true)}
                    className="bg-white text-black p-2 rounded-full"
                  >
                    <Camera size={18} />
                  </button>
                </motion.div>
              </motion.div>
              
              {/* Efeito de "brilho" no hover */}
              <motion.div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100"
                style={{
                  background: "radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.2), transparent 80%)",
                  "--mouse-x": "50%",
                  "--mouse-y": "50%",
                }}
                animate={{
                  "--mouse-x": `calc(${mouseX.get()}px + 50%)`,
                  "--mouse-y": `calc(${mouseY.get()}px + 50%)`,
                }}
              />
            </motion.div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-brand-primary to-purple-500 bg-clip-text text-transparent">
                {formData.fullName || "Seu Perfil"}
              </h1>
              <p className="text-text-secondary mt-1">
                {formData.username ? `@${formData.username}` : "Complete suas informações de perfil"}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center">
            {/* Círculo de progresso do perfil */}
            <div className="relative">
              <svg className="w-20 h-20" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="40" 
                  fill="none" 
                  stroke="rgba(var(--border-primary), 0.6)" 
                  strokeWidth="8"
                />
                <motion.circle 
                  cx="50" cy="50" r="40" 
                  fill="none" 
                  stroke="url(#profileGradient)" 
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                  animate={{ 
                    strokeDashoffset: 2 * Math.PI * 40 * (1 - progress/100) 
                  }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  style={{ 
                    transformOrigin: "center",
                    transform: "rotate(-90deg)"
                  }}
                />
                <defs>
                  <linearGradient id="profileGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgb(var(--brand-primary))" />
                    <stop offset="100%" stopColor="rgb(var(--purple-600))" />
                  </linearGradient>
                </defs>
                <text 
                  x="50" 
                  y="50" 
                  textAnchor="middle" 
                  dominantBaseline="middle" 
                  className="fill-text-primary font-semibold text-lg"
                >
                  {progress}%
                </text>
              </svg>
            </div>
            <p className="text-sm text-text-secondary mt-2">Conclusão do Perfil</p>
          </div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-background-primary rounded-xl p-4 border border-border-primary"
        >
          <div className="flex items-center gap-3">
            <CheckCircle size={18} className={progress === 100 ? "text-green-500" : "text-text-tertiary"} />
            <div className="flex-grow">
              <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-brand-primary to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                />
              </div>
            </div>
            <button 
              className="text-sm font-medium text-brand-primary hover:underline transition-colors"
              onClick={() => setPreviewMode(!previewMode)}
            >
              {previewMode ? "Modo de Edição" : "Modo de Visualização"}
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Menu de Navegação Entre Seções */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex overflow-x-auto sm:justify-center gap-2 py-2 px-4"
      >
        {[
          {
            id: 'personal',
            label: 'Informações Pessoais',
            icon: User
          },
          {
            id: 'address',
            label: 'Endereço',
            icon: MapPin
          },
          {
            id: 'contact',
            label: 'Contato',
            icon: Phone
          },
          {
            id: 'security',
            label: 'Segurança',
            icon: Lock
          }
        ].map(section => (
          <motion.button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap ${
              activeSection === section.id 
                ? 'bg-brand-primary text-white shadow-lg' 
                : 'bg-background-secondary text-text-secondary border border-border-primary'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <section.icon size={16} />
            {section.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Conteúdo de Perfil com Animações */}
      {!previewMode ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeSection === 'personal' && (
              <motion.section 
                className="bg-background-secondary border border-border-primary rounded-2xl shadow-lg overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="border-b border-border-primary p-6">
                  <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                    <User className="text-brand-primary" size={20} />
                    Informações Pessoais
                  </h2>
                  <p className="text-text-secondary text-sm mt-1">
                    Atualize seus dados pessoais
                  </p>
                </div>

                <form className="p-6 space-y-6" onSubmit={handleSave}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div 
                      className="group"
                      whileHover={{ y: -2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <label className="block text-sm font-medium text-text-secondary mb-1">Nome Completo</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary group-hover:text-brand-primary transition-colors" size={16} />
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full pl-10 p-2.5 rounded-lg border border-border-primary bg-background-primary text-text-primary placeholder-text-tertiary focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                          placeholder="João Silva"
                        />
                      </div>
                    </motion.div>

                    <motion.div 
                      className="group"
                      whileHover={{ y: -2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <label className="block text-sm font-medium text-text-secondary mb-1">Nome de Usuário</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary group-hover:text-brand-primary transition-colors">@</span>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          className="w-full pl-10 p-2.5 rounded-lg border border-border-primary bg-background-primary text-text-primary placeholder-text-tertiary focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                          placeholder="joaosilva"
                        />
                      </div>
                    </motion.div>
                  
                    <motion.div 
                      className="group md:col-span-2"
                      whileHover={{ y: -2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <label className="block text-sm font-medium text-text-secondary mb-1">Biografia</label>
                      <div className="relative">
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          className="w-full p-2.5 rounded-lg border border-border-primary bg-background-primary text-text-primary placeholder-text-tertiary resize-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                          rows={3}
                          placeholder="Conte-nos sobre você..."
                        />
                        <span className="absolute bottom-2 right-2 text-xs text-text-tertiary">
                          {formData.bio?.length || 0}/250
                        </span>
                      </div>
                    </motion.div>
                  </div>
                  
                  <motion.button
                    type="submit"
                    disabled={isLoading || saveAnimation}
                    className={`px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 w-full sm:w-auto ${
                      saveAnimation ? "bg-green-500 text-white" : "bg-brand-primary text-white"
                    }`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {saveAnimation ? (
                      <>
                        <CheckCircle size={18} />
                        Salvo com Sucesso
                      </>
                    ) : isLoading ? (
                      <>
                        <motion.div 
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Salvar Alterações
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.section>
            )}

            {activeSection === 'contact' && (
              <motion.section 
                className="bg-background-secondary border border-border-primary rounded-2xl shadow-lg overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="border-b border-border-primary p-6">
                  <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                    <Phone className="text-brand-primary" size={20} />
                    Informações de Contato
                  </h2>
                  <p className="text-text-secondary text-sm mt-1">
                    Atualize seus dados de contato
                  </p>
                </div>

                <form className="p-6 space-y-6" onSubmit={handleSave}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div 
                      className="group"
                      whileHover={{ y: -2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <label className="block text-sm font-medium text-text-secondary mb-1">E-mail</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary group-hover:text-brand-primary transition-colors" size={16} />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full pl-10 p-2.5 rounded-lg border border-border-primary bg-background-primary text-text-primary placeholder-text-tertiary focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                          placeholder="joao@exemplo.com"
                        />
                      </div>
                    </motion.div>

                    <motion.div 
                      className="group"
                      whileHover={{ y: -2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <label className="block text-sm font-medium text-text-secondary mb-1">Telefone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary group-hover:text-brand-primary transition-colors" size={16} />
                        <InputMask
                          mask="+55 (99) 99999-9999"
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full pl-10 p-2.5 rounded-lg border border-border-primary bg-background-primary text-text-primary placeholder-text-tertiary focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                          placeholder="+55 (00) 00000-0000"
                        />
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="group"
                      whileHover={{ y: -2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <label className="block text-sm font-medium text-text-secondary mb-1">Website</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary group-hover:text-brand-primary transition-colors" size={16} />
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          className="w-full pl-10 p-2.5 rounded-lg border border-border-primary bg-background-primary text-text-primary placeholder-text-tertiary focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                          placeholder="https://exemplo.com"
                        />
                      </div>
                    </motion.div>
                  </div>
                  
                  <motion.button
                    type="submit"
                    disabled={isLoading || saveAnimation}
                    className={`px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 w-full sm:w-auto ${
                      saveAnimation ? "bg-green-500 text-white" : "bg-brand-primary text-white"
                    }`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {saveAnimation ? (
                      <>
                        <CheckCircle size={18} />
                        Salvo com Sucesso
                      </>
                    ) : isLoading ? (
                      <>
                        <motion.div 
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Salvar Alterações
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.section>
            )}

            {activeSection === 'address' && (
              <motion.section 
                className="bg-background-secondary border border-border-primary rounded-2xl shadow-lg overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="border-b border-border-primary p-6">
                  <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                    <MapPin className="text-brand-primary" size={20} />
                    Informações de Endereço
                  </h2>
                  <p className="text-text-secondary text-sm mt-1">
                    Atualize seus dados de localização
                  </p>
                </div>

                <form className="p-6 space-y-6" onSubmit={handleSave}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div 
                      className="group"
                      whileHover={{ y: -2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <label className="block text-sm font-medium text-text-secondary mb-1">CEP</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary group-hover:text-brand-primary transition-colors" size={16} />
                        <InputMask
                          mask="99999-999"
                          type="text"
                          className="w-full pl-10 p-2.5 rounded-lg border border-border-primary bg-background-primary text-text-primary placeholder-text-tertiary focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                          placeholder="00000-000"
                          onChange={handleCEPChange}
                          value={address.cep}
                          disabled={isLoading}
                          name="cep"
                        />
                        {isLoading && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <motion.div 
                              className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                          </div>
                        )}
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="group"
                      whileHover={{ y: -2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <label className="block text-sm font-medium text-text-secondary mb-1">Rua</label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary group-hover:text-brand-primary transition-colors" size={16} />
                        <input
                          type="text"
                          name="street"
                          className="w-full pl-10 p-2.5 rounded-lg border border-border-primary bg-background-primary text-text-primary placeholder-text-tertiary focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                          value={address.street}
                          onChange={handleAddressChange}
                          placeholder="Seu endereço"
                        />
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="group"
                      whileHover={{ y: -2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <label className="block text-sm font-medium text-text-secondary mb-1">Bairro</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="neighborhood"
                          className="w-full p-2.5 rounded-lg border border-border-primary bg-background-primary text-text-primary placeholder-text-tertiary focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                          value={address.neighborhood}
                          onChange={handleAddressChange}
                          placeholder="Seu bairro"
                        />
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="group"
                      whileHover={{ y: -2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <label className="block text-sm font-medium text-text-secondary mb-1">Cidade</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="city"
                          className="w-full p-2.5 rounded-lg border border-border-primary bg-background-primary text-text-primary placeholder-text-tertiary focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                          value={address.city}
                          onChange={handleAddressChange}
                          placeholder="Sua cidade"
                        />
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="group"
                      whileHover={{ y: -2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <label className="block text-sm font-medium text-text-secondary mb-1">Estado</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="state"
                          className="w-full p-2.5 rounded-lg border border-border-primary bg-background-primary text-text-primary placeholder-text-tertiary focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                          value={address.state}
                          onChange={handleAddressChange}
                          placeholder="Seu estado"
                        />
                      </div>
                    </motion.div>
                  </div>
                  
                  <motion.button
                    type="submit"
                    disabled={isLoading || saveAnimation}
                    className={`px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 w-full sm:w-auto ${
                      saveAnimation ? "bg-green-500 text-white" : "bg-brand-primary text-white"
                    }`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {saveAnimation ? (
                      <>
                        <CheckCircle size={18} />
                        Salvo com Sucesso
                      </>
                    ) : isLoading ? (
                      <>
                        <motion.div 
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Salvar Alterações
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.section>
            )}

            {activeSection === 'security' && (
              <motion.section 
                className="bg-background-secondary border border-border-primary rounded-2xl shadow-lg overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="border-b border-border-primary p-6">
                  <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                    <Shield className="text-brand-primary" size={20} />
                    Segurança da Conta
                  </h2>
                  <p className="text-text-secondary text-sm mt-1">
                    Gerencie as configurações de segurança da sua conta
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  <motion.div 
                    className="bg-background-primary border border-border-primary rounded-xl p-4"
                    whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-lg">
                          <AlertCircle size={18} />
                        </div>
                        <div>
                          <h3 className="text-text-primary font-medium">Desativar Conta</h3>
                          <p className="text-text-secondary text-sm">Desativar temporariamente sua conta</p>
                        </div>
                      </div>
                      
                      <motion.button
                        onClick={() => setIsDeactivateModalOpen(true)}
                        className="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg font-medium"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Desativar
                      </motion.button>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-background-primary border border-border-primary rounded-xl p-4"
                    whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-lg">
                          <AlertCircle size={18} />
                        </div>
                        <div>
                          <h3 className="text-text-primary font-medium">Excluir Conta</h3>
                          <p className="text-text-secondary text-sm">Excluir permanentemente sua conta e dados</p>
                        </div>
                      </div>
                      
                      <motion.button
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg font-medium"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Excluir
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
              </motion.section>
            )}
          </motion.div>
        </AnimatePresence>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-background-secondary border border-border-primary rounded-2xl shadow-lg p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-text-primary">Visualização do Perfil</h2>
            <motion.button
              onClick={() => setPreviewMode(false)}
              className="px-4 py-2 border border-border-primary text-text-primary rounded-lg hover:bg-background-tertiary transition-colors text-sm flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Edit size={14} />
              Editar Perfil
            </motion.button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center">
              <motion.div 
                className="w-40 h-40 rounded-full overflow-hidden border-4 border-brand-primary/20"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <img
                  src={formData.photo || "https://via.placeholder.com/150"}
                  alt="Perfil"
                  className="w-full h-full object-cover"
                />
              </motion.div>
              
              <div className="mt-4 text-center">
                <h3 className="text-2xl font-bold text-text-primary">{formData.fullName}</h3>
                <p className="text-brand-primary">{formData.username ? `@${formData.username}` : ""}</p>
              </div>
              
              <div className="mt-4 flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200`}>
                  {user?.role || "usuário"}
                </span>
              </div>
            </div>
            
            <div className="flex-1 space-y-6">
              <div>
                <h4 className="text-text-tertiary text-sm uppercase tracking-wider mb-2">Biografia</h4>
                <p className="text-text-primary bg-background-primary p-4 rounded-lg border border-border-primary">
                  {formData.bio || "Nenhuma biografia fornecida ainda."}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-text-tertiary text-sm uppercase tracking-wider mb-2">Informações de Contato</h4>
                  <div className="space-y-3 bg-background-primary p-4 rounded-lg border border-border-primary">
                    <div className="flex items-center gap-2">
                      <Mail className="text-text-tertiary" size={16} />
                      <span className="text-text-primary">{formData.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="text-text-tertiary" size={16} />
                      <span className="text-text-primary">{formData.phone || "Não fornecido"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="text-text-tertiary" size={16} />
                      <span className="text-text-primary">{formData.website || "Não fornecido"}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-text-tertiary text-sm uppercase tracking-wider mb-2">Endereço</h4>
                  <div className="space-y-2 bg-background-primary p-4 rounded-lg border border-border-primary">
                    {address.street && (
                      <p className="text-text-primary">
                        {address.street}
                        {address.neighborhood ? `, ${address.neighborhood}` : ''}
                      </p>
                    )}
                    {address.city && (
                      <p className="text-text-primary">
                        {address.city}
                        {address.state ? `, ${address.state}` : ''}
                      </p>
                    )}
                    {address.cep && (
                      <p className="text-text-primary">CEP: {address.cep}</p>
                    )}
                    {!address.street && !address.city && !address.cep && (
                      <p className="text-text-tertiary">Nenhum endereço fornecido</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {isDeactivateModalOpen && (
        <ModalDeactivate
          onClose={() => setIsDeactivateModalOpen(false)}
          onDeactivate={handleDeactivate}
        />
      )}

      {isDeleteModalOpen && (
        <ModalDeleteAccount
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      )}

      {isPhotoModalOpen && (
        <ModalUpdatePhoto
          currentPhoto={user?.photo || "https://via.placeholder.com/150"}
          onClose={() => setIsPhotoModalOpen(false)}
          onUpdate={handleUpdatePhoto}
        />
      )}
    </div>
  );
}