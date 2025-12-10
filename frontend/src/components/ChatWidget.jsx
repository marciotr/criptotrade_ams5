    import React, { useState, useEffect, useRef } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { X, Send, MessageCircle, Sparkles } from 'lucide-react';
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
        <AnimatePresence>
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-4 right-4 z-50"
        >
            <motion.div 
            className="w-[340px] h-[560px] sm:w-[380px] sm:h-[640px] bg-background-primary border border-border-primary rounded-3xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl"
            >
            {/* Header com gradiente */}
            <motion.div 
                className="relative px-5 py-4 bg-gradient-to-r from-brand-primary to-purple-600 overflow-hidden"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                {/* Efeito de brilho animado no header */}
                <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                
                <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <MessageCircle size={22} className="text-white" />
                    <motion.div
                        className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    </div>
                    <div>
                    <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        Assistente CriptoTrade
                        <Sparkles size={14} className="text-yellow-300" />
                    </div>
                    <div className="text-xs text-white/80 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        Online agora
                    </div>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
                >
                    <X size={18} className="text-white" />
                </button>
                </div>
            </motion.div>

            {/* Área de mensagens com scroll customizado */}
            <div 
                ref={containerRef} 
                className="flex-1 p-4 overflow-y-auto space-y-3 bg-gradient-to-b from-background-secondary/20 to-background-primary"
                style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(139, 92, 246, 0.3) transparent'
                }}
            >
                <AnimatePresence mode="popLayout">
                {messages.map((m, i) => (
                    <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className={`flex ${m.from === 'bot' ? 'justify-start' : 'justify-end'}`}
                    >
                    <div
                        className={`${
                        m.from === 'bot'
                            ? 'bg-background-secondary border border-border-primary text-text-primary'
                            : 'bg-gradient-to-r from-brand-primary to-purple-600 text-white shadow-lg'
                        } max-w-[85%] px-4 py-3 rounded-2xl ${
                        m.from === 'bot' ? 'rounded-tl-sm' : 'rounded-tr-sm'
                        }`}
                    >
                        {m.from === 'bot' && (
                        <div className="flex items-center gap-2 mb-1.5 text-xs text-text-secondary">
                            <MessageCircle size={12} />
                            <span className="font-medium">Assistente</span>
                        </div>
                        )}
                        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {m.text}
                        </div>
                    </div>
                    </motion.div>
                ))}
                </AnimatePresence>
                
                {/* Indicador de digitação */}
                <AnimatePresence>
                {sending && (
                    <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-start"
                    >
                    <div className="bg-background-secondary border border-border-primary px-4 py-3 rounded-2xl rounded-tl-sm">
                        <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                            key={i}
                            className="w-1.5 h-1.5 bg-brand-primary rounded-full"
                            animate={{ y: [0, -6, 0] }}
                            transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: i * 0.15,
                            }}
                            />
                        ))}
                        </div>
                    </div>
                    </motion.div>
                )}
                </AnimatePresence>
            </div>

            {/* Input area modernizada */}
            <motion.div 
                className="p-4 border-t border-border-primary bg-background-secondary/50 backdrop-blur-sm"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <div className="flex gap-2">
                <div className="flex-1 relative">
                    <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Digite sua mensagem..."
                    rows={1}
                    className="w-full resize-none px-4 py-2.5 rounded-xl border border-border-primary bg-background-primary text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all overflow-hidden"
                    />
                </div>
                <button
                    onClick={sendMessage}
                    disabled={sending || !input.trim()}
                    className="px-4 py-2.5 bg-gradient-to-r from-brand-primary to-purple-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2 min-w-[60px]"
                >
                    {sending ? (
                    <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    ) : (
                    <Send size={18} />
                    )}
                </button>
                </div>
                
                <div className="flex items-center justify-between mt-2 px-1">
                <div className="text-xs text-text-tertiary">
                    {sending ? (
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-1.5"
                    >
                        <motion.div
                        className="w-1.5 h-1.5 bg-brand-primary rounded-full"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        Processando...
                    </motion.span>
                    ) : (
                    <span className="opacity-0">Processando...</span>
                    )}
                </div>
                <div className="text-xs text-text-tertiary">
                    Pressione Enter para enviar
                </div>
                </div>
            </motion.div>
            </motion.div>
        </motion.div>
        </AnimatePresence>
    );
    }
