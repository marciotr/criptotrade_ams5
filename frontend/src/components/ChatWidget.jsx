import React, { useState, useEffect, useRef } from 'react';
import { chatbotApi } from '../services/api/api';

export default function ChatWidget({ userId, onClose }) {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Olá! Pergunte algo como "Qual meu saldo?" ou diga "Depositar 200 USD".' }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    const userMsg = { from: 'user', text };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setSending(true);

    try {
      const body = { message: text };
      if (userId) body.userId = userId;

      const res = await chatbotApi.sendMessage(body);
      const data = res?.data;
      const reply = data?.reply || 'Sem resposta do chatbot.';
      setMessages(m => [...m, { from: 'bot', text: reply }]);
    } catch (err) {
      // tenta extrair mensagem útil do erro axios
      const msg = err?.response?.data?.message || err?.response?.data?.reply || err?.message || 'Erro ao comunicar com o chatbot.';
      setMessages(m => [...m, { from: 'bot', text: String(msg) }]);
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="w-[320px] h-[520px] sm:w-[360px] sm:h-[600px] bg-background-primary border border-border-primary rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-primary">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-brand-primary to-purple-600 flex items-center justify-center text-white font-bold">CB</div>
            <div>
              <div className="text-sm font-semibold text-text-primary">Chatbot</div>
              <div className="text-xs text-text-secondary">Assistente de carteira</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-sm">Fechar</button>
          </div>
        </div>

        <div ref={containerRef} className="flex-1 p-3 overflow-y-auto space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === 'bot' ? 'justify-start' : 'justify-end'}`}>
              <div className={`${m.from === 'bot' ? 'bg-background-secondary text-text-primary' : 'bg-brand-primary text-white'} max-w-[80%] p-2.5 rounded-lg`}> 
                <div className="text-xs sm:text-sm whitespace-pre-wrap">{m.text}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-border-primary">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Escreva uma mensagem..."
            className="w-full resize-none h-16 p-2 rounded-md border border-border-primary bg-background-secondary text-text-primary placeholder-text-tertiary"
          />
          <div className="flex items-center justify-between mt-2">
            <div className="text-xs text-text-secondary">{sending ? 'Enviando...' : ''}</div>
            <div className="flex items-center gap-2">
              <button
                onClick={sendMessage}
                disabled={sending}
                className="px-3 py-1.5 bg-gradient-to-r from-brand-primary to-purple-600 text-white rounded-md text-sm disabled:opacity-60"
              >Enviar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
