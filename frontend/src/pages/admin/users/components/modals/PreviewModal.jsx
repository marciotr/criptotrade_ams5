import React from 'react';
import { motion } from 'framer-motion';
import { X, ExternalLink, Download, Trash2 } from 'lucide-react';

export function PreviewModal({ 
  children, 
  onClose, 
  title,
  imageUrl,
  width = 'max-w-2xl',
  height = 'auto',
  maxHeight = 'max-h-[90vh]',
  onDownload,
  onOpenExternal,
  footer,
  isOpen, // Adicionar isOpen como prop
  previewUser,
  users,
  setIsPreviewModalOpen,
  openDeleteModal,
  showNotification
}) {
  // Não renderizar nada se não estiver aberto
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`relative bg-background-primary rounded-lg shadow-xl p-0 w-full ${width} ${
          height !== 'auto' ? height : ''
        } ${maxHeight} overflow-hidden border border-border-primary`}
      >
        {/* Header com design melhorado */}
        <div className="flex items-center justify-between p-4 border-b border-border-primary bg-background-secondary">
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          <div className="flex items-center gap-2">
            {onDownload && (
              <button 
                onClick={onDownload} 
                className="p-1.5 rounded-full text-text-secondary hover:bg-background-primary hover:text-brand-primary transition-colors"
                title="Download"
              >
                <Download size={18} />
              </button>
            )}
            {onOpenExternal && (
              <button 
                onClick={onOpenExternal} 
                className="p-1.5 rounded-full text-text-secondary hover:bg-background-primary hover:text-brand-primary transition-colors"
                title="Open in new tab"
              >
                <ExternalLink size={18} />
              </button>
            )}
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-full text-text-secondary hover:bg-background-primary hover:text-brand-primary transition-colors"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content com padding consistente */}
        <div 
          className="overflow-auto scrollbar-thin scrollbar-thumb-border-primary scrollbar-track-background-secondary" 
          style={{ maxHeight: 'calc(90vh - 8rem)' }}
        >
          {imageUrl ? (
            <div className="flex items-center justify-center p-6">
              <img 
                src={imageUrl} 
                alt={title || "Preview"} 
                className="max-w-full max-h-[70vh] object-contain rounded-md border border-border-primary"
              />
            </div>
          ) : children}
        </div>

        {/* Footer com design melhorado */}
        {footer && (
          <div className="p-4 border-t border-border-primary bg-background-secondary">
            {footer}
          </div>
        )}
      </motion.div>
    </div>
  );
}