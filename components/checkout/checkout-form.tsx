// Location: components/checkout/checkout-form.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CreditCard,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Tag,
  Gift,
  QrCode,
  Copy,
  Check,
  Banknote,
  Sparkles,
} from 'lucide-react';
import { formatCurrency, INDIAN_STATES } from '@/lib/utils';
import { createCheckout } from '@/server/actions/checkout';

interface CheckoutFormProps {
  cart: {
    items: Array<{
      id: string;
      quantity: number;
      product: {
        id: string;
        name: string;
        price: number;
        images: Array<{ url: string }>;
      };
    }>;
    total: number;
    itemCount: number;
  };
  shippingMethods: Array<{
    id: string;
    name: string;
    price: number;
    estimatedDays: string;
  }>;
  userEmail?: string;
  isLoggedIn?: boolean;
  savedAddress?: {
    shippingName: string;
    shippingAddress: string;
    shippingCity: string;
    shippingState?: string | null;
    shippingZip: string;
    customerEmail: string;
    customerPhone?: string | null;
  } | null;
}

export function CheckoutForm({
  cart,
  shippingMethods,
  userEmail,
  isLoggedIn,
  savedAddress,
}: CheckoutFormProps) {
  const router = useRouter();
  const [addressMode, setAddressMode] = useState<'saved' | 'form'>(
    isLoggedIn && savedAddress ? 'saved' : 'form'
  );
  const [email, setEmail] = useState(userEmail ?? '');
  const [firstName, setFirstName] = useState(
    savedAddress?.shippingName?.split(' ')[0] ?? ''
  );
  const [lastName, setLastName] = useState(
    savedAddress?.shippingName?.split(' ').slice(1).join(' ') ?? ''
  );
  const [address, setAddress] = useState(savedAddress?.shippingAddress ?? '');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState(savedAddress?.shippingCity ?? 'Ahmedabad');
  const [state, setState] = useState(savedAddress?.shippingState ?? 'Gujarat');
  const [pincode, setPincode] = useState(savedAddress?.shippingZip ?? '');
  const [phone, setPhone] = useState(savedAddress?.customerPhone ?? '');
  const [shippingMethod, setShippingMethod] = useState(
    shippingMethods[0]?.id ?? 'standard'
  );
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'COD'>('UPI');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    message: string;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const UPI_ID = 'sonih4495@ybl';
  const PAYEE_NAME = 'Jhumka Junction';

  const subtotal = cart.total;
  const discount = appliedCoupon?.discountAmount ?? 0;
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const shippingCost = 0; // Always free — we don't charge for shipping 🎉
  const codFee = paymentMethod === 'COD' && discountedSubtotal < 1999 ? 49 : 0;
  const finalTotal = discountedSubtotal + shippingCost + codFee;

  // Clean standard UPI URI (universal intent for Android/iOS)
  const upiIntentUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${finalTotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Jewellery Order')}`;
  const gpayUrl = `gpay://upi/pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${finalTotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Jewellery Order')}`;
  const phonepeUrl = `phonepe://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${finalTotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Jewellery Order')}`;
  const paytmUrl = `paytmmp://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${finalTotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Jewellery Order')}`;
  
  // High-resolution scannable QR code
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiIntentUrl)}&margin=1`;

  const [showQrOnMobile, setShowQrOnMobile] = useState(false);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError(null);

    try {
      const res = await fetch('/api/coupon/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput, cartTotal: subtotal }),
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        setCouponError(data.message || 'Invalid coupon code');
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon({
          code: data.code,
          discountAmount: data.discountAmount,
          message: data.message,
        });
      }
    } catch {
      setCouponError('Failed to apply coupon. Try again.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handlePlaceOrder = async () => {
    setError(null);

    if (cart.items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    const info =
      addressMode === 'saved' && savedAddress
        ? {
            email: savedAddress.customerEmail,
            firstName: savedAddress.shippingName.split(' ')[0] ?? '',
            lastName: savedAddress.shippingName.split(' ').slice(1).join(' ') || 'Customer',
            phone: savedAddress.customerPhone || '9876543210',
            line1: savedAddress.shippingAddress,
            landmark,
            city: savedAddress.shippingCity,
            state: savedAddress.shippingState ?? 'Gujarat',
            postalCode: savedAddress.shippingZip,
            country: 'IN',
          }
        : {
            email,
            firstName,
            lastName: lastName || 'Customer',
            phone,
            line1: address,
            landmark,
            city,
            state,
            postalCode: pincode,
            country: 'IN',
          };

    if (!info.email || !info.firstName || !info.line1 || !info.city || !info.state || !info.postalCode) {
      setError('Please fill in all required shipping address fields.');
      return;
    }

    if (!/^[1-9][0-9]{5}$/.test(info.postalCode)) {
      setError('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    if (!info.phone || info.phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number for delivery updates.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.set(
        'items',
        JSON.stringify(
          cart.items.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          }))
        )
      );
      formData.set(
        'shippingAddress',
        JSON.stringify({
          line1: info.line1,
          landmark: info.landmark,
          city: info.city,
          state: info.state,
          postalCode: info.postalCode,
          country: 'IN',
        })
      );
      formData.set(
        'customerInfo',
        JSON.stringify({
          email: info.email,
          firstName: info.firstName,
          lastName: info.lastName,
          phone: info.phone,
        })
      );
      formData.set('shippingMethod', shippingMethod);
      formData.set('paymentMethod', paymentMethod);
      if (utrNumber.trim()) {
        formData.set('notes', `UPI Payment UTR / Ref No: ${utrNumber.trim()}`);
      }
      if (appliedCoupon) {
        formData.set('couponCode', appliedCoupon.code);
      }

      const result = await createCheckout(formData);

      if (!result.success) {
        setError(result.error || 'Checkout failed. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Notify cart listeners and redirect to success page
      window.dispatchEvent(new Event('cart-updated'));
      router.push(result.redirectUrl || `/checkout/success?orderNumber=${result.orderNumber}&method=${paymentMethod.toLowerCase()}`);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong while placing your order.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* Left Column: Shipping & Payment */}
      <div className="space-y-6 lg:col-span-7">
        {/* Contact & Shipping Address Card */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-4">
            <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Truck className="h-4 w-4 text-rose-600" />
              Delivery Address (India)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {isLoggedIn && savedAddress && (
              <div className="flex gap-2 rounded-xl bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => setAddressMode('saved')}
                  className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                    addressMode === 'saved' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  Use Saved Address
                </button>
                <button
                  type="button"
                  onClick={() => setAddressMode('form')}
                  className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                    addressMode === 'form' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  Enter New Address
                </button>
              </div>
            )}

            {addressMode === 'saved' && savedAddress ? (
              <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 text-xs space-y-1">
                <p className="font-bold text-gray-900">{savedAddress.shippingName}</p>
                <p className="text-gray-600">{savedAddress.shippingAddress}</p>
                <p className="text-gray-600">
                  {savedAddress.shippingCity}, {savedAddress.shippingState} - {savedAddress.shippingZip}
                </p>
                <p className="text-gray-600">📞 {savedAddress.customerPhone || 'Phone not set'}</p>
                <p className="text-gray-500">✉️ {savedAddress.customerEmail}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">First Name *</Label>
                    <Input
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      placeholder="Ananya"
                      className="text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Last Name *</Label>
                    <Input
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      placeholder="Deshmukh"
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Email (for Order updates) *</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="ananya@gmail.com"
                      className="text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">WhatsApp / Mobile Number *</Label>
                    <div className="flex">
                      <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-xs text-muted-foreground">
                        +91
                      </span>
                      <Input
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="9820098200"
                        className="rounded-l-none text-xs"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Flat / House No., Building, Street *</Label>
                  <Input
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="B-402, Shanti Kunj Apartments, MG Road"
                    className="text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Landmark (Optional)</Label>
                    <Input
                      value={landmark}
                      onChange={e => setLandmark(e.target.value)}
                      placeholder="Near City Mall"
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">City *</Label>
                    <Input
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="Ahmedabad"
                      className="text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">PIN Code *</Label>
                    <Input
                      maxLength={6}
                      value={pincode}
                      onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
                      placeholder="380001"
                      className="text-xs font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">State *</Label>
                  <select
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                  >
                    {INDIAN_STATES.map(st => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shipping Method Card */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-4">
            <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Truck className="h-4 w-4 text-rose-600" />
              Shipping Speed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {shippingMethods.map(method => {
              const isSelected = shippingMethod === method.id;

              return (
                <label
                  key={method.id}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                    isSelected
                      ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      value={method.id}
                      checked={isSelected}
                      onChange={() => setShippingMethod(method.id)}
                      className="h-4 w-4 text-gray-900"
                    />
                    <div>
                      <p className="text-xs font-bold text-gray-900">{method.name}</p>
                      <p className="text-[11px] text-gray-500">
                        Estimated delivery: {method.estimatedDays}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">
                    FREE 🎁
                  </span>
                </label>
              );
            })}
          </CardContent>
        </Card>

        {/* Payment Method Card */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-4">
            <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-rose-600" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {/* Option 1: Direct UPI / QR Code (ACTIVE) */}
            <label
              className={`flex cursor-pointer flex-col rounded-xl border p-4 transition-all ${
                paymentMethod === 'UPI'
                  ? 'border-gray-900 bg-amber-50/30 ring-1 ring-gray-900'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="UPI"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                    className="h-4 w-4 text-gray-900"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <QrCode className="h-4 w-4 text-rose-600" />
                      <p className="text-sm font-bold text-gray-900">Instant UPI &amp; QR Code Payment</p>
                      <Badge className="bg-emerald-100 text-emerald-800 text-[10px] hover:bg-emerald-100 border-0">
                        Zero Fee
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Pay directly via GPay, PhonePe, Paytm, BHIM, CRED
                    </p>
                  </div>
                </div>
              </div>

              {/* Expanded UPI Box */}
              {paymentMethod === 'UPI' && (
                <div className="mt-4 pt-4 border-t border-amber-200/60 bg-white rounded-2xl p-5 shadow-sm space-y-5">
                  {/* Mobile Direct UPI App Launchers (NO QR SCAN NEEDED ON MOBILE) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                        Pay Directly via UPI App:
                      </span>
                      <span className="text-[11px] font-extrabold text-rose-600">
                        {formatCurrency(finalTotal)}
                      </span>
                    </div>

                    {/* Primary Universal Intent Button */}
                    <a
                      href={upiIntentUrl}
                      className="flex items-center justify-center gap-2 w-full rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 py-3.5 text-sm font-bold text-white shadow-md hover:opacity-95 transition-all active:scale-[0.98]"
                    >
                      <Sparkles className="h-4 w-4" />
                      Open Installed UPI App to Pay ({formatCurrency(finalTotal)})
                    </a>

                    {/* Specific App Quick Launchers */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <a
                        href={phonepeUrl}
                        className="flex flex-col items-center justify-center rounded-xl border border-purple-200 bg-purple-50/60 py-2.5 px-2 hover:bg-purple-100 transition-colors text-center"
                      >
                        <span className="text-xs font-bold text-purple-900">PhonePe</span>
                        <span className="text-[10px] text-purple-600">Direct Pay</span>
                      </a>
                      <a
                        href={gpayUrl}
                        className="flex flex-col items-center justify-center rounded-xl border border-blue-200 bg-blue-50/60 py-2.5 px-2 hover:bg-blue-100 transition-colors text-center"
                      >
                        <span className="text-xs font-bold text-blue-900">Google Pay</span>
                        <span className="text-[10px] text-blue-600">Direct Pay</span>
                      </a>
                      <a
                        href={paytmUrl}
                        className="flex flex-col items-center justify-center rounded-xl border border-sky-200 bg-sky-50/60 py-2.5 px-2 hover:bg-sky-100 transition-colors text-center"
                      >
                        <span className="text-xs font-bold text-sky-900">Paytm</span>
                        <span className="text-[10px] text-sky-600">Direct Pay</span>
                      </a>
                    </div>
                  </div>

                  <Separator />

                  {/* QR Code & Manual Pay Section */}
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* QR Code Container (Always visible on desktop, toggleable or visible on mobile) */}
                    <div className="flex flex-col items-center shrink-0 w-full sm:w-auto">
                      <div className="relative h-44 w-44 overflow-hidden rounded-2xl border-2 border-gray-100 p-2 bg-white shadow-md">
                        <Image
                          src={qrCodeUrl}
                          alt={`Scan UPI QR Code to pay ${formatCurrency(finalTotal)}`}
                          fill
                          className="object-contain p-1"
                          unoptimized
                        />
                      </div>
                      <span className="text-[11px] text-gray-600 font-bold mt-2 text-center">
                        Scan QR with any device to pay {formatCurrency(finalTotal)}
                      </span>
                    </div>

                    {/* Manual UPI ID & UTR Details */}
                    <div className="flex-1 space-y-3.5 w-full text-left">
                      <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-gray-700 block">
                          Or Pay Manually to UPI ID:
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="rounded-xl bg-gray-100 px-3.5 py-2 font-mono text-sm font-bold text-gray-900 border border-gray-200 select-all">
                            {UPI_ID}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCopyUpi}
                            className="h-9 text-xs font-semibold gap-1.5 hover:bg-gray-50 rounded-xl"
                          >
                            {copiedUpi ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5 text-gray-600" /> Copy ID
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-1 pt-1">
                        <Label className="text-[11px] font-semibold text-gray-700">
                          Transaction UTR / Ref No. (Optional):
                        </Label>
                        <Input
                          value={utrNumber}
                          onChange={e => setUtrNumber(e.target.value)}
                          placeholder="e.g. 425618291048"
                          className="text-xs font-mono h-9 rounded-xl"
                        />
                        <p className="text-[10px] text-gray-400">
                          Enter 12-digit UTR after payment to speed up order confirmation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </label>

            {/* Option 2: Cash on Delivery (ACTIVE) */}
            <label
              className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                paymentMethod === 'COD'
                  ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="h-4 w-4 text-gray-900"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-emerald-600" />
                    <p className="text-sm font-bold text-gray-900">Cash on Delivery (COD)</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Pay via cash or UPI at your doorstep {discountedSubtotal < 1999 ? '(+₹49 handling fee)' : '(Free for orders above ₹1,999)'}
                  </p>
                </div>
              </div>
            </label>

            {/* Option 3: Credit/Debit Cards (TEMPORARILY DISABLED) */}
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/75 p-4 opacity-60 cursor-not-allowed">
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-500">Credit / Debit Cards &amp; Netbanking</p>
                    <Badge variant="outline" className="text-[10px] text-gray-400 border-gray-300">
                      Temporarily Unavailable
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Please use UPI / QR or Cash on Delivery for instant orders
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Order Summary & Coupon */}
      <div className="space-y-6 lg:col-span-5">
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-4">
            <CardTitle className="text-base font-bold text-gray-900">
              Order Summary ({cart.itemCount} items)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {/* Items list */}
            <div className="max-h-60 divide-y divide-gray-100 overflow-y-auto pr-1">
              {cart.items.map(item => (
                <div key={item.id} className="flex items-center gap-3 py-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-50 border border-gray-100">
                    {item.product.images[0] ? (
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <Sparkles className="m-auto h-6 w-6 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-bold text-gray-900">{item.product.name}</p>
                    <p className="text-[11px] text-gray-500">
                      Qty: {item.quantity} × {formatCurrency(item.product.price)}
                    </p>
                  </div>
                  <p className="text-xs font-extrabold text-gray-900">
                    {formatCurrency(item.product.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <Separator />

            {/* Coupon Box */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <Tag className="h-3.5 w-3.5 text-rose-600" />
                Have a Promo / Referral Code?
              </Label>
              <div className="flex gap-2">
                <Input
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="e.g. DRIP10 or BESTIE20"
                  className="uppercase font-mono text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleApplyCoupon}
                  disabled={isApplyingCoupon || !couponInput.trim()}
                  className="text-xs font-bold"
                >
                  {isApplyingCoupon ? 'Applying...' : 'Apply'}
                </Button>
              </div>
              {appliedCoupon && (
                <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-2 text-xs text-emerald-800 border border-emerald-200">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    {appliedCoupon.message}
                  </span>
                  <button
                    onClick={() => setAppliedCoupon(null)}
                    className="text-[10px] text-rose-600 hover:underline font-bold"
                  >
                    Remove
                  </button>
                </div>
              )}
              {couponError && <p className="text-xs text-rose-600">{couponError}</p>}
            </div>

            <Separator />

            {/* Calculation details */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Bag Subtotal</span>
                <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-rose-600 font-bold">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>- {formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping 🚚</span>
                <span className="text-emerald-600 font-bold">Nope, it's on us! 😄</span>
              </div>
              {codFee > 0 && (
                <div className="flex justify-between text-amber-800 font-semibold">
                  <span>COD Handling Fee</span>
                  <span>{formatCurrency(codFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>GST / Tax</span>
                <span className="text-emerald-600 font-semibold">₹0 (Zero Extra Tax)</span>
              </div>

              <Separator />

              <div className="flex justify-between text-base font-bold text-gray-900 pt-1">
                <span>Total Payable</span>
                <span className="text-lg font-black text-rose-600">{formatCurrency(finalTotal)}</span>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              className="w-full rounded-2xl bg-gray-900 hover:bg-black py-6 text-sm font-bold text-white shadow-md transition-all border-0"
              onClick={handlePlaceOrder}
              disabled={isSubmitting || cart.items.length === 0}
            >
              {isSubmitting ? (
                'Placing Order...'
              ) : paymentMethod === 'COD' ? (
                `Confirm Cash on Delivery (${formatCurrency(finalTotal)})`
              ) : (
                `Confirm UPI Order (${formatCurrency(finalTotal)}) ✨`
              )}
            </Button>

            <div className="flex items-center justify-center gap-4 pt-2 text-[11px] text-gray-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Premium Quality Guaranteed
              </span>
              <span className="flex items-center gap-1">
                <Truck className="h-3.5 w-3.5 text-rose-600" /> Insured India Delivery
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}