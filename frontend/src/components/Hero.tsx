'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Flame, Sparkles, ArrowRight, Award, Clock, Compass } from 'lucide-react';
import gsap from 'gsap';

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.9 } });

      tl.from(badgeRef.current, {
        y: -30,
        opacity: 0,
        delay: 0.2,
      })
      .from(titleRef.current, {
        y: 40,
        opacity: 0,
      }, '-=0.5')
      .from(subtitleRef.current, {
        y: 30,
        opacity: 0,
      }, '-=0.5')
      .from(buttonsRef.current, {
        y: 20,
        opacity: 0,
      }, '-=0.4')
      .from(statsRef.current, {
        y: 30,
        opacity: 0,
      }, '-=0.3');
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-mesh-dark">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-orange-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 text-center">
        {/* Top Feature Pill */}
        <div ref={badgeRef} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-badge mb-6 shadow-lg shadow-orange-500/10">
          <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
          <span className="text-xs uppercase tracking-widest font-semibold text-orange-300">
            900° Oak-Fired • 72-Hour Fermented Dough • 3D Interactive
          </span>
        </div>

        {/* Hero Title */}
        <h1 
          ref={titleRef} 
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.08] text-white max-w-5xl mx-auto mb-6"
        >
          Wood-Fired Precision. <br />
          <span className="text-gradient-ember font-serif italic">Digital Gastronomy.</span>
        </h1>

        {/* Subtitle */}
        <p 
          ref={subtitleRef} 
          className="text-base sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10"
        >
          Sculpt your artisanal pizza in real-time 3D, customize bespoke crusts & cured Italian toppings, 
          and track your pie from the burning embers directly to your doorstep.
        </p>

        {/* Call to Actions */}
        <div 
          ref={buttonsRef} 
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <a
            href="#configurator"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-base shadow-xl shadow-orange-600/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group"
          >
            <Sparkles className="w-5 h-5 text-amber-200 group-hover:rotate-12 transition-transform" />
            Launch 3D Configurator
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#menu"
            className="w-full sm:w-auto px-8 py-4 rounded-xl glass-panel hover:bg-white/10 text-white font-semibold text-base border border-white/15 transition-all hover:border-orange-500/50 flex items-center justify-center gap-2"
          >
            <Compass className="w-5 h-5 text-orange-400" />
            Explore Signature Menu
          </a>
        </div>

        {/* Floating Social Proof Metrics */}
        <div 
          ref={statsRef} 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-white/10"
        >
          <div className="glass-panel p-4 rounded-xl text-left">
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <Award className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Rating</span>
            </div>
            <p className="text-2xl font-black text-white">4.95 / 5.0</p>
            <p className="text-xs text-gray-400">12,400+ Verified Foodies</p>
          </div>

          <div className="glass-panel p-4 rounded-xl text-left">
            <div className="flex items-center gap-2 text-orange-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Average Speed</span>
            </div>
            <p className="text-2xl font-black text-white">26 Mins</p>
            <p className="text-xs text-gray-400">From Oven to Table</p>
          </div>

          <div className="glass-panel p-4 rounded-xl text-left">
            <div className="flex items-center gap-2 text-red-400 mb-1">
              <Flame className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Oven Heat</span>
            </div>
            <p className="text-2xl font-black text-white">900°F</p>
            <p className="text-xs text-gray-400">Imported Biscotto Clay</p>
          </div>

          <div className="glass-panel p-4 rounded-xl text-left">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Craftsmanship</span>
            </div>
            <p className="text-2xl font-black text-white">100%</p>
            <p className="text-xs text-gray-400">Organic Caputo & San Marzano</p>
          </div>
        </div>
      </div>
    </section>
  );
}
