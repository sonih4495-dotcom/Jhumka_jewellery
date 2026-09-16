// Location: components/referral-modal.tsx
'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Gift, Copy, Check, Share2 } from 'lucide-react';

export function ReferralModal({ trigger }: { trigger?: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const referralCode = 'BESTIE20';

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://jhumkajunction.in';
    const referralMessage = `Hey bestie! ✨ Get 20% OFF on trendy handcrafted jewellery at Jhumka Junction using my exclusive code: ${referralCode} at checkout! 💖 Visit: ${origin}`;
    const encoded = encodeURIComponent(referralMessage);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="rounded-full border-pink-200 bg-pink-50/50 text-pink-700 hover:bg-pink-100 text-xs">
            <Gift className="mr-1.5 h-3.5 w-3.5 text-pink-500" />
            Give ₹200, Get ₹200
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-3xl p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/25">
          <Gift className="h-7 w-7" />
        </div>

        <DialogHeader className="mt-2">
          <DialogTitle className="text-xl font-extrabold text-gray-900">
            Share the Drip with your Bestie! 👯‍♀️
          </DialogTitle>
          <p className="text-xs text-gray-500 mt-1">
            Give your best friends 20% OFF their first order. When they order, you unlock a ₹200 gift voucher!
          </p>
        </DialogHeader>

        <div className="my-5 rounded-2xl border border-dashed border-purple-200 bg-purple-50/50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-600">Your Exclusive Bestie Code</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="font-mono text-2xl font-black tracking-widest text-gray-900">{referralCode}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="h-8 rounded-lg border-purple-200 bg-white px-2.5 text-xs text-purple-700 hover:bg-purple-50"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span className="ml-1">{copied ? 'Copied!' : 'Copy'}</span>
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            onClick={handleWhatsAppShare}
            className="w-full rounded-xl bg-green-600 py-5 text-xs font-bold text-white hover:bg-green-700 shadow-md shadow-green-500/20"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share on WhatsApp to Besties
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
