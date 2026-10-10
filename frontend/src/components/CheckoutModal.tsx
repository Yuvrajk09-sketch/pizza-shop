'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { submitOrder } from '@/lib/api';
import { formatINR } from '@/lib/currency';
import confetti from 'canvas-confetti';
import { 
  X, Check, Lock, CreditCard, Banknote, 
  MapPin, Phone, User, Mail, AlertCircle, Loader2 
} from 'lucide-react';

export default function CheckoutModal() {
  const router = useRouter();
  const {
    items,
    isCheckoutOpen,
    setCheckoutOpen,
    setDrawerOpen,
    clearCart,
    getSubtotal,
    getTax,
    getDeliveryFee,
    getTotal,
    hasSoldOutItems,
  } = useCartStore();

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    delivery_address: '',
    delivery_city: 'Manhattan, New York',
    delivery_notes: '',
    payment_method: 'card',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isCheckoutOpen) return null;

  const total = getTotal();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.customer_email || !formData.customer_phone || !formData.delivery_address) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (hasSoldOutItems()) {
      setErrorMsg('Cannot place order: One or more items or ingredients in your bag are currently sold out. Please return to your cart and remove sold-out items.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const orderPayload = {
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        delivery_address: formData.delivery_address,
        delivery_city: formData.delivery_city,
        delivery_notes: formData.delivery_notes || undefined,
        payment_method: formData.payment_method,
        items: items.map((item) => ({
          pizza_id: item.pizza_id || null,
          pizza_name: item.pizza_name,
          size: item.size,
          crust_type: item.crust_type,
          sauce_type: item.sauce_type,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          selected_toppings: item.selected_toppings,
        })),
      };

      const result = await submitOrder(orderPayload);

      // Save order ID to localStorage for the customer dashboard
      const existingOrders = JSON.parse(localStorage.getItem('slicecraft_orders') || '[]');
      existingOrders.unshift(result.id);
      localStorage.setItem('slicecraft_orders', JSON.stringify(existingOrders));

      // Fire celebratory confetti!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF5B26', '#F59E0B', '#10B981', '#FFFFFF'],
      });

      clearCart();
      setCheckoutOpen(false);

      // Navigate to order tracking page
      router.push(`/orders/${result.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong while placing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={() => !isSubmitting && setCheckoutOpen(false)}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl glass-panel-elevated rounded-3xl p-6 sm:p-8 shadow-2xl z-10 border border-white/10 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Artisan Checkout</h3>
              <p className="text-xs text-gray-400">Encrypted • Fast Express Dispatch</p>
            </div>
          </div>

          <button
            disabled={isSubmitting}
            onClick={() => setCheckoutOpen(false)}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg ? (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
            {errorMsg.toLowerCase().includes('sold out') && (
              <button
                type="button"
                onClick={() => {
                  setCheckoutOpen(false);
                  setDrawerOpen(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-200 text-[10px] font-bold hover:bg-red-500/30 transition-all shrink-0"
              >
                Edit Bag
              </button>
            )}
          </div>
        ) : hasSoldOutItems() ? (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>One or more items in your bag are sold out.</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setCheckoutOpen(false);
                setDrawerOpen(true);
              }}
              className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-200 text-[10px] font-bold hover:bg-rose-500/30 transition-all shrink-0"
            >
              Edit Bag
            </button>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
                <input
                  type="text"
                  name="customer_name"
                  required
                  placeholder="Marco Rossi"
                  value={formData.customer_name}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Phone Number *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
                <input
                  type="tel"
                  name="customer_phone"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={formData.customer_phone}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Email (For Live Receipt) *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
              <input
                type="email"
                name="customer_email"
                required
                pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
                title="Please enter a valid email address (e.g., example@domain.com)"
                placeholder="marco@example.com"
                value={formData.customer_email}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Delivery Address *</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
              <input
                type="text"
                name="delivery_address"
                required
                placeholder="742 Evergreen Terrace, Apt 4B"
                value={formData.delivery_address}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          {/* Delivery Instructions */}
          <div>
            <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Courier Instructions</label>
            <textarea
              name="delivery_notes"
              rows={2}
              placeholder="Leave with doorman, ring buzzer 4B..."
              value={formData.delivery_notes}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-orange-500 transition-colors resize-none"
            />
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, payment_method: 'card' })}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                  formData.payment_method === 'card'
                    ? 'bg-orange-500/20 border-orange-500 text-white shadow-md'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4 text-orange-400" />
                <div>
                  <p className="text-xs font-bold">Credit / Debit Card</p>
                  <p className="text-[10px] text-gray-400">Instant Online Charge</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, payment_method: 'cash' })}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                  formData.payment_method === 'cash'
                    ? 'bg-orange-500/20 border-orange-500 text-white shadow-md'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                <Banknote className="w-4 h-4 text-orange-400" />
                <div>
                  <p className="text-xs font-bold">Cash on Delivery</p>
                  <p className="text-[10px] text-gray-400">Pay to Courier</p>
                </div>
              </button>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-gray-400 block display-label" style={{ letterSpacing: '0.18em' }}>Total Due</span>
              <span style={{ fontFamily: "'Cormorant Garamond', serif" }}
                className="text-3xl font-bold text-white">
                {formatINR(total)}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || hasSoldOutItems()}
              className={`px-8 py-3.5 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${
                hasSoldOutItems()
                  ? 'bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed opacity-75'
                  : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-xl shadow-orange-600/30 disabled:opacity-50'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Placing Order...
                </>
              ) : hasSoldOutItems() ? (
                <>
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  Items in Bag Sold Out
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Confirm &amp; Bake ({formatINR(total)})
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
