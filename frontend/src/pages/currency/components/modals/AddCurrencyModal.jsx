import React from 'react';
import { Plus, Loader } from 'lucide-react';
import { Modal } from '../../../../components/common/Modal';

export function AddCurrencyModal({ isOpen, onClose, formData, setFormData, onSubmit, loading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} width="max-w-md" overflow="overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4 flex items-center text-text-primary">
        <Plus className="mr-2 text-brand-primary" /> Add Currency
      </h2>
      <form onSubmit={onSubmit} className="space-y-4">
        {['symbol','name','backing'].map(field => (
          <div key={field}>
            <label className="block text-sm font-medium mb-1 capitalize text-text-primary">{field}</label>
            <input
              type="text"
              name={field}
              value={formData[field]}
              onChange={e => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
              className="w-full p-2.5 border border-border-primary rounded-md bg-background-secondary text-text-primary focus:ring-2 focus:ring-brand-primary transition"
              required
            />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium mb-1 text-text-primary">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
            className="w-full p-2.5 border border-border-primary rounded-md bg-background-secondary text-text-primary focus:ring-2 focus:ring-brand-primary transition"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-border-primary">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 bg-background-secondary text-text-primary border border-border-primary rounded-md hover:bg-opacity-80 transition"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading} 
            className="px-4 py-2 bg-brand-primary text-white rounded-md flex items-center hover:bg-brand-primary-dark transition"
          >
            {loading ? (
              <><Loader size={16} className="animate-spin mr-2" /> Creating...</>
            ) : (
              <><Plus size={16} className="mr-2" /> Create</>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
