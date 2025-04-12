import React, { useState, useEffect, useRef } from 'react';
import { userApi, authApi } from '../../../services/api/api';
import { useTheme } from '../../../context/ThemeContext';
import { 
  Edit, Trash2, Users as UsersIcon, Loader, UserCog, 
  PlusCircle, AlertCircle, UserPlus, Search, RefreshCcw, Phone,
  ChevronDown, Shield, User, Check
} from 'lucide-react';
import { Modal } from '../../../components/common/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import InputMask from 'react-input-mask';
import { NotificationToast } from '../../../components/common/NotificationToast';

const Users = () => {
  const { theme } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: '',
    password: ''
  });
  const roleDropdownRef = useRef(null);
  const editRoleDropdownRef = useRef(null); // Novo ref para o dropdown na tela de edição
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [editRoleDropdownOpen, setEditRoleDropdownOpen] = useState(false); // Novo estado para controlar o dropdown de edição

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userApi.getUsers();
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
      showNotification('error', 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Show notification helper function
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      role: 'user',
      password: ''
    });
    setIsAddModalOpen(true);
  };

  // Altere a função handleAddUser para incluir uma foto padrão
  const handleAddUser = async (e) => {
    e.preventDefault();
    
    // Validação adicional do formulário
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      showNotification('error', 'Please enter a valid email address');
      return;
    }
    
    if (formData.password.length < 6) {
      showNotification('error', 'Password must be at least 6 characters long');
      return;
    }
    
    // Remover caracteres especiais do telefone antes de enviar
    const cleanPhone = formData.phone.replace(/[^0-9+]/g, '');
    
    try {
      setLoading(true);
      
      // Criar um novo objeto para enviar ao servidor com foto padrão
      const userData = {
        ...formData,
        phone: cleanPhone,
        // Adicionar uma string vazia ou foto padrão em base64
        photo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
      };
      
      await authApi.register(userData);
      
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        role: 'user',
        password: ''
      });
      
      // Atraso para garantir que o servidor processou a criação antes de buscar dados
      setTimeout(() => {
        fetchUsers();
      }, 500);
      
      setError(null);
      showNotification('success', 'User created successfully');
    } catch (err) {
      console.error('Error creating user:', err);
      
      // Lidar com diferentes tipos de erros
      if (err.response) {
        // O servidor retornou um status de erro
        if (err.response.status === 500) {
          if (err.response.data && err.response.data.includes('Duplicate')) {
            showNotification('error', 'A user with this email already exists');
          } else {
            showNotification('error', 'Server error: Please contact administrator');
          }
        } else if (err.response.status === 400) {
          showNotification('error', 'Invalid data: Please check your inputs');
        } else {
          showNotification('error', `Error (${err.response.status}): ${err.response.statusText}`);
        }
      } else if (err.request) {
        // Requisição feita mas sem resposta
        showNotification('error', 'No response from server. Check your connection.');
      } else {
        // Outros erros
        showNotification('error', 'Failed to create user: ' + err.message);
      }
      
      setError('Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Modifique a função handleSelectUser para usar o ID correto da resposta da API
const handleSelectUser = async (id) => {
  try {
    setLoading(true);
    console.log("Fetching user with ID:", id);
    const response = await userApi.getProfile(id);
    console.log("API Response:", response.data);
    
    // Verificar se a API está retornando o ID corretamente
    const userId = response.data.id || id;
    
    // Garantir que o ID esteja incluído explicitamente nos dados do usuário
    const userData = {
      ...response.data,
      id: userId // Usar o ID da resposta da API se disponível, ou o ID passado como parâmetro
    };
    
    console.log("User data with ID:", userData);
    setSelectedUser(userData);
    setFormData({
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      address: userData.address || '',
      role: userData.role || '',
      password: '' // Don't populate password for security
    });
    
    console.log("Selected user after setting:", userData);
    setIsEditModalOpen(true);
  } catch (err) {
    setError('Failed to fetch user details');
    console.error('Error fetching user details:', err);
    showNotification('error', 'Failed to fetch user details');
  } finally {
    setLoading(false);
  }
};

// Corrigir a função handleUpdateUser para enviar apenas os campos esperados pelo backend
const handleUpdateUser = async (e) => {
  e.preventDefault();
  try {
    setLoading(true);
    
    if (!selectedUser) {
      console.error("Selected user is missing");
      showNotification('error', 'Selected user data is missing');
      setLoading(false);
      return;
    }
    
    // Garantir que estamos usando o ID correto
    const userId = selectedUser.id;
    if (!userId) {
      console.error("User ID is missing in selectedUser:", selectedUser);
      showNotification('error', 'User ID is missing');
      setLoading(false);
      return;
    }
    
    console.log("Updating user with ID:", userId);
    
    // Criar um objeto com apenas os campos que o backend espera
    const dataToSend = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone ? formData.phone.replace(/[^0-9+]/g, '') : '', // Limpar caracteres especiais do telefone
      address: formData.address,
      // Não incluir o ID no corpo da requisição, apenas na URL
    };
    
    // Incluir role se disponível
    if (formData.role) {
      dataToSend.role = formData.role;
    }
    
    // Remover senha vazia (não enviar senha se não foi alterada)
    if (formData.password && formData.password.trim() !== '') {
      dataToSend.password = formData.password;
    }
    
    // Log para debug
    console.log(`About to call updateProfile with URL: /User/${userId}`);
    console.log("Data being sent:", dataToSend);
    
    // Chamar a API com o ID explícito
    await userApi.updateProfile(userId, dataToSend);
    
    setIsEditModalOpen(false);
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      role: '',
      password: ''
    });
    fetchUsers();
    setError(null);
    showNotification('success', 'User updated successfully');
  } catch (err) {
    console.error('Error updating user:', err);
    if (err.response) {
      console.error('Server response:', err.response.data);
      console.error('Status code:', err.response.status);
    }
    setError('Failed to update user');
    showNotification('error', 'Failed to update user');
  } finally {
    setLoading(false);
  }
};

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteUser = async () => {
    try {
      setLoading(true);
      await userApi.deleteAccount(userToDelete.id);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      fetchUsers();
      setError(null);
      showNotification('success', 'User deleted successfully');
    } catch (err) {
      setError('Failed to delete user');
      console.error('Error deleting user:', err);
      showNotification('error', 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload for profile photo
  const handlePhotoUpload = async (id, e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          await userApi.updatePhoto(id, { photo: reader.result });
          fetchUsers();
          showNotification('success', 'Profile photo updated successfully');
        } catch (error) {
          console.error('Error updating profile photo:', error);
          showNotification('error', 'Failed to update profile photo');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to update profile photo');
      console.error('Error with file:', err);
      showNotification('error', 'Failed to read uploaded file');
      setLoading(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Adicionar este useEffect para fechar o dropdown quando clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setRoleDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [roleDropdownRef]);

  // Adicione este useEffect para fechar o dropdown de edição quando clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (editRoleDropdownRef.current && !editRoleDropdownRef.current.contains(event.target)) {
        setEditRoleDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editRoleDropdownRef]);

  // Helper para exibir o nome formatado do role
  const getRoleName = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'user':
        return 'Regular User';
      default:
        return 'Select Role';
    }
  };

  // Helper para obter o ícone do role
  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-purple-600" />;
      case 'user':
        return <User className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="relative p-4 lg:p-6 space-y-6">
      {/* Notification Toast */}
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
      
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6"
      >
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <UsersIcon className="h-6 w-6 text-brand-primary" />
          Users Management
        </h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchUsers}
            className="p-2 rounded-full hover:bg-background-secondary transition-colors"
            title="Refresh"
          >
            <RefreshCcw className="h-5 w-5 text-text-secondary" />
          </button>
          <button 
            onClick={openAddModal}
            className="flex items-center space-x-2 px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-white rounded-md transition-colors duration-200 shadow-sm"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add User</span>
          </button>
        </div>
      </motion.div>

      {error && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md mb-4 flex items-center gap-2"
        >
          <AlertCircle className="h-5 w-5" />
          {error}
        </motion.div>
      )}
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="p-4 lg:p-6 rounded-xl bg-background-primary border border-border-primary shadow-lg"
      >
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <h2 className="text-lg font-semibold text-text-primary flex items-center">
            <UsersIcon className="mr-2 text-brand-primary" /> All Users
            <span className="ml-2 text-sm font-normal text-text-tertiary">
              ({filteredUsers.length})
            </span>
          </h2>
          
          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-text-tertiary" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-3 border border-border-primary rounded-md bg-background-secondary text-text-primary focus:ring-2 focus:ring-brand-primary focus:outline-none focus:border-transparent transition-all"
            />
          </div>
        </div>
        
        {loading && !isEditModalOpen && !isDeleteModalOpen && !isAddModalOpen ? (
          <div className="flex justify-center items-center p-16">
            <Loader className="animate-spin text-brand-primary h-10 w-10" />
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-border-primary scrollbar-track-background-secondary rounded-md">
            <table className="min-w-full divide-y divide-border-primary">
              <thead className="bg-background-secondary">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-primary">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-background-secondary transition-colors">
                    <td className="px-4 py-3 text-sm text-text-primary">{user.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-200 mr-3">
                          {user.photo ? (
                            <img 
                              src={user.photo} 
                              alt={user.name} 
                              className="h-10 w-10 object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/40';
                              }}
                            />
                          ) : (
                            <div className="h-10 w-10 flex items-center justify-center text-gray-500 font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-text-primary">{user.name}</div>
                          <div className="text-xs text-text-tertiary">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-text-primary">{user.phone || '-'}</div>
                      <div className="text-xs text-text-tertiary truncate max-w-[200px]" title={user.address}>
                        {user.address || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleSelectUser(user.id)}
                          className="p-1.5 rounded-md text-brand-primary hover:bg-background-primary hover:text-brand-secondary transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(user)}
                          className="p-1.5 rounded-md text-red-500 hover:bg-background-primary hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredUsers.length === 0 && !loading && (
              <div className="text-center py-16 text-text-secondary">
                <div className="flex flex-col items-center">
                  <UsersIcon className="h-12 w-12 text-text-tertiary mb-4 opacity-30" />
                  <p className="text-lg font-medium">No users found</p>
                  <p className="text-sm text-text-tertiary mt-1">
                    {searchTerm ? 'Try a different search term' : 'Add your first user'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Add User Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <Modal 
            onClose={() => setIsAddModalOpen(false)}
            width="max-w-lg"
            maxHeight="max-h-[90vh]"
            overflow="overflow-y-auto"
          >
            <h2 className="text-xl font-semibold mb-4 text-text-primary flex items-center">
              <UserPlus className="mr-2 text-brand-primary" /> Add New User
            </h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="form-group">
                <label className="block text-sm font-medium text-text-secondary mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-border-primary rounded-md bg-background-secondary text-text-primary focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                  required
                />
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-border-primary rounded-md bg-background-secondary text-text-primary focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                  required
                />
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-text-secondary mb-1">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-text-tertiary h-4 w-4" />
                  <InputMask
                    mask="+55 (99) 99999-9999"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 p-2.5 border border-border-primary rounded-md bg-background-secondary text-text-primary focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                    placeholder="+55 (00) 00000-0000"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-text-secondary mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-border-primary rounded-md bg-background-secondary text-text-primary focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                  placeholder="Enter full address"
                />
              </div>
              {/* Novo dropdown para Role */}
              <div className="form-group">
                <label className="block text-sm font-medium text-text-secondary mb-1">Role</label>
                <div className="relative" ref={roleDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                    className="w-full p-2.5 border border-border-primary rounded-md bg-background-secondary text-text-primary hover:bg-background-primary focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      {getRoleIcon(formData.role)}
                      <span className={`ml-2 ${formData.role ? 'text-text-primary' : 'text-text-tertiary'}`}>
                        {formData.role ? getRoleName(formData.role) : 'Select Role'}
                      </span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-text-tertiary transition-transform ${roleDropdownOpen ? 'transform rotate-180' : ''}`} />
                  </button>
                  
                  {roleDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full rounded-md shadow-lg bg-background-primary border border-border-primary">
                      <ul className="py-1 max-h-60 overflow-auto scrollbar-thin scrollbar-thumb-border-primary">
                        <li 
                          className="px-3 py-2.5 hover:bg-background-secondary cursor-pointer flex items-center justify-between"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, role: 'admin' }));
                            setRoleDropdownOpen(false);
                          }}
                        >
                          <div className="flex items-center">
                            <Shield className="h-4 w-4 text-purple-600" />
                            <span className="ml-2 text-text-primary">Administrator</span>
                          </div>
                          {formData.role === 'admin' && <Check className="h-4 w-4 text-brand-primary" />}
                        </li>
                        <li 
                          className="px-3 py-2.5 hover:bg-background-secondary cursor-pointer flex items-center justify-between"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, role: 'user' }));
                            setRoleDropdownOpen(false);
                          }}
                        >
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-blue-600" />
                            <span className="ml-2 text-text-primary">Regular User</span>
                          </div>
                          {formData.role === 'user' && <Check className="h-4 w-4 text-brand-primary" />}
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-border-primary rounded-md bg-background-secondary text-text-primary focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-border-primary text-text-primary hover:bg-background-secondary rounded-md transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-white rounded-md transition-colors duration-200 flex items-center"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin mr-2 h-4 w-4" /> Creating...
                    </>
                  ) : (
                    'Create User'
                  )}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <Modal 
            onClose={() => setIsEditModalOpen(false)}
            width="max-w-lg"
            maxHeight="max-h-[90vh]"
            overflow="overflow-y-auto"
          >
            <h2 className="text-xl font-semibold mb-4 text-text-primary flex items-center">
              <UserCog className="mr-2 text-brand-primary" /> Edit User
            </h2>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="form-group">
                <label className="block text-sm font-medium text-text-secondary mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-border-primary rounded-md bg-background-secondary text-text-primary focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                  required
                />
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-border-primary rounded-md bg-background-secondary text-text-primary focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                  required
                />
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-text-secondary mb-1">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-text-tertiary h-4 w-4" />
                  <InputMask
                    mask="+55 (99) 99999-9999"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 p-2.5 border border-border-primary rounded-md bg-background-secondary text-text-primary focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                    placeholder="+55 (00) 00000-0000"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-text-secondary mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-border-primary rounded-md bg-background-secondary text-text-primary focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                />
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-text-secondary mb-1">Role</label>
                <div className="relative" ref={editRoleDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setEditRoleDropdownOpen(!editRoleDropdownOpen)}
                    className="w-full p-2.5 border border-border-primary rounded-md bg-background-secondary text-text-primary hover:bg-background-primary focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      {getRoleIcon(formData.role)}
                      <span className={`ml-2 ${formData.role ? 'text-text-primary' : 'text-text-tertiary'}`}>
                        {formData.role ? getRoleName(formData.role) : 'Select Role'}
                      </span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-text-tertiary transition-transform ${editRoleDropdownOpen ? 'transform rotate-180' : ''}`} />
                  </button>
                  
                  {editRoleDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full rounded-md shadow-lg bg-background-primary border border-border-primary">
                      <ul className="py-1 max-h-60 overflow-auto scrollbar-thin scrollbar-thumb-border-primary">
                        <li 
                          className="px-3 py-2.5 hover:bg-background-secondary cursor-pointer flex items-center justify-between"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, role: 'admin' }));
                            setEditRoleDropdownOpen(false);
                          }}
                        >
                          <div className="flex items-center">
                            <Shield className="h-4 w-4 text-purple-600" />
                            <span className="ml-2 text-text-primary">Administrator</span>
                          </div>
                          {formData.role === 'admin' && <Check className="h-4 w-4 text-brand-primary" />}
                        </li>
                        <li 
                          className="px-3 py-2.5 hover:bg-background-secondary cursor-pointer flex items-center justify-between"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, role: 'user' }));
                            setEditRoleDropdownOpen(false);
                          }}
                        >
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-blue-600" />
                            <span className="ml-2 text-text-primary">Regular User</span>
                          </div>
                          {formData.role === 'user' && <Check className="h-4 w-4 text-brand-primary" />}
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Password {selectedUser ? '(Leave blank to keep unchanged)' : ''}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-border-primary rounded-md bg-background-secondary text-text-primary focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                  placeholder={selectedUser ? '••••••••' : ''}
                />
              </div>
              
              <div className="form-group">
                <label className="block text-sm font-medium text-text-secondary mb-1">Profile Photo</label>
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                    {selectedUser?.photo ? (
                      <img 
                        src={selectedUser.photo} 
                        alt={selectedUser.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/64';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 font-medium text-xl">
                        {selectedUser?.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(selectedUser.id, e)}
                      className="w-full p-2 border border-border-primary rounded-md bg-background-secondary text-text-primary"
                    />
                    <p className="text-xs text-text-tertiary mt-1">
                      Max size: 2MB. Formats: JPG, PNG, GIF
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-border-primary text-text-primary hover:bg-background-secondary rounded-md transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-white rounded-md transition-colors duration-200 flex items-center"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin mr-2 h-4 w-4" /> Updating...
                    </>
                  ) : (
                    'Update User'
                  )}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && userToDelete && (
          <Modal 
            onClose={() => setIsDeleteModalOpen(false)}
            width="max-w-md"
          >
            <div className="text-center">
              <div className="bg-red-100 p-3 rounded-full inline-flex items-center justify-center mb-4">
                <AlertCircle className="h-10 w-10 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">Delete User</h3>
              <p className="text-sm text-text-secondary mb-6">
                Are you sure you want to delete user <span className="font-semibold">{userToDelete.name}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 border border-border-primary text-text-primary hover:bg-background-secondary rounded-md transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteUser}
                  disabled={loading}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors duration-200 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin mr-2 h-4 w-4" /> Deleting...
                    </>
                  ) : (
                    'Delete User'
                  )}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Users;