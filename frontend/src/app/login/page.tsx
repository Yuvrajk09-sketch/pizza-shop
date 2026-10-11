'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '@/lib/api';


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem('user_token');
    if (token) {
      router.replace('/');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginUser(email, password);
      // Save token to localStorage and cookie for remembering user session
      localStorage.setItem('user_token', data.access_token);
      localStorage.setItem('user_info', JSON.stringify({ name: data.user_name, email: data.email }));
      document.cookie = `user_token=${data.access_token}; path=/; max-age=604800; SameSite=Lax`;
      
      // Redirect to home storefront
      router.replace('/');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 font-sans selection:bg-orange-500/30 flex flex-col">


      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-neutral-800/50 backdrop-blur-md border border-neutral-700/50 p-8 rounded-2xl shadow-xl">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-neutral-400 mb-8">Sign in to your account to continue</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-neutral-400 text-sm">
            Don't have an account?{' '}
            <Link href="/register" className="text-orange-500 hover:text-orange-400 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
