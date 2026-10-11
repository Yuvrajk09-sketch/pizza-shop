'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';

export default function SessionWatcher() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isPublic = pathname === '/login' || pathname === '/register' || pathname?.startsWith('/admin');

    const checkToken = () => {
      const currentToken = localStorage.getItem('user_token');

      // Sync cookie if token is in localStorage
      if (currentToken) {
        if (!document.cookie.includes('user_token=')) {
          document.cookie = `user_token=${currentToken}; path=/; max-age=604800; SameSite=Lax`;
        }
        if (pathname === '/login' || pathname === '/register') {
          router.replace('/');
        }
      } else {
        // No token found
        if (document.cookie.includes('user_token=')) {
          document.cookie = 'user_token=; path=/; max-age=0; SameSite=Lax';
        }
        useCartStore.getState().clearCart();
        if (!isPublic) {
          router.replace('/login');
        }
      }
    };

    // Check immediately on mount/route change
    checkToken();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user_token') {
        checkToken();
      }
    };

    const interval = setInterval(checkToken, 1000);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [router, pathname]);

  return null;
}
