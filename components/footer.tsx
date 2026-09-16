// Location: components/footer.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, ShieldCheck, RefreshCw, Truck, Heart, Instagram } from 'lucide-react';
import dynamic from 'next/dynamic';
import { NewsletterForm } from './newsletter-form';

const RingSizeGuideModal = dynamic(
  () => import('./ring-size-guide-modal').then(mod => mod.RingSizeGuideModal),
  { ssr: false }
);

const ReferralModal = dynamic(
  () => import('./referral-modal').then(mod => mod.ReferralModal),
  { ssr: false }
);

export function Footer() {
  return (
    <footer className="mt-20 border-t border-gray-800 bg-[#0F0F11] text-gray-300">
      {/* Trust Badges Banner */}
      <div className="border-b border-gray-800/80 py-8 bg-[#141417]">
        <div className="container mx-auto grid grid-cols-2 gap-6 px-4 sm:grid-cols-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-800/80 text-amber-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Premium Quality</p>
              <p className="text-[11px] text-gray-400">Authentic artisan craftsmanship</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-800/80 text-rose-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Anti-Tarnish Polish</p>
              <p className="text-[11px] text-gray-400">Long-lasting shine &amp; finish</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-800/80 text-cyan-400">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">COD Available</p>
              <p className="text-[11px] text-gray-400">Cash on Delivery across India</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-800/80 text-emerald-400">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">15-Day Easy Returns</p>
              <p className="text-[11px] text-gray-400">Doorstep pickup available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-gray-700 shadow-md">
                <Image src="/images/logo.png" alt="Jhumka Junction Logo" fill sizes="40px" className="object-cover" />
              </div>
              <span className="text-xl font-black tracking-tight text-white font-sans">
                Jhumka<span className="text-rose-500">Junction</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              India's favorite oxidised and fashion jewellery destination for Gen Z. Handcrafted for college OOTDs, Navratri nights, date nights, and everyday glam.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <Link href="https://instagram.com" className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-rose-400 hover:bg-gray-700 transition-colors">
                <Instagram className="h-4 w-4" />
              </Link>
              <ReferralModal trigger={
                <button className="flex items-center gap-1 rounded-full bg-gray-800 px-3.5 py-1.5 text-xs font-bold text-amber-300 hover:bg-gray-700 transition-colors">
                  <Heart className="h-3 w-3 text-rose-500 fill-rose-500" /> Share with Besties
                </button>
              } />
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-white">Shop Categories</p>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link href="/category/rings" className="hover:text-white transition-colors">Statement Rings</Link></li>
              <li><Link href="/category/earrings" className="hover:text-white transition-colors">Oxidised Jhumkas &amp; Studs</Link></li>
              <li><Link href="/category/necklaces" className="hover:text-white transition-colors">Pendants &amp; Chokers</Link></li>
              <li><Link href="/category/anklets" className="hover:text-white transition-colors">Ghungroo Payal (Anklets)</Link></li>
              <li><Link href="/category/bracelets" className="hover:text-white transition-colors">Charm Bracelets</Link></li>
              <li><Link href="/category/combos" className="hover:text-white transition-colors">Festive Gift Boxes</Link></li>
            </ul>
          </div>

          {/* Quick Help */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-white">Customer Care</p>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><RingSizeGuideModal /></li>
              <li><Link href="/profile" className="hover:text-white transition-colors">Track My Order</Link></li>
              <li><Link href="/products" className="hover:text-white transition-colors">Quality Guarantee</Link></li>
              <li><Link href="/products" className="hover:text-white transition-colors">Jewellery Care Guide</Link></li>
              <li><Link href="/products" className="hover:text-white transition-colors">Shipping &amp; Returns</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-white">Join the Jhumka Club ✨</p>
            <p className="text-xs text-gray-400">Get 10% off your first jewellery piece and early access to secret drops.</p>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-800/80 pt-6 text-center text-xs text-gray-500 sm:flex-row sm:text-left">
          <p>© 2026 Jhumka Junction Jewellery Private Limited. Crafted with 💖 in India.</p>
          <p className="text-[11px] text-gray-500">Premium Handcrafted Jewellery • GST Compliant (CGST/SGST/IGST 3%)</p>
        </div>
      </div>
    </footer>
  );
}