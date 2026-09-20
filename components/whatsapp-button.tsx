// Location: components/whatsapp-button.tsx
'use client';

import React, { useState } from 'react';
import { MessageCircle, X, Sparkles, Send } from 'lucide-react';

export function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  const phoneNumber = '919898243002'; // Jhumka Junction WhatsApp Concierge

  const quickPrompts = [
    '✨ Hey! Help me pick jewellery for Garba / Navratri!',
    '💎 What material is this jewellery made of?',
    '📦 What is the delivery time to my city?',
    '🎁 I want to send a Bestie Gift Box!',
  ];

  const handleSend = (text: string) => {
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${phoneNumber}?text=${encoded}`, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-3.5 sm:right-6 z-40">
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2rem)] max-w-sm sm:w-80 rounded-2xl border border-pink-100 bg-white p-4 shadow-2xl animate-fade-in transition-all">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white shadow-sm">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Jhumka Junction Concierge</p>
                <p className="text-[10px] text-green-600 font-medium">● Online • Instant Stylist Support</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="my-3 space-y-2">
            <p className="text-xs text-gray-600 font-medium">Quick Questions:</p>
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="w-full text-left rounded-xl bg-purple-50/60 hover:bg-purple-100/70 p-2.5 text-xs text-purple-900 transition-all font-medium border border-purple-100/50"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="flex gap-1.5 pt-1">
            <input
              type="text"
              placeholder="Ask anything about our jewellery..."
              value={customMsg}
              onChange={e => setCustomMsg(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && customMsg.trim()) {
                  handleSend(customMsg);
                }
              }}
              className="flex-1 rounded-xl border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-purple-600"
            />
            <button
              onClick={() => customMsg.trim() && handleSend(customMsg)}
              className="rounded-xl bg-green-600 px-3 py-1.5 text-white hover:bg-green-700 transition-all"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gradient-to-tr from-green-600 to-emerald-500 text-white shadow-xl shadow-green-500/25 hover:scale-105 active:scale-95 transition-all focus:outline-none"
        aria-label="Chat with Jhumka Junction Stylist on WhatsApp"
      >
        <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-pink-500 text-[8px] font-bold text-white items-center justify-center">1</span>
        </span>
      </button>
    </div>
  );
}
