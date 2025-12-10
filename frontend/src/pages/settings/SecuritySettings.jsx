import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Shield, Key } from 'lucide-react';
import { Modal } from '../../components/common/Modal'; 
import InputMask from 'react-input-mask';
import { userApi } from '../../services/api/api';
import { NotificationToast } from '../../components/common/NotificationToast';

export function SecuritySettings() {
  const [selectedAuthMethod, setSelectedAuthMethod] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phoneMask, setPhoneMask] = useState('(99) 99999-9999');
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaType, setMfaType] = useState('none');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const handleAuthMethodChange = (event) => {
    const val = event.target.value;
    setSelectedAuthMethod(val);
    setIsModalOpen(val !== 'none');
    setMfaType(val);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAuthMethod('');
  };

  const handlePhoneMaskChange = (event) => {
    const selectedCountry = event.target.value;
    if (selectedCountry === 'BR') {
      setPhoneMask('(99) 99999-9999');
    } else {
      setPhoneMask('+999 999 999 999');
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          const u = JSON.parse(stored);
          setCurrentUser(u);
          setMfaEnabled(!!u.mfaEnabled || !!u.MfaEnabled || false);
          const t = (u.mfaType || u.MfaType || '').toLowerCase();
          if (t.includes('sms')) setMfaType('sms');
          else if (t.includes('auth')) setMfaType('authenticator');
          else if (t.includes('email')) setMfaType('email');
          else setMfaType('none');
        } else {
          const resp = await userApi.getUsers();
          const users = resp.data || [];
          const tokenUserEmail = stored ? JSON.parse(stored).email : null;
          const found = users.find(x => x.email === tokenUserEmail) || users[0];
          if (found) {
            setCurrentUser(found);
            setMfaEnabled(!!found.mfaEnabled || !!found.MfaEnabled || false);
            const t = (found.mfaType || found.MfaType || '').toLowerCase();
            if (t.includes('sms')) setMfaType('sms');
            else if (t.includes('auth')) setMfaType('authenticator');
            else if (t.includes('email')) setMfaType('email');
            else setMfaType('none');
          }
        }
      } catch (err) {
        console.error('Failed to load user for security settings', err);
      }
    };

    loadUser();
  }, []);

  const handleSaveMfa = async () => {
    if (!currentUser) {
      setToast({ type: 'error', message: 'Usuário não encontrado. Refaça o login.' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...currentUser,
        MfaEnabled: mfaEnabled,
        MfaType: mfaType === 'none' ? null : mfaType
      };

      await userApi.updateProfile(currentUser.id || currentUser.Id || currentUser.userId, payload);

      const updated = { ...currentUser, mfaEnabled, MfaEnabled: mfaEnabled, mfaType: payload.MfaType };
      setCurrentUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));

      setToast({ type: 'success', message: 'Configurações de MFA atualizadas com sucesso.' });
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: err.response?.data?.message || 'Falha ao salvar configurações.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 lg:p-6 rounded-xl bg-background-primary shadow-lg"
    >
      <h2 className="text-xl font-bold text-text-primary">Segurança</h2>
      <p className="text-text-secondary mb-4">Configure suas configurações de segurança.</p>
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <NotificationToast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}
      
      <div className="space-y-6">
        {/* Seção de Senha */}
        <div>
          <label className="block text-text-primary flex items-center mb-2">
            <Lock className="mr-2 text-brand-primary" /> Alterar Senha
          </label>
          <input 
            type="password" 
            placeholder="Digite a nova senha" 
            className="block w-full px-3 py-2 bg-background-primary border border-border-primary rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary text-text-primary placeholder-text-tertiary" 
          />
        </div>

        {/* Seção de Autenticação de 2 Fatores */}
        <div>
          <label className="block text-text-primary flex items-center mb-2">
            <Shield className="mr-2 text-brand-primary" /> Autenticação de Dois Fatores
          </label>

          <div className="flex items-center gap-3 mb-3">
            <label className="flex items-center gap-2 text-text-primary">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={mfaEnabled}
                onChange={() => setMfaEnabled(v => !v)}
              />
              <span>Ativar 2FA</span>
            </label>
            <div className="text-sm text-text-secondary">{mfaEnabled ? 'Ativado' : 'Desativado'}</div>
          </div>

          <select 
            value={selectedAuthMethod || mfaType}
            className="block w-full px-3 py-2 bg-background-primary border border-border-primary rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary text-text-primary"
            onChange={handleAuthMethodChange}
          >
            <option value="none">Nenhum</option>
            <option value="sms">SMS</option>
            <option value="authenticator">Aplicativo Autenticador</option>
            <option value="email">E-mail</option>
          </select>

          <div className="mt-3">
            <button
              disabled={loading}
              onClick={handleSaveMfa}
              className="px-4 py-2 bg-brand-primary text-background-primary rounded-lg hover:opacity-90 transition-colors"
            >
              Salvar 2FA
            </button>
          </div>
        </div>

        {/* Perguntas de Segurança */}
        <div>
          <label className="block text-text-primary flex items-center mb-2">
            <Key className="mr-2 text-brand-primary" /> Perguntas de Segurança
          </label>
          <input 
            type="text" 
            placeholder="Digite a pergunta de segurança" 
            className="block w-full px-3 py-2 bg-background-primary border border-border-primary rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary text-text-primary placeholder-text-tertiary" 
          />
        </div>

        <button className="px-4 py-2 bg-brand-primary text-background-primary rounded-lg hover:opacity-90 transition-colors flex items-center">
          <Shield className="mr-2" /> Salvar Alterações
        </button>
      </div>

      {/* Modal com cores atualizadas */}
      {isModalOpen && (
        <Modal onClose={closeModal}>
          <div className="p-6 bg-background-primary rounded-lg">
            {selectedAuthMethod === 'sms' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-text-primary">Digite seu número de telefone</h3>
                <select className="block w-full px-3 py-2 mb-4 bg-background-primary border border-border-primary rounded-md shadow-sm focus:ring-2 focus:ring-brand-primary text-text-primary" onChange={handlePhoneMaskChange}>
                  <option value="BR">Brasil</option>
                  <option value="INT">Internacional</option>
                </select>
                <InputMask 
                  mask={phoneMask} 
                  placeholder="Digite o número de telefone" 
                  className="block w-full px-3 py-2 bg-background-primary border border-border-primary rounded-md shadow-sm focus:ring-2 focus:ring-brand-primary text-text-primary placeholder-text-tertiary" 
                />
                <button className="w-full px-4 py-2 bg-brand-primary text-background-primary rounded-lg hover:opacity-90 transition-colors">
                  Enviar
                </button>
              </div>
            )}
            {selectedAuthMethod === 'authenticator' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-text-primary">Escaneie o código QR com seu aplicativo autenticador</h3>
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Link_pra_pagina_principal_da_Wikipedia-PT_em_codigo_QR_b.svg/1200px-Link_pra_pagina_principal_da_Wikipedia-PT_em_codigo_QR_b.svg.png" alt="QR Code" className="mx-auto" />
                <InputMask mask="999 999" placeholder="Digite o código" className="block w-full px-3 py-2 bg-background-primary border border-border-primary rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary text-text-primary placeholder-text-tertiary" />
                <button className="w-full px-4 py-2 bg-brand-primary text-background-primary rounded-lg hover:opacity-90 transition-colors">Concluído</button>
              </div>
            )}
            {selectedAuthMethod === 'email' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-text-primary">Digite seu endereço de e-mail</h3>
                <input type="email" placeholder="Digite o endereço de e-mail" className="block w-full px-3 py-2 bg-background-primary border border-border-primary rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary text-text-primary placeholder-text-tertiary" />
                <button className="w-full px-4 py-2 bg-brand-primary text-background-primary rounded-lg hover:opacity-90 transition-colors">Enviar</button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </motion.div>
  );
}