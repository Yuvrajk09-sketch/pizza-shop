import { create } from 'zustand';
import { CartItem, PizzaSize, CrustType, SauceType, Topping, Pizza } from '@/types/pizza';

interface CartStore {
  items: CartItem[];
  isDrawerOpen: boolean;
  isCheckoutOpen: boolean;

  // Menu Data for availability checking
  availablePizzas: Pizza[];
  availableToppings: Topping[];
  setMenuData: (pizzas: Pizza[], toppings: Topping[]) => void;
  sanitizeCustomToppings: (toppings: Topping[]) => void;

  // Custom Configurator State
  customSize: PizzaSize;
  customCrust: CrustType;
  customSauce: SauceType;
  customToppings: string[];

  // Cart Actions
  setDrawerOpen: (open: boolean) => void;
  setCheckoutOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;

  // Custom Builder Actions
  setCustomSize: (size: PizzaSize) => void;
  setCustomCrust: (crust: CrustType) => void;
  setCustomSauce: (sauce: SauceType) => void;
  toggleCustomTopping: (toppingName: string) => void;
  resetCustomBuilder: () => void;

  // Getters & Validators
  getSubtotal: () => number;
  getTax: () => number;
  getDeliveryFee: () => number;
  getTotal: () => number;
  getItemCount: () => number;
  getCustomPizzaPrice: (allToppings: Topping[]) => number;
  isToppingSoldOut: (name: string) => boolean;
  isPizzaSoldOut: (pizza: { id?: number; name?: string; is_available?: boolean; default_toppings?: string[] }) => boolean;
  isCartItemSoldOut: (item: CartItem) => { soldOut: boolean; reason: string };
  hasSoldOutItems: () => boolean;
}

