import React from 'react';
import { MapPin, Phone, Shield, User, Trash2, Edit } from 'lucide-react';
import { PreviewModal } from './PreviewModal';


export function PreviewUserModal({ isOpen, user, onClose, onEdit, onDelete }) {
    // Se não houver usuário, não renderize o conteúdo do modal
    if (!user) return null;
    
    return (
        <PreviewModal 
            isOpen={isOpen} 
            title={`${user.name || 'User'}'s Profile`} 
            onClose={onClose} 
            width="max-w-4xl" 
            footer={(
                <div className="flex justify-between w-full">
                    <button 
                        onClick={onDelete}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md flex items-center gap-2"
                    >
                        <Trash2 size={16} /> Delete
                    </button>
                    <button 
                        onClick={onEdit} 
                        className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-white rounded-md flex items-center gap-2"
                    >
                        <Edit size={16} /> Edit User
                    </button>
                </div>
            )}
        >
            <div className="p-4 space-y-6">
                {/* Cabeçalho com foto e informações básicas */}
                <div className="flex items-start gap-4">
                    <div className="h-24 w-24 rounded-full overflow-hidden bg-background-secondary flex-shrink-0 border border-border-primary">
                        {user.photo ? (
                            <img
                                src={user.photo}
                                alt={user.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/96';
                                }}
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-text-tertiary font-medium text-3xl">
                                {user.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                        )}
                    </div>

                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                            {user.name || 'Unknown User'}
                            <span className={`px-2 py-0.5 text-xs rounded-full ${user.role === 'admin'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                }`}>
                                {user.role || 'user'}
                            </span>
                        </h3>
                        <p className="text-text-secondary">{user.email || 'No email'}</p>
                        <div className="mt-2 text-sm text-text-tertiary">
                            User ID: <span className="font-mono">{user.id || 'Unknown'}</span>
                        </div>
                    </div>
                </div>

                {/* Informações detalhadas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-4">
                        <h4 className="font-medium text-text-primary border-b border-border-primary pb-2">
                            Personal Information
                        </h4>

                        <div>
                            <div className="mb-3">
                                <p className="text-xs text-text-tertiary mb-1">Full Name</p>
                                <p className="text-text-primary">{user.name || 'Not provided'}</p>
                            </div>

                            <div className="mb-3">
                                <p className="text-xs text-text-tertiary mb-1">Email</p>
                                <p className="text-text-primary">{user.email || 'Not provided'}</p>
                            </div>

                            <div className="mb-3">
                                <p className="text-xs text-text-tertiary mb-1">Phone</p>
                                <div className="flex items-center">
                                    <Phone size={16} className="text-text-tertiary mr-2" />
                                    <p className="text-text-primary">{user.phone || 'Not provided'}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-text-tertiary mb-1">Address</p>
                                <div className="flex items-start">
                                    <MapPin size={16} className="text-text-tertiary mr-2 mt-0.5 flex-shrink-0" />
                                    <p className="text-text-primary break-words">
                                        {user.address || 'Not provided'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-medium text-text-primary border-b border-border-primary pb-2">
                            Account Information
                        </h4>

                        <div>
                            <div className="mb-3">
                                <p className="text-xs text-text-tertiary mb-1">Role</p>
                                <div className="flex items-center">
                                    {user.role === 'admin' ? (
                                        <Shield size={16} className="text-purple-500 mr-2" />
                                    ) : (
                                        <User size={16} className="text-blue-500 mr-2" />
                                    )}
                                    <p className="text-text-primary capitalize">{user.role || 'user'}</p>
                                </div>
                            </div>

                            <div className="mb-3">
                                <p className="text-xs text-text-tertiary mb-1">Status</p>
                                <p className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive !== false
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                    }`}>
                                    {user.isActive !== false ? 'Active' : 'Inactive'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PreviewModal>
    );
}