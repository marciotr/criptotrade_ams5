import React, { useState, useEffect } from 'react';
import { userApi, authApi } from '../../../services/api/api';
import { useTheme } from '../../../context/ThemeContext';
import { Edit, Trash2, Users as UsersIcon, Loader, UserCog, PlusCircle, AlertCircle, UserPlus } from 'lucide-react';
import { Modal } from '../../../components/common/Modal';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: '',
    password: ''
  });

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
    } finally {
      setLoading(false);
    }
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

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await userApi.register(formData);
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        role: 'user',
        password: ''
      });
      fetchUsers();
      setError(null);
    } catch (err) {
      setError('Failed to create user');
      console.error('Error creating user:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update the handleSelectUser function to include the new fields
  const handleSelectUser = async (id) => {
    try {
      setLoading(true);
      const response = await userApi.getProfile(id);
      setSelectedUser(response.data);
      setFormData({
        name: response.data.name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        address: response.data.address || '',
        role: response.data.role || '',
        password: '' // Don't populate password for security
      });
      setIsEditModalOpen(true);
    } catch (err) {
      setError('Failed to fetch user details');
      console.error('Error fetching user details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Create a copy of formData to modify before sending
      const dataToSend = {...formData};
      
      // If password is empty and we're updating an existing user, remove it
      if (!dataToSend.password) {
        delete dataToSend.password;
      }
      
      await userApi.updateProfile(selectedUser.id, dataToSend);
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
    } catch (err) {
      setError('Failed to update user');
      console.error('Error updating user:', err);
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
    } catch (err) {
      setError('Failed to delete user');
      console.error('Error deleting user:', err);
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
      await userApi.updatePhoto(id, file);
      fetchUsers();
      setError(null);
    } catch (err) {
      setError('Failed to update profile photo');
      console.error('Error updating profile photo:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative p-4 lg:p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Users Management</h1>
        <button 
          onClick={openAddModal}
          className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md transition-colors duration-200"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add User</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div className="p-4 lg:p-6 rounded-xl bg-background-primary border border-border-primary shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary flex items-center">
            <UsersIcon className="mr-2" /> All Users
          </h2>
        </div>
        
        {loading && !isEditModalOpen && !isDeleteModalOpen && !isAddModalOpen ? (
          <div className="flex justify-center items-center p-8">
            <Loader className="animate-spin text-primary h-8 w-8" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-primary">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Role</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-primary">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-background-secondary">
                    <td className="px-4 py-3 text-sm text-text-primary">{user.id}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{user.name}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{user.email}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleSelectUser(user.id)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(user)}
                          className="p-1 text-red-600 hover:text-red-800"
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
            
            {users.length === 0 && !loading && (
              <div className="text-center py-8 text-text-secondary">
                No users found
              </div>
            )}
          </div>
        )}
      </div>

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
              <UserPlus className="mr-2" /> Add New User
            </h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="form-group">
                <label className="block text-sm font-medium text-text-secondary mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-border-primary rounded-md bg-background-secondary text-text-primary"
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
                  className="w-full p-2 border border-border-primary rounded-md bg-background-secondary text-text-primary"
                  required
                />
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-text-secondary mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-border-primary rounded-md bg-background-secondary text-text-primary"
                />
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-text-secondary mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-border-primary rounded-md bg-background-secondary text-text-primary"
                />
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-text-secondary mb-1">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-border-primary rounded-md bg-background-secondary text-text-primary"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-border-primary rounded-md bg-background-secondary text-text-primary"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md transition-colors duration-200 flex items-center"
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
              <UserCog className="mr-2" /> Edit User
            </h2>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="form-group">
                <label className="block text-sm font-medium text-text-secondary mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-border-primary rounded-md bg-background-secondary text-text-primary"
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
                  className="w-full p-2 border border-border-primary rounded-md bg-background-secondary text-text-primary"
                  required
                />
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-text-secondary mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-border-primary rounded-md bg-background-secondary text-text-primary"
                />
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-text-secondary mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-border-primary rounded-md bg-background-secondary text-text-primary"
                />
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-text-secondary mb-1">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-border-primary rounded-md bg-background-secondary text-text-primary"
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-text-secondary mb-1">Password {selectedUser ? '(Leave blank to keep unchanged)' : ''}</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-border-primary rounded-md bg-background-secondary text-text-primary"
                  placeholder={selectedUser ? '••••••••' : ''}
                />
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-text-secondary mb-1">Profile Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload(selectedUser.id, e)}
                  className="w-full p-2 border border-border-primary rounded-md bg-background-secondary text-text-primary"
                />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md transition-colors duration-200 flex items-center"
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
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">Delete User</h3>
              <p className="text-sm text-text-secondary mb-4">
                Are you sure you want to delete user <span className="font-semibold">{userToDelete.name}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteUser}
                  disabled={loading}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors duration-200 flex items-center"
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