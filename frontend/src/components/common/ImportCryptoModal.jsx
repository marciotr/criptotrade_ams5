import React from 'react';
import { Modal } from './Modal';
import CryptoIcon from '../common/CryptoIcons';

export function ImportCryptoModal({ coin, onConfirm, onClose }) {
  if (!coin) return null;
  return (
    <Modal onClose={onClose} width="max-w-sm">
      <div className="flex flex-col items-center space-y-4">
        <h2 className="text-xl font-semibold">Importar Moeda</h2>
        <CryptoIcon symbol={coin.name} size={48} className="text-brand-primary" />
        <p className="text-text-primary">
          Deseja adicionar <strong>{coin.name}</strong> à tabela de moedas?
        </p>
        <div className="flex space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-background-secondary text-text-primary rounded-md hover:bg-background-tertiary"
          >
            Cancelar
          </button>
          <button
            onClick={() => { onConfirm(coin); onClose(); }}
            className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary"
          >
            Confirmar
          </button>
        </div>
      </div>
    </Modal>
  );
}