const BASE_PRICES: Record<PizzaSize, number> = {
  small: 499.00,
  medium: 699.00,
  large: 899.00,
};

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isDrawerOpen: false,
  isCheckoutOpen: false,

  availablePizzas: [],
  availableToppings: [],

  setMenuData: (pizzas, toppings) => {
    set({ availablePizzas: pizzas, availableToppings: toppings });
    get().sanitizeCustomToppings(toppings);
  },

  sanitizeCustomToppings: (toppings) => {
    const soldOutNames = new Set(
      toppings
        .filter((t) => t.is_available === false || (t.stock_count !== undefined && t.stock_count <= 0))
        .map((t) => t.name.toLowerCase())
    );
    set((state) => ({
      customToppings: state.customToppings.filter((t) => !soldOutNames.has(t.toLowerCase())),
    }));
  },

  customSize: 'medium',
  customCrust: 'neapolitan',
  customSauce: 'marinara',
  customToppings: ['Fresh Mozzarella', 'Sweet Basil Leaves'],

  setDrawerOpen: (open) => set({ isDrawerOpen: open }),
  setCheckoutOpen: (open) => set({ isCheckoutOpen: open }),

  addToCart: (itemData) => {
    // 1. Guard against sold-out pizza
    if (itemData.pizza_id) {
      const p = get().availablePizzas.find((x) => x.id === itemData.pizza_id);
      if (p && p.is_available === false) {
        console.warn(`Cannot add sold-out pizza: ${itemData.pizza_name}`);
        return;
      }
    } else if (!itemData.is_custom) {
      const p = get().availablePizzas.find(
        (x) => x.name.trim().toLowerCase() === itemData.pizza_name.trim().toLowerCase()
      );
      if (p && p.is_available === false) {
        console.warn(`Cannot add sold-out pizza: ${itemData.pizza_name}`);
        return;
      }
    }

    // 2. Guard against sold-out toppings
    if (itemData.selected_toppings && itemData.selected_toppings.length > 0) {
      for (const topName of itemData.selected_toppings) {
        if (get().isToppingSoldOut(topName)) {
          console.warn(`Cannot add pizza with sold-out topping: ${topName}`);
          return;
        }
      }
    }

    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newItem: CartItem = {
      ...itemData,
      id,
    };
    set((state) => ({
      items: [...state.items, newItem],
      isDrawerOpen: true,
    }));
  },

  removeFromCart: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },

  updateQuantity: (id, delta) => {
    set((state) => ({
      items: state.items
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              total_price: Number((item.unit_price * newQty).toFixed(2)),
            };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null),
    }));
  },

  clearCart: () => set({ items: [] }),

  setCustomSize: (size) => set({ customSize: size }),
  setCustomCrust: (crust) => set({ customCrust: crust }),
  setCustomSauce: (sauce) => set({ customSauce: sauce }),

  toggleCustomTopping: (toppingName) => {
    set((state) => {
      const exists = state.customToppings.some((t) => t.toLowerCase() === toppingName.toLowerCase());
      if (exists) {
        return {
          customToppings: state.customToppings.filter((t) => t.toLowerCase() !== toppingName.toLowerCase()),
        };
      } else {
        // Prevent selecting sold out toppings
        if (get().isToppingSoldOut(toppingName)) {
          console.warn(`Cannot select sold-out topping: ${toppingName}`);
          return state;
        }
        return { customToppings: [...state.customToppings, toppingName] };
      }
    });
  },

  resetCustomBuilder: () => {
    const defaultToppings = ['Fresh Mozzarella', 'Sweet Basil Leaves'];
    const validDefaults = defaultToppings.filter((t) => !get().isToppingSoldOut(t));
    set({
      customSize: 'medium',
      customCrust: 'neapolitan',
      customSauce: 'marinara',
      customToppings: validDefaults,
    });
  },

  getSubtotal: () => {
    const items = get().items;
    const sum = items.reduce((acc, item) => acc + item.total_price, 0);
    return Number(sum.toFixed(2));
  },

  getTax: () => {
    const subtotal = get().getSubtotal();
    return Number((subtotal * 0.05).toFixed(2)); // 5% GST
  },

  getDeliveryFee: () => {
    return get().items.length > 0 ? 49.00 : 0; // Flat ₹49
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const tax = Number((subtotal * 0.05).toFixed(2));
    const fee = get().items.length > 0 ? 49.00 : 0;
    return Number((subtotal + tax + fee).toFixed(2));
  },

  getItemCount: () => {
    return get().items.reduce((acc, item) => acc + item.quantity, 0);
  },

  getCustomPizzaPrice: (allToppings: Topping[]) => {
    const toppingsList = (allToppings && allToppings.length > 0) ? allToppings : get().availableToppings;
    const size = get().customSize;
    let base = Number(BASE_PRICES[size] || 699);
    const selected = get().customToppings;

    selected.forEach((topName) => {
      const found = toppingsList.find((t) => t.name.toLowerCase() === topName.toLowerCase());
      if (found) {
        base += Number(found.price || 0);
      } else {
        base += 79.00;
      }
    });

    return Number((Number(base) || 0).toFixed(2));
  },

  isToppingSoldOut: (name: string) => {
    const toppings = get().availableToppings;
    if (!toppings || toppings.length === 0) return false;
    const found = toppings.find((t) => t.name.trim().toLowerCase() === name.trim().toLowerCase());
    if (!found) return false;
    return found.is_available === false || (found.stock_count !== undefined && found.stock_count <= 0);
  },

  isPizzaSoldOut: (pizza) => {
    const pizzas = get().availablePizzas;
    let p = pizza.id ? pizzas.find((x) => x.id === pizza.id) : undefined;
    if (!p && pizza.name) {
      const targetName = pizza.name.trim().toLowerCase();
      p = pizzas.find((x) => x.name.trim().toLowerCase() === targetName);
    }
    if (p && p.is_available === false) return true;
    if (pizza.is_available === false) return true;

    // Check default toppings
    const defToppings = p?.default_toppings || pizza.default_toppings || [];
    for (const topName of defToppings) {
      if (get().isToppingSoldOut(topName)) return true;
    }
    return false;
  },

  isCartItemSoldOut: (item: CartItem) => {
    // 1. Check pizza availability
    if (item.pizza_id) {
      const p = get().availablePizzas.find((x) => x.id === item.pizza_id);
      if (p && p.is_available === false) {
        return { soldOut: true, reason: `Pizza '${item.pizza_name}' is sold out` };
      }
    } else if (!item.is_custom) {
      const p = get().availablePizzas.find(
        (x) => x.name.trim().toLowerCase() === item.pizza_name.trim().toLowerCase()
      );
      if (p && p.is_available === false) {
        return { soldOut: true, reason: `Pizza '${item.pizza_name}' is sold out` };
      }
    }

    // 2. Check toppings availability
    if (item.selected_toppings && item.selected_toppings.length > 0) {
      for (const topName of item.selected_toppings) {
        if (get().isToppingSoldOut(topName)) {
          return { soldOut: true, reason: `Topping '${topName}' is sold out` };
        }
      }
    }

    return { soldOut: false, reason: '' };
  },

  hasSoldOutItems: () => {
    const items = get().items;
    return items.some((item) => get().isCartItemSoldOut(item).soldOut);
  },
}));
