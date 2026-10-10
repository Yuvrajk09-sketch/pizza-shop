'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { fetchOrderById } from '@/lib/api';
import { Order } from '@/types/pizza';
import { 
  User, Package, MapPin, History, ChevronRight, 
  Flame, Clock, CheckCircle2, ArrowRight, Pizza, Edit3 
} from 'lucide-react';
import { formatINR } from '@/lib/currency';

export default function CustomerDashboard() {
  const [savedOrders, setSavedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, we'd fetch orders for the logged-in user.
    // For this demo, we'll try to find any recently tracked orders in localStorage,
    // or provide some realistic looking placeholder data if empty, to show off the UI.
    const loadOrders = async () => {
      setLoading(true);
      try {
        const localIds = JSON.parse(localStorage.getItem('slicecraft_orders') || '[]');
        if (localIds.length > 0) {
          const promises = localIds.map((id: string) => fetchOrderById(id).catch(() => null));
          const results = await Promise.all(promises);
          setSavedOrders(results.filter(Boolean) as Order[]);
        } else {
          setSavedOrders([]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const activeOrders = savedOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
  const pastOrders = savedOrders.filter(o => o.status === 'delivered' || o.status === 'cancelled');

  return (
    <div className="min-h-screen bg-[#08090C] text-white selection:bg-orange-500 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 px-4 md:px-8 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 p-1">
              <div className="w-full h-full rounded-full bg-[#08090C] flex items-center justify-center border-2 border-transparent">
                <User className="w-8 h-8 text-orange-400" />
              </div>
            </div>
            <div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-4xl font-bold text-white mb-1">
                Welcome back, <span className="text-orange-400 italic">Gastronome</span>
              </h1>
              <p className="text-gray-400 text-sm">Manage your artisan pizza orders and preferences.</p>
            </div>
          </div>
          <Link href="/#menu" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-600/20 transition-all">
            <Pizza className="w-4 h-4" />
            Order New Pizza
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: User Details & Stats */}
          <div className="space-y-6">
            <div className="glass-panel rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Profile Details</h2>
                <button className="text-orange-400 hover:text-orange-300 transition-colors">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Name</p>
                  <p className="text-sm text-gray-200">Demo User</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Email</p>
                  <p className="text-sm text-gray-200">demo@slicecraft.com</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Default Delivery Address</p>
                  <p className="text-sm text-gray-200 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                    742 Evergreen Terrace<br />New York, NY 10012
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-bl-[100px] transition-transform group-hover:scale-110" />
              <h2 className="text-lg font-bold text-white mb-2 relative z-10">SliceCraft Rewards</h2>
              <p className="text-3xl font-black text-orange-400 mb-1 relative z-10">450 <span className="text-sm font-normal text-gray-400">pts</span></p>
              <p className="text-xs text-gray-400 relative z-10 mb-4">50 points away from a free Margherita!</p>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden relative z-10">
                <div className="h-full bg-gradient-to-r from-orange-600 to-amber-500 w-[90%]" />
              </div>
            </div>
          </div>

          {/* Right Column: Orders */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Active Orders Section */}
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-white mb-4">
                <Flame className="w-5 h-5 text-orange-400" /> Active Orders
              </h2>
              {loading ? (
                <div className="glass-panel rounded-3xl p-10 text-center">
                  <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-400">Loading orders...</p>
                </div>
              ) : activeOrders.length > 0 ? (
                <div className="space-y-4">
                  {activeOrders.map(order => (
                    <Link href={`/orders/${order.id}`} key={order.id} className="block group">
                      <div className="glass-panel-elevated rounded-2xl p-5 border border-orange-500/30 hover:border-orange-500 transition-all shadow-lg shadow-orange-500/10">
                        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-black text-white">Order #{order.id}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                {order.status.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400">Placed today at {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-sm font-bold text-emerald-400">{formatINR(order.total_amount)}</p>
                            <p className="text-[10px] text-gray-500">{order.items.length} item(s)</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                          <p className="text-xs text-gray-300 truncate max-w-[70%]">
                            {order.items.map(i => i.pizza_name).join(', ')}
                          </p>
                          <div className="flex items-center gap-1 text-xs font-bold text-orange-400 group-hover:translate-x-1 transition-transform">
                            Track Order <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="glass-panel rounded-3xl p-10 text-center border border-white/5 flex flex-col items-center">
                  <Package className="w-10 h-10 text-gray-600 mb-3" />
                  <p className="text-gray-400 text-sm mb-4">You have no active orders in the kitchen.</p>
                  <Link href="/#menu" className="text-orange-400 hover:text-orange-300 text-sm font-bold transition-colors">Start an order →</Link>
                </div>
              )}
            </div>

            {/* Order History Section */}
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-white mb-4">
                <History className="w-5 h-5 text-gray-400" /> Order History
              </h2>
              {loading ? null : pastOrders.length > 0 ? (
                <div className="glass-panel rounded-3xl overflow-hidden">
                  {pastOrders.map((order, idx) => (
                    <div key={order.id} className={`p-5 flex flex-col sm:flex-row justify-between gap-4 ${idx !== pastOrders.length - 1 ? 'border-b border-white/10' : ''} hover:bg-white/[0.02] transition-colors`}>
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          {order.status === 'delivered' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Clock className="w-5 h-5 text-gray-500" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white mb-0.5">Order #{order.id}</p>
                          <p className="text-xs text-gray-400 mb-2">{new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          <p className="text-xs text-gray-300 line-clamp-1">{order.items.map(i => i.pizza_name).join(', ')}</p>
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0">
                        <p className="text-sm font-bold text-white">{formatINR(order.total_amount)}</p>
                        <Link href={`/orders/${order.id}`} className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors">
                          View Receipt <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-panel rounded-3xl p-8 text-center border border-white/5">
                  <p className="text-gray-500 text-sm">Your order history is empty.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0A0B0F] py-8 text-center mt-auto">
        <p className="text-xs text-gray-500">© {new Date().getFullYear()} SliceCraft Artisans Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
