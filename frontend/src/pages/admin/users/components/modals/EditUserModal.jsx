import React from 'react';
import InputMask from 'react-input-mask';
import { Modal } from '../../../../../components/common/Modal';
import { UserCog, Loader, Phone } from 'lucide-react';

export function EditUserModal({
  isOpen,
  onClose,
  selectedUser,
  formData,
  setFormData,
  onSubmit,
  loading,
  handlePhotoUpload
}) {
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} width="max-w-xl" overflow="overflow-y-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-text-primary flex items-center gap-2">
            <UserCog className="h-6 w-6 text-brand-primary" /> Edit User
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4">
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

          <div>
            <label className="block text-sm font-medium text-text-primary">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="mt-1 w-full p-3 border border-border-primary rounded-lg bg-background-secondary text-text-primary focus:ring-2 focus:ring-brand-primary transition"
              placeholder="Full address"
            />
          </div>

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

          <div>
            <label className="block text-sm font-medium text-text-primary">
              Password <span className="text-xs text-text-tertiary">(leave blank to keep unchanged)</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full p-3 border border-border-primary rounded-lg bg-background-secondary text-text-primary focus:ring-2 focus:ring-brand-primary transition"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary">Profile Photo</label>
            <div className="flex items-center space-x-4 mt-1">
              <div className="h-20 w-20 rounded-full overflow-hidden bg-background-secondary border border-border-primary">
                {selectedUser?.photo ? (
                  <img
                    src={selectedUser.photo}
                    alt={selectedUser.name}
                    className="h-full w-full object-cover"
                    onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/80'; }}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-text-tertiary font-medium text-2xl">
                    {selectedUser?.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <label className="cursor-pointer px-4 py-2 bg-brand-primary text-white rounded-lg shadow hover:bg-brand-primary-dark transition">
                Change Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handlePhotoUpload(selectedUser.id, e)}
                  className="hidden"
                />
              </label>
            </div>
          </div>

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
              {loading ? <Loader className="animate-spin h-5 w-5" /> : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
