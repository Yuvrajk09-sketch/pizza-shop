'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';

export default function SessionWatcher() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const syncSession = () => {
      const currentToken = typeof window !== 'undefined' ? localStorage.getItem('user_token') : null;

      if (currentToken) {
        // Ensure cookie is synced for server-side requests & middleware
        if (!document.cookie.includes('user_token=')) {
          document.cookie = `user_token=${currentToken}; path=/; max-age=604800; SameSite=Lax`;
        }
      } else {
        // Token removed or logged out
        if (document.cookie.includes('user_token=')) {
          document.cookie = 'user_token=; path=/; max-age=0; SameSite=Lax';
        }
        // Redirect to login only if currently on protected customer account routes
        if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/orders')) {
          router.replace('/login');
        }
      }
    };

    // Check on route change and mount
    syncSession();

    // Respond when user signs in or signs out in another tab
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user_token') {
        syncSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [router, pathname]);

  return null;
}
