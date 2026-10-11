'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  loginAdmin, verifyAdminToken, fetchAdminOrders, updateOrderStatus,
  fetchAdminAnalytics, togglePizzaStock, toggleToppingStock,
  FALLBACK_PIZZAS, FALLBACK_TOPPINGS, fetchMenu
} from '@/lib/api';
import { Order, OrderStatus, Pizza, Topping, AnalyticsSummary } from '@/types/pizza';
import { formatINR } from '@/lib/currency';
import {
  ShieldCheck, Lock, LogOut, Flame, Clock,
  DollarSign, ShoppingBag, AlertTriangle, CheckCircle2,
  Radio, ArrowRight, RefreshCw, Layers, ToggleLeft, ToggleRight, Sparkles,
  Search, TrendingUp, Users, Package, Filter, Eye, X, ChevronDown,
  BarChart3, PieChart, Activity, Bell, Settings, Star, Zap, ArrowUpRight,
  Calendar, ChevronRight, Hash, MapPin, Phone, Mail, Receipt,
} from 'lucide-react';

const KANBAN_COLUMNS: { status: OrderStatus; title: string; color: string; bg: string; dot: string }[] = [
  { status: 'received',         title: 'New Orders',    color: 'text-blue-400',    bg: 'border-blue-500/30',    dot: 'bg-blue-400' },
  { status: 'baking',           title: 'In Oven (900)', color: 'text-orange-400',  bg: 'border-orange-500/30',  dot: 'bg-orange-400' },
  { status: 'out_for_delivery', title: 'With Courier',  color: 'text-amber-400',   bg: 'border-amber-500/30',   dot: 'bg-amber-400' },
  { status: 'delivered',        title: 'Delivered',     color: 'text-emerald-400', bg: 'border-emerald-500/30', dot: 'bg-emerald-400' },
];

const STATUS_NEXT: Record<string, string> = {
  received: 'baking',
  baking: 'out_for_delivery',
  out_for_delivery: 'delivered',
};

const STATUS_LABEL: Record<string, string> = {
  received: 'Move to Oven',
  baking: 'Dispatch Courier',
  out_for_delivery: 'Mark Delivered',
};

function StatCard({ label, value, sub, icon: Icon, color }: { label: string; value: string | number; sub?: string; icon: any; color: string }) {
  return (
    <div className="glass-panel rounded-2xl p-5 flex items-center justify-between group hover:border-white/15 transition-all">
      <div>
        <p className="text-[11px] uppercase font-bold tracking-wider text-gray-400">{label}</p>
        <p className="text-2xl font-black text-white mt-1">{value}</p>
        {sub && <p className="text-[11px] text-gray-500 mt-0.5">{sub}</p>}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}

function MiniBarChart({ data, color = '#f97316' }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1 h-12">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm transition-all duration-500"
          style={{
            height: `${(v / max) * 100}%`,
            backgroundColor: color,
            opacity: i === data.length - 1 ? 1 : 0.35 + (i / data.length) * 0.55,
          }}
        />
      ))}
    </div>
  );
}

