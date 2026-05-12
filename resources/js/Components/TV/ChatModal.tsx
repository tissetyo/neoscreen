'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useSWR from 'swr';
import { QRCode } from 'react-qr-code';
import { MessageCircle, QrCode, Send, X } from 'lucide-react';
import { useRoomStore } from '@/stores/roomStore';
import { useDpadNavigation } from '@/lib/hooks/useDpadNavigation';

interface ChatMessage {
  id: string;
  sender: 'guest' | 'staff';
  message: string;
  created_at: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_REPLIES = [
  'Hello',
  'Need assistance',
  'Housekeeping please',
  'Please call my room',
];

export default function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const store = useRoomStore();
  const authHeaders = store.roomSessionToken ? { 'X-Room-Token': store.roomSessionToken } : {};
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: messages = [], mutate } = useSWR(
    isOpen && store.roomId ? `chat-${store.roomId}` : null,
    async () => {
      const res = await fetch(`/api/room/${store.roomId}/chat`, { headers: authHeaders });
      const data = await res.json();
      return data.messages as ChatMessage[] || [];
    },
    { refreshInterval: 3000 }
  );

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !store.roomId || !store.hotelId || sessionId) return;
    setLoadingQr(true);
    fetch(`/api/room/${store.roomId}/mobile-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ hotelId: store.hotelId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.sessionId) setSessionId(data.sessionId);
      })
      .finally(() => setLoadingQr(false));
  }, [isOpen, store.roomId, store.hotelId, sessionId]);

  useDpadNavigation({ enabled: isOpen, onEscape: onClose, selector: '.chat-focusable' });

  const sendMessage = async (message: string) => {
    const msgText = message.trim();
    if (!msgText || !store.roomId || !store.hotelId || sending) return;
    setSending(true);
    setInput('');

    mutate([...messages, {
      id: crypto.randomUUID(),
      sender: 'guest',
      message: msgText,
      created_at: new Date().toISOString()
    }], false);

    await fetch(`/api/room/${store.roomId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ message: msgText }),
    });

    mutate();
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
    if (e.key === 'Escape' || e.key === 'Backspace') {
      e.preventDefault();
      onClose();
    }
  };

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

  const originUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const qrUrl = sessionId ? `${originUrl}/${store.hotelSlug}/mobile/${sessionId}/chat` : '';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.82)' }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="glass-card flex h-[min(78vh,760px)] w-[min(82vw,1360px)] flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-[2.4vw] py-[2vh]">
              <div className="flex items-center gap-[1vw]">
                <div className="flex h-[3vw] w-[3vw] items-center justify-center rounded-2xl bg-white/10 text-[#f3e5ab]">
                  <MessageCircle className="h-[1.5vw] w-[1.5vw]" />
                </div>
                <div>
                  <h2 className="text-[clamp(24px,2vw,40px)] font-semibold text-white">Chat with Front Office</h2>
                  <p className="text-[clamp(13px,0.85vw,18px)] text-white/50">Use quick replies with the remote, or scan to type on your phone.</p>
                </div>
                {store.unreadChatCount > 0 && (
                  <span className="rounded-full bg-red-500 px-3 py-1 text-sm text-white">{store.unreadChatCount}</span>
                )}
              </div>
              <button onClick={onClose} className="chat-focusable rounded-full p-[0.8vw] text-white/60 transition-colors hover:text-white" tabIndex={0}>
                <X className="h-[1.7vw] w-[1.7vw]" />
              </button>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-[1fr_minmax(280px,24vw)] gap-[1.4vw] p-[2vw]">
              <div className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-black/18">
                <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-[1.6vw] hide-scrollbar">
                  {messages.length === 0 && (
                    <div className="flex h-full items-center justify-center text-center text-white/35">
                      <p className="text-[clamp(18px,1.2vw,24px)]">No messages yet</p>
                    </div>
                  )}
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'guest' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-[1.1vw] py-[1vh] ${
                        msg.sender === 'guest'
                          ? 'rounded-br-md bg-[#aa8529]/85 text-white'
                          : 'rounded-bl-md bg-white/10 text-white/90'
                      }`}>
                        <p className="mb-1 text-[clamp(12px,0.7vw,15px)] opacity-65">
                          {msg.sender === 'guest' ? (store.guestName || 'Guest') : 'Front Office'} - {formatTime(msg.created_at)}
                        </p>
                        <p className="text-[clamp(16px,1vw,22px)] leading-relaxed">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 p-[1.2vw]">
                  <div className="mb-[1vh] grid grid-cols-4 gap-[0.6vw]">
                    {QUICK_REPLIES.map((reply) => (
                      <button
                        key={reply}
                        onClick={() => sendMessage(reply)}
                        disabled={sending}
                        className="chat-focusable rounded-2xl border border-white/12 bg-white/8 px-[0.7vw] py-[1vh] text-[clamp(13px,0.82vw,17px)] font-semibold text-white transition-colors hover:border-[#d4af37] disabled:opacity-50"
                        tabIndex={0}
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-[0.8vw]">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      className="chat-focusable min-w-0 flex-1 rounded-2xl border border-white/12 bg-white/6 px-[1vw] py-[1.1vh] text-[clamp(16px,1vw,22px)] text-white placeholder-white/30 outline-none focus:border-[#d4af37]"
                      tabIndex={0}
                    />
                    <button
                      onClick={() => sendMessage(input)}
                      disabled={!input.trim() || sending}
                      className="chat-focusable flex items-center gap-[0.5vw] rounded-2xl bg-[#14b8a6] px-[1.6vw] py-[1vh] text-[clamp(16px,1vw,22px)] font-bold text-white disabled:opacity-45"
                      tabIndex={0}
                    >
                      <Send className="h-[1vw] w-[1vw]" />
                      Send
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center rounded-3xl border border-[#d4af37]/30 bg-[#d4af37]/10 p-[1.4vw] text-center">
                <QrCode className="mb-[1vh] h-[2vw] w-[2vw] text-[#f3e5ab]" />
                <h3 className="text-[clamp(20px,1.35vw,28px)] font-semibold text-white">Chat on phone</h3>
                <p className="mb-[1.4vh] mt-[0.4vh] text-[clamp(13px,0.85vw,17px)] text-white/55">Scan to open the mobile chat and type comfortably.</p>
                {loadingQr ? (
                  <div className="h-[min(17vw,230px)] w-[min(17vw,230px)] animate-pulse rounded-3xl bg-white/10" />
                ) : qrUrl ? (
                  <div className="rounded-3xl bg-white p-[0.8vw] shadow-[0_0_40px_rgba(20,184,166,0.18)]">
                    <QRCode value={qrUrl} size={230} style={{ width: 'min(17vw,230px)', height: 'min(17vw,230px)' }} />
                  </div>
                ) : (
                  <div className="flex h-[min(17vw,230px)] w-[min(17vw,230px)] items-center justify-center rounded-3xl bg-white/10 text-white/40">
                    QR unavailable
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
