'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loginUser, fetchCurrentUser } from '@/lib/api';
import { Flame, ArrowLeft, Lock, Mail, AlertCircle, Loader2, CheckCircle2, UserCheck, Shield } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingUser, setExistingUser] = useState<{ full_name: string; email: string; is_admin: boolean } | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('user_token') : null;
    if (token) {
      fetchCurrentUser(token)
        .then((user) => {
          setExistingUser(user);
        })
        .catch(() => {
          // Token is stale or invalid; purge it cleanly
          localStorage.removeItem('user_token');
          localStorage.removeItem('user_info');
          document.cookie = 'user_token=; path=/; max-age=0; SameSite=Lax';
        })
        .finally(() => {
          setCheckingExisting(false);
        });
    } else {
      setCheckingExisting(false);
    }
  }, []);

  const handleContinueExisting = () => {
    const target = redirectParam && redirectParam.startsWith('/') ? redirectParam : (existingUser?.is_admin ? '/admin' : '/');
    router.push(target);
  };

  const handleSwitchAccount = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_info');
    document.cookie = 'user_token=; path=/; max-age=0; SameSite=Lax';
    setExistingUser(null);
    window.dispatchEvent(new Event('storage'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginUser(email.trim(), password);
      // Save token and profile to localStorage and cookies for seamless session persistence
      localStorage.setItem('user_token', data.access_token);
      localStorage.setItem(
        'user_info',
        JSON.stringify({ name: data.user_name, email: data.email, is_admin: data.is_admin })
      );
      document.cookie = `user_token=${data.access_token}; path=/; max-age=604800; SameSite=Lax`;

      // Trigger storage event so Header and Cart immediately sync
      window.dispatchEvent(new Event('storage'));

      const destination =
        redirectParam && redirectParam.startsWith('/')
          ? redirectParam
          : data.is_admin
          ? '/admin'
          : '/';

      router.push(destination);
    } catch (err: any) {
      setError(err.message || 'Incorrect email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
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
          Welcome to <span className="text-orange-500">SliceCraft</span>
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          Sign in to access your artisanal orders &amp; bespoke pizza studio
        </p>
      </div>

      <div className="glass-panel border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        {checkingExisting ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <p className="text-xs tracking-wider uppercase">Checking Session...</p>
          </div>
        ) : existingUser ? (
          /* Already Signed In Card */
          <div className="space-y-6 text-center py-2">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <UserCheck className="w-8 h-8" />
            </div>

            <div>
              <p className="text-xs uppercase font-bold tracking-widest text-gray-400">Already Signed In</p>
              <h2 className="text-xl font-bold text-white mt-1">{existingUser.full_name}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{existingUser.email}</p>
              {existingUser.is_admin && (
                <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  <Shield className="w-3 h-3" /> Master Pizzaiolo Chef
                </span>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleContinueExisting}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-lg shadow-orange-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <span>Continue to {redirectParam ? 'Target Page' : 'Storefront'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <button
                onClick={handleSwitchAccount}
                className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                Sign In with Different Account
              </button>
            </div>
          </div>
        ) : (
          /* Login Form */
          <>
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-3 animate-in fade-in duration-200">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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
                    placeholder="you@domain.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#12131A] border border-white/10 focus:border-orange-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                    placeholder="••••••••"
                    autoComplete="current-password"
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
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In to Account</span>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials */}
            <div className="mt-6 pt-5 border-t border-white/5">
              <p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-2">
                Quick Demo Credentials:
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fillQuickCredentials('admin@slicecraft.com', 'admin123')}
                  className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-gray-300 hover:text-white transition-all text-left flex items-center gap-1.5"
                >
                  <Shield className="w-3 h-3 text-orange-400" />
                  <span>Chef Marco (Admin)</span>
                </button>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-gray-400">
              Don&apos;t have an account yet?{' '}
              <Link
                href={redirectParam ? `/register?redirect=${encodeURIComponent(redirectParam)}` : '/register'}
                className="text-orange-400 hover:text-orange-300 font-semibold underline underline-offset-4"
              >
                Create Account
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#08090C] text-white flex flex-col justify-between selection:bg-orange-500 p-4 md:p-8">
      {/* Navigation Bar Back link */}
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
          <LoginForm />
        </Suspense>
      </main>

      <footer className="text-center text-xs text-gray-600 py-4">
        © 2026 SliceCraft Artisans Inc. All rights reserved.
      </footer>
    </div>
  );
}
