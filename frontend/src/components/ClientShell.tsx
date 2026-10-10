 'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import { useCartStore } from '@/store/useCartStore';
import { fetchMenu } from '@/lib/api';
import type { Topping, Pizza } from '@/types/pizza';

// Dynamically import PizzaCanvas with SSR disabled — MUST live in a Client Component
const PizzaCanvas = dynamic(() => import('@/components/3d/PizzaCanvas'), {
  ssr: false,
  loading: () => (
    <div className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="glass-panel-elevated rounded-3xl h-[520px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto border-2 border-orange-500/50 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm tracking-widest uppercase">Firing up the oven…</p>
        </div>
      </div>
    </div>
  ),
});

interface ClientShellProps {
  initialPizzas: Pizza[];
  initialToppings: Topping[];
}

export default function ClientShell({ initialPizzas, initialToppings }: ClientShellProps) {
  const { setMenuData } = useCartStore();
  const [currentToppings, setCurrentToppings] = useState<Topping[]>(initialToppings);

  useEffect(() => {
    setMenuData(initialPizzas, initialToppings);
  }, [initialPizzas, initialToppings, setMenuData]);

  // Connect to live storefront WebSocket feed for real-time stock updates
  useEffect(() => {
    const wsUrl = `ws://127.0.0.1:8000/api/ws/storefront`;
    let socket: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

    function refreshMenu() {
      fetchMenu().then((data) => {
        setMenuData(data.pizzas, data.toppings);
        setCurrentToppings(data.toppings);
      }).catch(() => {});
    }

    function connect() {
      try {
        socket = new WebSocket(wsUrl);
        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.event === 'menu_updated') {
              refreshMenu();
            }
          } catch {}
        };
        socket.onclose = () => {
          reconnectTimeout = setTimeout(connect, 4000);
        };
        socket.onerror = () => socket?.close();
      } catch {}
    }

    connect();

    const onFocus = () => refreshMenu();
    window.addEventListener('focus', onFocus);

    return () => {
      window.removeEventListener('focus', onFocus);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      socket?.close();
    };
  }, [setMenuData]);

  return (
    <>
      {/* Global overlays */}
      <CartDrawer />
      <CheckoutModal />
      {/* 3D Configurator — browser-only */}
      <PizzaCanvas availableToppings={currentToppings} />
    </>
  );
}