function OrderDetailModal({ order, onClose, onAdvance }: { order: Order; onClose: () => void; onAdvance: (id: string, status: OrderStatus) => void }) {
  const canAdvance = order.status !== 'delivered' && order.status !== 'cancelled';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg glass-panel-elevated rounded-3xl p-6 border border-white/15 shadow-2xl animate-fadeInUp"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs text-gray-400 font-mono">{order.id}</p>
            <h3 className="text-xl font-black text-white">{order.customer_name}</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <p className="text-[10px] text-gray-500 uppercase font-bold">Email</p>
            <p className="text-xs text-white mt-1 truncate">{order.customer_email}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <p className="text-[10px] text-gray-500 uppercase font-bold">Phone</p>
            <p className="text-xs text-white mt-1">{order.customer_phone}</p>
          </div>
          <div className="col-span-2 p-3 rounded-xl bg-white/5 border border-white/5">
            <p className="text-[10px] text-gray-500 uppercase font-bold">Delivery</p>
            <p className="text-xs text-white mt-1">{order.delivery_address}, {order.delivery_city}</p>
          </div>
        </div>
        <div className="space-y-2 mb-5 max-h-40 overflow-y-auto">
          {order.items.map((it, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <div>
                <p className="text-xs font-bold text-white">{it.quantity}x {it.pizza_name}</p>
                <p className="text-[10px] text-gray-400 capitalize">{it.size} · {it.crust_type.replace('_', ' ')}</p>
              </div>
              <p className="text-xs font-bold text-orange-400">{formatINR(it.total_price)}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 mb-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-gray-300">Total</span>
          </div>
          <span className="text-xl font-black text-orange-400">{formatINR(order.total_amount)}</span>
        </div>
        {canAdvance && (
          <button
            onClick={() => { onAdvance(order.id, order.status as OrderStatus); onClose(); }}
            className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-600/25"
          >
            {STATUS_LABEL[order.status] || 'Advance Status'}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [token, setToken] = useState<string | null>(null);
  const [adminName, setAdminName] = useState<string>('Chef Marco');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (typeof window === 'undefined') return;

      // Purge any legacy unverified tokens stored in permanent localStorage
      // so visiting /admin will properly prompt for login
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminName');

      const sessionToken = sessionStorage.getItem('adminToken');
      const sessionName = sessionStorage.getItem('adminName');

      if (!sessionToken) {
        setToken(null);
        setIsCheckingAuth(false);
        return;
      }

      try {
        const user = await verifyAdminToken(sessionToken);
        setToken(sessionToken);
        setAdminName(user.full_name || sessionName || 'Chef Marco');
      } catch (err) {
        console.warn('Admin session token invalid or expired:', err);
        sessionStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminName');
        setToken(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  const [email, setEmail] = useState('admin@slicecraft.com');
  const [password, setPassword] = useState('admin123');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'kanban' | 'analytics' | 'inventory'>('kanban');
  const [orders, setOrders] = useState<Order[]>([]);
  const [pizzas, setPizzas] = useState<Pizza[]>(FALLBACK_PIZZAS);
  const [toppings, setToppings] = useState<Topping[]>(FALLBACK_TOPPINGS);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [notifications, setNotifications] = useState<string[]>([]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const res = await loginAdmin(email, password);
      setToken(res.access_token);
      setAdminName(res.user_name || 'Chef Marco');
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('adminToken', res.access_token);
        sessionStorage.setItem('adminName', res.user_name || 'Chef Marco');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminName');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Check credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('adminToken');
      sessionStorage.removeItem('adminName');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminName');
    }
  };

  const loadData = async () => {
    if (!token) return;
    setLoadingData(true);
    try {
      const [ordersRes, analyticsRes, menuRes] = await Promise.allSettled([
        fetchAdminOrders(token),
        fetchAdminAnalytics(token),
        fetchMenu(),
      ]);

      const orderUnauthorized = ordersRes.status === 'rejected' && ordersRes.reason?.message?.includes('401');
      const analyticsUnauthorized = analyticsRes.status === 'rejected' && analyticsRes.reason?.message?.includes('401');

      if (orderUnauthorized || analyticsUnauthorized) {
        handleLogout();
        setLoginError('Your admin session has expired. Please authenticate to continue.');
        return;
      }

      if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value);
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value);
      if (menuRes.status === 'fulfilled') {
        setPizzas(menuRes.value.pizzas);
        setToppings(menuRes.value.toppings);
      }
    } catch (err: any) {
      console.warn('Error loading admin data:', err);
      if (err?.message?.includes('401')) {
        handleLogout();
        setLoginError('Your admin session has expired. Please authenticate to continue.');
      }
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => { if (token) loadData(); }, [token]);

  useEffect(() => {
    if (!token) return;
    let socket: WebSocket | null = null;
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const wsBase = apiBase.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');
      socket = new WebSocket(`${wsBase}/ws/admin`);
      socket.onopen = () => setWsConnected(true);
      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.event === 'new_order' && msg.order) {
            setOrders(prev => [msg.order, ...prev.filter((o: Order) => o.id !== msg.order.id)]);
            setNotifications(prev => [`New order: ${msg.order.id}`, ...prev.slice(0, 4)]);
          } else if (msg.event === 'status_changed' && msg.data) {
            setOrders(prev => prev.map((o: Order) => o.id === msg.data.id ? msg.data : o));
          } else if (msg.event === 'menu_updated') {
            loadData();
          }
        } catch {}
      };
      socket.onclose = () => setWsConnected(false);
    } catch {}
    return () => { socket?.close(); };
  }, [token]);

  const advanceOrderStatus = async (orderId: string, currentStatus: OrderStatus) => {
    if (!token) return;
    const next = STATUS_NEXT[currentStatus] as OrderStatus;
    if (!next) return;
    try {
      const updated = await updateOrderStatus(orderId, next, token);
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
    } catch (err: any) {
      console.error('Failed to update status:', err);
      if (err?.message?.includes('401')) {
        handleLogout();
        setLoginError('Session expired. Please log in again.');
      }
    }
  };

  const handleToggleTopping = async (id: number) => {
    setToppings(prev => prev.map(t => t.id === id ? { ...t, is_available: !t.is_available } : t));
    if (token) {
      try {
        await toggleToppingStock(id, token);
      } catch (err: any) {
        if (err?.message?.includes('401')) {
          handleLogout();
          setLoginError('Session expired. Please log in again.');
        }
      }
    }
  };

  const handleTogglePizza = async (id: number) => {
    setPizzas(prev => prev.map(p => p.id === id ? { ...p, is_available: !p.is_available } : p));
    if (token) {
      try {
        await togglePizzaStock(id, token);
      } catch (err: any) {
        if (err?.message?.includes('401')) {
          handleLogout();
          setLoginError('Session expired. Please log in again.');
        }
      }
    }
  };

  const totalRevenue = useMemo(() => orders.filter(o => o.status === 'delivered').reduce((acc, o) => acc + o.total_amount, 0), [orders]);
  const activeOrdersCount = useMemo(() => orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled' && (o.status as any) !== 'pending_payment').length, [orders]);
  const deliveredCount = useMemo(() => orders.filter(o => o.status === 'delivered').length, [orders]);
  const avgOrderValue = useMemo(() => deliveredCount > 0 ? totalRevenue / deliveredCount : 0, [totalRevenue, deliveredCount]);

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (statusFilter !== 'all') result = result.filter(o => o.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_email.toLowerCase().includes(q)
      );
    }
    return result;
  }, [orders, statusFilter, searchQuery]);

  const revenueByDay = useMemo(() => {
    const days = Array(7).fill(0);
    const now = Date.now();
    orders.filter(o => o.status === 'delivered').forEach(o => {
      const age = (now - new Date(o.created_at).getTime()) / (1000 * 60 * 60 * 24);
      const dayIdx = Math.min(Math.floor(age), 6);
      days[6 - dayIdx] += o.total_amount;
    });
    return days;
  }, [orders]);

  const ordersByStatus = useMemo(() => ({
    received: orders.filter(o => o.status === 'received').length,
    baking: orders.filter(o => o.status === 'baking').length,
    out_for_delivery: orders.filter(o => o.status === 'out_for_delivery').length,
    delivered: deliveredCount,
  }), [orders, deliveredCount]);

  // ─── Auth Verification Loading ───────────────────────────────────────────
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#08090C] text-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center animate-pulse">
            <Flame className="w-7 h-7 text-orange-400" />
          </div>
          <p className="text-xs text-gray-400 tracking-wider font-semibold uppercase animate-pulse">
            Verifying Chef Credentials...
          </p>
        </div>
      </div>
    );
  }

  // ─── Login Gate ───────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div className="min-h-screen bg-[#08090C] text-white flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-amber-500/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="w-full max-w-md relative">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-500 to-red-500 flex items-center justify-center shadow-2xl shadow-orange-500/30">
                <Flame className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <p className="text-xl font-black text-white tracking-wider">SLICECRAFT</p>
                <p className="text-[10px] text-orange-400 uppercase tracking-widest font-bold">Admin Command Center</p>
              </div>
            </div>
          </div>
          <div className="glass-panel-elevated rounded-3xl p-8 border border-white/10 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-black text-white">Chef&apos;s Portal</h1>
                <p className="text-[11px] text-gray-400">Authenticate with Master Pizzaiolo JWT</p>
              </div>
            </div>
            {loginError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {loginError}
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">Admin Email</label>
                <input
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-orange-500 transition-all placeholder:text-gray-600"
                  placeholder="admin@slicecraft.com"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">Password</label>
                <input
                  type="password" required value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-orange-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div
                onClick={() => { setEmail('admin@slicecraft.com'); setPassword('admin123'); }}
                className="p-3 rounded-xl bg-orange-500/5 hover:bg-orange-500/10 border border-orange-500/15 text-[11px] text-gray-400 space-y-1 cursor-pointer transition-colors"
                title="Click to fill demo credentials"
              >
                <p className="text-orange-400 font-bold flex items-center gap-1.5"><Zap className="w-3 h-3" /> Demo Credentials (Click to fill)</p>
                <p>Email: <span className="text-white font-mono">admin@slicecraft.com</span></p>
                <p>Password: <span className="text-white font-mono">admin123</span></p>
              </div>
              <button
                type="submit" disabled={loginLoading}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-xl shadow-orange-600/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
              >
                {loginLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                {loginLoading ? 'Authenticating...' : 'Access Command Center'}
              </button>
            </form>
            <div className="mt-5 pt-5 border-t border-white/8 text-center">
              <Link href="/" className="text-xs text-gray-500 hover:text-white flex items-center justify-center gap-1.5 transition-colors">
                <ArrowRight className="w-3.5 h-3.5 rotate-180" /> Return to Customer Storefront
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Authenticated Dashboard ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#08090C] text-white flex flex-col selection:bg-orange-500">
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onAdvance={advanceOrderStatus}
        />
      )}

      {/* Header */}
      <header className="border-b border-white/10 bg-[#0E1015]/90 backdrop-blur-md sticky top-0 z-30 px-4 md:px-6 py-3.5">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm tracking-wider">SLICECRAFT</span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 uppercase tracking-wider">Admin</span>
              </div>
              <p className="text-[11px] text-gray-400">Welcome back, <span className="text-white font-semibold">{adminName}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors relative">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-black flex items-center justify-center">
                  {notifications.length}
                </span>
              </button>
            )}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs">
              <Radio className={`w-3 h-3 ${wsConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
              <span className="text-gray-400">{wsConnected ? 'Live' : 'Syncing'}</span>
            </div>
            <button onClick={loadData} disabled={loadingData} className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors" title="Refresh">
              <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
            </button>
            <Link href="/" className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 text-xs font-semibold hover:bg-white/10 transition-colors text-gray-300">
              Storefront <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button onClick={handleLogout} className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 flex-1 w-full space-y-6">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Revenue" value={formatINR(totalRevenue)} sub="From delivered orders" icon={DollarSign} color="bg-emerald-500/10 text-emerald-400" />
          <StatCard label="Orders Total" value={orders.length} sub="All statuses" icon={ShoppingBag} color="bg-blue-500/10 text-blue-400" />
          <StatCard label="Active in Kitchen" value={activeOrdersCount} sub="Needs attention" icon={Flame} color="bg-orange-500/10 text-orange-400" />
          <StatCard label="Avg Order Value" value={formatINR(avgOrderValue)} sub="Per delivered order" icon={TrendingUp} color="bg-purple-500/10 text-purple-400" />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { key: 'kanban',    icon: Layers,    label: 'Live Kitchen Kanban' },
            { key: 'analytics', icon: BarChart3, label: 'Analytics & Reports' },
            { key: 'inventory', icon: Package,   label: 'Menu & Stock' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                  : 'glass-panel text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB: Kanban */}
        {activeTab === 'kanban' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by order ID, name, or email..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-500 transition-all placeholder:text-gray-600"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-500 transition-all"
                >
                  <option value="all">All Statuses</option>
                  <option value="received">New Orders</option>
                  <option value="baking">In Oven</option>
                  <option value="out_for_delivery">With Courier</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
            </div>

            {(searchQuery || statusFilter !== 'all') ? (
              <div className="glass-panel rounded-3xl p-4 space-y-3">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">
                  {filteredOrders.length} result{filteredOrders.length !== 1 ? 's' : ''}
                </p>
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-12 text-gray-600 text-xs">No orders match your search</div>
                ) : (
                  filteredOrders.map(ord => {
                    const col = KANBAN_COLUMNS.find(c => c.status === ord.status);
                    return (
                      <div
                        key={ord.id}
                        className="p-4 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-between gap-4 hover:border-white/20 transition-all cursor-pointer"
                        onClick={() => setSelectedOrder(ord)}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${col?.dot || 'bg-gray-500'}`} />
                          <div>
                            <p className="text-xs font-bold text-white">{ord.customer_name}</p>
                            <p className="text-[10px] text-gray-500 font-mono">{ord.id}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 border border-white/10 ${col?.color}`}>
                            {ord.status.replace('_', ' ')}
                          </span>
                          <span className="text-xs font-black text-orange-400">{formatINR(ord.total_amount)}</span>
                          <Eye className="w-3.5 h-3.5 text-gray-600" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {KANBAN_COLUMNS.map(col => {
                  const columnOrders = orders.filter(o => o.status === col.status);
                  return (
                    <div key={col.status} className={`glass-panel rounded-3xl p-4 flex flex-col border ${col.bg} min-h-[500px] max-h-[680px]`}>
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                          <span className={`text-xs font-black uppercase tracking-wider ${col.color}`}>{col.title}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-white/5 text-gray-400 text-xs font-mono font-bold">{columnOrders.length}</span>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-3 pr-0.5">
                        {columnOrders.length === 0 ? (
                          <div className="text-center py-10 text-gray-600 text-xs">
                            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-2">
                              <Clock className="w-4 h-4 text-gray-700" />
                            </div>
                            No orders here
                          </div>
                        ) : (
                          columnOrders.map(ord => (
                            <div
                              key={ord.id}
                              className="glass-panel-elevated p-4 rounded-2xl flex flex-col gap-3 border border-white/10 hover:border-white/25 transition-all cursor-pointer"
                              onClick={() => setSelectedOrder(ord)}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-black text-[10px] text-gray-400">{ord.id}</span>
                                <span className="text-xs font-black text-orange-400">{formatINR(ord.total_amount)}</span>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white">{ord.customer_name}</p>
                                <p className="text-[10px] text-gray-500 truncate flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3 h-3" /> {ord.delivery_address}
                                </p>
                              </div>
                              <div className="space-y-1 py-2 border-t border-b border-white/5">
                                {ord.items.slice(0, 2).map((it, idx) => (
                                  <p key={idx} className="text-[10px] text-gray-400 truncate">
                                    - {it.quantity}x {it.pizza_name} ({it.size})
                                  </p>
                                ))}
                                {ord.items.length > 2 && (
                                  <p className="text-[10px] text-gray-600">+{ord.items.length - 2} more</p>
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-gray-500">
                                  {new Date(ord.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {col.status !== 'delivered' && (
                                  <button
                                    onClick={e => { e.stopPropagation(); advanceOrderStatus(ord.id, ord.status as OrderStatus); }}
                                    className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-white/5 hover:bg-orange-600 border border-white/10 hover:border-orange-500 text-white transition-all flex items-center gap-1"
                                  >
                                    {STATUS_LABEL[ord.status]} <ArrowRight className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 glass-panel rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white">Revenue — Last 7 Days</h3>
                    <p className="text-xs text-gray-400 mt-0.5">From delivered orders only</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400">{formatINR(totalRevenue)}</span>
                  </div>
                </div>
                <MiniBarChart data={revenueByDay} color="#f97316" />
                <div className="flex justify-between text-[10px] text-gray-600 mt-2">
                  {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <span key={d}>{d}</span>)}
                </div>
              </div>
              <div className="glass-panel rounded-3xl p-6">
                <h3 className="text-base font-bold text-white mb-4">Orders by Status</h3>
                <div className="space-y-3">
                  {[
                    { label: 'New Orders',   count: ordersByStatus.received,        color: 'bg-blue-500' },
                    { label: 'In Oven',       count: ordersByStatus.baking,          color: 'bg-orange-500' },
                    { label: 'With Courier', count: ordersByStatus.out_for_delivery, color: 'bg-amber-500' },
                    { label: 'Delivered',    count: ordersByStatus.delivered,        color: 'bg-emerald-500' },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-400">{item.label}</span>
                        <span className="text-white font-bold">{item.count}</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all duration-700`}
                          style={{ width: orders.length > 0 ? `${(item.count / orders.length) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Completion Rate', value: orders.length > 0 ? `${((deliveredCount / orders.length) * 100).toFixed(0)}%` : '0%', icon: CheckCircle2, color: 'text-emerald-400' },
                { label: 'Total Orders',    value: orders.length,                 icon: Hash,          color: 'text-blue-400' },
                { label: 'Low Stock Items', value: toppings.filter(t => !t.is_available).length, icon: AlertTriangle, color: 'text-amber-400' },
                { label: 'Avg Order Value', value: formatINR(avgOrderValue), icon: DollarSign,   color: 'text-purple-400' },
              ].map(item => (
                <div key={item.label} className="glass-panel rounded-2xl p-5 text-center">
                  <item.icon className={`w-6 h-6 mx-auto mb-2 ${item.color}`} />
                  <p className="text-2xl font-black text-white">{item.value}</p>
                  <p className="text-[10px] text-gray-500 uppercase font-bold mt-1">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="glass-panel rounded-3xl p-6">
              <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                Top Performing Pizzas
              </h3>
              <div className="space-y-3">
                {pizzas.slice(0, 5).map((pizza, idx) => {
                  const orderCount = orders.filter(o => o.items.some(it => it.pizza_name === pizza.name)).length;
                  const maxOrders = Math.max(...pizzas.map(p => orders.filter(o => o.items.some(it => it.pizza_name === p.name)).length), 1);
                  return (
                    <div key={pizza.id} className="flex items-center gap-4">
                      <span className="w-6 text-center text-xs font-black text-gray-600">#{idx + 1}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-white font-semibold truncate">{pizza.name}</span>
                          <span className="text-gray-400 ml-2">{orderCount} orders</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-600 to-amber-500 rounded-full transition-all duration-700"
                            style={{ width: `${(orderCount / maxOrders) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-orange-400 font-bold">{formatINR(pizza.price_medium)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-6">
              <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                Recent Orders Log
              </h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {orders.slice(0, 15).map(ord => {
                  const col = KANBAN_COLUMNS.find(c => c.status === ord.status);
                  return (
                    <div
                      key={ord.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/15 transition-all cursor-pointer"
                      onClick={() => setSelectedOrder(ord)}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${col?.dot || 'bg-gray-500'}`} />
                        <div>
                          <p className="text-xs font-bold text-white">{ord.customer_name}</p>
                          <p className="text-[10px] text-gray-500 font-mono">{ord.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold capitalize px-2 py-0.5 rounded-md bg-white/5 border border-white/10 ${col?.color}`}>
                          {ord.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-black text-white">{formatINR(ord.total_amount)}</span>
                      </div>
                    </div>
                  );
                })}
                {orders.length === 0 && <div className="text-center py-10 text-gray-600 text-xs">No orders yet</div>}
              </div>
            </div>
          </div>
        )}

        {/* TAB: Inventory */}
        {activeTab === 'inventory' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel rounded-3xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-bold text-white">Artisan Toppings</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">{toppings.filter(t => t.is_available).length}/{toppings.length} available</p>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-400">
                  {toppings.filter(t => !t.is_available).length} out of stock
                </div>
              </div>
              <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
                {['meat', 'cheese', 'veggie', 'garnish'].map(category => {
                  const catToppings = toppings.filter(t => t.category === category);
                  if (catToppings.length === 0) return null;
                  return (
                    <div key={category}>
                      <p className="text-[10px] font-black uppercase tracking-wider text-gray-600 mb-1.5 mt-4 first:mt-0">{category}</p>
                      {catToppings.map(top => (
                        <div
                          key={top.id}
                          className={`p-3 rounded-xl border flex items-center justify-between mb-1.5 transition-all ${
                            top.is_available ? 'bg-white/4 border-white/5' : 'bg-red-500/5 border-red-500/15'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: top.color_hex }} />
                            <div>
                              <p className={`text-xs font-bold ${top.is_available ? 'text-white' : 'text-gray-500'}`}>{top.name}</p>
                              <p className="text-[10px] text-gray-500">+{formatINR(top.price)} · Stock: {top.stock_count}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleTopping(top.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                              top.is_available
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/25 hover:bg-rose-500/25'
                            }`}
                          >
                            {top.is_available ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                            {top.is_available ? 'In Stock' : 'Out'}
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-bold text-white">Signature Pizza Menu</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">{pizzas.filter(p => p.is_available).length}/{pizzas.length} available</p>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-400">
                  {pizzas.filter(p => !p.is_available).length} sold out
                </div>
              </div>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {pizzas.map(p => (
                  <div
                    key={p.id}
                    className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                      p.is_available ? 'bg-white/4 border-white/5' : 'bg-red-500/5 border-red-500/15'
                    }`}
                  >
                    {p.image_url && (
                      <img src={p.image_url} alt={p.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${p.is_available ? 'text-white' : 'text-gray-500'}`}>{p.name}</p>
                      <p className="text-[10px] text-gray-500">{p.category} · S {formatINR(p.price_small)} / M {formatINR(p.price_medium)} / L {formatINR(p.price_large)}</p>
                    </div>
                    <button
                      onClick={() => handleTogglePizza(p.id)}
                      className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                        p.is_available
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/25 hover:bg-rose-500/25'
                      }`}
                    >
                      {p.is_available ? 'Available' : 'Sold Out'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      <footer className="border-t border-white/8 px-6 py-4 text-center text-xs text-gray-600">
        SliceCraft Admin Command Center · {new Date().getFullYear()} · <span className="text-orange-500">Authenticated</span>
      </footer>
    </div>
  );
}
