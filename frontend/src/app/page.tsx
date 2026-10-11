import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import MenuSection from '@/components/MenuSection';
import ClientShell from '@/components/ClientShell';
import { fetchMenu } from '@/lib/api';
import { Flame, MapPin, Phone, Clock } from 'lucide-react';

export const revalidate = 0; // Fresh menu on reload

export default async function HomePage() {
  const { pizzas, toppings, categories } = await fetchMenu();

  return (
    <div className="min-h-screen bg-[#08090C] text-white flex flex-col justify-between selection:bg-orange-500">
      <Navbar />

      {/*
        ClientShell is a 'use client' component that:
        - Renders CartDrawer + CheckoutModal (global overlays)
        - Dynamically loads PizzaCanvas with ssr:false (Three.js needs browser)
      */}
      <ClientShell initialPizzas={pizzas} initialToppings={toppings} />

      <main className="flex-1">
        {/* 1. Hero Section */}
        <Hero />

        {/* 2. Signature Wood-Fired Menu */}
        <MenuSection pizzas={pizzas} categories={categories} toppings={toppings} />
      </main>

      {/* Luxury Footer */}
      <footer className="border-t border-white/10 bg-[#0A0B0F] py-16 px-4 md:px-8 mt-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
                <Flame className="w-5 h-5 text-orange-400" />
              </div>
              <span className="font-extrabold text-xl tracking-wider text-white">
                SLICE<span className="text-orange-500">CRAFT</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Merging century-old Neapolitan fermenting traditions with real-time 3D craftsmanship. Baked exclusively at 900°F over red oak embers.
            </p>
          </div>

          <div className="space-y-2 text-xs text-gray-400">
            <p className="font-bold uppercase tracking-wider text-white mb-3">Wood-Fired Hearth</p>
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-400" /> Linking Road, Bandra West, Mumbai
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-orange-400" /> +91 98765 43210
            </p>
            <p className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-400" /> 11:30 AM – 1:00 AM Daily
            </p>
          </div>

          <div className="space-y-2 text-xs text-gray-400">
            <p className="font-bold uppercase tracking-wider text-white mb-3">Fast Navigation</p>
            <p><a href="#configurator" className="hover:text-orange-400 transition-colors">3D Custom Studio</a></p>
            <p><a href="#menu" className="hover:text-orange-400 transition-colors">Signature Pizzas</a></p>
            <p><a href="/dashboard" className="hover:text-orange-400 transition-colors">Order History &amp; Dashboard</a></p>
            <p><a href="/admin" className="hover:text-orange-400 transition-colors">Chef&apos;s Admin Portal</a></p>
          </div>

          <div className="space-y-3">
            <p className="font-bold uppercase tracking-wider text-white text-xs">Pizzaiolo Guarantee</p>
            <div className="p-3.5 rounded-2xl glass-panel text-xs text-gray-400 leading-relaxed border border-white/5">
              Every crust is fermented for 72 hours with imported Caputo 00 flour and cold spring water for extreme digestibility.
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-10 mt-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© 2026 SliceCraft Artisans Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with Next.js, React Three Fiber &amp; Node.js/Express
          </p>
        </div>
      </footer>
    </div>
  );
}
