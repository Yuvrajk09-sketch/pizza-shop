'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Pizza, PizzaSize, Topping } from '@/types/pizza';
import { useCartStore } from '@/store/useCartStore';
import { formatINR } from '@/lib/currency';
import { Flame, Plus, Check, Utensils, AlertCircle } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface MenuSectionProps {
  pizzas: Pizza[];
  categories: string[];
  toppings?: Topping[];
}

export default function MenuSection({ pizzas, categories, toppings = [] }: MenuSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSizes, setSelectedSizes] = useState<Record<number, PizzaSize>>({});
  const [addedIds, setAddedIds] = useState<number[]>([]);
  const { addToCart, availableToppings: storeToppings } = useCartStore();

  const activeToppings = toppings.length > 0 ? toppings : storeToppings;

  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // GSAP ScrollTrigger for smooth staggered reveal
  useEffect(() => {
    if (!gridRef.current) return;

    const cards = gridRef.current.children;
    const anim = gsap.fromTo(
      cards,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 80%',
        },
      }
    );

    return () => {
      anim.kill();
    };
  }, [selectedCategory]);

  const allCategories = ['All', ...categories];

  const filteredPizzas = selectedCategory === 'All'
    ? pizzas
    : pizzas.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());

  const handleSizeChange = (pizzaId: number, size: PizzaSize) => {
    setSelectedSizes((prev) => ({ ...prev, [pizzaId]: size }));
  };

  const getPriceForSize = (pizza: Pizza, size: PizzaSize) => {
    if (size === 'small') return pizza.price_small;
    if (size === 'large') return pizza.price_large;
    return pizza.price_medium;
  };

  const handleAddPizza = (pizza: Pizza, isUnavailable?: boolean) => {
    if (isUnavailable) return;
    const size = selectedSizes[pizza.id] || 'medium';
    const price = getPriceForSize(pizza, size);

    addToCart({
      pizza_id: pizza.id,
      pizza_name: pizza.name,
      size,
      crust_type: 'neapolitan',
      sauce_type: 'marinara',
      quantity: 1,
      unit_price: price,
      total_price: price,
      selected_toppings: pizza.default_toppings,
      is_custom: false,
      image_url: pizza.image_url,
    });

    setAddedIds((prev) => [...prev, pizza.id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== pizza.id));
    }, 1800);
  };

  return (
    <section id="menu" ref={sectionRef} className="py-24 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-badge mb-4">
          <Utensils className="w-3.5 h-3.5 text-orange-400" />
          <span className="display-label text-orange-300 text-[10px]">Hand-Crafted Selections</span>
        </div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }}
          className="text-4xl sm:text-6xl font-semibold text-white tracking-tight leading-none">
          Master Pizzaiolo{' '}
          <em className="text-gradient-ember" style={{ fontStyle: 'italic', fontWeight: 300 }}>Collection</em>
        </h2>
        <p className="text-gray-400 max-w-lg mx-auto mt-4 text-sm leading-relaxed">
          Fermented 72 hours, hand-stretched with Italian Semolina, and fired over aromatic red oak embers.
        </p>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-600/25 scale-105'
                  : 'glass-panel text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Pizzas Grid */}
      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPizzas.map((pizza) => {
          const size = selectedSizes[pizza.id] || 'medium';
          const currentPrice = getPriceForSize(pizza, size);
          const isAdded = addedIds.includes(pizza.id);

          const isPizzaDirectlySoldOut = pizza.is_available === false;
          const soldOutIngredients = (pizza.default_toppings || []).filter((topName) => {
            const top = activeToppings.find((t) => t.name.trim().toLowerCase() === topName.trim().toLowerCase());
            return top && (top.is_available === false || (top.stock_count !== undefined && top.stock_count <= 0));
          });
          const hasSoldOutIngredients = soldOutIngredients.length > 0;
          const isUnavailable = isPizzaDirectlySoldOut || hasSoldOutIngredients;

          return (
            <div
              key={pizza.id}
              className={`glass-panel rounded-3xl overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                isUnavailable
                  ? 'border-white/10 opacity-90'
                  : 'hover:border-orange-500/40 hover:shadow-orange-500/10'
              }`}
            >
              {/* Image & Badge Header */}
              <div className="relative h-60 w-full overflow-hidden bg-zinc-900">
                <img
                  src={pizza.image_url}
                  alt={pizza.name}
                  className={`w-full h-full object-cover transition-transform duration-500 ${
                    isUnavailable ? 'grayscale-[35%] group-hover:scale-100' : 'group-hover:scale-105'
                  }`}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#12141A] via-transparent to-black/40" />

                {/* Category & Status Badges */}
                <div className="absolute top-4 left-4 flex items-center gap-1.5 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-black/60 backdrop-blur-md text-orange-400 border border-orange-500/30">
                    {pizza.category}
                  </span>
                  {isUnavailable && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-600/90 backdrop-blur-md text-white border border-rose-500/30 shadow-lg flex items-center gap-1">
                      Sold Out
                    </span>
                  )}
                </div>

                {/* Fired Tag */}
                <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-600/80 backdrop-blur-md text-white">
                  <Flame className="w-3 h-3 text-amber-200" />
                  Wood-Fired
                </div>
              </div>

              {/* Pizza Details */}
              <div className="p-6 flex flex-col flex-1 justify-between">
                <div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    className={`text-2xl font-semibold mb-2 transition-colors leading-tight ${
                      isUnavailable ? 'text-gray-300' : 'text-white group-hover:text-orange-400'
                    }`}>
                    {pizza.name}
                  </h3>
                  <p className="text-gray-400 text-xs leading-relaxed mb-4">
                    {pizza.description}
                  </p>

                  {/* Sold-out ingredient notification */}
                  {hasSoldOutIngredients && !isPizzaDirectlySoldOut && (
                    <div className="mb-3 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                      <span>{soldOutIngredients.join(', ')} currently sold out</span>
                    </div>
                  )}

                  {/* Toppings Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {pizza.default_toppings.map((top, idx) => {
                      const isThisTopSoldOut = soldOutIngredients.some(
                        (s) => s.trim().toLowerCase() === top.trim().toLowerCase()
                      );
                      return (
                        <span
                          key={idx}
                          className={`px-2 py-0.5 rounded-md text-[11px] transition-colors ${
                            isThisTopSoldOut
                              ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300 line-through'
                              : 'bg-white/5 border border-white/5 text-gray-300'
                          }`}
                        >
                          {top}
                          {isThisTopSoldOut && (
                            <span className="text-[9px] text-rose-400 no-underline font-semibold ml-1">
                              (Sold Out)
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div>
                  {/* Size Selector */}
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/5 mb-4">
                    {(['small', 'medium', 'large'] as PizzaSize[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSizeChange(pizza.id, s)}
                        disabled={isUnavailable}
                        className={`flex-1 py-1 text-center rounded-lg text-[11px] font-bold uppercase transition-all ${
                          size === s
                            ? isUnavailable
                              ? 'bg-white/10 text-gray-400'
                              : 'bg-orange-500 text-white shadow-md'
                            : isUnavailable
                            ? 'text-gray-600 cursor-not-allowed'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {s === 'small' ? '10"' : s === 'medium' ? '12"' : '16"'}
                      </button>
                    ))}
                  </div>

                  {/* Price & Action */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="display-label text-gray-500 text-[9px] block mb-0.5">Starting from</span>
                      <span style={{ fontFamily: "'Cormorant Garamond', serif" }}
                        className={`text-2xl font-bold ${isUnavailable ? 'text-gray-400 line-through' : 'text-white'}`}>
                        {formatINR(currentPrice)}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (!isUnavailable) handleAddPizza(pizza, isUnavailable);
                      }}
                      disabled={isUnavailable}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg ${
                        isUnavailable
                          ? 'bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed opacity-75'
                          : isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-600/30 hover:scale-105 active:scale-95'
                      }`}
                    >
                      {isUnavailable ? (
                        'Sold Out'
                      ) : isAdded ? (
                        <>
                          <Check className="w-4 h-4 animate-bounce" />
                          Added
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
