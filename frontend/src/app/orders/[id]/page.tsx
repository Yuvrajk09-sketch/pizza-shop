'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { fetchOrderById } from '@/lib/api';
import { formatINR } from '@/lib/currency';
import { Order, OrderStatus } from '@/types/pizza';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import InvoiceTemplate from '@/components/InvoiceTemplate';
import {
  CheckCircle2, Clock, Flame, Bike,
  Sparkles, MapPin, ShieldCheck,
  Receipt, ArrowLeft, RefreshCw, Radio, FileText,
} from 'lucide-react';

const STEPS: { status: OrderStatus; label: string; desc: string; icon: any }[] = [
  {
    status: 'received',
    label: 'Order Confirmed',
    desc: 'Recipe transmitted to pizzaiolo chef',
    icon: CheckCircle2,
  },
  {
    status: 'baking',
    label: 'Fired in 900° Wood Oven',
    desc: 'Baking on volcanic Biscotto clay floor',
    icon: Flame,
  },
  {
    status: 'out_for_delivery',
    label: 'Courier Dispatched',
    desc: 'Thermal hot-bag locked on high-speed sprint',
    icon: Bike,
  },
  {
    status: 'delivered',
    label: 'Arrived at Doorstep',
    desc: 'Enjoy piping hot artisan craftsmanship!',
    icon: Sparkles,
  },
];

