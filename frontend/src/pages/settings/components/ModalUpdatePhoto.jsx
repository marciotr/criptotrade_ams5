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

  const handleUpload = (file) => {
    onUpdate(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setIsLoading(true);
      handleUpload(selectedFile);
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
          <h3 className="text-xl font-semibold text-text-primary">Atualizar Foto de Perfil</h3>
          <p className="mt-2 text-text-secondary text-sm">
            Escolha uma nova foto de perfil. Tamanho recomendado: 400x400px
          </p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <div className="w-32 h-32 relative rounded-full overflow-hidden">
            <img
              src={preview || currentPhoto}
              alt="Prévia do perfil"
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
              <span className="text-sm font-medium">Enviar nova foto</span>
            </div>
          </label>

          <div className="text-xs text-text-tertiary">
            Formatos suportados: JPG, PNG, GIF (máx. 2MB)
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-text-primary hover:bg-background-secondary rounded-lg transition-colors"
          >
            Cancelar
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
                Atualizando...
              </>
            ) : (
              'Atualizar Foto'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}