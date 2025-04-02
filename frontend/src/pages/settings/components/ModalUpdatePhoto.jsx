import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Upload } from 'lucide-react';

export function ModalUpdatePhoto({ onClose, onUpdate, currentPhoto }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setIsLoading(true);
      await onUpdate(selectedFile);
      onClose();
    } catch (error) {
      console.error('Error updating photo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-text-primary">Update Profile Photo</h3>
          <p className="mt-2 text-text-secondary text-sm">
            Choose a new profile photo. Recommended size: 400x400px
          </p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <div className="w-32 h-32 relative rounded-full overflow-hidden">
            <img
              src={preview || currentPhoto}
              alt="Profile preview"
              className="w-full h-full object-cover"
            />
          </div>

          <label className="cursor-pointer group">
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <div className="flex items-center gap-2 text-brand-primary hover:text-brand-secondary">
              <Upload size={20} />
              <span className="text-sm font-medium">Upload new photo</span>
            </div>
          </label>

          <div className="text-xs text-text-tertiary">
            Supported formats: JPG, PNG, GIF (max. 2MB)
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-text-primary hover:bg-background-secondary rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedFile || isLoading}
            className="px-4 py-2 bg-brand-primary text-background-primary rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
                Updating...
              </>
            ) : (
              'Update Photo'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}