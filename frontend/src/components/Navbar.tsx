'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Flame, ShoppingBag, ShieldCheck, Compass, Sparkles, User, LogOut } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

export default function Navbar() {
  const router = useRouter();
  const { setDrawerOpen, getItemCount, clearCart } = useCartStore();
  const itemCount = getItemCount();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const updateAuth = () => {
      try {
        const raw = localStorage.getItem('user_info');
        if (raw) {
          const parsed = JSON.parse(raw);
          setUserName(parsed.name || parsed.email || 'Member');
        } else {
          setUserName(null);
        }
      } catch {
        setUserName(null);
      }
    };

    updateAuth();
    window.addEventListener('storage', updateAuth);
    return () => window.removeEventListener('storage', updateAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_info');
    document.cookie = 'user_token=; path=/; max-age=0; SameSite=Lax';
    clearCart();
    setUserName(null);
    router.replace('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 md:px-8 py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto glass-panel rounded-2xl px-5 py-3 flex items-center justify-between shadow-2xl">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform duration-300">
            <Flame className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-wider text-xl text-white">SLICE<span className="text-orange-500">CRAFT</span></span>
              <span className="text-[10px] uppercase tracking-widest font-semibold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">Artisan</span>
            </div>
            <p className="text-[11px] text-gray-400 hidden sm:block tracking-wide">Wood-Fired Neapolitan & 3D Studio</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <Link href="/#menu" className="hover:text-orange-400 transition-colors flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-orange-400/80" />
            Menu
          </Link>
          <Link href="/#configurator" className="hover:text-orange-400 transition-colors flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-orange-400/80" />
            3D Studio
          </Link>
          <Link href="/dashboard" className="hover:text-orange-400 transition-colors flex items-center gap-1.5">
            <User className="w-4 h-4 text-orange-400/80" />
            Dashboard
          </Link>
          <Link href="/admin" className="hover:text-orange-400 transition-colors flex items-center gap-1 text-gray-400">
            <ShieldCheck className="w-4 h-4 text-gray-500" />
            Admin
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Link 
            href="/#configurator"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-lg shadow-orange-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Build 3D Pizza
          </Link>

          {/* Cart Button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="relative p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all flex items-center gap-2 group"
            aria-label="Open Cart"
          >
            <ShoppingBag className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold hidden sm:inline">Cart</span>
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-orange-500 text-white text-[11px] font-black flex items-center justify-center shadow-lg shadow-orange-500/50 animate-bounce">
                {itemCount}
              </span>
            )}
          </button>

          {/* User Status / Logout */}
          {userName ? (
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <Link 
                href="/dashboard"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-gray-300 hover:text-white transition-colors"
                title="Account Profile"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="max-w-[100px] truncate">{userName}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-gray-400 hover:text-red-400 transition-colors"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
