import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModalDeactivate } from './components/ModalDeactivate';
import { ModalDeleteAccount } from './components/ModalDeleteAccount';
import { ModalUpdatePhoto } from './components/ModalUpdatePhoto';
import { Camera, MapPin, Phone, Globe, Calendar, Building, Shield } from 'lucide-react';
import InputMask from 'react-input-mask';
import axios from 'axios';
import { NotificationToast } from '../../components/common/NotificationToast';
import { useAuth } from '../../store/auth/useAuth';
import { userApi } from '../../services/api/api';

export function ProfileSettings() {
  const { user } = useAuth();
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
            street: addressParts[0] || '', // Primeira parte é a rua
            neighborhood: addressParts[1] || '', // Segunda parte é o bairro
            city: addressParts[2] || '', // Terceira parte é a cidade
            state: addressParts[3] || '', // Quarta parte é o estado
            cep: addressParts[4]?.replace('CEP: ', '') || '' // Quinta parte é o CEP
          };

          setAddress(addressObj);
        }

        setNotification({
          type: 'success',
          message: 'Profile data loaded successfully!'
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        setNotification({
          type: 'error',
          message: 'Failed to load profile data. Please try again.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchUserProfile();
    }
  }, [user]);

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
        console.error('Error fetching address:', error);
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
    console.log(`Account will be deactivated for ${days} days.`);
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await userApi.deleteAccount(user.id);
      
      // Clear user data and redirect
      localStorage.clear();
      setNotification({
        type: 'success',
        message: 'Your account has been deleted successfully.'
      });
      
      // Small delay to show the notification before redirecting
      setTimeout(() => {
        window.location.href = '/signin';
      }, 1500);
      
    } catch (error) {
      console.error('Error deleting account:', error);
      setNotification({
        type: 'error',
        message: 'Failed to delete account. Please try again.'
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

      setNotification({
        type: 'success',
        message: 'Your profile has been updated successfully!'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setNotification({
        type: 'error',
        message: 'Failed to update profile. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePhoto = async (file) => {
    try {
      setIsLoading(true);
      await userApi.updatePhoto(user.id, file);
      
      setNotification({
        type: 'success',
        message: 'Profile photo updated successfully!'
      });
    } catch (error) {
      console.error('Error updating photo:', error);
      setNotification({
        type: 'error',
        message: 'Failed to update profile photo. Please try again.'
      });
    } finally {
      setIsLoading(false);
      setIsPhotoModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
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

      <motion.section
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-background-primary p-6 rounded-xl shadow-lg"
      >
        <h2 className="text-xl font-semibold text-text-primary mb-6">Profile Information</h2>
        <div className="flex flex-col lg:flex-row items-start space-y-4 lg:space-y-0 lg:space-x-6">
          <div className="flex-shrink-0 relative group">
            <img
              src={formData.photo}
              alt="User Avatar"
              className="w-32 h-32 lg:w-40 lg:h-40 rounded-full object-cover"
            />
            <button 
              onClick={() => setIsPhotoModalOpen(true)}
              className="absolute bottom-0 right-0 p-2 bg-brand-primary rounded-full text-background-primary hover:opacity-90 transition-colors"
            >
              <Camera size={16} />
            </button>
          </div>

          <form className="flex-grow space-y-6 w-full" onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full p-2.5 rounded-lg border border-border-primary bg-background-primary text-text-primary placeholder-text-tertiary"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full p-2.5 rounded-lg border border-border-primary bg-background-primary text-text-primary placeholder-text-tertiary"
                  placeholder="@johndoe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2.5 rounded-lg border border-border-primary bg-background-primary text-text-primary placeholder-text-tertiary"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Phone</label>
                <InputMask
                  mask="+55 (99) 99999-9999"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-2.5 rounded-lg border border-border-primary bg-background-primary text-text-primary placeholder-text-tertiary"
                  placeholder="+55 (00) 00000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">CEP</label>
                <div className="relative">
                  <InputMask
                    mask="99999-999"
                    type="text"
                    className={`w-full p-2.5 rounded-lg border ${
                      isLoading ? 'bg-gray-50' : ''
                    } border-border-primary bg-background-primary ${
                      address.cep ? 'text-text-primary' : 'text-text-tertiary'
                    }`}
                    placeholder="00000-000"
                    onChange={handleCEPChange}
                    value={address.cep}
                    disabled={isLoading}
                    name="cep"
                  />
                  {isLoading && (
                    <div className="absolute right-3 top-3">
                      <div className="w-4 h-4 border-2 border-brand-primary rounded-full animate-spin border-t-transparent"></div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Street</label>
                <input
                  type="text"
                  name="street"
                  className={`w-full p-2.5 rounded-lg border border-border-primary bg-background-primary 
                    ${address.street ? 'text-text-primary' : 'text-text-tertiary'}`}
                  value={address.street}
                  onChange={handleAddressChange}
                  placeholder="Your street address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Neighborhood</label>
                <input
                  type="text"
                  name="neighborhood"
                  className={`w-full p-2.5 rounded-lg border border-border-primary bg-background-primary 
                    ${address.neighborhood ? 'text-text-primary' : 'text-text-tertiary'}`}
                  value={address.neighborhood}
                  onChange={handleAddressChange}
                  placeholder="Your neighborhood"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  className={`w-full p-2.5 rounded-lg border border-border-primary bg-background-primary 
                    ${address.city ? 'text-text-primary' : 'text-text-tertiary'}`}
                  value={address.city}
                  onChange={handleAddressChange}
                  placeholder="Your city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  className={`w-full p-2.5 rounded-lg border border-border-primary bg-background-primary 
                    ${address.state ? 'text-text-primary' : 'text-text-tertiary'}`}
                  value={address.state}
                  onChange={handleAddressChange}
                  placeholder="Your state"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Website</label>
                <div className="relative">
                  <Globe size={16} className="absolute left-3 top-3 text-text-tertiary" />
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full pl-10 p-2.5 rounded-lg border border-border-primary bg-background-primary text-text-primary placeholder-text-tertiary"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className="w-full p-2.5 rounded-lg border border-border-primary bg-background-primary text-text-primary placeholder-text-tertiary resize-none"
                rows={3}
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                className="px-6 py-2.5 bg-brand-primary text-background-primary rounded-lg hover:opacity-90 transition-colors"
              >
                Save Changes
              </button>
              <button
                type="button"
                className="px-6 py-2.5 border border-border-primary text-text-primary rounded-lg hover:bg-background-secondary transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </motion.section>

      <motion.section
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-background-primary p-6 rounded-xl shadow-lg"
      >
        <h2 className="text-xl font-semibold text-text-primary mb-6">Account Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border-primary rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="text-text-tertiary" size={16} />
              <span className="text-text-primary">Deactivate Account</span>
            </div>
            <button
              type="button"
              className="px-4 py-2 bg-feedback-error text-background-primary rounded-lg hover:opacity-90 transition-colors"
              onClick={() => setIsDeactivateModalOpen(true)}
            >
              Deactivate
            </button>
          </div>
          <div className="flex items-center justify-between p-4 border border-border-primary rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="text-text-tertiary" size={16} />
              <span className="text-text-primary">Delete Account</span>
            </div>
            <button
              type="button"
              className="px-4 py-2 bg-feedback-error text-background-primary rounded-lg hover:opacity-90 transition-colors"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Delete
            </button>
          </div>
        </div>
      </motion.section>

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
          currentPhoto={user?.photo || "https://img.freepik.com/fotos-gratis/retrato-de-um-homem-sorridente-satisfeito-trabalhando_171337-12116.jpg"}
          onClose={() => setIsPhotoModalOpen(false)}
          onUpdate={handleUpdatePhoto}
        />
      )}
    </div>
  );
}