export default function OrderTrackerPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastPingTime, setLastPingTime] = useState<string>('Just now');
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    let isMounted = true;
    fetchOrderById(orderId)
      .then((data) => { if (isMounted) { setOrder(data); setLoading(false); } })
      .catch(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;
    const wsUrl = `ws://127.0.0.1:8000/api/ws/orders/${orderId}`;
    let socket: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

    function connect() {
      try {
        socket = new WebSocket(wsUrl);
        socket.onopen = () => setWsConnected(true);
        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.event === 'status_changed' && data.data) {
              setOrder(data.data);
              setLastPingTime(new Date().toLocaleTimeString('en-IN'));
            }
          } catch {}
        };
        socket.onclose = () => {
          setWsConnected(false);
          reconnectTimeout = setTimeout(connect, 3000);
        };
        socket.onerror = () => socket?.close();
      } catch {}
    }

    connect();
    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      socket?.close();
    };
  }, [orderId]);

  const getStepIndex = (status: OrderStatus) => {
    const map: Record<OrderStatus, number> = {
      received: 0, baking: 1, out_for_delivery: 2, delivered: 3, cancelled: 0,
    };
    return map[status] ?? 0;
  };

  const currentStepIdx = order ? getStepIndex(order.status) : 0;
  const isDelivered = order?.status === 'delivered';

  return (
    <div className="min-h-screen bg-[#08090C] text-white flex flex-col selection:bg-orange-500">
      <Navbar />
      <CartDrawer />
      <CheckoutModal />

      {/* Invoice Overlay */}
      {showInvoice && order && (
        <InvoiceTemplate order={order} onClose={() => setShowInvoice(false)} />
      )}

      <main className="flex-1 pt-32 pb-24 px-4 md:px-8 max-w-5xl mx-auto w-full">
        {/* Navigation Breadcrumb */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/#menu"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Menu
          </Link>

          <div className="flex items-center gap-3">
            {/* Invoice Button — shown always but glows when delivered */}
            {order && (
              <button
                onClick={() => setShowInvoice(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  isDelivered
                    ? 'bg-orange-600/20 border-orange-500/50 text-orange-400 hover:bg-orange-600/30 shadow-lg shadow-orange-500/10'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                {isDelivered ? 'Download Invoice' : 'View Invoice'}
              </button>
            )}

            {/* WebSocket Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs">
              <Radio className={`w-3.5 h-3.5 ${wsConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
              <span className="text-gray-300 hidden sm:inline">
                {wsConnected ? 'Live Stream' : 'Sync Mode'}
              </span>
            </div>
          </div>
        </div>

        {/* ===== DELIVERED HERO BANNER ===== */}
        {isDelivered && order && (
          <div className="mb-8 rounded-3xl overflow-hidden relative"
            style={{ background: 'linear-gradient(135deg, #0F2D1A 0%, #1A3D22 50%, #0A2015 100%)', border: '1px solid rgba(34,197,94,0.25)' }}>
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,rgba(34,197,94,0.4),transparent_60%)]" />
            <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-3xl">
                🍕
              </div>
              <div className="flex-1 text-center sm:text-left">
                <p style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  className="text-2xl sm:text-3xl font-semibold text-emerald-400 leading-tight">
                  Delivered. Buon Appetito!
                </p>
                <p className="text-sm text-emerald-300/70 mt-1">
                  Your artisan pizza has arrived piping hot. We hope you enjoy every bite.
                </p>
              </div>
              <button
                onClick={() => setShowInvoice(true)}
                className="flex items-center gap-2.5 px-6 py-3 rounded-2xl font-semibold text-sm shrink-0 transition-all"
                style={{ background: 'linear-gradient(135deg, #FF5B26, #D97706)', color: '#fff', boxShadow: '0 8px 24px rgba(255,91,38,0.35)' }}
              >
                <FileText className="w-4 h-4" />
                Open Tax Invoice
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="glass-panel rounded-3xl p-16 text-center">
            <RefreshCw className="w-8 h-8 text-orange-400 animate-spin mx-auto mb-4" />
            <p className="text-base font-bold text-gray-300">Connecting to Oven Sensors...</p>
          </div>
        ) : !order ? (
          <div className="glass-panel rounded-3xl p-16 text-center">
            <p className="text-lg font-bold text-white mb-2">Order Not Found</p>
            <p className="text-xs text-gray-400 mb-6">We couldn&apos;t locate order reference {orderId}.</p>
            <Link href="/" className="px-6 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs">
              Return Home
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Order Header HUD */}
            <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span style={{ fontFamily: "'Cormorant Garamond', serif" }}
                      className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                      Order #{order.id}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${
                      isDelivered
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                    }`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Placed for <span className="text-white font-medium">{order.customer_name}</span>
                    {' '}•{' '}
                    Est. Arrival: <span className="text-orange-400 font-bold">{order.estimated_delivery_time || '25–35 mins'}</span>
                  </p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-gray-400">Last Telemetry Ping</p>
                  <p className="text-xs font-mono font-bold text-white">{lastPingTime}</p>
                </div>
              </div>

              {/* 4-Stage Progression Stepper */}
              <div className="relative mb-8">
                <div className="absolute top-[22px] left-0 right-0 h-0.5 bg-white/10 hidden md:block" />
                <div
                  className="absolute top-[22px] left-0 h-0.5 bg-gradient-to-r from-orange-600 to-amber-500 transition-all duration-700 hidden md:block"
                  style={{ width: `${(currentStepIdx / (STEPS.length - 1)) * 100}%` }}
                />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
                  {STEPS.map((step, idx) => {
                    const isPassed = idx < currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    const Icon = step.icon;
                    return (
                      <div
                        key={step.status}
                        className={`flex md:flex-col items-center md:items-center gap-4 md:gap-3 text-left md:text-center p-4 rounded-2xl transition-all ${
                          isCurrent ? 'glass-panel border-orange-500/50 shadow-lg shadow-orange-500/10' : ''
                        }`}
                      >
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                          isPassed
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : isCurrent
                            ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/40 radar-pulse'
                            : 'bg-white/5 text-gray-500 border border-white/10'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className={`text-sm font-black ${isCurrent ? 'text-orange-400' : isPassed ? 'text-white' : 'text-gray-500'}`}>
                            {step.label}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5 max-w-[160px]">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Courier HUD */}
              <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/10">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
                    <Bike className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Courier Partner: Luigi Ferrari</p>
                    <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-red-400" />
                      {order.delivery_address}, {order.delivery_city}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                    Live Speed: 18 mph
                  </span>
                </div>
              </div>
            </div>

            {/* Order Items & Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pizza Manifest */}
              <div className="md:col-span-2 glass-panel rounded-3xl p-6">
                <h3 className="flex items-center gap-2 mb-5">
                  <Receipt className="w-4 h-4 text-orange-400" />
                  <span style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    className="text-lg font-semibold text-white">
                    Pizza Manifest
                  </span>
                  <span className="text-xs text-gray-500 ml-1">({order.items.length} items)</span>
                </h3>
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-start justify-between gap-4 hover:bg-white/[0.07] transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white leading-tight">
                          {item.quantity}× {item.pizza_name}
                        </p>
                        <p className="text-[11px] text-gray-400 capitalize mt-1">
                          {item.size} · {item.crust_type.replace('_', ' ')} crust · {item.sauce_type.replace('_', ' ')}
                        </p>
                        {item.selected_toppings.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.selected_toppings.map((t, ti) => (
                              <span key={ti} className="text-[10px] px-1.5 py-0.5 rounded-md bg-orange-500/10 text-orange-300 border border-orange-500/20">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-white">{formatINR(item.total_price)}</p>
                        {item.quantity > 1 && (
                          <p className="text-[10px] text-gray-500 mt-0.5">{formatINR(item.unit_price)} each</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Billing Summary */}
              <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between">
                <div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    className="text-lg font-semibold text-white mb-5">
                    Billing Summary
                  </h3>
                  <div className="space-y-3 text-xs">
                    {[
                      { label: 'Subtotal', val: order.subtotal },
                      { label: 'GST / Tax (8.875%)', val: order.tax },
                      { label: 'Express Courier', val: order.delivery_fee },
                    ].map(({ label, val }) => (
                      <div key={label} className="flex justify-between text-gray-400">
                        <span>{label}</span>
                        <span className="text-white font-medium">{formatINR(val)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-baseline pt-4 border-t border-white/10">
                      <span className="text-sm font-black text-white">Total Paid</span>
                      <span style={{ fontFamily: "'Cormorant Garamond', serif" }}
                        className="text-2xl font-bold text-orange-400">
                        {formatINR(order.total_amount)}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 text-right">@ ₹84.50 / USD</p>
                  </div>
                </div>

                <div className="space-y-3 pt-5 border-t border-white/10 mt-4">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Paid via {order.payment_method.toUpperCase()}</span>
                  </div>

                  <button
                    onClick={() => setShowInvoice(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all border border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    {isDelivered ? 'Download Tax Invoice' : 'Preview Invoice'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
