'use client';

import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { useCartStore } from '@/store/useCartStore';
import { Topping, PizzaSize, CrustType, SauceType } from '@/types/pizza';
import { formatINR } from '@/lib/currency';
import { 
  Sparkles, RotateCcw, Eye, Camera, Check, 
  ShoppingBag, Flame, Layers, Plus, Info 
} from 'lucide-react';

interface PizzaCanvasProps {
  availableToppings: Topping[];
}

// --- Procedural 3D Topping Meshes ---
function PepperoniGroup({ count = 12 }: { count?: number }) {
  const positions = useMemo(() => {
    const list = [];
    for (let i = 0; i < count; i++) {
      const radius = 0.5 + (i % 2 === 0 ? 0.7 : 0.35) * (0.8 + (i / count) * 0.4);
      const angle = (i * 2.4);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const rotY = (i * 0.7);
      const rotX = (Math.sin(i) * 0.08);
      list.push({ pos: [x, 0.16 + (i * 0.002), z] as [number, number, number], rot: [rotX, rotY, 0] as [number, number, number] });
    }
    return list;
  }, [count]);

  return (
    <group>
      {positions.map((p, idx) => (
        <mesh key={idx} position={p.pos} rotation={p.rot} castShadow receiveShadow>
          <cylinderGeometry args={[0.26, 0.26, 0.035, 24]} />
          <meshStandardMaterial 
            color="#A81C1C" 
            roughness={0.4} 
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

function MushroomGroup({ count = 10 }: { count?: number }) {
  const positions = useMemo(() => {
    const list = [];
    for (let i = 0; i < count; i++) {
      const radius = 0.45 + (i * 0.09);
      const angle = i * 2.8 + 1.2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      list.push({ 
        pos: [x, 0.17 + (i * 0.003), z] as [number, number, number], 
        rot: [0.1, i * 1.1, 0.05] as [number, number, number] 
      });
    }
    return list;
  }, [count]);

  return (
    <group>
      {positions.map((p, idx) => (
        <group key={idx} position={p.pos} rotation={p.rot}>
          {/* Mushroom Cap */}
          <mesh castShadow position={[0, 0.03, 0]}>
            <sphereGeometry args={[0.18, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#5C3A21" roughness={0.7} />
          </mesh>
          {/* Mushroom Stem */}
          <mesh position={[0, 0.01, 0]}>
            <cylinderGeometry args={[0.06, 0.07, 0.04, 12]} />
            <meshStandardMaterial color="#D7CCC8" roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function BasilGroup({ count = 8 }: { count?: number }) {
  const positions = useMemo(() => {
    const list = [];
    for (let i = 0; i < count; i++) {
      const radius = 0.4 + (i * 0.12);
      const angle = i * 2.1 + 0.5;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      list.push({ 
        pos: [x, 0.18 + (i * 0.003), z] as [number, number, number], 
        rot: [0.15, i * 1.8, -0.1] as [number, number, number] 
      });
    }
    return list;
  }, [count]);

  return (
    <group>
      {positions.map((p, idx) => (
        <mesh key={idx} position={p.pos} rotation={p.rot} castShadow>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial 
            color="#2E7D32" 
            roughness={0.3} 
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

function OlivesGroup({ count = 12 }: { count?: number }) {
  const positions = useMemo(() => {
    const list = [];
    for (let i = 0; i < count; i++) {
      const radius = 0.35 + (i * 0.08);
      const angle = i * 2.5 + 2.0;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      list.push({ pos: [x, 0.16 + (i * 0.002), z] as [number, number, number], rot: [Math.PI / 2, 0, i * 0.5] as [number, number, number] });
    }
    return list;
  }, [count]);

  return (
    <group>
      {positions.map((p, idx) => (
        <mesh key={idx} position={p.pos} rotation={p.rot} castShadow>
          <torusGeometry args={[0.08, 0.035, 12, 20]} />
          <meshStandardMaterial color="#1F1B24" roughness={0.3} metalness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function PeppersGroup({ count = 14 }: { count?: number }) {
  const positions = useMemo(() => {
    const list = [];
    for (let i = 0; i < count; i++) {
      const radius = 0.3 + (i * 0.08);
      const angle = i * 2.2 + 0.8;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      list.push({ 
        pos: [x, 0.17 + (i * 0.002), z] as [number, number, number], 
        rot: [0.1, i * 1.4, 0.2] as [number, number, number],
        color: i % 2 === 0 ? "#E64A19" : "#FBC02D"
      });
    }
    return list;
  }, [count]);

  return (
    <group>
      {positions.map((p, idx) => (
        <mesh key={idx} position={p.pos} rotation={p.rot} castShadow>
          <boxGeometry args={[0.09, 0.04, 0.2]} />
          <meshStandardMaterial color={p.color} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

// --- Dynamic 3D Pizza Assembly ---
function PizzaModel({
  size,
  crust,
  sauce,
  toppings,
  autoRotate,
}: {
  size: PizzaSize;
  crust: CrustType;
  sauce: SauceType;
  toppings: string[];
  autoRotate: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.35;
    }
  });

  // Scale based on size
  const scale = size === 'small' ? 1.0 : size === 'medium' ? 1.25 : 1.45;

  // Colors & dimensions based on crust
  const crustColor = crust === 'neapolitan' ? '#C88B52' : crust === 'deep_dish' ? '#B36B2B' : '#D4A373';
  const rimRadius = crust === 'deep_dish' ? 0.32 : crust === 'neapolitan' ? 0.22 : 0.15;

  // Sauce color
  const sauceColorMap: Record<SauceType, string> = {
    marinara: '#B71C1C',
    garlic_white: '#F5EBE1',
    pesto: '#33691E',
    bbq: '#4E260E',
  };

  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      {/* Wooden Peel / Board base */}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <cylinderGeometry args={[1.9, 1.9, 0.12, 48]} />
        <meshStandardMaterial color="#4A2E18" roughness={0.8} />
      </mesh>

      {/* 1. Base Dough Crust Bed */}
      <mesh position={[0, 0.04, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.5, 1.5, 0.1, 48]} />
        <meshStandardMaterial color={crustColor} roughness={0.85} />
      </mesh>

      {/* 2. Outer Crust Rim */}
      <mesh position={[0, 0.09, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[1.42, rimRadius, 20, 48]} />
        <meshStandardMaterial color={crustColor} roughness={0.8} />
      </mesh>

      {/* 3. Sauce Layer */}
      <mesh position={[0, 0.095, 0]} receiveShadow>
        <cylinderGeometry args={[1.34, 1.34, 0.02, 48]} />
        <meshStandardMaterial 
          color={sauceColorMap[sauce]} 
          roughness={0.4} 
          metalness={0.05} 
        />
      </mesh>

      {/* 4. Melted Cheese Blanket with Mozzarella bubbles */}
      <mesh position={[0, 0.115, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.3, 1.3, 0.03, 48]} />
        <meshStandardMaterial 
          color="#FFF8E1" 
          roughness={0.35} 
          metalness={0.08}
        />
      </mesh>

      {/* 5. Toppings Layers */}
      {toppings.some(t => t.toLowerCase().includes('pepperoni') || t.toLowerCase().includes('salami')) && (
        <PepperoniGroup count={size === 'large' ? 16 : size === 'medium' ? 12 : 8} />
      )}
      {toppings.some(t => t.toLowerCase().includes('mushroom')) && (
        <MushroomGroup count={size === 'large' ? 14 : size === 'medium' ? 10 : 7} />
      )}
      {toppings.some(t => t.toLowerCase().includes('basil')) && (
        <BasilGroup count={size === 'large' ? 10 : size === 'medium' ? 7 : 5} />
      )}
      {toppings.some(t => t.toLowerCase().includes('olive')) && (
        <OlivesGroup count={size === 'large' ? 15 : size === 'medium' ? 11 : 7} />
      )}
      {toppings.some(t => t.toLowerCase().includes('pepper') || t.toLowerCase().includes('jalapeño') || t.toLowerCase().includes('onion')) && (
        <PeppersGroup count={size === 'large' ? 16 : size === 'medium' ? 12 : 8} />
      )}
    </group>
  );
}

export default function PizzaCanvas({ availableToppings }: PizzaCanvasProps) {
  const {
    customSize,
    customCrust,
    customSauce,
    customToppings,
    setCustomSize,
    setCustomCrust,
    setCustomSauce,
    toggleCustomTopping,
    addToCart,
    getCustomPizzaPrice,
  } = useCartStore();

  const [autoRotate, setAutoRotate] = useState(true);
  const [cameraView, setCameraView] = useState<'orbit' | 'top' | 'close'>('orbit');
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-remove any default toppings that are currently sold out
  React.useEffect(() => {
    if (availableToppings && availableToppings.length > 0) {
      const soldOutNames = new Set(
        availableToppings
          .filter((t) => t.is_available === false || (t.stock_count !== undefined && t.stock_count <= 0))
          .map((t) => t.name.toLowerCase())
      );
      const invalid = customToppings.filter((name) => soldOutNames.has(name.toLowerCase()));
      if (invalid.length > 0) {
        invalid.forEach((name) => toggleCustomTopping(name));
      }
    }
  }, [availableToppings]);

  const soldOutSelected = useMemo(() => {
    if (!availableToppings || availableToppings.length === 0) return [];
    return customToppings.filter((name) => {
      const found = availableToppings.find(
        (t) => t.name.trim().toLowerCase() === name.trim().toLowerCase()
      );
      return found && (found.is_available === false || (found.stock_count !== undefined && found.stock_count <= 0));
    });
  }, [customToppings, availableToppings]);

  const canAddToCart = soldOutSelected.length === 0;

  const price = getCustomPizzaPrice(availableToppings);

  const handleAddToCart = () => {
    if (!canAddToCart) return;

    addToCart({
      pizza_name: `Bespoke 3D Artisan (${customCrust.toUpperCase()})`,
      size: customSize,
      crust_type: customCrust,
      sauce_type: customSauce,
      quantity: 1,
      unit_price: price,
      total_price: price,
      selected_toppings: customToppings,
      is_custom: true,
      image_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80"
    });
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2200);
  };

  return (
    <section id="configurator" className="relative py-20 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-badge mb-3">
          <Sparkles className="w-4 h-4 text-orange-400 animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider text-orange-300">
            Real-Time 3D WebGL Configurator
          </span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Sculpt Your <span className="text-gradient-ember font-serif italic">Bespoke Pie</span>
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto mt-3 text-sm sm:text-base">
          Rotate, inspect, and customize every layer in real time. From the wood-fired crust to cured meats and aromatic herbs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 3D WebGL Viewport (Takes 7 cols on large screens) */}
        <div className="lg:col-span-7 glass-panel-elevated rounded-3xl p-4 relative overflow-hidden h-[480px] sm:h-[580px] flex flex-col justify-between">
          {/* Top Canvas Controls HUD */}
          <div className="relative z-10 flex items-center justify-between gap-2 px-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
              </span>
              <span className="text-xs font-semibold text-gray-300 tracking-wide uppercase">
                Interactive 3D Engine
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`p-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                  autoRotate 
                    ? 'bg-orange-500/20 border-orange-500/40 text-orange-400' 
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                }`}
                title="Toggle Auto Rotation"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Rotate</span>
              </button>

              <button
                onClick={() => setCameraView(cameraView === 'orbit' ? 'top' : 'orbit')}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white text-xs font-medium transition-all flex items-center gap-1.5"
                title="Switch Camera View"
              >
                <Eye className="w-3.5 h-3.5 text-orange-400" />
                <span className="hidden sm:inline">{cameraView === 'orbit' ? "Top Down" : "Free 3D"}</span>
              </button>
            </div>
          </div>

          {/* R3F Canvas */}
          <div className="absolute inset-0 cursor-grab active:cursor-grabbing">
            {mounted ? (
              <Canvas
                shadows={{ type: THREE.PCFShadowMap }}
                camera={{ 
                  position: cameraView === 'top' ? [0, 4.2, 0.1] : [0, 2.6, 3.4], 
                  fov: 45 
                }}
              >
                <ambientLight intensity={0.8} />
                <directionalLight
                  position={[5, 8, 5]}
                  intensity={1.5}
                  castShadow
                  shadow-mapSize-width={1024}
                  shadow-mapSize-height={1024}
                />
                <pointLight position={[-4, 3, -4]} intensity={0.5} color="#FF7A45" />

                <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.3}>
                  <PizzaModel
                    size={customSize}
                    crust={customCrust}
                    sauce={customSauce}
                    toppings={customToppings}
                    autoRotate={autoRotate}
                  />
                </Float>

                <ContactShadows
                  position={[0, -0.3, 0]}
                  opacity={0.65}
                  scale={5}
                  blur={2.4}
                  far={4}
                />

                <OrbitControls
                  enablePan={false}
                  minDistance={2.2}
                  maxDistance={5.5}
                  maxPolarAngle={Math.PI / 2.1}
                />
              </Canvas>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center animate-pulse">
                  <Sparkles className="w-6 h-6 animate-spin" />
                </div>
                <p className="text-xs font-bold text-gray-400">Initializing 3D Pizza Studio...</p>
              </div>
            )}
          </div>

          {/* Bottom HUD: Active Ingredients Ticker */}
          <div className="relative z-10 glass-panel rounded-2xl p-3 flex items-center justify-between border border-white/10">
            <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs">
              <span className="text-gray-400 font-semibold shrink-0">On Board:</span>
              {customToppings.length === 0 ? (
                <span className="text-gray-500 italic">No extra toppings added</span>
              ) : (
                customToppings.map((top) => (
                  <span
                    key={top}
                    className="px-2 py-0.5 rounded-md bg-white/10 text-white font-medium shrink-0 flex items-center gap-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                    {top}
                  </span>
                ))
              )}
            </div>
            <span className="text-xs text-gray-400 font-mono hidden md:inline shrink-0 pl-2">
              Drag to Inspect
            </span>
          </div>
        </div>

        {/* Customization Selector Controls (Takes 5 cols on large screens) */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 flex flex-col gap-6 shadow-2xl">
          {/* 1. Size Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mb-2.5">
              <Layers className="w-4 h-4 text-orange-400" />
              1. Select Pizza Diameter
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(['small', 'medium', 'large'] as PizzaSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setCustomSize(size)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    customSize === size
                      ? 'bg-orange-500/20 border-orange-500 text-white shadow-lg shadow-orange-500/10'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <p className="text-xs uppercase font-extrabold capitalize">{size}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {size === 'small' ? '10" Personal' : size === 'medium' ? '12" Standard' : '16" Party'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Crust Style */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mb-2.5">
              <Flame className="w-4 h-4 text-orange-400" />
              2. Dough & Crust Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'neapolitan', label: 'Neapolitan Airy', sub: '900° Charred leopard spots' },
                { id: 'thin', label: 'Roman Thin Crisp', sub: 'Light, crackly bite' },
                { id: 'deep_dish', label: 'Chicago Deep Pan', sub: 'Thick caramelized buttery wall' },
                { id: 'gluten_free', label: 'Artisan Gluten-Free', sub: 'Ancient grain blend' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCustomCrust(c.id as CrustType)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    customCrust === c.id
                      ? 'bg-orange-500/20 border-orange-500 text-white shadow-lg'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <p className="text-xs font-bold">{c.label}</p>
                  <p className="text-[10px] text-gray-400 truncate">{c.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Sauce Type */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mb-2.5">
              <Sparkles className="w-4 h-4 text-orange-400" />
              3. Artisan Sauce Base
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'marinara', label: 'San Marzano', dot: '#B71C1C' },
                { id: 'garlic_white', label: 'Garlic Cream', dot: '#F5EBE1' },
                { id: 'pesto', label: 'Basil Pesto', dot: '#33691E' },
                { id: 'bbq', label: 'Bourbon BBQ', dot: '#4E260E' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setCustomSauce(s.id as SauceType)}
                  className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                    customSauce === s.id
                      ? 'bg-orange-500/20 border-orange-500 text-white'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.dot }} />
                  <span className="text-[11px] font-bold">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Interactive Toppings Grid */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-orange-400" />
                4. Select Artisan Toppings
              </label>
              <span className="text-[11px] text-orange-400 font-medium">
                {customToppings.length} selected
              </span>
            </div>

            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
              {availableToppings.map((top) => {
                const isSelected = customToppings.some((t) => t.toLowerCase() === top.name.toLowerCase());
                const isAvailable = top.is_available !== false && (top.stock_count === undefined || top.stock_count > 0);
                return (
                  <button
                    key={top.id}
                    onClick={() => {
                      if (isAvailable || isSelected) toggleCustomTopping(top.name);
                    }}
                    disabled={!isAvailable && !isSelected}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all ${
                      !isAvailable
                        ? isSelected
                          ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                          : 'opacity-40 cursor-not-allowed bg-red-500/5 border-red-500/20 text-gray-500'
                        : isSelected
                        ? 'bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-600/30'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <span 
                      className={`w-2.5 h-2.5 rounded-full ${!isAvailable ? 'opacity-40' : ''}`} 
                      style={{ backgroundColor: top.color_hex }} 
                    />
                    <span className={!isAvailable ? 'line-through' : ''}>{top.name}</span>
                    <span className="text-[10px] opacity-80">
                      {!isAvailable ? 'Sold Out' : `+${formatINR(top.price)}`}
                    </span>
                    {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sold-out Warning Banner */}
          {soldOutSelected.length > 0 && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0 text-rose-400" />
                <span>Unavailable: {soldOutSelected.join(', ')} currently sold out</span>
              </div>
              <button
                onClick={() => {
                  soldOutSelected.forEach((n) => toggleCustomTopping(n));
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-200 text-[10px] font-bold hover:bg-rose-500/30 transition-all shrink-0"
              >
                Remove Sold Out
              </button>
            </div>
          )}

          {/* Total Price & Add to Cart Trigger */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase font-medium">Computed Price</p>
              <p className="text-3xl font-black text-white">{formatINR(price)}</p>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              className={`px-6 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-xl ${
                !canAddToCart
                  ? 'bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed opacity-80'
                  : addedAnimation
                  ? 'bg-emerald-600 text-white scale-105'
                  : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-orange-600/30 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {!canAddToCart ? (
                <>
                  <Info className="w-5 h-5 text-rose-400" />
                  {soldOutSelected[0]} Sold Out
                </>
              ) : addedAnimation ? (
                <>
                  <Check className="w-5 h-5 animate-bounce" />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  Add 3D Pizza to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
