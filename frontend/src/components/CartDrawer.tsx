'use client';

import React from 'react';
import { useCartStore } from '@/store/useCartStore';
import { formatINR } from '@/lib/currency';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles, IndianRupee, AlertCircle } from 'lucide-react';

export default function CartDrawer() {
  const {
    items, isDrawerOpen, setDrawerOpen, setCheckoutOpen,
    updateQuantity, removeFromCart, clearCart,
    getSubtotal, getTax, getDeliveryFee, getTotal,
    isCartItemSoldOut, hasSoldOutItems,
  } = useCartStore();

  if (!isDrawerOpen) return null;

  const subtotal     = getSubtotal();
  const tax          = getTax();
  const deliveryFee  = getDeliveryFee();
  const total        = getTotal();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setDrawerOpen(false)}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />

      <div className="fixed inset-y-0 right-0 flex pl-10 max-w-full">
        <div className="w-screen max-w-[400px] glass-panel-elevated shadow-2xl flex flex-col border-l border-white/10">

          {/* ── Header ── */}
          <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  className="text-xl font-semibold text-white leading-tight">Your Tasting Bag</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">{items.length} item{items.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="w-8 h-8 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── Items ── */}
          {hasSoldOutItems() && items.length > 0 && (
            <div className="mx-5 mt-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>Some items in your bag are sold out. Please remove them to proceed.</span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mx-auto mb-4 text-4xl">
                  🍕
                </div>
                <p className="text-sm font-bold text-gray-300 mb-1">Your bag is empty</p>
                <p className="text-xs text-gray-500 max-w-[200px] mx-auto mb-6 leading-relaxed">
                  Build a 3D custom pizza or pick from our signature Neapolitan collection.
                </p>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white transition-all"
                >
                  Explore Menu
                </button>
              </div>
            ) : (
              items.map((item) => {
                const { soldOut, reason } = isCartItemSoldOut(item);
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl transition-all space-y-3 border ${
                      soldOut
                        ? 'bg-rose-950/20 border-rose-500/30'
                        : 'bg-white/[0.04] border-white/[0.06] hover:border-white/[0.12]'
                    }`}
                  >
                    {/* Name row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`font-bold text-sm leading-tight ${soldOut ? 'text-gray-300' : 'text-white'}`}>
                            {item.pizza_name}
                          </span>
                          {item.is_custom && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/25 flex items-center gap-0.5 shrink-0">
                              <Sparkles className="w-2 h-2" /> 3D Custom
                            </span>
                          )}
                          {soldOut && (
                            <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                              Sold Out
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 capitalize mt-0.5">
                          {item.size} · {item.crust_type.replace('_', ' ')} crust
                        </p>
                        {soldOut && (
                          <p className="text-[11px] text-rose-400 font-medium mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 shrink-0" /> {reason}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                          soldOut
                            ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                            : 'text-gray-600 hover:text-red-400'
                        }`}
                        title="Remove from bag"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Toppings */}
                    {item.selected_toppings.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.selected_toppings.map((t, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-md bg-orange-500/8 text-orange-300/80 border border-orange-500/15">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Qty + price */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                      <div className="flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5 border border-white/8">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-black text-white px-2">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          disabled={soldOut}
                          className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                            soldOut ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-right">
                        <span style={{ fontFamily: "'Cormorant Garamond', serif" }}
                          className={`text-base font-bold ${soldOut ? 'text-gray-400 line-through' : 'text-white'}`}>
                          {formatINR(item.total_price)}
                        </span>
                        {item.quantity > 1 && (
                          <p className="text-[10px] text-gray-500">{formatINR(item.unit_price)} each</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ── Footer ── */}
          {items.length > 0 && (
            <div className="px-5 pb-6 pt-4 border-t border-white/10 bg-[#0C0D11]/80 space-y-4">
              {/* Totals */}
              <div className="space-y-2 text-xs">
                {[
                  { label: 'Subtotal',       val: subtotal },
                  { label: 'GST / Tax',      val: tax },
                  { label: 'Express Courier', val: deliveryFee },
                ].map(({ label, val }) => (
                  <div key={label} className="flex justify-between text-gray-400">
                    <span>{label}</span>
                    <span className="text-gray-200 font-medium">{formatINR(val)}</span>
                  </div>
                ))}

                <div className="flex justify-between items-baseline pt-2.5 border-t border-white/10">
                  <span className="text-sm font-black text-white">Total</span>
                  <div className="text-right">
                    <span style={{ fontFamily: "'Cormorant Garamond', serif" }}
                      className="text-2xl font-bold text-orange-400">
                      {formatINR(total)}
                    </span>
                    <p className="text-[10px] text-gray-500">incl. GST &amp; delivery</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={clearCart}
                  className="w-11 h-11 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors"
                  title="Clear cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (!hasSoldOutItems()) {
                      setDrawerOpen(false);
                      setCheckoutOpen(true);
                    }
                  }}
                  disabled={hasSoldOutItems()}
                  className={`flex-1 py-3.5 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 group ${
                    hasSoldOutItems()
                      ? 'bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed opacity-75'
                      : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-xl shadow-orange-600/25'
                  }`}
                >
                  {hasSoldOutItems() ? (
                    'Remove Sold Out Items to Checkout'
                  ) : (
                    <>
                      <IndianRupee className="w-4 h-4" />
                      Checkout
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
