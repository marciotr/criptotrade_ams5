import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { 
  Users as UsersIcon, 
  UserPlus, 
  RefreshCcw, 
  Search, 
  Loader, 
  Edit, 
  Trash2, 
  ChevronDown, 
  ArrowUpDown, 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Activity, 
  FileText,
  Filter,
  Grid,
  List,
  MoreHorizontal,
  X
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { userApi, authApi } from '../../../services/api/api';
import InputMask from 'react-input-mask';
import { NotificationToast } from '../../../components/common/NotificationToast';
import { AddUserModal } from './components/modals/AddUserModal';
import { EditUserModal } from './components/modals/EditUserModal';
import { DeleteUserModal } from './components/modals/DeleteUserModal';
import { PreviewUserModal } from './components/modals/PreviewUserModal';
import { useVirtualizer } from '@tanstack/react-virtual';

const Users = () => {
  const { theme } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortConfig, setSortConfig] = useState({ field: 'name', direction: 'asc' });
  const [filterRole, setFilterRole] = useState('all');
  
  const [isAddOpen, setAddOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [isPreviewOpen, setPreviewOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', role: 'user', password: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);

  // Virtualization references
  const parentRef = React.useRef(null);
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setRefreshLoading(true);
      const { data } = await userApi.getUsers();
      setUsers(data);
      setError(null);
    } catch {
      setError('Failed to fetch users');
      notify('error', 'Failed to fetch users');
    } finally {
      setLoading(false);
      setRefreshLoading(false);
    }
  };

  const notify = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredAndSortedUsers = useMemo(() => {
    // Aplicando a busca e filtro
    let result = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      
      return matchesSearch && matchesRole;
    });
    
    return [...result].sort((a, b) => {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];
      
      if (sortConfig.direction === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }, [users, searchTerm, filterRole, sortConfig]);

  const rowVirtualizer = useVirtualizer({
    count: filteredAndSortedUsers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => viewMode === 'grid' ? 330 : 72,
    overscan: 5,
  });

  const handleSort = (field) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const openAdd = () => {
    setFormData({ name: '', email: '', phone: '', address: '', role: 'user', password: '' });
    setAddOpen(true);
  };

  const handleAdd = async e => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await authApi.register({
        ...formData,
        phone: formData.phone.replace(/\D/g, ''),
        photo: ''
      });
      notify('success', 'User created');
      setAddOpen(false);
      fetchUsers();
    } catch {
      notify('error', 'Failed to create user');
    } finally {
      setActionLoading(false);
    }
  };

  const openEdit = async id => {
    setActionLoading(true);
    try {
      const { data } = await userApi.getProfile(id);
      setSelectedUser(data);
      setFormData({
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        role: data.role,
        password: ''
      });
      setEditOpen(true);
    } catch {
      notify('error', 'Failed to fetch user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async e => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await userApi.updateProfile(selectedUser.id, formData);
      notify('success', 'User updated');
      setEditOpen(false);
      fetchUsers();
    } catch {
      notify('error', 'Update failed');
    } finally {
      setActionLoading(false);
    }
  };

  const openDelete = user => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await userApi.deleteAccount(selectedUser.id);
      notify('success', 'User deleted');
      setDeleteOpen(false);
      fetchUsers();
    } catch {
      notify('error', 'Delete failed');
    } finally {
      setActionLoading(false);
    }
  };

  const openPreview = async id => {
    setActionLoading(true);
    try {
      const { data } = await userApi.getProfile(id);
      setSelectedUser(data);
      setPreviewOpen(true);
    } catch {
      notify('error', 'Preview failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePhotoUpload = async (id, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setActionLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await userApi.updatePhoto(id, { photo: reader.result });
        notify('success', 'Photo updated');
        fetchUsers();
      } catch {
        notify('error', 'Photo upload failed');
      } finally {
        setActionLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleCardExpand = (id) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  const getRoleBadgeStyles = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200';
      case 'manager':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-primary p-4 md:p-6">
      <AnimatePresence>
        {notification && (
          <NotificationToast
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}
      </AnimatePresence>

      {/* Header Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6"
      >
        <h1 className="text-3xl font-extrabold flex items-center gap-2 text-text-primary">
          <UsersIcon className="text-brand-primary h-8 w-8" /> 
          <span className="bg-gradient-to-r from-brand-primary to-purple-500 bg-clip-text text-transparent">
            Users Management
          </span>
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            disabled={refreshLoading}
            className="p-2 rounded-full hover:bg-background-secondary transition-all"
            title="Refresh Users"
          >
            <RefreshCcw
              className={
                refreshLoading
                  ? 'h-6 w-6 text-brand-primary animate-spin'
                  : 'h-6 w-6 text-text-secondary'
              }
            />
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-gradient-to-r from-brand-primary to-purple-600 hover:brightness-110 text-white px-5 py-2 rounded-xl shadow-lg shadow-brand-primary/20 transition-all"
          >
            <UserPlus className="h-5 w-5" /> Add User
          </button>
        </div>
      </motion.div>

      {/* Filters Bar */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full bg-background-secondary border border-border-primary rounded-xl shadow-md p-4 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="absolute inset-y-0 left-3 text-text-tertiary m-auto h-4 w-4" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 p-2 border border-border-primary rounded-xl bg-background-primary text-text-primary focus:ring-2 focus:ring-brand-primary outline-none transition"
            />
            {searchTerm && (
              <button 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
                onClick={() => setSearchTerm('')}
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          {/* Role Filter */}
          <div className="relative w-full md:w-auto">
            <div className="flex items-center gap-2 text-sm bg-background-primary border border-border-primary p-2 px-4 rounded-xl">
              <Filter className="h-4 w-4 text-text-tertiary" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-transparent text-text-primary focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>

          {/* Sort Button */}
          <div className="relative w-full md:w-auto">
            <div className="flex items-center gap-2 text-sm bg-background-primary border border-border-primary p-2 px-4 rounded-xl">
              <ArrowUpDown className="h-4 w-4 text-text-tertiary" />
              <select
                value={sortConfig.field}
                onChange={(e) => handleSort(e.target.value)}
                className="bg-transparent text-text-primary focus:outline-none"
              >
                <option value="name">Name {sortConfig.field === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</option>
                <option value="email">Email {sortConfig.field === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</option>
                <option value="role">Role {sortConfig.field === 'role' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* View Mode Toggles */}
        <div className="flex items-center bg-background-primary border border-border-primary rounded-lg overflow-hidden">
          <button 
            className={`p-2 flex items-center justify-center ${viewMode === 'grid' ? 'bg-brand-primary text-white' : 'text-text-tertiary'}`}
            onClick={() => setViewMode('grid')}
          >
            <Grid size={18} />
          </button>
          <button 
            className={`p-2 flex items-center justify-center ${viewMode === 'list' ? 'bg-brand-primary text-white' : 'text-text-tertiary'}`}
            onClick={() => setViewMode('list')}
          >
            <List size={18} />
          </button>
        </div>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 mb-6 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded-xl flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            <span>{error}</span>
          </div>
          <button 
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 dark:hover:text-red-300"
          >
            <X size={18} />
          </button>
        </motion.div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16">
          <Loader className="h-12 w-12 text-brand-primary animate-spin mb-4" />
          <p className="text-text-secondary animate-pulse">Loading users...</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex-1 border border-border-primary bg-background-primary rounded-xl shadow-xl backdrop-blur-sm p-4 md:p-6 overflow-hidden"
        >
          {/* Users Count Badge */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <span className="bg-brand-primary/10 text-brand-primary text-sm font-medium py-1 px-3 rounded-full">
                {filteredAndSortedUsers.length} {filteredAndSortedUsers.length === 1 ? 'user' : 'users'}
              </span>
              {(searchTerm || filterRole !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterRole('all');
                  }}
                  className="ml-2 text-xs text-text-tertiary hover:text-text-secondary underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
          
          {filteredAndSortedUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-text-tertiary">
              <FileText className="h-16 w-16 mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-1">No Users Found</h3>
              <p className="text-sm max-w-sm text-center">
                No users match your current search and filter criteria. Try adjusting your search or clear the filters.
              </p>
            </div>
          ) : (
            <div 
              ref={parentRef} 
              className="h-[calc(100vh-280px)] overflow-auto"
              style={{
                overflowY: 'auto',
                overflowX: 'hidden',
              }}
            >
              <LayoutGroup>
                {viewMode === 'grid' ? (
                  <div 
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    style={{
                      height: `${rowVirtualizer.getTotalSize()}px`,
                      width: '100%',
                      position: 'relative',
                    }}
                  >
                    {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                      const user = filteredAndSortedUsers[virtualItem.index];
                      return (
                        <motion.div
                          key={user.id}
                          layout
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            transform: `translateY(${virtualItem.start}px)`,
                            width: '100%',
                          }}
                        >
                          <UserCard 
                            user={user}
                            isExpanded={expandedCardId === user.id}
                            onToggleExpand={() => toggleCardExpand(user.id)}
                            onEdit={() => openEdit(user.id)}
                            onDelete={() => openDelete(user)}
                            onPreview={() => openPreview(user.id)}
                            getRoleBadgeStyles={getRoleBadgeStyles}
                          />
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    style={{
                      height: `${rowVirtualizer.getTotalSize()}px`,
                      width: '100%',
                      position: 'relative',
                    }}
                  >
                    <div className="sticky top-0 z-10 grid grid-cols-12 gap-2 border-b border-border-primary pb-2 mb-2 text-text-tertiary text-xs uppercase tracking-wider bg-background-primary">
                      <div className="col-span-5">User</div>
                      <div className="col-span-4 hidden sm:block">Contact</div>
                      <div className="col-span-2">Role</div>
                      <div className="col-span-1 text-right">Actions</div>
                    </div>
                    {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                      const user = filteredAndSortedUsers[virtualItem.index];
                      return (
                        <motion.div
                          key={user.id}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: `${virtualItem.size}px`,
                            transform: `translateY(${virtualItem.start}px)`,
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <UserRow 
                            user={user} 
                            onEdit={() => openEdit(user.id)}
                            onDelete={() => openDelete(user)}
                            onPreview={() => openPreview(user.id)}
                            getRoleBadgeStyles={getRoleBadgeStyles}
                          />
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </LayoutGroup>
            </div>
          )}
        </motion.div>
      )}

      {/* Modal Components */}
      <AddUserModal isOpen={isAddOpen} onClose={() => setAddOpen(false)} formData={formData} setFormData={setFormData} onSubmit={handleAdd} loading={actionLoading} />
      <EditUserModal isOpen={isEditOpen} onClose={() => setEditOpen(false)} selectedUser={selectedUser} formData={formData} setFormData={setFormData} onSubmit={handleEdit} loading={actionLoading} handlePhotoUpload={handlePhotoUpload} />
      <DeleteUserModal isOpen={isDeleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} loading={actionLoading} userName={selectedUser?.name} />
      <PreviewUserModal isOpen={isPreviewOpen} onClose={() => setPreviewOpen(false)} user={selectedUser} onEdit={() => { setPreviewOpen(false); openEdit(selectedUser.id); }} onDelete={() => { setPreviewOpen(false); openDelete(selectedUser); }} />
    </div>
  );
};

// User Card Component for Grid View
const UserCard = ({ user, isExpanded, onToggleExpand, onEdit, onDelete, onPreview, getRoleBadgeStyles }) => {
  return (
    <motion.div
      layout
      className={`bg-background-secondary rounded-xl border border-border-primary shadow-sm hover:shadow-md transition-all overflow-hidden ${isExpanded ? 'scale-[1.02] shadow-lg' : ''}`}
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div 
            onClick={onPreview}
            className="flex-shrink-0 cursor-pointer"
          >
            <div className="h-14 w-14 rounded-full overflow-hidden bg-background-tertiary flex items-center justify-center border-2 border-brand-primary/20">
              {user.photo ? (
                <img
                  src={user.photo}
                  alt={user.name}
                  className="w-full h-full object-cover"
                  onError={e => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/40';
                  }}
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-text-tertiary font-medium text-xl">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex space-x-1">
            <button
              onClick={onEdit}
              className="p-2 rounded-lg hover:bg-background-tertiary transition-colors text-text-tertiary hover:text-brand-primary"
              title="Edit User"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors text-text-tertiary hover:text-red-500"
              title="Delete User"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        
        <div onClick={onPreview} className="cursor-pointer">
          <h3 className="text-text-primary font-medium truncate hover:text-brand-primary transition-colors">
            {user.name}
          </h3>
          <div className="flex items-center text-text-tertiary text-sm mt-1 space-x-2">
            <Mail size={14} className="flex-shrink-0" />
            <span className="truncate">{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center text-text-tertiary text-sm mt-1 space-x-2">
              <Phone size={14} className="flex-shrink-0" />
              <span className="truncate">{user.phone}</span>
            </div>
          )}
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeStyles(user.role)}`}>
            {user.role}
          </span>
          
          <button 
            onClick={onToggleExpand}
            className={`p-1 rounded-full bg-background-tertiary ${isExpanded ? 'text-brand-primary rotate-180' : 'text-text-tertiary'} transition-all`}
          >
            <ChevronDown size={16} />
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-border-primary p-4 bg-background-primary"
        >
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-text-tertiary">ID:</span>
              <p className="text-text-secondary">{user.id}</p>
            </div>
            
            {user.address && (
              <div className="col-span-2">
                <span className="text-text-tertiary">Address:</span>
                <p className="text-text-secondary">{user.address}</p>
              </div>
            )}
          </div>
          
          <button
            onClick={onPreview}
            className="w-full mt-3 py-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg text-sm font-medium transition-colors"
          >
            View Full Profile
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

// User Row Component for List View
const UserRow = ({ user, onEdit, onDelete, onPreview, getRoleBadgeStyles }) => {
  const [showActions, setShowActions] = useState(false);
  
  return (
    <motion.div 
      className="grid grid-cols-12 gap-2 items-center py-3 border-b border-border-primary text-text-primary hover:bg-background-secondary rounded-lg px-3 transition-colors relative"
      whileHover={{ backgroundColor: 'rgba(var(--background-secondary), 0.8)' }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="col-span-5 flex items-center space-x-3">
        <div 
          onClick={onPreview}
          className="h-10 w-10 rounded-full overflow-hidden bg-background-tertiary flex items-center justify-center cursor-pointer border-2 border-brand-primary/20"
        >
          {user.photo ? (
            <img
              src={user.photo}
              alt={user.name}
              className="w-full h-full object-cover"
              onError={e => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/40';
              }}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-text-tertiary font-medium">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <button
            onClick={onPreview}
            className="text-text-primary hover:text-brand-primary font-medium truncate text-left transition-colors"
          >
            {user.name}
          </button>
          <p className="text-xs text-text-tertiary truncate">ID: {user.id}</p>
        </div>
      </div>
      
      <div className="col-span-4 hidden sm:block">
        <div className="text-sm text-text-tertiary truncate flex items-center space-x-1">
          <Mail size={12} />
          <span>{user.email}</span>
        </div>
        {user.phone && (
          <div className="text-xs text-text-tertiary mt-1 truncate flex items-center space-x-1">
            <Phone size={10} />
            <span>{user.phone}</span>
          </div>
        )}
      </div>
      
      <div className="col-span-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeStyles(user.role)}`}>
          <Shield className="w-3 h-3 inline-block mr-1" />
          {user.role}
        </span>
      </div>
      
      <div className="col-span-1 flex justify-end">
        {showActions ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex space-x-1"
          >
            <button
              onClick={onEdit}
              className="p-1.5 rounded-md hover:bg-background-tertiary transition-colors text-text-tertiary hover:text-brand-primary"
            >
              <Edit size={15} />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors text-text-tertiary hover:text-red-500"
            >
              <Trash2 size={15} />
            </button>
          </motion.div>
        ) : (
          <button
            onClick={() => setShowActions(true)}
            className="p-1.5 text-text-tertiary hover:text-text-primary"
          >
            <MoreHorizontal size={16} />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default Users;
