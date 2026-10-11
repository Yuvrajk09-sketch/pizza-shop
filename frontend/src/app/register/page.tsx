'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { registerUser, fetchCurrentUser } from '@/lib/api';
import { Flame, ArrowLeft, Lock, Mail, User, AlertCircle, Loader2 } from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('user_token') : null;
    if (token) {
      // Validate that the token is active before auto-redirecting
      fetchCurrentUser(token)
        .then(() => {
          const dest = redirectParam && redirectParam.startsWith('/') ? redirectParam : '/';
          router.replace(dest);
        })
        .catch(() => {
          // Token is stale; clear it so user can register smoothly
          localStorage.removeItem('user_token');
          localStorage.removeItem('user_info');
          document.cookie = 'user_token=; path=/; max-age=0; SameSite=Lax';
        });
    }
  }, [router, redirectParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await registerUser(email.trim(), password, name.trim());
      // Save session credentials
      localStorage.setItem('user_token', data.access_token);
      localStorage.setItem(
        'user_info',
        JSON.stringify({ name: data.user_name, email: data.email, is_admin: false })
      );
      document.cookie = `user_token=${data.access_token}; path=/; max-age=604800; SameSite=Lax`;

      // Trigger storage event so Header and Cart immediately sync
      window.dispatchEvent(new Event('storage'));

      const dest = redirectParam && redirectParam.startsWith('/') ? redirectParam : '/';
      router.push(dest);
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 group mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform duration-300">
            <Flame className="w-6 h-6 text-white" />
          </div>
        </Link>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Join <span className="text-orange-500">SliceCraft</span>
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          Create an artisan account for live Neapolitan delivery tracking &amp; rewards
        </p>
      </div>

      <div className="glass-panel border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-3 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#12131A] border border-white/10 focus:border-orange-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                placeholder="Mario Rossi"
                autoComplete="name"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#12131A] border border-white/10 focus:border-orange-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                placeholder="mario@example.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#12131A] border border-white/10 focus:border-orange-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-lg shadow-orange-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Already have an account?{' '}
          <Link
            href={redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : '/login'}
            className="text-orange-400 hover:text-orange-300 font-semibold underline underline-offset-4"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#08090C] text-white flex flex-col justify-between selection:bg-orange-500 p-4 md:p-8">
      <header className="max-w-7xl mx-auto w-full pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to SliceCraft Hearth</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center py-10">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          }
        >
          <RegisterForm />
        </Suspense>
      </main>

      <footer className="text-center text-xs text-gray-600 py-4">
        © 2026 SliceCraft Artisans Inc. All rights reserved.
      </footer>
    </div>
  );
}
