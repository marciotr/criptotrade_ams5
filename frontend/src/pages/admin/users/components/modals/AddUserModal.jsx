import React from 'react';
import InputMask from 'react-input-mask';
import { Modal } from '../../../../../components/common/Modal';
import { UserPlus, Loader, Phone } from 'lucide-react';

export function AddUserModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  loading
}) {
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} width="max-w-lg" overflow="overflow-y-auto">
      <div className="bg-background-primary p-6">
        <header className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-brand-primary" /> Add New User
          </h2>
        </header>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-text-primary">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 w-full p-3 border border-border-primary rounded-lg bg-background-secondary text-text-primary focus:ring-2 focus:ring-brand-primary transition"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-text-primary">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full p-3 border border-border-primary rounded-lg bg-background-secondary text-text-primary focus:ring-2 focus:ring-brand-primary transition"
              required
            />
          </div>

          {/* Phone */}
          <div className="relative">
            <label className="block text-sm font-medium text-text-primary">Phone</label>
            <Phone className="absolute left-3 top-10 text-text-tertiary" />
            <InputMask
              mask="+55 (99) 99999-9999"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 w-full pl-10 p-3 border border-border-primary rounded-lg bg-background-secondary text-text-primary focus:ring-2 focus:ring-brand-primary transition"
              placeholder="+55 (00) 00000-0000"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-text-primary">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="mt-1 w-full p-3 border border-border-primary rounded-lg bg-background-secondary text-text-primary focus:ring-2 focus:ring-brand-primary transition"
              placeholder="Enter full address"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-text-primary">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 w-full p-3 border border-border-primary rounded-lg bg-background-secondary text-text-primary focus:ring-2 focus:ring-brand-primary transition"
            >
              <option value="admin">Administrator</option>
              <option value="user">Regular User</option>
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-text-primary">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full p-3 border border-border-primary rounded-lg bg-background-secondary text-text-primary focus:ring-2 focus:ring-brand-primary transition"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-border-primary">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-background-secondary text-text-primary rounded-lg hover:bg-opacity-80 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-brand-primary text-white rounded-lg flex items-center gap-2 hover:bg-brand-primary-dark transition"
            >
              {loading ? <Loader className="animate-spin h-5 w-5" /> : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
